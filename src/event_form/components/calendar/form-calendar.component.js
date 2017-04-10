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
    controller: 'FormCalendarController',
    controllerAs: 'calendar'
  });
