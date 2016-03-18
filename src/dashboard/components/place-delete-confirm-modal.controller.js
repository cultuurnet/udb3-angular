
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:PlaceDeleteConfirmModalCtrl
 * @description
 * # PlaceDeleteConfirmModalCtrl
 * Modal to delete an event.
 */
angular
  .module('udb.dashboard')
  .controller('PlaceDeleteConfirmModalCtrl', PlaceDeleteConfirmModalController);

/* @ngInject */
function PlaceDeleteConfirmModalController(
  $scope,
  $uibModalInstance,
  eventCrud,
  place,
  events,
  appConfig
) {
  $scope.place = place;
  $scope.saving = false;
  $scope.events = events ? events : [];
  $scope.hasEvents = $scope.events.length > 0;
  $scope.baseUrl = appConfig.udb3BaseUrl;
  $scope.cancelRemoval = cancelRemoval;
  $scope.deletePlace = deletePlace;

  /**
   * Remove the event in db.
   */
  function deletePlace() {

    // Extra check in case delete place is tried with events.
    if (events) {
      $uibModalInstance.dismiss();
    }

    $scope.saving = true;
    $scope.error = false;
    var promise = eventCrud.removePlace(place);
    promise.then(function(jsonResponse) {
      $scope.saving = false;
      $uibModalInstance.close(place);
    }, function() {
      $scope.saving = false;
      $scope.error = true;
    });

  }

  /**
   * Cancel, modal dismiss.
   */
  function cancelRemoval() {
    $uibModalInstance.dismiss();
  }

}
