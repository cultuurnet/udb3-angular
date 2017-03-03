'use strict';

/**
 * @ngdoc component
 * @name udb.event-form.directive:udbFormAge
 * @description
 * # Target age component for offer forms
 */
angular
  .module('udb.event-form')
  .directive('udbFormAge', FormAgeDirective);

/* @ngInject */
function FormAgeDirective() {
  return {
    templateUrl: 'templates/form-age.html',
    restrict: 'EA',
    controller: 'FormAgeController',
    controllerAs: 'fac'
  };
}
