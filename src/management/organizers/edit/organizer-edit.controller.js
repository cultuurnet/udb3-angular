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
    $state,
    $stateParams,
    cities,
    Levenshtein,
    $q
  ) {
  var controller = this;
  var organizerId = $stateParams.id;

  controller.cities = cities;
  controller.selectedCity = '';
  controller.contact = [];
  controller.showWebsiteValidation = false;
  controller.websiteError = false;
  controller.validUrl = true;
  controller.hasErrors = false;
  controller.disableSubmit = true;

  controller.validateWebsite = validateWebsite;
  controller.validateName = validateName;
  controller.addOrganizerContactInfo = addOrganizerContactInfo;
  controller.deleteOrganizerContactInfo = deleteOrganizerContactInfo;
  controller.filterCities = filterCities;
  controller.orderByLevenshteinDistance = orderByLevenshteinDistance;
  controller.selectCity = selectCity;
  controller.changeCitySelection = changeCitySelection;
  controller.validateOrganizer = validateOrganizer;

  var oldOrganizer = {};
  var oldContact = [];
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
    oldOrganizer = _.cloneDeep(organizer);
    controller.originalName = oldOrganizer.name;
    controller.selectedCity = organizer.address.postalCode + ' ' + organizer.address.addressLocality;

    _.forEach(controller.organizer.contactPoint, function(contactArray, key) {
      _.forEach(contactArray, function(value) {
        controller.contact.push({type: key, value: value});
      });
    });

    oldContact = _.cloneDeep(controller.contact);
  }

  /**
   * Validate the website of new organizer.
   */
  function validateWebsite() {
    controller.showWebsiteValidation = true;

    if (!controller.organizerEditForm.website.$valid) {
      controller.validUrl = false;
      controller.showWebsiteValidation = false;
      controller.disableSubmit = true;
      return;
    }

    controller.validUrl = true;

    udbOrganizers
        .findOrganizersWebsite(controller.organizer)
        .then(function (data) {
          if (data.totalItems > 0) {
            controller.organizersWebsiteFound = true;
            controller.showWebsiteValidation = false;
            controller.disableSubmit = true;
            controller.hasErrors = true;
          }
          else {
            controller.showWebsiteValidation = false;
            controller.organizersWebsiteFound = false;
            controller.disableSubmit = false;
            controller.hasErrors = false;
          }
        }, function() {
          controller.websiteError = true;
          controller.showWebsiteValidation = false;
          controller.hasErrors = true;
          controller.disableSubmit = true;
        });

    checkChanges();
  }

  function validateName() {
    if (!controller.organizerEditForm.name.$valid) {
      controller.hasErrors = true;
      return;
    }
    controller.hasErrors = false;
    checkChanges();
  }

  /**
   * Add a contact info entry for an organizer.
   */
  function addOrganizerContactInfo(type) {
    controller.contact.push({
      type : type,
      value : ''
    });
  }

  /**
   * Remove a given key of the contact info.
   */
  function deleteOrganizerContactInfo(index) {
    controller.contact.splice(index, 1);
  }

  function filterCities(value) {
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
  }

  function orderByLevenshteinDistance(value) {
    return function (city) {
      return new Levenshtein(value, city.zip + '' + city.name);
    };
  }

  /**
   * Select City.
   */
  function selectCity($item, $label) {
    controller.organizer.address.postalCode = $item.zip;
    controller.organizer.address.addressLocality = $item.name;

    controller.cityAutocompleteTextField = '';
    controller.selectedCity = $label;
  }

  /**
   * Change a city selection.
   */
  function changeCitySelection() {
    controller.selectedCity = '';
    controller.cityAutocompleteTextField = '';
  }

  /**
   * Validate the new organizer.
   */
  function validateOrganizer() {

    controller.showValidation = true;
    // Forms are automatically known in scope.
    if (!controller.organizerEditForm.$valid) {
      controller.hasErrors = true;
      controller.disableSubmit = true;
      return;
    }

    saveOrganizer();

  }

  function checkChanges() {
    isUrlChanged = !_.isEqual(controller.organizer.url, oldOrganizer.url);
    isNameChanged = !_.isEqual(controller.organizer.name, oldOrganizer.name);
    isAddressChanged = !_.isEqual(controller.organizer.address, oldOrganizer.address);
    isContactChanged = !_.isEqual(controller.contact, oldContact);

    (isUrlChanged || isNameChanged || isAddressChanged || isContactChanged) ? controller.disableSubmit = false : controller.disableSubmit = true;
  }

  function saveOrganizer () {
    var promises = [];
    if (isUrlChanged) {
      promises.push(OrganizerManager.updateOrganizerWebsite(organizerId, controller.organizer.url));
    }

    if (isNameChanged) {
      promises.push(OrganizerManager.updateOrganizerName(organizerId, controller.organizer.name));
    }

    if (isAddressChanged) {
      promises.push(OrganizerManager.updateOrganizerAddress(organizerId, controller.organizer.address));
    }

    if (isContactChanged) {
      promises.push(OrganizerManager.updateOrganizerContact(organizerId, controller.contact));
    }

    $q.all(promises)
        .then(function() {
          $state.go('management.organizers.search', {}, {reload: true});
        })
        .catch(showProblem);
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
