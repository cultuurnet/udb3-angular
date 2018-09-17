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
  UdbOrganizer,
  eventCrud,
  $q,
  organizerName,
  OrganizerManager,
  appConfig,
  citiesBE,
  citiesNL
) {

  var controller = this;

  // Scope vars.
  $scope.organizer = organizerName;
  $scope.organizersWebsiteFound = false;
  $scope.organizersFound = false;
  $scope.saving = false;
  $scope.error = false;
  $scope.addressError = false;
  $scope.contactError = false;
  $scope.showWebsiteValidation = false;
  $scope.showValidation = false;
  $scope.organizers = [];
  $scope.selectedCity = '';
  $scope.disableSubmit = true;

  $scope.newOrganizer = {
    mainLanguage: 'nl',
    website: 'http://',
    name : $scope.organizer,
    address : {
      streetAddress : '',
      addressLocality : '',
      postalCode: '',
      addressCountry : 'BE'
    },
    contact: []
  };

  // Scope functions.
  $scope.cancel = cancel;
  $scope.validateWebsite = validateWebsite;
  $scope.updateName = updateName;
  $scope.validateAddress = validateAddress;
  $scope.validateContact = validateContact;
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
   * Validate the website of new organizer.
   */
  function validateWebsite() {
    $scope.showWebsiteValidation = true;

    if (!$scope.organizerForm.website.$valid) {
      $scope.showWebsiteValidation = false;
      return;
    }
    udbOrganizers
        .findOrganizersWebsite($scope.newOrganizer.website)
        .then(function (data) {
          // Set the results for the duplicates modal,
          if (data.totalItems > 0) {
            $scope.organizersWebsiteFound = true;
            $scope.firstOrganizerFound = new UdbOrganizer(data.member[0]);
            $scope.showWebsiteValidation = false;
            $scope.disableSubmit = true;
          }
          else {
            $scope.showWebsiteValidation = false;
            $scope.organizersWebsiteFound = false;
            $scope.firstOrganizerFound = '';
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
   * When the name is changed by a user, submit state needs to be updated also.
   */
  function updateName() {
    if ($scope.newOrganizer.name && !$scope.websiteError) {
      $scope.disableSubmit = false;
    } else {
      $scope.disableSubmit = true;
    }
  }

  function validateAddress(error) {
    $scope.addressError = error;
  }

  function validateContact(error) {
    $scope.contactError = error;
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

    $scope.$broadcast('organizerAddressSubmit');
    $scope.$broadcast('organizerContactSubmit');

    // resolve for now, will re-introduce duplicate detection later on
    var promise = $q.resolve([]);

    $scope.error = false;
    $scope.saving = true;

    if ($scope.addressError || $scope.contactError) {
      $scope.error = true;
      $scope.saving = false;
      return;
    }

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
    $scope.saveError = false;

    var organizer = _.clone($scope.newOrganizer);
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
        $scope.newOrganizer.id = jsonResponse.data.organizerId;
        selectOrganizer($scope.newOrganizer);
        $scope.saving = false;
      }, function() {
        $scope.saveError = true;
        $scope.saving = false;
      });
  }

}
