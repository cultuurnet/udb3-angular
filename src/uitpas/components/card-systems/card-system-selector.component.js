'use strict';

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
function CardSystemsController($q, udbUitpasApi, UitpasLabels) {
  var controller = this;
  var organisation = controller.organisation;
  var offerData = controller.offerData;

  controller.$onInit = function() {
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

        controller.availableCardSystems = availableCardSystems;
      });
  };
}
