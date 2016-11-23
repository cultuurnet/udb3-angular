(function () {
'use strict';

/**
 * @ngdoc component
 * @name udb.core.directive:udbTime
 * @description
 * # udbTime
 */
angular
  .module('udb.core')
  .directive('udbTime', udbTimeDirective);

function udbTimeDirective() {
  return {
    restrict: 'AE',
    require: 'ngModel',
    template: '<input type="time" ng-model="hour" class="form-control uur" required />',
    link: link
  };

  function link (scope, element, attrs, ngModel) {

    scope.hour = ngModel.$viewValue;

    function hoursChanged(timestamp) {
      return formatter(timestamp);
    }

    ngModel.$parsers.push(function(date) {
      //View -> Model
      return moment(date).format('HH:mm');
    });

    function formatter(timestamp) {
      //var hour = moment(timestamp);
      //attrs.destination = hour.format('HH:mm');
      //Model -> View
      return moment(timestamp).format('HH:mm');
    }

    ngModel.$formatters.push(formatter);

    ngModel.$render = function() {
      //element.html(formatter(ngModel.$viewValue));
      //element.html(ngModel.$viewValue);
      ngModel.$setViewValue(formatter(ngModel.$modelValue));
    };

    ngModel.$render = function() {
      scope.hour = formatter(ngModel.$modelValue);
    };

    console.log(ngModel);
    console.log(element);
  }
}
})();
