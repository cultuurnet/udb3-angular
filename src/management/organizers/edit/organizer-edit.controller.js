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
    $state,
    $stateParams,
    $q
  ) {
  var controller = this;
  var organizerId = $stateParams.id;

  controller.contact = [];
  controller.showWebsiteValidation = false;
  controller.websiteError = false;
  controller.invalidUrl = false;
  controller.addressError = false;
  controller.contactError = false;
  controller.hasErrors = false;
  controller.disableSubmit = true;
  controller.saveError = false;

  controller.validateWebsite = validateWebsite;
  controller.validateName = validateName;
  controller.validateAddress = validateAddress;
  controller.validateContact = validateContact;
  controller.checkChanges = checkChanges;
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

    if (controller.organizer.contactPoint !== null) {
      _.forEach(controller.organizer.contactPoint, function(contactArray, key) {
        _.forEach(contactArray, function(value) {
          controller.contact.push({type: key, value: value});
        });
      });
      oldContact = _.cloneDeep(controller.contact);
    }
  }

  /**
   * Validate the website of new organizer.
   */
  function validateWebsite() {
    controller.showWebsiteValidation = true;

    if (!controller.organizerEditForm.website.$valid) {
      controller.invalidUrl = true;
      controller.showWebsiteValidation = false;
      return;
    }

    controller.invalidUrl = false;

    udbOrganizers
        .findOrganizersWebsite(controller.organizer)
        .then(function (data) {
          if (data.totalItems > 0) {
            controller.organizersWebsiteFound = true;
            controller.showWebsiteValidation = false;
            controller.hasErrors = true;
          }
          else {
            controller.showWebsiteValidation = false;
            controller.organizersWebsiteFound = false;
            controller.hasErrors = false;
          }
        }, function() {
          controller.websiteError = true;
          controller.showWebsiteValidation = false;
          controller.hasErrors = true;
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

  function validateAddress(address, error) {
    controller.organizer.address = address;

    if (error) {
      controller.disableSubmit = true;
    }
    else {
      checkChanges();
    }
  }

  function validateContact(contact, error) {
    controller.contact = contact;
    controller.contactError = error;

    if (controller.contactError) {
      controller.disableSubmit = true;
    }
    else {
      checkChanges();
    }
  }

  /**
   * Validate the new organizer.
   */
  function validateOrganizer() {

    controller.showValidation = true;
    // Forms are automatically known in scope.
    if (!controller.organizerEditForm.$valid) {
      controller.hasErrors = true;
      return;
    }

    saveOrganizer();

  }

  function checkChanges() {
    isUrlChanged = !_.isEqual(controller.organizer.url, oldOrganizer.url);
    isNameChanged = !_.isEqual(controller.organizer.name, oldOrganizer.name);
    isAddressChanged = !_.isEqual(controller.organizer.address, oldOrganizer.address);
    isContactChanged = !_.isEqual(controller.contact, oldContact);

    if (isUrlChanged || isNameChanged || isAddressChanged || isContactChanged) {
      controller.disableSubmit = false;
    }
    else {
      controller.disableSubmit = true;
    }
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
        .catch(function () {
          controller.hasErrors = true;
          controller.saveError = true;
        });
  }
}
