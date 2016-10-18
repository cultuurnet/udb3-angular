'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormOrganizerModalController
 * @description
 * # EventFormOrganizerModalController
 * Modal for adding an organizer.
 */
angular
  .module('udb.event-form')
  .controller('EventFormOrganizerModalController', EventFormOrganizerModalController);

/* @ngInject */
function EventFormOrganizerModalController(
  $scope,
  $uibModalInstance,
  udbOrganizers,
  eventCrud,
  cities,
  Levenshtein,
  $q,
  organizerName
) {

  var controller = this;

  // Scope vars.
  $scope.organizer = organizerName;
  $scope.organizersFound = false;
  $scope.saving = false;
  $scope.error = false;
  $scope.showValidation = false;
  $scope.organizers = [];
  $scope.selectedCity = '';

  $scope.newOrganizer = {
    name : $scope.organizer,
    address : {
      streetAddress : '',
      locality : '',
      postalCode: '',
      country : 'BE'
    },
    contact: []
  };

  // Scope functions.
  $scope.cancel = cancel;
  $scope.addOrganizerContactInfo = addOrganizerContactInfo;
  $scope.deleteOrganizerContactInfo = deleteOrganizerContactInfo;
  $scope.validateNewOrganizer = validateNewOrganizer;
  $scope.selectOrganizer = selectOrganizer;
  $scope.saveOrganizer = saveOrganizer;

  /**
   * Cancel the modal.
   */
  function cancel() {
    $uibModalInstance.dismiss('cancel');
  }

  /**
   * Add a contact info entry for an organizer.
   */
  function addOrganizerContactInfo(type) {
    $scope.newOrganizer.contact.push({
      type : type,
      value : ''
    });
  }

  /**
   * Remove a given key of the contact info.
   */
  function deleteOrganizerContactInfo(index) {
    $scope.newOrganizer.contact.splice(index, 1);
  }

  /**
   * Validate the new organizer.
   */
  function validateNewOrganizer() {

    $scope.showValidation = true;
    // Forms are automatically known in scope.
    if (!$scope.organizerForm.$valid) {
      return;
    }

    // resolve for now, will re-introduce duplicate detection later on
    var promise = $q.resolve([]);

    $scope.error = false;
    $scope.saving = true;

    promise.then(function (data) {

      // Set the results for the duplicates modal,
      if (data.length > 0) {
        $scope.organizersFound = true;
        $scope.organizers = data;
        $scope.saving = false;
      }
      // or save the event immediately if no duplicates were found.
      else {
        saveOrganizer();
      }

    }, function() {
      $scope.error = true;
      $scope.saving = false;
    });

  }

  /**
   * Select the organizer that should be used.
   */
  function selectOrganizer(organizer) {
    $uibModalInstance.close(organizer);
  }

  /**
   * Save the new organizer in db.
   */
  function saveOrganizer() {

    $scope.saving = true;
    $scope.error = false;

    var promise = eventCrud.createOrganizer($scope.newOrganizer);
    promise.then(function(jsonResponse) {
      $scope.newOrganizer.id = jsonResponse.data.organizerId;
      selectOrganizer($scope.newOrganizer);
      $scope.saving = false;
    }, function() {
      $scope.error = true;
      $scope.saving = false;
    });
  }

  // Scope functions.
  $scope.cities = cities;
  $scope.changeCitySelection = changeCitySelection;

  $scope.filterCities = function(value) {
    return function (city) {
      var length = value.length;
      var words = value.match(/\w+/g);
      var zipMatches = words.filter(function (word) {
        return city.zip.substring(0, length) === word;
      });
      var nameMatches = words.filter(function (word) {
        return city.name.toLowerCase().indexOf(word.toLowerCase()) !== -1;
      });

      return zipMatches.length + nameMatches.length >= words.length;
    };
  };

  $scope.orderByLevenshteinDistance = function(value) {
    return function (city) {
      return new Levenshtein(value, city.zip + '' + city.name);
    };
  };

  /**
   * Select City.
   */
  controller.selectCity = function ($item, $label) {
    $scope.newOrganizer.address.postalCode = $item.zip;
    $scope.newOrganizer.address.locality = $item.name;

    $scope.cityAutocompleteTextField = '';
    $scope.selectedCity = $label;
  };
  $scope.selectCity = controller.selectCity;

  /**
   * Change a city selection.
   */
  function changeCitySelection() {
    $scope.selectedCity = '';
    $scope.cityAutocompleteTextField = '';
  }

}
