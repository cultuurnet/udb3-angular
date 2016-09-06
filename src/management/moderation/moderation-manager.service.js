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
   * @param {string} query
   * @param {int} limit
   * @param {int} start
   *
   * @return {Promise.<PagedCollection>}
   */
  service.getMyRoles = function() {
    return udbApi
      .getMe()
      .then(function(user) {
        return udbApi.getUserRoles(user.id);
      });
  };
}
