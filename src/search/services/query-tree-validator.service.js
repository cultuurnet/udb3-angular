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

  var validFields = _.union(_.map(queryFields, 'field'), ['_exists_']),
      implicitToken = '<implicit>',
      validParentFields = _(validFields)
        .filter(function (field) {
          return field.indexOf('.') > 0;
        })
        .map(function (field) {
          var fields = field.split('.');
          fields.pop();
          return fields.join('.');
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

    var queryField = current.field;
    if (typeof(queryField) !== 'undefined') {
      var field = _.trim(queryField, '.\\*');
      var fieldHasWildcard = queryField !== field;

      if (field !== null && field !== implicitToken) {
        var validFieldsToCheck = fieldHasWildcard ? validParentFields : validFields;
        if (!_.contains(validFieldsToCheck, field)) {
          errors.push(queryField + ' is not a valid search field');
        }
      }
    }
  };

  this.validate = function (queryTree, errors) {
    validateFields(queryTree, 0, errors);
  };

}
