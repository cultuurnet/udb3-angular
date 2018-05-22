'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:event-translate.html
 * @description
 * # udb event form directive
 */
angular
  .module('udb.event-translate')
  .directive('udbEventTranslate', EventTranslateDirective);

/* @ngInject */
function EventTranslateDirective() {
  return {
    templateUrl: 'templates/event-translate.html',
    restrict: 'EA',
  };
}
