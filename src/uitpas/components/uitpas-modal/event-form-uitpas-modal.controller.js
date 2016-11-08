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
  $q,
  udbUitpasApi,
  UitpasLabels,
  organisation,
  offerData
) {
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
    $q
      .all([
        udbUitpasApi.getEventUitpasData(offerData.id),
        udbUitpasApi.findOrganisationsCardSystems(organisation.id)
      ])
      .then(function (uitpasInfo) {
        var assignedDistributionKeys = uitpasInfo[0],
            organisationCardSystems = uitpasInfo[1];

        var availableCardSystems = _.map(organisationCardSystems, function (cardSystem) {
          cardSystem.active = _.includes(offerData.labels, cardSystem.name);

          cardSystem.assignedDistributionKey = _.find(
            cardSystem.distributionKeys,
            function(distributionKey) {
              return _.includes(assignedDistributionKeys, distributionKey.id);
            }
          );

          return cardSystem;
        });

        var organisationLabels = _.intersection(_.values(UitpasLabels), _.pluck(organisation.labels, 'name'));

        _.forEach(organisationLabels, function(organisationLabel) {
          if (!_.find(availableCardSystems, {name: organisationLabel})) {
            availableCardSystems.push({
              name: organisationLabel,
              active: true, //_.includes(offerData.labels, organisationLabel),
              distributionKeys: []
            });
          }
        });

        $scope.availableCardSystems = availableCardSystems;
      });
  }
}
