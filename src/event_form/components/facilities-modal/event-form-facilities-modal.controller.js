'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormFacilitiesModalController
 * @description
 * # EventFormFacilitiesModalController
 * Modal for selecting facilities.
 */
angular
  .module('udb.event-form')
  .controller('EventFormFacilitiesModalController', EventFormFacilitiesModalController);

/* @ngInject */
function EventFormFacilitiesModalController($scope, $uibModalInstance, EventFormData, eventCrud, facilities) {

  // Scope vars.
  $scope.saving = false;
  $scope.error = false;

  $scope.facilities = _.omit(facilities, 'place');

  // Scope functions.
  $scope.cancel = cancel;
  $scope.saveFacilities = saveFacilities;

  // if already selected facilities, make sure they're checked
  if (EventFormData.facilities) {
    var isset = false;
    var i, j, k = 0;
    var facilityTypes = ['motor', 'visual', 'hearing'];
    var type = '';

    for (i = 0; i < EventFormData.facilities.length; i++) {
      isset = false;

      for (j = 0; j < facilityTypes.length; j++)
      {
        type = facilityTypes[j];

        for (k = 0; k < $scope.facilities[type].length; k++) {
          if ($scope.facilities[type][k].id === EventFormData.facilities[i].id) {
            isset = true;
            $scope.facilities[type][k].selected = true;
            break;
          }
        }

        if (isset === true) {
          break;
        }
      }
    }
  }

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
    var selectedFacilities = _.where(_.union(
      $scope.facilities.motor,
      $scope.facilities.visual,
      $scope.facilities.hearing
    ), {selected: true});

    EventFormData.facilities = selectedFacilities;

    $scope.saving = true;
    $scope.error = false;

    var promise = eventCrud.updateFacilities(EventFormData);
    promise.then(function() {

      $scope.saving = false;
      $uibModalInstance.close();

    }, function() {
      $scope.error = true;
      $scope.saving = false;
    });
  }

}
