'use strict';

angular
  .module('udb.event-form')
  .component('udbFormCalendarDatepicker', {
    templateUrl: 'templates/form-calendar-datepicker.component.html',
    controller: FormCalendarDatepickerController,
    require: {
      ngModel: '^ngModel'
    },
    bindings: {
      disabled: '=ngDisabled'
    },
    controllerAs: 'datepicker'
  });

/** @inject */
function FormCalendarDatepickerController(appConfig) {
  var datepicker = this;
  var options = {
    minDate: new Date(),
    showWeeks: false,
    customClass: getDayClass
  };

  datepicker.$onInit = function() {
    datepicker.isOpen = false;
    datepicker.options = options;
    datepicker.ngModel.$render = function () {
      datepicker.date = new Date(datepicker.ngModel.$viewValue);
    };
  };

  datepicker.open = function() {
    datepicker.isOpen = true;
  };

  datepicker.changed = function() {
    if (datepicker.date) {
      var time = moment(datepicker.ngModel.$viewValue);
      var day = moment(datepicker.date).hour(time.hour()).minute(time.minute());
      datepicker.ngModel.$setViewValue(day.toDate());
    }
  };

  function getDayClass(data) {
    if (appConfig.calendarHighlight.date !== '') {
      var dayToCheck = moment(data.date);
      var highlightDate = moment(appConfig.calendarHighlight.date);

      if (dayToCheck.isSame(highlightDate, data.mode)) {
        return appConfig.calendarHighlight.extraClass;
      }
    }
  }
}

FormCalendarDatepickerController.$inject = ['appConfig'];
