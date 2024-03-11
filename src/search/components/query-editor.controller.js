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

  console.log('queryFields', queryFields);

  console.log('taxonomyTerms', taxonomyTerms);

  qe.groupedQueryTree = searchHelper.getQueryTree() || qe.getDefaultQueryTree();

  function getGroupsFromLuceneSyntax(query) {
    var groups = [];
    var match;
    var regex = /\(([^)]+)\)|([^()]+)/g;

    while ((match = regex.exec(query)) !== null) {
      var group = match[1] ? match[1] : match[2];
      groups.push(group.trim());
    }

    return groups;
  }

  // Create a mapping from the 'field' value in the definitions to the corresponding object
  const fieldMapping = queryFields.filter(function(queryField) {
    return queryField.hasOwnProperty('name');
  }).reduce(function(map, def) {
    map[def.field] = def;
    return map;
  }, {});


  const fieldMappingByName = queryFields.filter(function(queryField) {
    return !['startdate', 'enddate'].includes(queryField.name);
  }).reduce(function(map, def) {
    map[def.name] = def;
    return map;
  }, {});

  function splitQuery(query) {
    // Splitting the query by AND and OR, while keeping the separators
    const parts = query.split(/ (AND|OR) /);

    // Grouping parts into [[part, operator], ...]
    const groupedParts = [];
    for (let i = 0; i < parts.length; i += 2) {
      groupedParts.push([parts[i], parts[i + 1] || 'OR']);
    }
    return groupedParts;
  }

  function parseRange(rangeString) {
    const matches = rangeString.match(/\[(.*?) TO (.*?)\]/);
    if (matches && matches.length === 3) {
      return {lowerBound: matches[1], upperBound: matches[2]};
    }
    return {lowerBound: '', upperBound: ''};
  }

  function getFieldTransformer(fieldNode, isFieldExcluded) {

    if (fieldNode.fieldType === 'date-range') {
      if (fieldNode.upperBound === '*') {
        return '>';
      }
      if (fieldNode.lowerBound === '*') {
        return '<';
      }
      return '=';
    }

    if (fieldNode.fieldType === 'choice') {
      return isFieldExcluded ? '!' : '=';
    }

    if (fieldNode.fieldType === 'term') {
      return isFieldExcluded ? '!' : '=';
    }

    if (fieldNode.fieldType === 'string') {
      return isFieldExcluded ? '!' : '=';
    }

    if (fieldNode.fieldType === 'tokenized-string') {
      return isFieldExcluded ? '-' : '+';
    }

    if (fieldNode.fieldType === 'check') {
      return  isFieldExcluded ? '!' : '=';
    }

    // default
    return '=';

  }

  function getFieldNameForTermsId(id) {
    const term  = taxonomyTerms.find(function(term) {
      return term.id === id;
    });

    if (term.domain === 'theme') {
      return 'category_theme_name';
    }

    if (term.domain === 'facility') {
      return 'category_facility_name';
    }

    if (term.domain === 'eventtype') {
      return term.scope.includes('events') ?  'category_eventtype_name' : 'locationtype';
    }
  }

  function getIsFieldExcluded(part) {
    const cleanedPart = part.replace('(', '');
    return cleanedPart.startsWith('!') || cleanedPart.startsWith('-');
  }

  function getCleanedField(field) {
    return field.replace(/[\(\)!-]/g, '');
  }



  function parseQueryPart(part) {
    console.log('part', part);
    // Extract field and term from the part (assuming format "field:term")
    const parts = part.split(':', 1);
    console.log('parts', parts);
    const isFieldExcluded = getIsFieldExcluded(parts[0]);
    const field = getCleanedField(parts[0]);
    console.log('field', field);

    console.log('isFieldExcluded', isFieldExcluded);

    let term = part.replace(field + ':', '').replace('-', '').replaceAll('(', '').replaceAll(')', '');

    term = term === '!permanent' ? '(!permanent)' : term.replace('!', '');

    // Find the field definition in the mapping
    let fieldDef = fieldMapping[field] || {};

    if (field === 'terms.id') {
      const fieldName =  getFieldNameForTermsId(term);
      fieldDef = fieldMappingByName[fieldName] || {};
    }


    console.log('fieldDef', fieldDef);
    console.log('fieldDef name', fieldDef.name);

    var fieldNode = {
      field: fieldDef.field || field,
      fieldType: fieldDef.type || 'unknown',
      name: fieldDef.name || field,
      term: term,
      transformer: '='
    };

    if (fieldNode.fieldType === 'date-range') {
      const range = parseRange(term);
      fieldNode.lowerBound = range.lowerBound === '*' ?  '*' :  new Date(range.lowerBound);
      fieldNode.upperBound = range.upperBound === '*' ? '*' :  new Date(range.upperBound);
    }

    fieldNode.transformer = getFieldTransformer(fieldNode, isFieldExcluded);

    // Example return structure
    return fieldNode;
  }

  function parseQuery(queryParts) {
    const nodes = queryParts.map(function(queryParts) {
      const part = queryParts[0];
      const operator = queryParts[1];
      const parsedNode = parseQueryPart(part);
      return {
        type: 'group',
        operator: operator,
        nodes: [parsedNode]
      };
    });
    return nodes;
  }

  // Example usage
  // const decodedQuery = 'dateRange:[2024-03-06T00:00:00+01:00 TO 2024-03-06T23:59:59+01:00] OR name.\\*:test';
  // name.\*:test OR (dateRange:[2024-03-07T00:00:00%2B01:00 TO *] OR (terms.id:1.7.1.0.0 OR audienceType:everyone))
  // const decodedQuery = 'dateRange:[* TO 2024-03-07T23:59:59+01:00] OR name.\\*:test';
  // const decodedQuery = 'name.\*:test OR (dateRange:[2024-03-07T00:00:00+01:00 TO *] OR (terms.id:3.14.0.0.0 OR audienceType:everyone))';  
  // const decodedQuery = 'terms.id:0.50.4.0.0 OR (location.labels:test OR (attendanceMode:mixed OR (bookingAvailability:available OR regions:nis-21004-Z)))';
  // const decodedQuery = 'terms.id:0.50.4.0.0 OR (location.labels:test OR (attendanceMode:mixed OR (bookingAvailability:available OR (terms.id:wwjRVmExI0w6xfQwT1KWpx OR (terms.id:1.7.12.0.0 OR terms.id:3.33.0.0.0)))))'
  // const decodedQuery =  'terms.id:0.50.4.0.0 OR (!location.labels:test OR (attendanceMode:mixed OR (bookingAvailability:available OR (terms.id:wwjRVmExI0w6xfQwT1KWpx OR (terms.id:1.7.12.0.0 OR terms.id:3.33.0.0.0)))))'
  const decodedQuery = 'terms.id:0.50.4.0.0 OR (!location.labels:test OR (attendanceMode:mixed OR (bookingAvailability:available OR (terms.id:wwjRVmExI0w6xfQwT1KWpx OR (terms.id:1.7.12.0.0 OR (terms.id:3.33.0.0.0 OR -name.\\*:"test 2"))))))';
  // const decodedQuery = 'bookingAvailability:unavailable OR (status:Available OR (modified:[2024-03-11T00:00:00+01:00 TO 2024-03-11T23:59:59+01:00] OR calendarType:(!permanent)))';

  // TODO make multiple queries and write tests for it

  const parsedQueryParts = splitQuery(decodedQuery);
  const jsonNodes = parseQuery(parsedQueryParts);

  const jsonStructure = {
    type: 'root',
    nodes: jsonNodes
  };

  console.log('jsonStructure', jsonStructure);

  function fillModalWithValuesFromQuery() {
    // init query modal?
    var queryString = window.location.search;
    console.log('queryString', queryString);
    console.log('queryBuilder', queryBuilder);
    /* jshint ignore:start */
    var urlParams = new URLSearchParams(queryString);
    var query = urlParams.get('query');

    if (!query) {
      return;
    }

    var currentQuery = {};
    currentQuery.queryString = query;
    var initialQuery = queryBuilder.parseQueryString(currentQuery);
    console.log('initialQuery', initialQuery);
    var root = qe.groupedQueryTree;

    // (name.\*:"test 1" OR name.\*:"test 2") OR name.\*:"test 3"
    // array with items
    var luceneGroupQueries = getGroupsFromLuceneSyntax(query);
    var rootGroups = []

    luceneGroupQueries.forEach(function(groupQuery) {
      var group = queryBuilder.groupQueryTree(queryBuilder.parseQueryString({queryString: groupQuery}));
      group.operator = 'OR';
      group.type = 'group';
      rootGroups.push(group);
    })

    console.log('rootGroups', rootGroups);

    var groups = queryBuilder.groupQueryTree(initialQuery);

    var newGroupNodes = groups.nodes.map(function(group) {
      group.nodes = group.nodes.map(function(node) {
        const foundQueryField = queryFields.find(function(queryField) {
          return queryField.field === node.field;
        });
        if (foundQueryField) {
          node.name =  foundQueryField.name;
          node.type = foundQueryField.type;
          node.fieldType = foundQueryField.type;

          if (node.type === 'date-range') {
            node.lowerBound = new Date(node.lowerBound);
            node.upperBound = new Date(node.upperBound);
          }

          // TODO this could probably be done better
          var foundQueryKey = Object.keys(initialQuery).find(function(key) {
            return initialQuery[key].field === node.field &&
              initialQuery[key].term === node.term &&
              typeof initialQuery[key].transformer === 'string';
          })

          console.log('foundObjectInQuery', foundQueryKey);

          node.transformer = foundQueryKey && initialQuery[foundQueryKey].transformer ?
            initialQuery[foundQueryKey].transformer :
            _.first(fieldTypeTransformers[foundQueryField.type]);
          // node.transformer = node.transformer ? node.transformer : '+';
        }
        return node;
      })
      return group;
    });

    console.log('newGroupNodes', newGroupNodes);
    root = JSON.parse(JSON.stringify(root));
    /* jshint ignore:end */
  }

  qe.groupedQueryTree = jsonStructure;

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

    console.log('subgroup', group);

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
