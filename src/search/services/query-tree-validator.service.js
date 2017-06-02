'use strict';

/**
 * @ngdoc service
 * @name udb.search.QueryTreeValidator
 * @description
 * # QueryTreeValidator
 * Service in the udb.search.
 */
angular.module('udb.search')
  .service('QueryTreeValidator', QueryTreeValidator);

/* @ngInject */
function QueryTreeValidator(queryFields) {

  var validFieldNames = _.union(_.map(queryFields, 'name'), ['_exists_']),
    implicitToken = '<implicit>';

  var validateFields = function (current, depth, errors) {
    var left = current.left || false,
      right = current.right || false,
      nodes = [];

    if (left) {
      nodes.push(left);
    }
    if (right) {
      nodes.push(right);
    }

    for (var i = 0, len = nodes.length; i < len; i++) {
      var node = nodes[i];
      if (typeof node === 'object') {
        validateFields(node, depth + 1, errors);
      }
    }

    var field = current.field;
    if (typeof(field) !== 'undefined') {
      if (field !== null && field !== implicitToken && !_.contains(validFieldNames, field)) {
        errors.push(field + ' is not a valid search field');
      }
    }
  };

  this.validate = function (queryTree, errors) {
    validateFields(queryTree, 0, errors);
  };

}
