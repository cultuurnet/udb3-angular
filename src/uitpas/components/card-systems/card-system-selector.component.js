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
    unlockCardSystems();
    init();
  }

  function showCardSystems(cardSystemCollections) {
    var eventCardSystems = cardSystemCollections[0],
        organisationCardSystems = cardSystemCollections[1];

    controller.availableCardSystems = _.map(organisationCardSystems, function (cardSystem) {
      return _.assign(cardSystem, {
        assignedDistributionKey: findAssignedDistributionKey(eventCardSystems, cardSystem),
        active: !!_.find(eventCardSystems, {id: cardSystem.id})
      });
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

    return _.first(
      (!matchingCardSystem || _.isEmpty(matchingCardSystem.distributionKeys)) ?
        cardSystem.distributionKeys :
        matchingCardSystem.distributionKeys
    );
  }

  /**
   * @param {CardSystem} cardSystem
   */
  controller.distributionKeyAssigned = function(cardSystem) {
    if (!cardSystem.assignedDistributionKey) {
      throw 'card system distribution key is missing';
    }

    controller.persistingCardSystems = true;

    return udbUitpasApi
      .addEventCardSystemDistributionKey(offerData.id, cardSystem.id, cardSystem.assignedDistributionKey.id)
      .then(function () {
        $rootScope.$emit('uitpasDataSaved');
        unlockCardSystems();
        return $q.resolve();
      });
  };

  function unlockCardSystems() {
    controller.persistingCardSystems = false;
  }

  /**
   * @param {CardSystem} cardSystem
   * @return {Promise}
   */
  function assignKeyAndOrCardSystem(cardSystem) {
    return cardSystem.assignedDistributionKey ?
      controller.distributionKeyAssigned(cardSystem) :
      udbUitpasApi.addEventCardSystem(offerData.id, cardSystem.id);
  }

  /**
   * @param {CardSystem} cardSystem
   */
  controller.activeCardSystemsChanged = function(cardSystem) {
    controller.persistingCardSystems = true;
    var activeCardSystemsUpdated = cardSystem.active ?
      assignKeyAndOrCardSystem(cardSystem) :
      udbUitpasApi.removeEventCardSystem(offerData.id, cardSystem.id);

    function revertCardSystemStatus() {
      cardSystem.active = !cardSystem.active;
      showUitpasUnavailableNotice();
    }

    function notifyUitpasDataSaved () {
      $rootScope.$emit('uitpasDataSaved');
    }

    activeCardSystemsUpdated
      .then(notifyUitpasDataSaved, revertCardSystemStatus)
      .finally(unlockCardSystems);
  };
}
