'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormUitpasInfoController
 * @description
 * # EventFormUitpasInfoController
 * Component for setting UiTPAS info.
 */
angular
  .module('udb.uitpas')
  .component('uitpasInfo', {
    templateUrl: 'templates/uitpasInfo.html',
    controller: UitpasInfoComponent,
    controllerAs: 'upic',
    bindings: {
      organizer: '<',
      price: '<',
      uitpasData: '='
    }
  });

/* @ngInject */
function UitpasInfoComponent(
  $scope,
  $rootScope,
  EventFormData,
  udbOrganizers,
  eventCrud
) {
  var controller = this;

  $scope.showUitpasInfo = false;
  $scope.uitpasCssClass = 'state-incomplete';
  $scope.savingUitpas = false;
  $scope.hasUitpasData = false;
  $scope.checkedCardSystems = [];
  controller.listeners = [];
  controller.showCardSystems = false;

  controller.$onInit = init;
  controller.$onDestroy = destroy;

  /**
   *
   * @param {Object} angularEvent
   * @param {EventFormData} offerData
   */
  controller.showCardSystemsIfPriceIsSelected = function(angularEvent, offerData) {
    controller.showCardSystems = offerData.priceInfo && !!offerData.priceInfo.length;
  };

  /**
   * Persist uitpasData for the active event.
   * @param {Cardsystem[]} checkedCardSystems
   */
  controller.saveUitpasData = function(checkedCardSystems) {
    controller.checkedCardSystems = checkedCardSystems;
    checkHasUitpasData();

    function markUitpasDataAsCompleted() {
      $rootScope.$emit('eventFormSaved', EventFormData);
      $scope.uitpasCssClass = 'state-complete';
      $scope.savingUitpas = false;
    }

    function showAsyncUitpasError() {
      $scope.uitpasError = true;
      $scope.savingUitpas = false;
    }

    EventFormData.uitpasData = checkedCardSystems;
    EventFormData.usedDistributionKeys = _.map(checkedCardSystems, 'distributionKeyId');

    $scope.savingUitpas = true;
    eventCrud
      .updateEventUitpasData(EventFormData)
      .then(markUitpasDataAsCompleted, showAsyncUitpasError);
  };

  function checkHasUitpasData() {
    $scope.hasUitpasData = !_.isEmpty(controller.checkedCardSystems);
  }

  function init() {
    controller.eventFormData = EventFormData;
    $scope.showUitpasInfo = _.get(controller, 'organizer.isUitpas', false) && EventFormData.isEvent;
    controller.showCardSystems = controller.price && !!controller.price.length;

    controller.listeners = [
      $rootScope.$on('eventFormSaved', controller.showCardSystemsIfPriceIsSelected),
      $rootScope.$on('eventOrganizerSelected', controller.reset),
      $rootScope.$on('eventOrganizerDeleted', controller.reset)
    ];

    if ($scope.showUitpasInfo) {
      udbOrganizers
        .findOrganizersCardsystem(controller.organizer.id)
        .then(function(response) {
          controller.organizerCardSystems = response;
        });
      getUitpasData(EventFormData.id);
    }
  }

  function destroy() {
    _.invoke(controller.listeners, 'call');
  }

  controller.reset = function (angularEvent, organizer) {
    controller.organizer = organizer;
    $scope.checkedCardSystems = [];
    destroy();
    init();
    controller.saveUitpasData($scope.checkedCardSystems);
  };

  /**
   * Get the Uitpas Data for an event
   */
  function getUitpasData(cdbid) {
    eventCrud
      .getEventUitpasData(cdbid)
      .then(function(data) {
        $scope.usedDistributionKeys = data;
        EventFormData.usedDistributionKeys = data;
        $scope.hasUitpasData = true;
        reverseLookUp();
      });
  }

  function reverseLookUp() {
    angular.forEach(controller.organizerCardSystems, function (cardSystem, index) {
      angular.forEach($scope.usedDistributionKeys, function(distributionKey) {
        var tempDistKey = _.findWhere(cardSystem.distributionKeys, {id: distributionKey});
        if (tempDistKey !== undefined) {
          $scope.checkedCardSystems[index] = {
            distributionKeyId: tempDistKey.id,
            distributionKeyName: tempDistKey.name,
            cardSystemId: cardSystem.id,
            cardSystemName: cardSystem.name
          };
        }
      });
    });
  }
}
