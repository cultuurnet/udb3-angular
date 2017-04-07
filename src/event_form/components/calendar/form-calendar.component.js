'use strict';

/**
 * @ngdoc function
 * @name udb.event-form.component:udbCalendar
 * @description
 * # Form Calendar
 * The Calendar component for the offer form.
 */
angular
  .module('udb.event-form')
  .component('udbFormCalendar', {
    templateUrl: 'templates/form-calendar.component.html',
    controller: CalendarController,
    controllerAs: 'calendar'
  });

/* @ngInject */
function CalendarController(EventFormData, OpeningHoursCollection, calendarLabels) {
  var calendar = this;

  calendar.formData = EventFormData;
  calendar.types = calendarLabels;
  calendar.type = EventFormData.activeCalendarType;
  calendar.setType = setType;
  calendar.reset = reset;
  calendar.openingHours = OpeningHoursCollection;

  function reset() {
    EventFormData.resetCalendar();
    calendar.type= EventFormData.calendarType;
  }

  /**
   * @param {string} calendarType
   */
  function setType(calendarType) {
    EventFormData.setCalendarType(calendarType);
    calendar.formData = EventFormData;
    calendar.type = EventFormData.activeCalendarType;
  }
}
