'use strict';

/**
 * @typedef {Object} User
 * @property {string}   uuid
 * @property {string}   email
 * @property {string}   username
 */

/**
 * @ngdoc service
 * @name udb.management.users
 * @description
 * # User Manager
 * This service allows you to lookup users and perform actions on them.
 */
angular
  .module('udb.management.users')
  .service('UserManager', UserManager);

/* @ngInject */
function UserManager(udbApi) {
  var service = this;

  /**
   * @param {string} email
   *
   * @returns {Promise}
   *
   */
  service.findUserWithEmail = function(email) {
    return udbApi.findUserWithEmail(email);
  };

  /**
   * @param {string} userId
   *
   * @return {Promise.<Role[]>}
   */
  service.getRoles = function (userId) {
    return udbApi.getUserRoles(userId);
  };
}
