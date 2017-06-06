'use strict';

/**
 * @ngdoc function
 * @name udb.event-form.component:udbFormPlaceCalendar
 * @description
 * # Form Place Calendar
 * The form calendar component for places.
 */
angular
  .module('udb.event-form')
  .component('udbFormPlaceCalendar', {
    templateUrl: 'templates/form-place-calendar.component.html',
    controller: 'FormCalendarController',
    controllerAs: 'calendar'
  });
