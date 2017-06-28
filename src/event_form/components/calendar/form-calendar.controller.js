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
function FormCalendarController(EventFormData, OpeningHoursCollection, $scope, $controller) {
  var calendar = this;

  $controller('BaseCalendarController', {calendar: calendar, $scope: $scope});

  calendar.init(EventFormData, OpeningHoursCollection);
}
