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
function EventFormUitpasModalController($scope,
                                        $uibModalInstance,
                                        organizer,
                                        organizerCardSystems) {
  $scope.organizer = organizer;
  $scope.organizerCardSystems = organizerCardSystems;
  $scope.checkedCardSystems = [];

  $scope.disableSubmit = true;
  $scope.saving = false;

  $scope.cancel = cancel;
  $scope.checkDistributionKeys = checkDistributionKeys;
  $scope.removeUnsetCardSystems = removeUnsetCardSystems;
  $scope.validate = validate;
  $scope.saveUitpasData = saveUitpasData;

  init();

  /**
   * Cancel the modal.
   */
  function cancel() {
    $uibModalInstance.dismiss('cancel');
  }

  function checkDistributionKeys(cardSystem, index) {
    // if there is only one distribution key set it as active.
    if(cardSystem.distributionKeys.length === 1) {
      $scope.checkedCardSystems[index].distributionKeyId = cardSystem.distributionKeys[0].id;
    }
    validate();
  }
  
  function removeUnsetCardSystems() {
    angular.forEach($scope.checkedCardSystems, function (cardSystem, index) {
      if (cardSystem.cardSystemId === 'unsetMe') {
        $scope.checkedCardSystems.splice(index, 1);
      }
    });
  }

  function validate() {
    var foundEmptyDistributionKey = false;
    angular.forEach($scope.checkedCardSystems, function (cardSystem) {
      if (cardSystem.distributionKeyId === undefined ||
        cardSystem.distributionKeyId === '') {
        foundEmptyDistributionKey = true;
      }
    });

    (foundEmptyDistributionKey || _.isEmpty($scope.checkedCardSystems)) ? $scope.disableSubmit = true : $scope.disableSubmit = false;
  }

  function saveUitpasData() {
    $scope.saving = true;

    var uitpasFullData = {
      usedCardSystem: $scope.selectedCardSystem,
      usedDistributionKey: $scope.selectedDistributionKey
    };
    $uibModalInstance.close(uitpasFullData);
  }

  function init() {

  }
}
