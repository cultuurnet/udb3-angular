'use strict';

/**
 * @ngdoc service
 * @name udbApp.LuceneQueryBuilder
 * @description
 * # LuceneQueryBuilder
 * Service in the udb.search.
 */
angular.module('udb.search')
  .service('LuceneQueryBuilder', LuceneQueryBuilder);

/* @ngInject */
function LuceneQueryBuilder(LuceneQueryParser, QueryTreeValidator, QueryTreeTranslator, queryFields, taxonomyTerms) {
  var implicitToken = '<implicit>';

  this.translate = function (query) {
    QueryTreeTranslator.translateQueryTree(query.queryTree);
  };

  this.validate = function (query) {
    QueryTreeValidator.validate(query.queryTree, query.errors);
  };

  this.isValid = function (query) {
    this.translate(query);
    this.validate(query);

    return query.errors.length === 0;
  };

  this.parseQueryString = function (query) {
    try {
      query.queryTree = LuceneQueryParser.parse(query.queryString);
    } catch (e) {
      query.errors.push(e.message);
    }

    return query.queryTree;
  };

  /**
   *
   * @param {string} queryString
   */
  this.createQuery = function (queryString) {
    var query = {
      originalQueryString: queryString,
      queryString: queryString,
      queryTree: {},
      errors: []
    };

    this.parseQueryString(query);

    return query;
  };

  var printTerm = function (node) {
    var term = node.term,
        isRangeExpression = (node.lowerBound || node.upperBound);

    if (isRangeExpression) {
      var min = node.lowerBound || '*',
          max = node.upperBound || '*',
          inclusive = node.inclusive;

      if (min instanceof Date) {
        min = moment(min).format();
      }
      if (max instanceof Date) {
        max = moment(max).format();
      }

      term = min + ' TO ' + max;

      if (inclusive) {
        term = '[' + term + ']';
      } else {
        term = '{' + term + '}';
      }
    } else {
      // if the term is a phrase surround it with double quotes
      if (node.quoted || term.indexOf(' ') !== -1) {
        term = '"' + term + '"';
      }

      // check for fuzzy search modifier
      if (node.similarity) {
        term += ('~' + node.similarity);
      }

      // check for proximity modifier
      if (node.proximity) {
        term += ('~' + node.proximity);
      }

      // check for prefix modifier
      if (node.prefix) {
        term = node.prefix + term;
      }

      // check for boost modifier
      if (node.boost) {
        term += ('^' + node.boost);
      }
    }

    return term;
  };

  var unparseNode = function (branch, depth, sentence) {

    if (branch.left) {
      var result,
          operator = (branch.operator === implicitToken) ? ' ' : (' ' + branch.operator + ' ');

      if (branch.right) {
        result = unparseNode(branch.left, depth + 1, sentence);
        result += operator;
        result += unparseNode(branch.right, depth + 1, sentence);

        if (depth > 0) {
          result = '(' + result + ')';
        }

        if (branch.field && branch.field !== implicitToken) {
          result = (branch.field + ':') + result;
        }

      } else {
        result = unparseNode(branch.left, depth + 1, sentence);
      }

      return result;

    } else {
      var fieldQuery = '',
          term = printTerm(branch);

      if (branch.field !== implicitToken && branch.field !== null) {
        var fieldPrefix = '';

        if (_.contains(['!', '+', '-'], branch.transformer)) {
          fieldPrefix = branch.transformer;
        }

        fieldQuery += (fieldPrefix + branch.field + ':');
      }

      fieldQuery += term;

      return sentence += fieldQuery;
    }

    if (depth === 0) {
      return sentence;
    }
  };

  this.unparse = function (query) {
    query.queryString = this.unparseQueryTree(query.queryTree);
    return query.queryString;
  };

  this.unparseQueryTree = function (queryTree) {
    var queryString = '';

    if (queryTree.left) {
      queryString = unparseNode(queryTree, 0, '');
    }

    return queryString;
  };

  function printTreeField(field) {
    if (field.fieldType === 'date-range') {
      cleanUpDateRangeField(field);
    }
    var transformedField = transformField(field);
    return transformedField.field + ':' + printTerm(transformedField);
  }

  /**
   * @description
   * Unparse a grouped field information tree to a query string
   *
   * @param   {object}  groupedTree     A tree structure with field groups
   * @return  {string}  A query string
   */
  this.unparseGroupedTree = function (groupedTree) {
    var root = groupedTree;
    var queryString = '';

    _.forEach(root.nodes, function (node, nodeIndex) {
      var nodeString = '';
      if (node.type === 'group') {
        var group = node;

        _.forEach(group.nodes, function (field, fieldIndex) {

          // check if the field is actually a sub group
          if (field.type === 'group') {

            var subGroup = field,
                subGroupString = ' ';

            if (subGroup.nodes.length === 1) {
              var singleField = subGroup.nodes[0];
              subGroupString += subGroup.operator + ' ' + printTreeField(singleField);
            } else {
              subGroupString += subGroup.operator + ' (';
              _.forEach(subGroup.nodes, function (field, fieldIndex) {
                if (fieldIndex) {
                  subGroupString += ' OR ';
                }
                subGroupString += printTreeField(field);
              });
              subGroupString += ')';
            }

            nodeString += subGroupString;
          } else {
            if (fieldIndex) {
              nodeString += ' ' + node.operator + ' ';
            }

            nodeString += printTreeField(field);

            var nextIndex = fieldIndex + 1;
            if (fieldIndex && nextIndex < group.nodes.length && group.nodes[nextIndex].type === 'group') {
              nodeString = '(' + nodeString + ')';
            }
          }
        });

        if (root.nodes.length > 1 && group.nodes.length > 1) {
          nodeString = '(' + nodeString + ')';
        }
      } else {
        console.log('Expecting a group but found: ' + node.type);
      }

      // do not prepend the first node with an operator
      if (nodeIndex || node.excluded) {
        var operator = node.excluded ? 'NOT' : 'OR';
        queryString += ' ' + operator + ' ';
      }
      queryString += nodeString;
    });

    return queryString;
  };

  function cleanUpDateRangeField(field) {
    if (field.transformer === '=' && moment(field.lowerBound).isValid()) {
      field.lowerBound = moment(field.lowerBound).startOf('day').toDate();
      field.upperBound = moment(field.lowerBound).endOf('day').toDate();
    }

    if (field.transformer === '><') {
      if (moment(field.lowerBound).isValid()) {
        field.lowerBound = moment(field.lowerBound).startOf('day').toDate();
      } else {
        field.lowerBound = '*';
      }

      if (moment(field.upperBound).isValid()) {
        field.upperBound = moment(field.upperBound).endOf('day').toDate();
      } else {
        field.upperBound = '*';
      }
    }

    if (field.transformer === '<') {
      if (moment(field.upperBound).isValid()) {
        field.upperBound = moment(field.upperBound).endOf('day').toDate();
      } else {
        field.upperBound = moment().endOf('day').toDate();
      }
    }

    if (field.transformer === '>') {
      if (moment(field.lowerBound).isValid()) {
        field.lowerBound = moment(field.lowerBound).startOf('day').toDate();
      } else {
        field.lowerBound = moment().startOf('day').toDate();
      }
    }
  }

  function transformField(originalField) {
    var field = _.clone(originalField);

    switch (field.transformer) {
      case '!':
        field.field = '!' + field.field;
        break;
      case '-':
        field.field = '-' + field.field;
        break;
      case '<':
        field.lowerBound = '*';
        break;
      case '>':
        field.upperBound = '*';
        break;
      case '=':
        if (field.fieldType !== 'date-range') {
          field.upperBound = undefined;
          field.lowerBound = undefined;
        }
        break;
    }

    return field;
  }

  /**
   * @description
   * Generate a grouped field information tree from a query tree
   * The query tree should not nest different operators deeper than 2 levels.
   * Modifiers will be ignored.
   *
   * @param   {object}  queryTree   - The queryTree to get information from
   *
   * @return  {object}              - A grouped field information tree
   */
  this.groupQueryTree = function (queryTree) {
    var groupedFieldTree = {
      type: 'root',
      nodes: [],
      operator: queryTree.operator || 'OR'
    };

    // If the query tree of an empty search is used, add a default field and group
    if (!queryTree.left) {
      var group = {
        type: 'field',
        operator: 'OR',
        nodes: [
          {
            field: 'name.\\*',
            name: 'title',
            term: '',
            fieldType: 'tokenized-string',
            transformer: '+'
          }
        ]
      };
      groupedFieldTree.nodes.push(group);
    } else {
      this.groupNode(queryTree, groupedFieldTree);
      this.cleanUpGroupedFieldTree(groupedFieldTree);
    }

    return groupedFieldTree;
  };

  /**
   * @description
   * Clean up a field tree after grouping.
   * Used by groupQueryTree to cleanse a freshly grouped tree.
   *
   * @param {object} groupedFieldTree
   */
  this.cleanUpGroupedFieldTree = function (groupedFieldTree) {
    _.forEach(groupedFieldTree.nodes, function (fieldGroup) {
      // This property is just used to track implicit fields and can be removed when switching groups.
      delete fieldGroup.implicitField;

      // Switch the type of the node to field instead of group if it only contains one field.
      if (fieldGroup.nodes && fieldGroup.nodes.length === 1) {
        fieldGroup.type = 'field';
      }

      // Replace any remaining implicitly declared operators with OR.
      // Assuming the following term grouping syntax was used "field:(term1 term2)".
      if (fieldGroup.operator === implicitToken) {
        fieldGroup.operator = 'OR';
      }

      // add field-query type and map options for term and choice fields
      _.forEach(fieldGroup.nodes, function (field) {

        // Find the field-query field type
        var fieldType = _.find(queryFields, function (fieldType) {
          return fieldType.name === field.field;
        });

        // Set the type and map options depending on field type
        if (fieldType) {
          field.fieldType = fieldType.type;

          // terms should be matched to their domain and used as the field-query field
          // if no matching taxonomy term is found the query-field should be removed
          if (fieldType.type === 'term') {
            var taxonomyTerm = _.find(taxonomyTerms, function (term) {
              return term.label.toUpperCase() === field.term.toUpperCase();
            });

            if (taxonomyTerm) {
              var domainFieldName = 'category_' + taxonomyTerm.domain + '_name';
              field.field = domainFieldName;
              field.term = taxonomyTerm.label;
            } else {
              field.invalid = true;
            }
          }

          // Look up options for choice field-query
          if (fieldType.type === 'choice') {
            var option = _.find(fieldType.options, function (option) {
              return option === field.term.toUpperCase();
            });

            if (option) {
              field.term = option;
            } else {
              field.invalid = true;
            }
          }

          // Make sure boolean field-query values are either true or false
          if (fieldType.type === 'check') {
            var trueValue = fieldType.name,
                falseValue = '!(' + fieldType.name + ')';

            if (!(field.term === trueValue || field.term === falseValue)) {
              field.invalid = true;
            }
          }

          if (fieldType.type === 'tokenized-string') {
            if (!field.transformer || field.transformer === '=') {
              field.transformer = '+';
            }

            if (field.transformer === '!') {
              field.transformer = '-';
            }
          }

          if (fieldType.type === 'string') {
            if (!field.transformer || field.transformer === '+') {
              field.transformer = '=';
            }

            if (field.transformer === '-') {
              field.transformer = '!';
            }
          }

          // Numbers can be a single or ranged term
          // The editor only handles ranges that have one of the boundaries set to infinity
          if (fieldType.type === 'number') {
            if (field.term) {
              field.transformer = '=';
            } else {
              if (field.upperBound && field.lowerBound === '*') {
                field.transformer = '<';
              } else if (field.lowerBound && field.upperBound === '*') {
                field.transformer = '>';
              } else {
                field.transformer = '=';
                field.term = field.lowerBound || field.upperBound;
                field.lowerBound = undefined;
                field.upperBound = undefined;
              }
            }
          }

          if (fieldType.type === 'date-range') {
            var startDate = moment(field.lowerBound),
                endDate = moment(field.upperBound);

            if (startDate.isValid() && endDate.isValid()) {
              if (startDate.isSame(endDate, 'day')) {
                field.transformer = '=';
              } else {
                field.transformer = '><';
              }
            } else {
              if (!startDate.isValid() && endDate.isValid()) {
                field.transformer = '<';
              }

              if (!endDate.isValid() && startDate.isValid()) {
                field.transformer = '>';
              }
            }
          }
        }

      });
    });
  };

  /**
   * @description
   * Group a node in a query tree branch.
   * You should not need to call this method directly, use groupQueryTree instead.
   *
   * @param {object}  branch        - The branch of a query tree
   * @param {object}  fieldTree     - The field tree that will be returned
   * @param {object}  [fieldGroup]  - Keeps track of the current field group
   */
  this.groupNode = function (branch, fieldTree, fieldGroup) {
    // if the operator is implicit, you're dealing with grouped terms eg: field:(term1 term2)
    if (branch.operator === implicitToken) {
      branch.operator = 'OR';
    }
    if (!fieldGroup || branch.operator && (branch.operator !== fieldGroup.operator)) {
      var newFieldGroup = {
        type: 'group',
        operator: branch.operator || 'OR',
        nodes: []
      };

      fieldTree.nodes.push(newFieldGroup);
      fieldGroup = newFieldGroup;
    }

    // Track the last used field name to apply to implicitly defined terms
    if (branch.field && branch.field !== implicitToken) {
      fieldGroup.implicitField = branch.field;
    }

    if (branch.term || (branch.lowerBound && branch.upperBound)) {
      var field = branch.field;

      // Handle implicit field names by using the last used field name
      if (field === implicitToken) {
        if (fieldGroup.implicitField) {
          field = fieldGroup.implicitField;
        } else {
          throw 'Field name is implicit and not defined elsewhere.';
        }
      }

      fieldGroup.nodes.push(makeField(branch, field));
    }

    if (branch.left) {
      this.groupNode(branch.left, fieldTree, fieldGroup);
      if (branch.right) {
        this.groupNode(branch.right, fieldTree, fieldGroup);
      }
    }
  };

  /**
   * @description
   * Generate a field object that's used to render the query editor fields.
   *
   * @param {object} node The node with all the necessary information
   * @return {object} A field object used to render the query editor
   */
  function makeField(node, fieldName) {
    var fieldType = _.find(queryFields, function (type) {
          return type.name === node.field;
        }),
        field = {
          field: fieldName || node.field,
          fieldType: fieldType || 'string',
          transformer: node.transformer || '='
        };

    if (node.lowerBound || node.upperBound) {
      field.lowerBound = node.lowerBound || undefined;
      field.upperBound = node.upperBound || undefined;
      field.inclusive = node.inclusive || true;
    } else {
      field.term = node.term || undefined;
    }

    return field;
  }
}
