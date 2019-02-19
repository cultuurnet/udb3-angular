'use strict';

/**
 * @ngdoc service
 * @name udb.search.fieldTypeTransformers
 * @description
 * # fieldTypeTransformers
 * Value in udb.search module.
 */
angular
  .module('udb.search')
  .value('fieldTypeTransformers', {
    'string': ['=', '!'],
    'tokenized-string': ['+', '-'],
    'choice': ['=', '!'],
    'term': ['=', '!'],
    'termNis': ['=', '!'],
    'number': ['=', '><', '<', '>'],
    'check': ['='],
    'date-range': ['=', '><', '<', '>']
});
