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

  /* @ngInject */
  function udbDatepickerDirective(appConfig) {

    return {
      restrict: 'EA',
      require: 'ngModel',
      link: link
    };

    function link (scope, elem, attrs, ngModel) {

      loadDatePicker();

      ngModel.$render = function () {
        // the datepicker component does not play well with date objects that are not set to midnight
        var date = moment(ngModel.$viewValue);
        elem.datepicker('update', date.startOf('day').toDate());
      };

      /**
       * Load the date picker.
       */
      function loadDatePicker() {

        var lastSelectedYear;
        var lastSelectedMonth;
        var selectedDate = ngModel.$viewValue;

        if (selectedDate) {
          lastSelectedYear = selectedDate.getFullYear();
          lastSelectedMonth = selectedDate.getMonth();
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
            var highlightDate = _.get(appConfig, 'calendarHighlight.highlightDate');
            var highlightExtraClass = _.get(appConfig, 'calendarHighlight.highlightExtraClass');

            if (!highlightDate) {
              return;
            }

            // init Date with ISO string
            if (highlightDate.toLocaleDateString() === date.toLocaleDateString()) {
              var highlightClasses = 'highlight';

              if (highlightExtraClass) {
                highlightClasses += ' ' + highlightExtraClass;
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
