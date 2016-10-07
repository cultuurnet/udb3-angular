'use strict';

/**
 * @ngdoc service
 * @name udb.management.organizers
 * @description
 * # Organizer Manager
 * This service allows you to lookup organizers and perform actions on them.
 */
angular
  .module('udb.management.organizers')
  .service('OrganizerManager', OrganizerManager);

/* @ngInject */
function OrganizerManager(udbApi) {
  var service = this;

  /**
   * @param {string} organizerId
   *
   * @returns {Promise.<Organizer>}
   */
  service.get = function(organizerId) {
    return udbApi.getOrganizerById(organizerId);
  };

  service.addLabelToOrganizer = function(organizerId, labelUuid) {
    return udbApi.addLabelToOrganizer(organizerId, labelUuid);
  };
}
