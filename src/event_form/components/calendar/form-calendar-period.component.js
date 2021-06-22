'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:FormCalendarPeriod
 * @description
 * # Form Calendar Period
 */
angular
  .module('udb.event-form')
  .component('udbFormCalendarPeriod', {
    templateUrl: 'templates/form-calendar-period.component.html',
    controller: FormCalendarPeriodComponentController,
    bindings: {
      formData: '=',
      disabled: '=ngDisabled'
    }
  });

function FormCalendarPeriodComponentController() {
  var controller = this;
  controller.calendarType = controller.formData.calendar.calendarType;
}
