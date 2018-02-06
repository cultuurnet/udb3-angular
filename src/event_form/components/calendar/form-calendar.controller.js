'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:FormCalendarController
 * @description
 * # Form Calendar Controller
 */
angular
  .module('udb.event-form')
  .controller('FormCalendarController', FormCalendarController);

/* @ngInject */
function FormCalendarController(EventFormData, OpeningHoursCollection, $scope, $controller, appConfig) {
  var calendar = this;
  calendar.onlySingleDay = false;

  if (appConfig.eventOnSingleDay !== 'undefined') {
    if (appConfig.eventOnSingleDay.toggle !== 'undefined') {
      calendar.onlySingleDay = appConfig.eventOnSingleDay.toggle;
    }
  }

  $controller('BaseCalendarController', {calendar: calendar, $scope: $scope});

  calendar.init(EventFormData, OpeningHoursCollection);
}
