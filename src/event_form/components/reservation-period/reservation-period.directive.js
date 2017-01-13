'use strict';

/**
 * @ngdoc directive
 * @name udb.event_form.directive:udbReservationPeriod
 * @description
 * # reservation period selection for event form
 */
angular
  .module('udb.event-form')
  .directive('udbReservationPeriod', ReservationPeriodDirective);

/* @ngInject */
function ReservationPeriodDirective() {

  return {
    restrict: 'AE',
    controller: 'ReservationPeriodController',
    templateUrl: 'templates/reservation-period.html'
  };

}
