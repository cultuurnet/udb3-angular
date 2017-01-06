'use strict';

/**
 * @ngdoc component
 * @name udb.event-detail.component:BookingInfoDetail
 * @description
 * # udbBookingInfoDetail
 */
angular
  .module('udb.event-detail')
  .directive('udbBookingInfoDetail', function () {
    return {
      templateUrl: 'templates/booking-info-detail.directive.html',
      controller: BookingInfoDetailController,
      restrict: 'A',
      scope: {
        bookingInfo: '<udbBookingInfoDetail'
      }
    };
  });

/* @ngInject */
function BookingInfoDetailController($scope) {
  $scope.isEmpty = _.isEmpty;
}
