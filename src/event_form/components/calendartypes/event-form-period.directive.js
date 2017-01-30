'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:tudbEventFormTimestampSelection
 * @description
 * # timestamp selection for event form
 */
angular
  .module('udb.event-form')
  .directive('udbEventFormPeriod', EventFormPeriodDirective);

/* @ngInject */
function EventFormPeriodDirective() {
  return {
    templateUrl: 'templates/event-form-period.html',
    restrict: 'EA',
    scope: {
      formData: '='
    }
  };
}
