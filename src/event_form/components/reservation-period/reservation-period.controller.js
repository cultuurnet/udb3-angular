'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:ReservationPeriodController
 * @description
 * # ReservationPeriodController
 */
angular
  .module('udb.event-form')
  .controller('ReservationPeriodController', ReservationPeriodController);

/* @ngInject */
function ReservationPeriodController($scope, EventFormData, $rootScope) {

  var controller = this;

  $scope.haveBookingPeriod = false;
  $scope.availabilityStarts = '';
  $scope.availabilityEnds = '';
  $scope.errorMessage = '';
  $scope.popup1 = {
    opened: false
  };

  $scope.popup2 = {
    opened: false
  };

  $scope.validateBookingPeriod = validateBookingPeriod;
  $scope.saveBookingPeriod = saveBookingPeriod;
  $scope.deleteBookingPeriod = deleteBookingPeriod;
  $scope.changeHaveBookingPeriod = changeHaveBookingPeriod;
  $scope.initBookingPeriodForm = initBookingPeriodForm;

  // Options for the datepicker
  $scope.dateOptions = {
    formatYear: 'yyyy',
    minDate: new Date(),
    startingDay: 1
  };

  initBookingPeriodForm();

  function validateBookingPeriod() {
    if ($scope.availabilityStarts > $scope.availabilityEnds) {
      $scope.errorMessage = 'De gekozen einddatum moet na de startdatum vallen.';
      return;
    }
    $scope.errorMessage = '';
    saveBookingPeriod();
  }

  function saveBookingPeriod() {
    if (moment($scope.availabilityStarts).isValid() && moment($scope.availabilityEnds).isValid()) {
      EventFormData.bookingInfo.availabilityStarts = moment($scope.availabilityStarts).format();
      EventFormData.bookingInfo.availabilityEnds = moment($scope.availabilityEnds).format();
    } else {
      EventFormData.bookingInfo.availabilityStarts = '';
      EventFormData.bookingInfo.availabilityEnds = '';
    }

    $scope.onBookingPeriodSaved();
  }

  function deleteBookingPeriod() {
    $scope.availabilityStarts = '';
    $scope.availabilityEnds = '';
    $scope.haveBookingPeriod = false;
    saveBookingPeriod();
  }

  function changeHaveBookingPeriod() {
    if (!$scope.haveBookingPeriod) {
      $scope.haveBookingPeriod = true;
    }
  }

  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };

  $scope.open2 = function() {
    $scope.popup2.opened = true;
  };

  function initBookingPeriodForm() {
    if (EventFormData.bookingInfo.availabilityStarts ||
      EventFormData.bookingInfo.availabilityEnds) {
      $scope.haveBookingPeriod = true;
    }

    if (EventFormData.bookingInfo.availabilityStarts) {
      $scope.availabilityStarts = new Date(EventFormData.bookingInfo.availabilityStarts);
    }
    else {
      $scope.availabilityStarts = new Date();
    }

    if (EventFormData.bookingInfo.availabilityEnds) {
      $scope.availabilityEnds = new Date(EventFormData.bookingInfo.availabilityEnds);
    }
    else {
      $scope.availabilityEnds = new Date();
    }
  }
}
