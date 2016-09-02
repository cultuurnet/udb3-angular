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
function ReservationPeriodController($scope, EventFormData, eventCrud, $rootScope) {

  var controller = this;

  $scope.haveBookingPeriod = false;
  $scope.bookingPeriodInfoCssClass = 'state-incomplete';
  $scope.savingBookingPeriodInfo = false;
  $scope.bookingPeriodInfoError = false;
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
    maxDate: new Date(2020, 5, 22),
    minDate: new Date(),
    startingDay: 1
  };

  initBookingPeriodForm();

  controller.bookingPeriodSaved = function () {
    $rootScope.$emit('bookingPeriodSaved', EventFormData);
  };

  function validateBookingPeriod() {
    if ($scope.availabilityStarts > $scope.availabilityEnds) {
      $scope.errorMessage = 'De gekozen einddatum moet na de startdatum vallen.';
      return;
    }
    $scope.errorMessage = '';
    saveBookingPeriod();
  }

  function saveBookingPeriod() {
    EventFormData.bookingInfo.availabilityStarts = $scope.availabilityStarts;
    EventFormData.bookingInfo.availabilityEnds = $scope.availabilityEnds;

    $scope.savingBookingPeriodInfo = true;
    $scope.bookingPeriodInfoError = false;

    var promise = eventCrud.updateBookingInfo(EventFormData);
    promise.then(function() {
      controller.bookingPeriodSaved();
      $scope.bookingPeriodInfoCssClass = 'state-complete';
      $scope.savingBookingPeriodInfo = false;
      $scope.bookingPeriodInfoError = false;
    }, function() {
      $scope.savingBookingPeriodInfo = false;
      $scope.bookingPeriodInfoError = true;
    });
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

    if (EventFormData.bookingInfo.availabilityEnds) {
      $scope.availabilityEnds = new Date(EventFormData.bookingInfo.availabilityEnds);
    }
  }
}
