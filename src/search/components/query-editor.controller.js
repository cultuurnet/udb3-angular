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

  qe.groupedQueryTree = searchHelper.getQueryTree() || qe.getDefaultQueryTree();

  // init query modal?
  var queryString = window.location.search;
  console.log('queryString', queryString);
  console.log('queryBuilder', queryBuilder);
  /* jshint ignore:start */
  var urlParams = new URLSearchParams(queryString);
  console.log('urlParams', urlParams);
  var currentQuery = {};
  currentQuery.queryString = urlParams.get('query');
  console.log('currentQuery', currentQuery);
  var initialQuery = queryBuilder.parseQueryString(currentQuery);
  console.log('initialQuery', initialQuery);
  var root = qe.groupedQueryTree;
  console.log('old root', root);

  var groups = queryBuilder.groupQueryTree(initialQuery);
  console.log('initialGroups', groups);
  console.log('fieldTypeTransformers', fieldTypeTransformers);

  var newGroupNodes = groups.nodes.map(function(group) {
    group.nodes = group.nodes.map(function(node) {
      const foundQueryField = queryFields.find(function(queryField) {
        return queryField.field === node.field;
      });
      if (foundQueryField) {
        node.name =  foundQueryField.name;
        node.type = foundQueryField.type;

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
  // var group = {
  //   type: 'group',
  //   operator: initialQuery.operator,
  //   nodes: [
  //     {
  //       field: initialQuery.left.field,
  //       name: 'title',
  //       term: initialQuery.left.term,
  //       fieldType: 'tokenized-string',
  //       transformer: '+'
  //     }
  //   ]
  // };
  // root.nodes.push(group);

  root.nodes = newGroupNodes;

  /* jshint ignore:end */

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
