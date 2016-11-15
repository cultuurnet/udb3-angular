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
    template: '<input type="time" ng-model="ngModel" class="form-control uur" required />',
    link: link
  };

  function link (scope, element, attrs, ngModel) {
    console.log(ngModel);
    console.log(element);

    /*ngModel.$render = function() {
      //element.html(formatter(ngModel.$viewValue));
      element.html(ngModel.$viewValue);
    };*/

    function hoursChanged(timestamp) {
      return formatter(timestamp);
    }

    function formatter(timestamp) {
      //var hour = moment(timestamp);
      //attrs.destination = hour.format('HH:mm');
      return moment(timestamp).format('HH:mm');
    }

    ngModel.$formatters.push(formatter);
  }
}
})();
