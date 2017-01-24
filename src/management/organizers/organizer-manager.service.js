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
function OrganizerManager(udbApi, jobLogger, BaseJob, $q) {
  var service = this;

  /**
   * @param {string} organizerId
   *
   * @returns {Promise.<Organizer>}
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
      .then(logOrganizerLabelJob);
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
      .then(logOrganizerLabelJob);
  };

  /**
   * Removes an organizer from the cache.
   * @param {string} organizerId
   */
  service.removeOrganizerFromCache = function(organizerId) {
    return udbApi.removeItemFromCache(organizerId);
  };

  /**
   * @param {Object} commandInfo
   * @return {Promise.<BaseJob>}
   */
  function logOrganizerLabelJob(commandInfo) {
    var job = new BaseJob(commandInfo.commandId);
    jobLogger.addJob(job);

    return $q.resolve(job);
  }
}
