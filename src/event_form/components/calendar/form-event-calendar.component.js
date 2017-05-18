'use strict';

/**
 * @ngdoc function
 * @name udb.event-form.component:udbFormEventCalendar
 * @description
 * # Form Calendar
 * The form calendar component for events.
 */
angular
  .module('udb.event-form')
  .component('udbFormEventCalendar', {
    templateUrl: 'templates/form-event-calendar.component.html',
    controller: 'FormCalendarController',
    controllerAs: 'calendar'
  });
