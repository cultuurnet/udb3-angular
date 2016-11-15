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
    requie: 'ngModel',
    tempate: '<input type="time" class="form-control uur" required />',
    link: link
  };

  function link (scope, element, attrs, ngModel) {

    ngModel.$render = function() {
      //element.html(formatter(ngModel.$viewValue));
      element.html(ngModel.$viewValue);
    };

    function hoursChanged(timestamp) {
      return formatter(timestamp);
    }

    function formatter(timestamp) {
      var hour = moment(timestamp);
      //attrs.destination = hour.format('HH:mm');
      return hour.format('HH:mm');
    }

    ngModel.$formatters.push(formatter);

  }
}
})();
