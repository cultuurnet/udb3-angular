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

    console.log(eventFormData);

    $scope.date = eventFormData.availableFrom;
    $scope.enableDate = false;

    $scope.dismiss = dismiss;
    $scope.convertDate = convertDate;
    $scope.publish = publish;
    $scope.drp = {
        dateFormat: 'dd/MM/yyyy',
        startOpened: false
    }

    function dismiss() {
      $uibModalInstance.dismiss();

    }

    function convertDate() {
      $scope.date = new Date($scope.date.getFullYear(), $scope.date.getMonth(), $scope.date.getDate(), 0, 0, 0);
    }

    function publish() {
      eventFormData.availableFrom = $scope.date;
      $uibModalInstance.close();
    }

  }

})();
