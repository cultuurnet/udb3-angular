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
function UserManager(udbApi, jobLogger, BaseJob, $q) {
  var service = this;

  /**
   * @param {string} query
   * @param {int} limit
   * @param {int} start
   *
   * @return {Promise.<PagedCollection>}
   */
  service.find = function (query, limit, start) {
    return udbApi.findUsers(query, limit, start);
  };
}
