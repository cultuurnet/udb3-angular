'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormOrganizerAddressController
 * @description
 * # EventFormOrganizerAddressController
 * Modal for setting the reservation period.
 */
angular.module('udb.event-form').component('udbOrganizerContact', {
  templateUrl: 'templates/organizer-contact.html',
  controller: OrganizerContactComponent,
  controllerAs: 'occ',
  bindings: {
    contact: '=',
    onUpdate: '&'
  }
});

/* @ngInject */
function OrganizerContactComponent($scope) {
  var controller = this;

  controller.newContact = {};

  controller.addingContactEntry = false;
  controller.validateContact = validateContact;
  controller.addOrganizerContactEntry = addOrganizerContactEntry;
  controller.cancelOrganizerContactEntry = cancelOrganizerContactEntry;
  controller.addOrganizerContactInfo = addOrganizerContactInfo;
  controller.deleteOrganizerContactInfo = deleteOrganizerContactInfo;
  controller.sendUpdate = sendUpdate;

  $scope.$on('organizerContactSubmit', function() {
    controller.organizerContactWrapper.$setSubmitted();
  });

  function validateContact() {
    if (
      _.find(controller.contact, { value: '' }) ||
      _.find(controller.contact, { value: undefined }) ||
      controller.organizerContactWrapper.$invalid
    ) {
      controller.contactHasErrors = true;
    } else {
      controller.contactHasErrors = false;
    }
  sendUpdate();
}

  function resetOrganizerContactEntry() {
    controller.newContact = {
      type: '',
      value: ''
    };
  }

  /**
  * Add a contact info entry for an organizer.
  */
  function addOrganizerContactEntry(type) {
    controller.newContact = {
      type: type,
      value: ''
    };
    controller.addingContactEntry = true;
  }

  /**
  * Add a contact info entry for an organizer.
  */
  function cancelOrganizerContactEntry() {
    resetOrganizerContactEntry();
    controller.addingContactEntry = false;
  }

  /* */
  function addOrganizerContactInfo() {
    validateContact();
      if (!controller.contactHasErrors) {
        controller.contact.push(controller.newContact);
        resetOrganizerContactEntry();
        controller.addingContactEntry = false;
      }
  }

  /**
  * Remove a given key of the contact info.
  */
  function deleteOrganizerContactInfo(index) {
    controller.contact.splice(index, 1);
    validateContact();
  }

  function sendUpdate() {
    controller.onUpdate({ error: controller.contactHasErrors });
  }
}
