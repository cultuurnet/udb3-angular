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
  $scope.organizersWebsiteFound = false;
  $scope.organizersFound = false;
  $scope.saving = false;
  $scope.error = false;
  $scope.showWebsiteValidation = false;
  $scope.showValidation = false;
  $scope.organizers = [];
  $scope.selectedCity = '';
  $scope.disableSubmit = true;

  $scope.newOrganizer = {
    website: 'http://',
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
  $scope.useFirstOrganizerFound = useFirstOrganizerFound;
  $scope.addOrganizerContactInfo = addOrganizerContactInfo;
  $scope.deleteOrganizerContactInfo = deleteOrganizerContactInfo;
  $scope.validateWebsite = validateWebsite;
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
   * Use the first organizer found in the event form.
   */
  function useFirstOrganizerFound() {
    $scope.$parent.selectOrganizer($scope.firstOrganizerFound);
    cancel();
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
   * Validate the website of new organizer.
   */
  function validateWebsite() {
    $scope.showWebsiteValidation = true;

    if (!$scope.organizerForm.website.$valid) {
      $scope.showWebsiteValidation = false;
      return;
    }

    var promise = udbOrganizers.searchDuplicates($scope.newOrganizer.website);

    promise.then(function (data) {
      // Set the results for the duplicates modal,
      if (data.length > 0) {
        $scope.organizersWebsiteFound = true;
        $scope.firstOrganizerFound = data.member[0];
        $scope.showWebsiteValidation = false;
      }
      else {
        $scope.showWebsiteValidation = false;
        if ($scope.newOrganizer.name) {
          $scope.disableSubmit = false;
        }
      }
    }, function() {
      $scope.websiteError = true;
      $scope.showWebsiteValidation = false;
    });
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

    saveOrganizer();
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
      var words = value.match(/\w+/g);
      var zipMatches = words.filter(function (word) {
        return city.zip.indexOf(word) !== -1;
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
