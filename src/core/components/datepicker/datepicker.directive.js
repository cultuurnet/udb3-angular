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

        var defaultViewDate = new Date();

        if (scope.formData) {
          for (var i = (scope.formData.timestamps.length - 1); i >= 0; i--) {
            if (scope.formData.timestamps[i].date !== '') {
              defaultViewDate = scope.formData.timestamps[i].date;
              break;
            }
          }
        }

        var options = {
          defaultViewDate: {year: defaultViewDate.getFullYear(), month: defaultViewDate.getMonth(), day: 1},
          format: 'd MM yyyy',
          language: 'nl-BE',
          beforeShowDay: function (date) {
            var highlightDateString = _.get(appConfig, 'calendarHighlight.date');
            var highlightExtraClass = _.get(appConfig, 'calendarHighlight.extraClass');

            if (!highlightDateString) {
              return;
            }
            // init Date with ISO string
            var highlightDate = new Date(highlightDateString);
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
          scope.defaultViewDate = newValue.date;
          if (!ngModel.$viewValue || ngModel.$viewValue.getTime() !== newValue.date.getTime()) {
            ngModel.$setViewValue(newValue.date);
          }
        });
      }
    }
  }
})();
