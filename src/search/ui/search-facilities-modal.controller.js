'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:SearchFacilitiesModalController
 * @description
 * # SearchFacilitiesModalController
 * Modal for selecting facilities.
 */
angular
  .module('udb.event-form')
  .controller('SearchFacilitiesModalController', SearchFacilitiesModalController);

/* @ngInject */
function SearchFacilitiesModalController($scope, $uibModalInstance, offer, eventCrud, facilities) {
  $scope.saving = false;
  $scope.error = false;
  $scope.cancel = cancel;
  $scope.saveFacilities = saveFacilities;
  $scope.facilities = preselectFacilities(facilities);

  function preselectFacilities(facilities) {
    return _.mapValues(facilities, function (facilityType) {
      return _.map(facilityType, function (facility) {
        return _.assign(facility, {
          selected: !!_.find(offer.facilities, {id: facility.id})
        });
      });
    });
  }

  function cancel() {
    $uibModalInstance.dismiss('cancel');
  }

  function saveFacilities() {
    showSaving();

    offer.facilities = _.where(
      _.flatten(_.map($scope.facilities)),
      {selected: true}
    );

    eventCrud.updateFacilities(offer).then(closeModal, showError);
  }

  function closeModal() {
    $scope.saving = false;
    $uibModalInstance.close();
  }

  function showError() {
    $scope.error = true;
    $scope.saving = false;
  }

  function showSaving() {
    $scope.saving = true;
    $scope.error = false;
  }
}
