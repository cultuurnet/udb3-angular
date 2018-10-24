'use strict';

/* @ngInject */
function OrganizerFormController(
    OrganizerManager,
    udbOrganizers,
    $state,
    $stateParams,
    $q,
    $scope,
    $translate,
    eventCrud,
    appConfig
) {
  var controller = this;
  var organizerId = $stateParams.id;
  var stateName = $state.current.name;
  var language = $translate.use() || 'nl';

  controller.language = language;
  controller.showAddressComponent = false;
  controller.isNew = true;
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
  var isWebsiteChanged = false;
  var isNameChanged = false;
  var isAddressChanged = false;
  var isContactChanged = false;

  if (organizerId) {
    controller.isNew = false;
    loadOrganizer(organizerId);
  }
  else {
    startCreatingOrganizer();
  }

  function startCreatingOrganizer() {
    controller.organizer = {
      mainLanguage: language,
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
    controller.showAddressComponent = true;
  }

  function loadOrganizer(organizerId) {
    OrganizerManager.removeOrganizerFromCache(organizerId);

    OrganizerManager
        .get(organizerId)
        .then(showOrganizer, function () {
          controller.loadingError = true;
        })
        .finally(function () {
          controller.showAddressComponent = true;
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
        .findOrganizersWebsite(controller.organizer.website)
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
    if (controller.isNew) {
      createNewOrganizer();
    }
    else {
      saveOrganizer();
    }
  }

  function checkChanges() {
    isWebsiteChanged = !_.isEqual(controller.organizer.website, oldOrganizer.website);
    isNameChanged = !_.isEqual(controller.organizer.name, oldOrganizer.name);
    // Also check if the address isn't empty
    isAddressChanged = (!_.isEqual(controller.organizer.address, oldOrganizer.address) &&
        !_.isEmpty(controller.organizer.address.streetAddress));
    isContactChanged = !_.isEqual(controller.contact, oldContact);

    if (isWebsiteChanged || isNameChanged || isAddressChanged || isContactChanged) {
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

    if (isWebsiteChanged) {
      promises.push(OrganizerManager.updateOrganizerWebsite(organizerId, controller.organizer.website));
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
          redirectToDetailPage();
        })
        .catch(function () {
          controller.hasErrors = true;
          controller.saveError = true;
        });
  }

  function createNewOrganizer() {

    var organizer = _.clone(controller.organizer);
    // remove the address when it's empty
    if (
        !organizer.address.streetAddress &&
        !organizer.address.addressLocality &&
        !organizer.address.postalCode
    ) {
      delete organizer.address;
    }

    eventCrud
        .createOrganizer(organizer)
        .then(function(jsonResponse) {
          var defaultOrganizerLabel = _.get(appConfig, 'offerEditor.defaultOrganizerLabel');
          if (typeof(defaultOrganizerLabel) !== 'undefined' &&
              defaultOrganizerLabel !== '') {
            OrganizerManager
                .addLabelToOrganizer(jsonResponse.data.organizerId, defaultOrganizerLabel);
          }
          controller.organizer.id = jsonResponse.data.organizerId;
          redirectToDetailPage();
        }, function() {
          controller.hasErrors = true;
          controller.saveError = true;
        });
  }

  function cancel() {
    if (isManageState()) {
      $state.go('management.organizers.search', {}, {reload: true});
    } else {
      $state.go('split.footer.dashboard', {}, {reload: true});
    }
  }

  function redirectToDetailPage() {
    OrganizerManager.removeOrganizerFromCache(controller.organizer.id);
    $state.go('split.organizerDetail', {id: controller.organizer.id}, {reload: true});
  }

  function isManageState() {
    return (stateName.indexOf('manage') !== -1);
  }
}

/**
 * @ngdoc function
 * @name udbApp.controller:OrganizerFormController
 * @description
 * # OrganizerFormController
 */
angular
  .module('udb.organizers')
  .controller('OrganizerFormController', OrganizerFormController);
