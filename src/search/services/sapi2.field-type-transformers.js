'use strict';

/**
 * @ngdoc service
 * @name udb.search.sapi2FieldTypeTransformers
 * @description
 * # sapi2FieldTypeTransformers
 * Value in udb.search module.
 */
angular
  .module('udb.search')
  .value('sapi2FieldTypeTransformers', {
    'string': ['=', '!'],
    'tokenized-string': ['+', '-'],
    'choice': ['=', '!'],
    'term': ['=', '!'],
    'number': ['=', '<', '>'],
    'check': ['='],
    'date-range': ['=', '><', '<', '>']
  });
