'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:OrganizerEditController
 * @description
 * # OrganizerEditController
 */
angular
  .module('udb.management.organizers')
  .controller('OrganizerEditController', OrganizerEditController);

/* @ngInject */
function OrganizerEditController(
    $scope,
    OrganizerManager,
    udbOrganizers,
    $uibModal,
    $stateParams,
    cities,
    Levenshtein
  ) {
  var controller = this;
  var organizerId = $stateParams.id;

  $scope.cities = cities;
  $scope.selectedCity = '';
  $scope.contact = [];

  loadOrganizer(organizerId);

  function loadOrganizer(organizerId) {
    OrganizerManager
      .get(organizerId)
      .then(showOrganizer);
  }

  /**
   * @param {udbOrganizer} organizer
   */
  function showOrganizer(organizer) {
    controller.organizer = organizer;
    controller.oldOrganizer = organizer;
    $scope.selectedCity = organizer.address.postalCode + ' - ' + organizer.address.addressLocality;

    _.forEach(organizer.contactPoint, function(contactArray, key) {
      _.forEach(contactArray, function(value) {
        $scope.contact.push({type: key, value: value});
      });
    });
  }

  /**
   * Validate the website of new organizer.
   */
  controller.validateWebsite = function() {
    $scope.showWebsiteValidation = true;

    if (!controller.organizerEditForm.website.$valid) {
      $scope.showWebsiteValidation = false;
      return;
    }

    udbOrganizers
        .findOrganizersWebsite(controller.organizer)
        .then(function (data) {
          // Set the results for the duplicates modal,
          if (data.totalItems > 0) {
            $scope.organizersWebsiteFound = true;
            $scope.showWebsiteValidation = false;
            $scope.disableSubmit = true;
          }
          else {
            $scope.showWebsiteValidation = false;
            $scope.organizersWebsiteFound = false;
          }
        }, function() {
          $scope.websiteError = true;
          $scope.showWebsiteValidation = false;
        });
  };

  /**
   * Add a contact info entry for an organizer.
   */
  controller.addOrganizerContactInfo = function(type) {
    $scope.contact.push({
      type : type,
      value : ''
    });
  };

  /**
   * Remove a given key of the contact info.
   */
  controller.deleteOrganizerContactInfo = function(index) {
    $scope.contact.splice(index, 1);
  };

  controller.filterCities = function(value) {
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

  controller.orderByLevenshteinDistance = function(value) {
    return function (city) {
      return new Levenshtein(value, city.zip + '' + city.name);
    };
  };

  /**
   * Select City.
   */
  controller.selectCity = function ($item, $label) {
    $scope.newOrganizer.address.postalCode = $item.zip;
    $scope.newOrganizer.address.addressLocality = $item.name;

    $scope.cityAutocompleteTextField = '';
    $scope.selectedCity = $label;
  };

  /**
   * Change a city selection.
   */
  controller.changeCitySelection = function () {
    $scope.selectedCity = '';
    $scope.cityAutocompleteTextField = '';
  };

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    controller.errorMessage = problem.title + (problem.detail ? ' ' + problem.detail : '');

    var modalInstance = $uibModal.open(
      {
        templateUrl: 'templates/unexpected-error-modal.html',
        controller: 'UnexpectedErrorModalController',
        size: 'sm',
        resolve: {
          errorMessage: function() {
            return controller.errorMessage;
          }
        }
      }
    );
  }
}
