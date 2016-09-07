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
  .service('ModerationManager', ModerationManager);

/* @ngInject */
function ModerationManager(udbApi) {
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
   * @param {string} queryString
   * @param {int} start
   *
   * @return {Promise.<PagedCollection>}
   */
  service.findModerationItems = function(queryString, start) {
    queryString = (queryString ? queryString + ' AND ' : '') + 'wfstatus="readyforvalidation"';

    return udbApi
      .findEvents(queryString, start);
  };
}
