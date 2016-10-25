'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormUitpasModalController
 * @description
 * # EventFormUitpasModalController
 * Modal for setting the uitpas cardsystem and destribution key.
 */
angular
    .module('udb.event-form')
    .controller('EventFormUitpasModalController', EventFormUitpasModalController);

/* @ngInject */
function EventFormUitpasModalController($scope, $uibModalInstance, organizer, udbOrganizers) {
  $scope.organizer = organizer;
  $scope.formData = {};
  $scope.disableSubmit = true;
  $scope.saving = false;

  $scope.cancel = cancel;
  $scope.selectCardSystem = selectCardSystem;
  $scope.selectDistributionKey = selectDistributionKey;
  $scope.validateUitpasData = validateUitpasData;
  $scope.saveUitpasData = saveUitpasData;

  getCardsystems(organizer.id);

  /**
   * Cancel the modal.
   */
  function cancel() {
    $uibModalInstance.dismiss('cancel');
  }

  function selectCardSystem(cardSystem) {
    $scope.selectedCardSystem = cardSystem;
    validateUitpasData();
  }

  function selectDistributionKey() {
    $scope.selectedDistributionKey = _.findWhere($scope.selectedCardSystem.distributionKeys, {id: $scope.formData.distributionKey});
    validateUitpasData();
  }

  function validateUitpasData() {
    ($scope.selectedCardSystem !== undefined &&
    $scope.selectedDistributionKey !== undefined) ? $scope.disableSubmit = false : $scope.disableSubmit = true;
  }

  function saveUitpasData() {
    $scope.saving = true;
    $uibModalInstance.close();
  }

  function getCardsystems(organizerId) {
    function fetchCardSystems(response) {
      $scope.cardSystems = response;
    }

    function errorHandling(error) {
      console.log(error);
    }

    udbOrganizers
        .findOrganizersCardsystem(organizerId)
        .then(fetchCardSystems, errorHandling);
  }
}
