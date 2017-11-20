'use strict';

/**
 * @typedef {Object} Cardsystem
 * @property {string} id
 *  a number serialized as a string
 * @property {string} name
 * @property {DistributionKey[]} distributionKeys
 * @property {DistributionKey|undefined} [assignedDistributionKey]
 */

/**
 * @ngdoc function
 * @name udbApp.controller:CardSystemSelector
 * @description
 * # CardSystemSelector
 * Component for setting UiTPAS info.
 */
angular
  .module('udb.uitpas')
  .component('cardSystemSelector', {
    templateUrl: 'templates/card-systems.html',
    controller: CardSystemsController,
    controllerAs: 'cardSystemSelector',
    bindings: {
      organisation: '<',
      offerData: '<'
    }
  });

/* @ngInject */
function CardSystemsController($q, udbUitpasApi, UitpasLabels, $rootScope) {
  var controller = this;
  var organisation = controller.organisation;
  var offerData = controller.offerData;
  controller.$onInit = init;
  controller.refresh = refresh;

  function init() {
    $q
      .all([
        udbUitpasApi.getEventCardSystems(offerData.id),
        udbUitpasApi.findOrganisationsCardSystems(organisation.id)
      ])
      .then(showCardSystems, showUitpasUnavailableNotice);
  }

  function showUitpasUnavailableNotice() {
    controller.uitpasUnavailable = true;
  }

  function hideUitpasUnavailableNotice() {
    controller.uitpasUnavailable = undefined;
  }

  function refresh() {
    controller.availableCardSystems = undefined;
    hideUitpasUnavailableNotice();
    init();
  }

  function showCardSystems(cardSystemCollections) {
    var eventCardSystems = cardSystemCollections[0],
        organisationCardSystems = cardSystemCollections[1];

    controller.availableCardSystems = _.map(organisationCardSystems, function (cardSystem) {
      cardSystem.assignedDistributionKey = findAssignedDistributionKey(eventCardSystems, cardSystem);

      var allOfferLabels = offerData.labels.concat(offerData.hiddenLabels);

      cardSystem.active = _.includes(allOfferLabels, cardSystem.name) || !!cardSystem.assignedDistributionKey;

      return cardSystem;
    });
  }

  /**
   * @param {CardSystem[]} cardSystemCollection
   * @param {CardSystem} cardSystem
   *
   * @return {(DistributionKey|null)}
   */
  function findAssignedDistributionKey(cardSystemCollection, cardSystem) {
    var matchingCardSystem = _.find(cardSystemCollection, {id: cardSystem.id});
    return matchingCardSystem ? _.first(matchingCardSystem.distributionKeys) : undefined;
  }

  /**
   * @param {CardSystem} cardSystem
   */
  controller.distributionKeyAssigned = function(cardSystem) {
    udbUitpasApi
      .addEventCardSystemDistributionKey(offerData.id, cardSystem.id, cardSystem.assignedDistributionKey.id)
      .then(function () {
        $rootScope.$emit('uitpasDataSaved');
      });
  };

  /**
   * @param {CardSystem} cardSystem
   */
  controller.activeCardSystemsChanged = function(cardSystem) {
    controller.persistingCardSystems = true;
    var activeCardSystemsUpdated = cardSystem.active ?
      udbUitpasApi.addEventCardSystem(offerData.id, cardSystem.id) :
      udbUitpasApi.removeEventCardSystem(offerData.id, cardSystem.id);

    function revertCardSystemStatus() {
      cardSystem.active = !cardSystem.active;
      showUitpasUnavailableNotice();
    }

    function uitpasResponded() {
      controller.persistingCardSystems = false;
    }

    function notifyUitpasDataSaved () {
      $rootScope.$emit('uitpasDataSaved');
    }

    activeCardSystemsUpdated
      .then(notifyUitpasDataSaved, revertCardSystemStatus)
      .finally(uitpasResponded);
  };
}
