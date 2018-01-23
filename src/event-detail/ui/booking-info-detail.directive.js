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
function BookingInfoDetailController($scope, $translate) {
  $scope.isEmpty = _.isEmpty;
  $scope.hasAtLeastOneContactPoint = function() {
    return $scope.bookingInfo.phone || $scope.bookingInfo.url || $scope.bookingInfo.email;
  };

  $scope.translateBookingInfo = function (label) {
    return $translate.instant('booking.' + label);
  };
}
