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

  controller.$onInit = function() {
    $q
      .all([
        udbUitpasApi.getEventCardSystems(offerData.id),
        udbUitpasApi.findOrganisationsCardSystems(organisation.id)
      ])
      .then(function (cardSystemCollections) {
        var eventCardSystems = cardSystemCollections[0],
            organisationCardSystems = cardSystemCollections[1];

        var availableCardSystems = _.map(organisationCardSystems, function (cardSystem) {
          cardSystem.assignedDistributionKey = findAssignedDistributionKey(eventCardSystems, cardSystem);

          var allOfferLabels = offerData.labels.concat(offerData.hiddenLabels);

          cardSystem.active = _.includes(allOfferLabels, cardSystem.name) || !!cardSystem.assignedDistributionKey;

          return cardSystem;
        });

        includeUitpasOrganisationCardSystems(availableCardSystems, organisation);
        controller.availableCardSystems = availableCardSystems;
      });
  };

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
   * @param {CardSystem[]} cardSystemCollection
   *  The card system collection that will include the organisation uitpas card systems.
   * @param {Organisation} organisation
   */
  function includeUitpasOrganisationCardSystems(cardSystemCollection, organisation) {
    var allOrganisationLabels = organisation.labels.concat(organisation.hiddenLabels);
    var organisationUitpasLabels = _.intersection(_.values(UitpasLabels), allOrganisationLabels);

    _.forEach(organisationUitpasLabels, function(organisationUitpasLabel) {
      if (!_.find(cardSystemCollection, {name: organisationUitpasLabel})) {
        cardSystemCollection.push({
          name: organisationUitpasLabel,
          active: true,
          distributionKeys: []
        });
      }
    });
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
    var activeCardSystemsUpdated = cardSystem.active ?
      udbUitpasApi.addEventCardSystem(offerData.id, cardSystem.id) :
      udbUitpasApi.removeEventCardSystem(offerData.id, cardSystem.id);

    activeCardSystemsUpdated.then(function () {
      $rootScope.$emit('uitpasDataSaved');
    });
  };
}
