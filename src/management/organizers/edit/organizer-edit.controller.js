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
    OrganizerManager,
    udbOrganizers,
    $uibModal,
    $stateParams,
    cities,
    Levenshtein
  ) {
  var controller = this;
  var organizerId = $stateParams.id;

  controller.cities = cities;
  controller.selectedCity = '';
  controller.contact = [];

  var isUrlChanged = false;
  var isNameChanged = false;
  var isAddressChanged = false;
  var isContactChanged = false;

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
    controller.oldOrganizer = _.cloneDeep(organizer);
    controller.selectedCity = organizer.address.postalCode + ' ' + organizer.address.addressLocality;

    _.forEach(organizer.contactPoint, function(contactArray, key) {
      _.forEach(contactArray, function(value) {
        controller.contact.push({type: key, value: value});
      });
    });
  }

  /**
   * Validate the website of new organizer.
   */
  controller.validateWebsite = function() {
    controller.showWebsiteValidation = true;

    if (!controller.organizerEditForm.website.$valid) {
      controller.showWebsiteValidation = false;
      return;
    }

    udbOrganizers
        .findOrganizersWebsite(controller.organizer)
        .then(function (data) {
          // Set the results for the duplicates modal,
          if (data.totalItems > 0) {
            controller.organizersWebsiteFound = true;
            controller.showWebsiteValidation = false;
            controller.disableSubmit = true;
          }
          else {
            controller.showWebsiteValidation = false;
            controller.organizersWebsiteFound = false;
          }
        }, function() {
          controller.websiteError = true;
          controller.showWebsiteValidation = false;
        });
  };

  /**
   * Add a contact info entry for an organizer.
   */
  controller.addOrganizerContactInfo = function(type) {
    controller.contact.push({
      type : type,
      value : ''
    });
  };

  /**
   * Remove a given key of the contact info.
   */
  controller.deleteOrganizerContactInfo = function(index) {
    controller.contact.splice(index, 1);
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
    controller.newOrganizer.address.postalCode = $item.zip;
    controller.newOrganizer.address.addressLocality = $item.name;

    controller.cityAutocompleteTextField = '';
    controller.selectedCity = $label;
  };

  /**
   * Change a city selection.
   */
  controller.changeCitySelection = function () {
    controller.selectedCity = '';
    controller.cityAutocompleteTextField = '';
  };

  /**
   * Validate the new organizer.
   */
  controller.validateOrganizer = function () {

    controller.showValidation = true;
    // Forms are automatically known in scope.
    if (!controller.organizerEditForm.$valid) {
      return;
    }

    isUrlChanged = !_.isEqual(controller.organizer.url, controller.oldOrganizer.url);
    isNameChanged = !_.isEqual(controller.organizer.name, controller.oldOrganizer.name);
    isAddressChanged = !_.isEqual(controller.organizer.address, controller.oldOrganizer.address);

    // overwrite all contactPoint info with info of controller.contact.
    delete controller.organizer.contactPoint;
    controller.organizer.contactPoint = {
      phone: [],
      email: [],
      url: []
    };
    _.forEach(controller.contact, function(value) {
      if (value.type === 'phone') {
        controller.organizer.contactPoint.phone.push(value.value);
      }
      else if (value.type === 'email') {
        controller.organizer.contactPoint.email.push(value.value);
      }
      else if (value.type === 'url') {
        controller.organizer.contactPoint.url.push(value.value);
      }
    });

    isContactChanged = !_.isEqual(controller.organizer.contactPoint, controller.oldOrganizer.contactPoint);

    saveOrganizer();

  };

  function saveOrganizer () {
    if (isUrlChanged) {
      OrganizerManager
          .updateOrganizerWebsite(organizerId, controller.organizer.url)
          .catch(showProblem);
    }

    if (isNameChanged) {
      OrganizerManager
          .updateOrganizerName(organizerId, controller.organizer.name)
          .catch(showProblem);
    }

    if (isAddressChanged) {
      OrganizerManager
          .updateOrganizerAddress(organizerId, controller.organizer.address)
          .catch(showProblem);
    }
  }

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
