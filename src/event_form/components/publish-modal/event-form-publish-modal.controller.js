(function () {
  'use strict';

  /**
   * @ngdoc function
   * @name udbApp.controller:EventFormPublishModalController
   * @description
   * # EventFormPublishModalController
   * Modal for postponing a publish.
   */
  angular
    .module('udb.event-form')
    .controller('EventFormPublishModalController', EventFormPublishModalController);

  /* @ngInject */
  function EventFormPublishModalController($scope, $uibModalInstance, eventFormData, eventCrud) {

    $scope.date = eventFormData.availableFrom;
    $scope.enableDate = false;
    var today = new Date();
    if (typeof eventFormData.availableFrom === 'string') {
      $scope.isToday = true;
    } else {
      $scope.isToday = (today.toDateString() === eventFormData.availableFrom.toDateString()) ;
    }
    $scope.dismiss = dismiss;
    $scope.convertDate = convertDate;
    $scope.publish = publish;
    $scope.drp = {
      dateFormat: 'dd/MM/yyyy',
      startOpened: false,
      options : {
        minDate : today
      }
    };
    $scope.error = false;
    $scope.onFocus = onFocus;

    function dismiss() {
      $uibModalInstance.dismiss();

    }

    function convertDate() {
      $scope.date = new Date($scope.date.getFullYear(), $scope.date.getMonth(), $scope.date.getDate(), 0, 0, 0);
    }

    function onFocus() {
      $scope.isToday = false;
      $scope.error = false;
      $scope.drp.startOpened = !$scope.drp.startOpened;
    }

    function publish() {
      if (today < $scope.date) {
        eventFormData.availableFrom = $scope.date;
        $uibModalInstance.close();
      } else {
        $scope.error = true;
      }

    }

  }

})();
