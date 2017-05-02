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
        contactPoint: '<'
      }
    });

/* @ngInject */
function OrganizerContactComponent() {
  var controller = this;

  controller.contact = [];

  controller.addOrganizerContactInfo = addOrganizerContactInfo;
  controller.deleteOrganizerContactInfo = deleteOrganizerContactInfo;

  if (controller.contactPoint !== null) {
    _.forEach(controller.contactPoint, function(contactArray, key) {
      _.forEach(contactArray, function(value) {
        controller.contact.push({type: key, value: value});
      });
    });
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
}
