'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:udbQueryEditor
 * @description
 * # udbQueryEditor
 */
angular
  .module('udb.search')
  .directive('udbQueryEditor', udbQueryEditor);

/* @ngInject */
function udbQueryEditor() {
  return {
    templateUrl: 'templates/query-editor.directive.html',
    restrict: 'EA',
    controllerAs: 'qe',
    controller: 'QueryEditorController'
  };
}
