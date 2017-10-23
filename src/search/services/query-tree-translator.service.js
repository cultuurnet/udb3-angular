'use strict';

/**
 * @ngdoc service
 * @name udb.search.QueryTreeTranslator
 * @description
 * # QueryTreeTranslator
 * Service in the udb.search.
 */
angular
  .module('udb.search')
  .service('QueryTreeTranslator', QueryTreeTranslator);

/* @ngInject */
function QueryTreeTranslator(queryFieldTranslations, queryFields) {
  /**
   * @param {string} field    - The field to translate.
   * @param {string} srcLang  - To source language to translate from.
   */
  var translateField = function (field, srcLang) {
    var translatableFieldName = _.findKey(queryFieldTranslations[srcLang], function (src) {
      return src === field;
    });

    var queryField = (undefined === translatableFieldName) ?
      undefined :
      _.find(queryFields, {name: translatableFieldName.toLowerCase()});

    return (undefined === queryField) ? field : queryField.field;
  };

  var translateNode = function (node, depth) {
    var left = node.left || false,
      right = node.right || false,
      nodes = [];

    if (left) {
      nodes.push(left);
    }
    if (right) {
      nodes.push(right);
    }

    for (var i = 0, len = nodes.length; i < len; i++) {
      var iNode = nodes[i];
      if (typeof iNode === 'object') {
        translateNode(iNode, depth + 1);
      }
    }

    if (node.field) {
      node.field = translateField(node.field, 'sapi2');
      node.field = translateField(node.field, 'en');
      node.field = translateField(node.field, 'nl');
    }

  };

  this.translateQueryTree = function (queryTree) {
    return translateNode(queryTree, 0);
  };
}
