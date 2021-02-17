'use strict';

angular
  .module('udb.event-form')
  .component('udbFormCalendarTimepicker', {
    templateUrl: 'templates/form-calendar-timepicker.component.html',
    controller: FormCalendarTimepickerController,
    require: {
      ngModel: '^ngModel'
    },
    bindings: {
      disabled: '=ngDisabled'
    },
    controllerAs: 'timepicker'
  });

/** @inject */
function FormCalendarTimepickerController() {
  var timepicker = this;

  timepicker.$onInit = function() {
    timepicker.ngModel.$render = function () {
      timepicker.time = new Date(timepicker.ngModel.$viewValue);
    };
  };

  timepicker.changed = function() {
    if (timepicker.time) {
      timepicker.ngModel.$setViewValue(timepicker.time);
    }
  };
}
