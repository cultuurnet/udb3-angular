'use strict';

/**
 * @ngdoc component
 * @name udb.event-form.directive:udbAgeInput
 * @description
 * # Age input parsing and formatting
 */
angular
  .module('udb.event-form')
  .directive('udbAgeInput', AgeInputDirective);

/* @ngInject */
function AgeInputDirective() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, controller) {
      function ensureAge(value) {
        var number = parseInt(value);

        if (isNaN(number)) {
          controller.$setViewValue(undefined);
          controller.$render();
          return undefined;
        }

        var age = Math.abs(number);

        if (age.toString() !== value) {
          controller.$setViewValue(age.toString());
          controller.$render();
        }

        return age;
      }

      controller.$formatters.push(ensureAge);
      controller.$parsers.splice(0, 0, ensureAge);
    }
  };
}
