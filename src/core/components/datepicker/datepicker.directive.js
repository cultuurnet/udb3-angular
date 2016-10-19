(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name udb.core.directive:udbDatepicker
   * @description
   * # directive for datepicker integration.
   * https://github.com/eternicode/bootstrap-datepicker
   */
  angular
  .module('udb.core')
  .directive('udbDatepicker', udbDatepickerDirective);

  function udbDatepickerDirective() {

    return {
      restrict: 'EA',
      require: 'ngModel',
      link: link
    };

    function link (scope, elem, attrs, ngModel) {

      loadDatePicker();

      ngModel.$render = function () {
        elem.datepicker('update', ngModel.$viewValue);
      };

      /**
       * Load the date picker.
       */
      function loadDatePicker() {

        var lastSelectedYear;
        var lastSelectedMonth;

        if (scope.lastSelectedDate) {
          lastSelectedYear = scope.lastSelectedDate.getFullYear();
          lastSelectedMonth = scope.lastSelectedDate.getMonth();
        } else {
          var today = new Date();
          lastSelectedYear = today.getFullYear();
          lastSelectedMonth = today.getMonth();
        }

        var options = {
          defaultViewDate: {year: lastSelectedYear, month: lastSelectedMonth, day: 1},
          format: 'd MM yyyy',
          language: 'nl-BE',
          beforeShowDay: function (date) {
            if (!attrs.highlightDate) {
              return;
            }

            // init Date with ISO string
            var highlightDate = new Date(attrs.highlightDate);
            if (highlightDate.toLocaleDateString() === date.toLocaleDateString()) {
              var highlightClasses = 'highlight';

              if (attrs.highlightExtraClass) {
                highlightClasses += ' ' + attrs.highlightExtraClass;
              }

              return {classes: highlightClasses};
            }
          }
        };

        elem.datepicker(options).on('changeDate', function (newValue) {
          if (!ngModel.$viewValue || ngModel.$viewValue.getTime() !== newValue.date.getTime()) {
            ngModel.$setViewValue(newValue.date);
          }
        });
      }
    }
  }
})();
