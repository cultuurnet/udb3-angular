'use strict';

/**
 * @ngdoc service
 * @name udb.search.sapi2QueryTreeValidator
 * @description
 * # sapi2QueryTreeValidator
 * Service in the udb.search.
 */
angular.module('udb.search')
  .service('sapi2QueryTreeValidator', QueryTreeValidator);

QueryTreeValidator.$inject = ['sapi2QueryFields'];
function QueryTreeValidator(queryFields) {

  var validFieldNames = _.union(_.map(queryFields, 'name'), ['_exists_']),
    implicitToken = '<implicit>',
    validParentFieldNames = _(validFieldNames)
      .filter(function (fieldName) {
        return fieldName.indexOf('.') > 0;
      })
      .map(function (fieldName) {
        return fieldName.split('.')[0];
      })
      .value();

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

      var fieldName = _.trim(field, '.\\*');
      var fieldHasWildcard = field !== fieldName;

      if (field !== null && field !== implicitToken) {
        var validFieldsToCheck = fieldHasWildcard ? validParentFieldNames : validFieldNames;
        if (!_.contains(validFieldsToCheck, field)) {
          errors.push(field + ' is not a valid search field');
        }
      }
    }
  };

  this.validate = function (queryTree, errors) {
    validateFields(queryTree, 0, errors);
  };

}
