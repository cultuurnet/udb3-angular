'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormUitpasModalController
 * @description
 * # EventFormUitpasModalController
 * Modal for setting the uitpas cardsystem and destribution key.
 */
angular
    .module('udb.uitpas')
    .controller('EventFormUitpasModalController', EventFormUitpasModalController);

/* @ngInject */
function EventFormUitpasModalController(
  $scope,
  $uibModalInstance,
  organizer,
  organizerCardSystems,
  checkedCardSystems
) {
  $scope.organizer = organizer;
  $scope.organizerCardSystems = organizerCardSystems;
  $scope.checkedCardSystems = checkedCardSystems;

  $scope.disableSubmit = true;
  $scope.saving = false;

  $scope.cancel = cancel;
  $scope.setCardSystem = setCardSystem;
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

  function setCardSystem(cardSystem, index) {
    $scope.checkedCardSystems[index].cardSystemName = cardSystem.name;

    // if there is only one distribution key set it as active.
    if (cardSystem.distributionKeys.length === 1) {
      $scope.checkedCardSystems[index].distributionKeyId = cardSystem.distributionKeys[0].id;
    }
    validate();
  }

  function removeUnsetCardSystems() {
    $scope.checkedCardSystems = _.reject($scope.checkedCardSystems, {cardSystemId: 'unsetMe'});
    validate();
  }

  var systemsWithoutKeySelected = _($scope.checkedCardSystems).reject('distributionKeyId');
  function validate() {
    $scope.disableSubmit = _.isEmpty($scope.checkedCardSystems) || !_.isEmpty(systemsWithoutKeySelected.value());
  }

  function saveUitpasData() {
    $scope.saving = true;

    $uibModalInstance.close($scope.checkedCardSystems);
  }

  function init() {

  }
}
