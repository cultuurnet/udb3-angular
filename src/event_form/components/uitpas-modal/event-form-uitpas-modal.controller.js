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
  getCardsystems(organizer.id);

  function getCardsystems(organizerId) {
    $scope.cardSystems = udbOrganizers.findOrganizersCardsystem(organizerId);
  }
}
