'use strict';

/**
 * @typedef {Object} OfferType
 * @property {string} id
 * @property {string} label
 */

/**
 * @ngdoc directive
 * @name udb.search.controller:QueryEditorController
 * @description
 * # QueryEditorController
 */
angular
  .module('udb.search')
  .controller('QueryEditorController', QueryEditorController);

/* @ngInject */
function QueryEditorController(
  LuceneQueryParser,
  queryFields,
  LuceneQueryBuilder,
  taxonomyTerms,
  sapi3CitiesBE,
  fieldTypeTransformers,
  searchHelper,
  $translate,
  $rootScope,
  eventTypes,
  placeTypes
) {
  var qe = this,
      queryBuilder = LuceneQueryBuilder;

  qe.fieldOptions = _.filter(queryFields, 'editable');

  // use the first occurrence of a group name to order it against the other groups
  var orderedGroups = _.chain(qe.fieldOptions)
    .map(function (field) {
           return field.group;
         })
    .uniq()
    .value();

  _.forEach(qe.fieldOptions, function (field) {
    var fieldName = 'queryFieldLabel.' + field.name,
        fieldGroup = 'queryFieldGroup.' + field.group;

    $translate([fieldName, fieldGroup]).then(function (translations) {
      field.label = translations[fieldName];
      field.groupIndex = _.indexOf(orderedGroups, field.group);
      field.groupLabel = translations[fieldGroup];
    });
  });

  qe.getDefaultQueryTree = function () {
    return {
      type: 'root',
      nodes: [
        {
          type: 'group',
          operator: 'OR',
          nodes: [
            {
              name: 'title',
              field: 'name.\\*',
              term: '',
              fieldType: 'tokenized-string',
              transformer: '+'
            }
          ]
        }
      ]
    };
  };

  qe.groupedQueryTree = searchHelper.getQueryTree() || qe.getDefaultQueryTree();

  // Create a mapping from the 'field' value in the definitions to the corresponding object
  var fieldMapping = queryFields.filter(function(queryField) {
    return queryField.hasOwnProperty('name') && queryField.name !== 'startdate' && queryField.name !== 'enddate';
  }).reduce(function(map, def) {
    map[def.field] = def;
    return map;
  }, {});

  var fieldMappingByName = queryFields.filter(function(queryField) {
    return queryField.name !== 'startdate' && queryField.name !== 'enddate';
  }).reduce(function(map, def) {
    map[def.name] = def;
    return map;
  }, {});

  function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
  }

  function getFieldTransformer(fieldNode, isFieldExcluded) {

    if (fieldNode.fieldType === 'tokenized-string') {
      return fieldNode.transformer === '=' ? '+' : '-';
    }

    if (fieldNode.fieldType === 'date-range') {
      if (fieldNode.upperBound === '*') {
        return '>';
      }
      if (fieldNode.lowerBound === '*') {
        return '<';
      }

      if (!isSameDay(fieldNode.lowerBound, fieldNode.upperBound)) {
        return '><';
      }

      return '=';
    }

    if (fieldNode.fieldType === 'check') {
      return '=';
    }

    return fieldNode.transformer;

    // if (fieldNode.fieldType === 'term') {
    //   return isFieldExcluded ? '!' : '=';
    // }

    // if (fieldNode.fieldType === 'string') {
    //   return isFieldExcluded ? '!' : '=';
    // }

    // if (fieldNode.fieldType === 'tokenized-string') {
    //   return isFieldExcluded ? '-' : '+';
    // }

  }

  function getFieldNameForTermsId(id) {
    var foundTerms = taxonomyTerms.filter(function(term) {
      return term.id === id;
    });

    var term = foundTerms[0];

    if (term.domain === 'theme') {
      return 'category_theme_name';
    }

    if (term.domain === 'facility') {
      return 'category_facility_name';
    }

    if (term.domain === 'eventtype') {
      return term.scope && term.scope.indexOf('events') !== -1 ?  'category_eventtype_name' : 'locationtype';
    }
  }

  function getIsFieldExcluded(part) {
    if (!part) {
      return false;
    }
    var cleanedPart = part.replace('(', '');
    return cleanedPart && (cleanedPart.indexOf('!') === 0 || cleanedPart.indexOf('-') === 0);
  }

  qe.parseModalValuesFromQuery = function (query) {
    var parsedLuceneQuery = LuceneQueryParser.parse(query);
    var groupedTree = queryBuilder.groupQueryTree(parsedLuceneQuery);
    console.log('parsed groupedTree', groupedTree);

    groupedTree.nodes = groupedTree.nodes.map(function(node) {
      if (node.type === 'field') {
        node.type = 'group';
      }
      node.nodes = node.nodes.map(function(subNode) {
        subNode.name = fieldMapping[subNode.field].name;
        subNode.fieldType = fieldMapping[subNode.field].type || 'unknown';

        if (subNode.fieldType === 'date-range') {
          subNode.lowerBound = subNode.lowerBound === '*' ?  '*' :  new Date(subNode.lowerBound);
          subNode.upperBound = subNode.upperBound === '*' ? '*' :  new Date(subNode.upperBound);
          delete subNode.term;
        }

        if (subNode.field === 'terms.id') {
          var fieldName =  getFieldNameForTermsId(subNode.term);
          var fieldDef = fieldMappingByName[fieldName] || {};
          subNode.name = fieldDef.name;
        }

        if (subNode.name === 'permanent' && subNode.transformer === '!') {
          subNode.term = '(!permanent)';
        }

        var isFieldExcluded = getIsFieldExcluded(subNode.term);
        subNode.transformer = getFieldTransformer(subNode, isFieldExcluded);
        return subNode;
      });
      return node;
    });

    groupedTree.nodes = groupedTree.nodes.filter(function(node) {
      return node.nodes.length > 0;
    });

    return groupedTree;
  };

  var currentUrl = new URL(window.location.href);
  var advancedSearchQuery =  currentUrl.searchParams ? currentUrl.searchParams.get('query') : undefined;

  if (advancedSearchQuery) {
    var modalValues = qe.parseModalValuesFromQuery(advancedSearchQuery);
    console.log('modalValues', modalValues);
    qe.groupedQueryTree = modalValues;
  }

  // Holds options for both term and choice query-field types
  qe.transformers = {};
  qe.termOptions = _.groupBy(taxonomyTerms, function (term) {
    return 'category_' + term.domain + '_name';
  });
  qe.termOptions.locationtype = placeTypes;
  qe.termOptions.nisRegions = sapi3CitiesBE;
  qe.termOptions['category_eventtype_name'] = eventTypes; // jshint ignore:line
  _.forEach(queryFields, function (field) {
    if (field.type === 'choice') {
      qe.termOptions[field.name] = field.options;
    }
    qe.transformers[field.name] = fieldTypeTransformers[field.type];
  });

  /**
   * Update the search input field with the data from the query editor
   */
  qe.updateQueryString = function () {
    searchHelper.setQueryTree(qe.groupedQueryTree);
    $rootScope.$emit('searchSubmitted');
    qe.stopEditing();
  };

  qe.stopEditing = function () {
    $rootScope.$emit('stopEditingQuery');
  };

  /**
   * Add a field to a group
   *
   * @param  {object}  group       The group to add the field to
   * @param {number}  fieldIndex  The index of the field after which to add
   */
  qe.addField = function (group, fieldIndex) {

    var insertIndex = fieldIndex + 1,
        field = {
          field: 'name.\\*',
          name: 'title',
          term: '',
          fieldType: 'tokenized-string',
          transformer: '+'
        };

    group.nodes.splice(insertIndex, 0, field);

    if (group.nodes.length) {
      group.type = 'group';
      group.operator = 'OR';
    }
  };

  /**
   * Remove a field from a group
   *
   * @param {object}    group       The group to delete a field from
   * @param {number}    fieldIndex  The index of the field to delete
   * @param {object=}   rootGroup   The root group of the field to delete
   */
  qe.removeField = function (group, fieldIndex, rootGroup) {
    if (rootGroup.nodes.length > 1) {
      group.nodes.splice(fieldIndex, 1);
    }

    qe.cleanUpGroups();
  };

  qe.cleanUpGroups = function () {
    qe.removeEmptyGroups();
    qe.unwrapSubGroups();
  };

  qe.unwrapSubGroups = function () {
    var root = qe.groupedQueryTree;

    _.forEach(root.nodes, function (group) {
      var firstNode = group.nodes[0];

      if (firstNode.nodes) {
        var firstNodeChildren = firstNode.nodes;
        group.nodes.splice(0, 1);
        _.forEach(firstNodeChildren, function (node, index) {
          group.nodes.splice(index, 0, node);
        });
      }
    });
  };

  qe.removeEmptyGroups = function () {
    var root = qe.groupedQueryTree;

    _.forEach(root.nodes, function (group) {
      _.remove(group.nodes, function (node) {
        return node.nodes && node.nodes.length === 0;
      });
    });
  };

  qe.toggleExcludeGroup = function (group) {
    group.excluded = !group.excluded;
  };

  qe.canRemoveGroup = function () {
    return !qe.hasSingleGroup();
  };

  qe.removeGroup = function (groupIndex) {
    if (qe.canRemoveGroup()) {
      var root = qe.groupedQueryTree,
          group = root.nodes[groupIndex];

      if (qe.canRemoveGroup() && group) {
        root.nodes.splice(groupIndex, 1);
      }
    }
  };

  qe.resetGroups = function () {
    qe.groupedQueryTree = qe.getDefaultQueryTree();
  };

  /**
   * Add a field group
   */
  qe.addGroup = function () {
    var root = qe.groupedQueryTree;
    var group = {
      type: 'group',
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

    root.nodes.push(group);
  };

  qe.addSubGroup = function (parentGroup, fieldIndex) {
    var group = {
      type: 'group',
      operator: 'AND',
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

    parentGroup.nodes.splice(fieldIndex + 1, 0, group);
  };

  qe.fieldTypeSelected = function (field) {
    var fieldName = field.name,
        queryField = _.find(queryFields, function (field) {
          return field.name === fieldName;
        });

    if (queryField) {
      field.field = queryField.field;
    }

    if (field.fieldType !== queryField.type) {
      // TODO: Maybe try to do a type conversion?
      if (queryField.type === 'date-range') {
        field.lowerBound = moment().startOf('day').toDate();
        field.upperBound = moment().endOf('day').toDate();
        field.inclusive = true;
      } else {
        field.term = '';
        field.lowerBound = undefined;
        field.upperBound = undefined;
        field.inclusive = undefined;
      }

      if (queryField.type === 'check') {
        field.term = queryField.name;
      }

      if (queryField.type === 'number') {
        field.inclusive = true;
      }

      if (!field.transformer || !_.contains(fieldTypeTransformers[queryField.type], field.transformer)) {
        field.transformer = _.first(fieldTypeTransformers[queryField.type]);
      }

      field.fieldType = queryField.type;
    }
  };

  qe.hasSingleGroup = function () {
    return (qe.groupedQueryTree.nodes.length === 1);
  };
}
