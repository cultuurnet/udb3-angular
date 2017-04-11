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
function OrganizerManager(udbApi, jobLogger, BaseJob, $q, $rootScope) {
  var service = this;

  /**
   * @param {UdbOrganizer} organization
   */
  service.delete = function (organization) {
    return udbApi
      .deleteOrganization(organization)
      .then(logOrganizationDeleted(organization));
  };

  /**
   * @param {UdbOrganizer} organization
   * @return {Function}
   */
  function logOrganizationDeleted(organization) {
    /**
     * @param {Object} commandInfo
     * @return {Promise.<BaseJob>}
     */
    return function (commandInfo) {
      var job = new BaseJob(commandInfo.commandId);
      jobLogger.addJob(job);

      $rootScope.$emit('organizationDeleted', organization);
      return $q.resolve(job);
    };

  }

  /**
   * @param {string} query
   * @param {int} limit
   * @param {int} start
   *
   * @return {Promise.<PagedCollection>}
   */
  service.find = function(query, limit, start) {
    return udbApi.findOrganisations(start, limit, null, query);
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
      .addLabelToOrganizer(organizerId, labelUuid)
      .then(logUpdateOrganizerJob);
  };

  /**
   * @param {string} organizerId
   * @param {string} labelUuid
   *
   * @returns {Promise}
   */
  service.deleteLabelFromOrganizer = function(organizerId, labelUuid) {
    return udbApi
      .deleteLabelFromOrganizer(organizerId, labelUuid)
      .then(logUpdateOrganizerJob);
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
        .updateOrganizerWebsite(organizerId, website)
        .then(logUpdateOrganizerJob);
  };

  /**
   * @param {Object} commandInfo
   * @return {Promise.<BaseJob>}
   */
  function logUpdateOrganizerJob(commandInfo) {
    var job = new BaseJob(commandInfo.commandId);
    jobLogger.addJob(job);

    return $q.resolve(job);
  }
}
