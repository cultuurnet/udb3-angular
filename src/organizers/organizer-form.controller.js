'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:OrganizerFormController
 * @description
 * # OrganizerFormController
 */
angular
  .module('udb.organizers')
  .controller('OrganizerFormController', OrganizerFormController);

/* @ngInject */
function OrganizerFormController(
    OrganizerManager,
    udbOrganizers,
    $state,
    $stateParams,
    $q,
    $scope
  ) {
  var controller = this;
  var organizerId = $stateParams.id;
  var stateName = $state.current.name;

  controller.loadingError = false;
  controller.contact = [];
  controller.showWebsiteValidation = false;
  controller.urlError = false;
  controller.websiteError = false;
  controller.nameError = false;
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
  controller.cancel = cancel;
  controller.isManageState = isManageState;

  var oldOrganizer = {};
  var oldContact = [];
  var isUrlChanged = false;
  var isNameChanged = false;
  var isAddressChanged = false;
  var isContactChanged = false;

  if (organizerId) {
    loadOrganizer(organizerId);
  }
  else {
    startCreatingOrganizer();
  }

  function startCreatingOrganizer() {
    controller.organizer = {
      mainLanguage: 'nl',
      website: 'http://',
      name : '',
      address : {
        streetAddress : '',
        addressLocality : '',
        postalCode: '',
        addressCountry : ''
      },
      contact: []
    };
  }

  function loadOrganizer(organizerId) {
    OrganizerManager.removeOrganizerFromCache(organizerId);

    OrganizerManager
      .get(organizerId)
      .then(showOrganizer, function () {
        controller.loadingError = true;
      });
  }

  /**
   * @param {udbOrganizer} organizer
   */
  function showOrganizer(organizer) {
    if (_.isEmpty(organizer.address)) {
      organizer.address = {
        streetAddress : '',
        addressLocality : '',
        postalCode: '',
        addressCountry : ''
      };
    }
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

    if (!controller.organizerForm.website.$valid) {
      controller.showWebsiteValidation = false;
      controller.urlError = true;
      return;
    }

    udbOrganizers
        .findOrganizersWebsite(controller.organizer.url)
        .then(function (data) {
          controller.urlError = false;
          if (data.totalItems > 0) {
            if (data.member[0].name === controller.originalName) {
              controller.showWebsiteValidation = false;
              controller.organizersWebsiteFound = false;
            }
            else {
              controller.organizersWebsiteFound = true;
              controller.showWebsiteValidation = false;
            }
          }
          else {
            controller.showWebsiteValidation = false;
            controller.organizersWebsiteFound = false;
          }
        }, function () {
          controller.websiteError = true;
          controller.showWebsiteValidation = false;
        })
        .finally(function() {
          checkChanges();
        });
  }

  function validateName() {
    if (!controller.organizerForm.name.$valid) {
      controller.nameError = true;
    }
    else {
      controller.nameError = false;
    }

    checkChanges();
  }

  function validateAddress(error) {
    controller.addressError = error;
    checkChanges();
  }

  function validateContact(error) {
    controller.contactError = error;
    checkChanges();
  }

  /**
   * Validate the new organizer.
   */
  function validateOrganizer() {
    controller.showValidation = true;
    if (!controller.organizerForm.$valid || controller.organizersWebsiteFound ||
        controller.websiteError || controller.urlError || controller.nameError ||
        controller.addressError || controller.contactError) {
      controller.hasErrors = true;
      controller.disableSubmit = true;
      $scope.$broadcast('organizerAddressSubmit');
      $scope.$broadcast('organizerContactSubmit');
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

    if (controller.organizerForm.$valid && !controller.organizersWebsiteFound &&
        !controller.websiteError && !controller.urlError && !controller.nameError &&
        !controller.addressError && !controller.contactError) {
      controller.hasErrors = false;
    }
  }

  function saveOrganizer() {
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

    promises.push(OrganizerManager.removeOrganizerFromCache(organizerId));

    $q.all(promises)
        .then(function() {
          if (isManageState) {
            $state.go('management.organizers.search', {}, {reload: true});
          } else {
            $state.go('split.footer.dashboard', {}, {reload: true});
          }
        })
        .catch(function () {
          controller.hasErrors = true;
          controller.saveError = true;
        });
  }

  function cancel() {
    OrganizerManager.removeOrganizerFromCache(organizerId);
    if (isManageState) {
      $state.go('management.organizers.search', {}, {reload: true});
    } else {
      $state.go('split.footer.dashboard', {}, {reload: true});
    }
  }

  function isManageState() {
    return (stateName.indexOf('manage') !== -1);
  }
}
