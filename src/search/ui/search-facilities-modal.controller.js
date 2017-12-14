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

  // Scope vars.
  $scope.saving = false;
  $scope.error = false;

  $scope.facilities = _.mapValues(facilities, function (facilityType) {
    return _.map(facilityType, function (facility) {
      return _.assign(facility, {
        selected: !!_.find(offer.facilities, {id: facility.id})
      });
    });
  });

  // Scope functions.
  $scope.cancel = cancel;
  $scope.saveFacilities = saveFacilities;

  /**
   * Cancel the modal.
   */
  function cancel() {
    $uibModalInstance.dismiss('cancel');
  }

  /**
   * Save the selected facilities in db.
   */
  function saveFacilities() {
    offer.facilities = _.where(
      _.flatten(_.map($scope.facilities)),
      {selected: true}
    );

    $scope.saving = true;
    $scope.error = false;

    var promise = eventCrud.updateFacilities(offer);
    promise.then(function() {
      $scope.saving = false;
      $uibModalInstance.close();

    }, function() {
      $scope.error = true;
      $scope.saving = false;
    });
  }
}
