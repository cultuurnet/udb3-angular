'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormOrganizerAddressController
 * @description
 * # EventFormOrganizerAddressController
 * Modal for setting the reservation period.
 */
angular
    .module('udb.event-form')
    .component('udbOrganizerContact', {
      templateUrl: 'templates/organizer-contact.html',
      controller: OrganizerContactComponent,
      controllerAs: 'occ',
      bindings: {
        contact: '<',
        onUpdate: '&'
      }
    });

/* @ngInject */
function OrganizerContactComponent() {
  var controller = this;
  controller.contactHasErrors = false;

  controller.validateContact = validateContact;
  controller.addOrganizerContactInfo = addOrganizerContactInfo;
  controller.deleteOrganizerContactInfo = deleteOrganizerContactInfo;

  function validateContact() {
    if (_.find(controller.contact, {'value': ''}) ||
        _.find(controller.contact, {'value': undefined})) {
      controller.contactHasErrors = true;
    }
    else {
      controller.contactHasErrors = false;
    }
    sendUpdate();
  }

  /**
   * Add a contact info entry for an organizer.
   */
  function addOrganizerContactInfo(type) {
    controller.contact.push({
      type : type,
      value : ''
    });
    validateContact();
  }

  /**
   * Remove a given key of the contact info.
   */
  function deleteOrganizerContactInfo(index) {
    controller.contact.splice(index, 1);
    validateContact();
  }

  function sendUpdate() {
    controller.onUpdate({contact: controller.contact, error: controller.contactHasErrors});
  }
}
