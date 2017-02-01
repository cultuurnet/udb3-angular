'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:tudbEventFormTimestampSelection
 * @description
 * # timestamp selection for event form
 */
angular
  .module('udb.event-form')
  .directive('udbEventFormTimestamp', EventFormTimestampDirective);

/* @ngInject */
function EventFormTimestampDirective() {
  return {
    templateUrl: 'templates/event-form-timestamp.html',
    restrict: 'EA',
    scope: {
      formData: '='
    }
  };
}
