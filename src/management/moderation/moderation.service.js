'use strict';

/**
 * @ngdoc service
 * @name udb.management.moderation
 * @description
 * # Moderation Manager
 * This service allows you to lookup moderation lists and approve/reject/... Offers.
 */
angular
  .module('udb.management.moderation')
  .service('ModerationService', ModerationService);

/* @ngInject */
function ModerationService(udbApi, OfferWorkflowStatus, jobLogger, BaseJob, $q) {
  var service = this;

  /**
   * @return {Promise.<Role[]>}
   */
  service.getMyRoles = function() {
    return udbApi.getMyRoles();
  };

  /**
   * Find moderation items
   *
   * @param {string} queryString
   * @param {int} itemsPerPage
   * @param {int} offset
   *
   * @return {Promise.<PagedCollection>}
   */
  service.find = function(queryString, itemsPerPage, offset) {
    return udbApi
      .findToModerate(queryString, offset, itemsPerPage);
  };

  /**
   * @param {string} offerId
   *
   * @return {Promise.<Offer>}
   */
  service.getModerationOffer = function(offerId) {
    return udbApi.getOffer(new URL(offerId));
  };

  /**
   * @param {UdbPlace|UdbEvent} offer
   *
   * @return {Promise.<BaseJob>}
   */
  service.approve = function(offer) {
    return udbApi
      .patchOffer(offer['@id'], 'Approve')
      .then(logModerationJob);
  };

  /**
   * @param {UdbPlace|UdbEvent} offer
   *
   * @return {Promise.<BaseJob>}
   */
  service.reject = function(offer, reason) {
    return udbApi
      .patchOffer(offer['@id'], 'Reject', reason)
      .then(logModerationJob);
  };

  /**
   * @param {UdbPlace|UdbEvent} offer
   *
   * @return {Promise.<BaseJob>}
   */
  service.flagAsDuplicate = function(offer) {
    return udbApi
      .patchOffer(offer['@id'], 'FlagAsDuplicate')
      .then(logModerationJob);
  };

  /**
   * @param {UdbPlace|UdbEvent} offer
   *
   * @return {Promise.<BaseJob>}
   */
  service.flagAsInappropriate = function(offer) {
    return udbApi
      .patchOffer(offer['@id'], 'FlagAsInappropriate')
      .then(logModerationJob);
  };

  /**
   * @param {Object} commandInfo
   * @return {Promise.<BaseJob>}
   */
  function logModerationJob(commandInfo) {
    var job = new BaseJob(commandInfo.commandId);
    jobLogger.addJob(job);

    return $q.resolve(job);
  }
}
