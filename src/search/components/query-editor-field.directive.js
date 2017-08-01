'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:udbQueryEditorField
 * @description
 * # udbQueryEditorField
 */
angular
  .module('udb.search')
  .directive('udbQueryEditorField', udbQueryEditorField);

/* @ngInject */
function udbQueryEditorField(searchApiSwitcher) {
  return searchApiSwitcher.getQueryEditorFieldDefinition();
}
