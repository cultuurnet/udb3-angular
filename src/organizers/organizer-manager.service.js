'use strict';

/**
 * @ngdoc service
 * @name udb.organizers
 * @description
 * # Organizer Manager
 * This service allows you to lookup organizers and perform actions on them.
 */
angular
  .module('udb.organizers')
  .service('OrganizerManager', OrganizerManager);

/* @ngInject */
function OrganizerManager(udbApi) {
  var service = this;

  /**
   * @param {UdbOrganizer} organization
   * @returns {Promise}
   */
  service.delete = function (organization) {
    return udbApi
      .deleteOrganization(organization);
  };

  /**
   * @param {string} query
   * @param {int} limit
   * @param {int} start
   *
   * @return {Promise.<PagedCollection>}
   */
  service.find = function(query, limit, start) {
    return udbApi.findOrganisations(start, limit, null, query, true);
  };

  /**
   * @param {string} organizerId
   *
   * @returns {Promise.<UdbOrganizer>}
   */
  service.get = function(organizerId) {
    return udbApi.getOrganizerById(organizerId);
  };

  /**
   * @param {string} organizerId
   * @param {string} labelUuid
   *
   * @returns {Promise}
   */
  service.addLabelToOrganizer = function(organizerId, labelUuid) {
    return udbApi
      .addLabelToOrganizer(organizerId, labelUuid);
  };

  /**
   * @param {string} organizerId
   * @param {string} labelUuid
   *
   * @returns {Promise}
   */
  service.deleteLabelFromOrganizer = function(organizerId, labelUuid) {
    return udbApi
      .deleteLabelFromOrganizer(organizerId, labelUuid);
  };

  /**
   * Removes an organizer from the cache.
   * @param {string} organizerId
   */
  service.removeOrganizerFromCache = function(organizerId) {
    return udbApi.removeItemFromCache(organizerId);
  };

  /**
   * Update the unique url of a specific organizer.
   * @param {string} organizerId
   * @param {string} website
   *
   * @returns {Promise}
   */
  service.updateOrganizerWebsite = function(organizerId, website) {
    return udbApi
        .updateOrganizerWebsite(organizerId, website);
  };

  /**
   * Update the name of a specific organizer.
   * @param {string} organizerId
   * @param {string} name
   * @param {string} language
   *
   * @returns {Promise}
   */
  service.updateOrganizerName = function(organizerId, name, language) {
    return udbApi
        .updateOrganizerName(organizerId, name, language);
  };

  /**
   * Update the address of a specific organizer.
   * @param {string} organizerId
   * @param {Object} address
   * @param {string} language
   *
   * @returns {Promise}
   */
  service.updateOrganizerAddress = function(organizerId, address, language) {
    return udbApi
        .updateOrganizerAddress(organizerId, address, language);
  };

  /**
   * Remove the address of a specific organizer.
   * @param {string} organizerId
   *
   * @returns {Promise}
   */
  service.removeOrganizerAddress = function(organizerId) {
    return udbApi
        .removeOrganizerAddress(organizerId);
  };

  /**
   * Update contact info of a specific organizer.
   * @param {string} organizerId
   * @param {Array} contact
   * @param {string} language
   *
   * @returns {Promise}
   */
  service.updateOrganizerContact = function(organizerId, contact, language) {
    return udbApi
        .updateOrganizerContact(organizerId, contact, language);
  };
}
