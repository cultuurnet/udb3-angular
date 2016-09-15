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
    return udbApi
      .getMe()
      .then(function(user) {
        return udbApi.getUserRoles(user.id);
      });
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
    queryString = (queryString ? queryString + ' AND ' : '') + 'wfstatus="readyforvalidation"';

    return udbApi
      .findEventsWithLimit(queryString, offset, itemsPerPage);
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
      .then(logRoleJob);
  };

  /**
   * @param {UdbPlace|UdbEvent} offer
   *
   * @return {Promise.<BaseJob>}
   */
  service.reject = function(offer, reason) {
    return udbApi
      .patchOffer(offer['@id'], 'Reject', reason)
      .then(logRoleJob);
  };

  /**
   * @param {UdbPlace|UdbEvent} offer
   *
   * @return {Promise.<BaseJob>}
   */
  service.flagAsDuplicate = function(offer) {
    return udbApi
      .patchOffer(offer['@id'], 'FlagAsDuplicate')
      .then(logRoleJob);
  };

  /**
   * @param {UdbPlace|UdbEvent} offer
   *
   * @return {Promise.<BaseJob>}
   */
  service.flagAsInappropriate = function(offer) {
    return udbApi
      .patchOffer(offer['@id'], 'FlagAsInappropriate')
      .then(logRoleJob);
  };

  /**
   * @param {Object} commandInfo
   * @return {Promise.<BaseJob>}
   */
  function logRoleJob(commandInfo) {
    var job = new BaseJob(commandInfo.commandId);
    jobLogger.addJob(job);

    return $q.resolve(job);
  }
}
