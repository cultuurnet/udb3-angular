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
    controller: function () {},
    bindings: {
      formData: '=',
    }
  });
