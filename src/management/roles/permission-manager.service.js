'use strict';

/**
 * @typedef {Object} Permission
 * @property {string} key
 * @property {string} name
 */

/**
 * @ngdoc service
 * @name udb.management.permissions
 * @description
 * # Permission Manager
 * This service allows you to lookup permissions and perform actions on them.
 */
angular
  .module('udb.management.roles')
  .service('PermissionManager', PermissionManager);

/* @ngInject */
function PermissionManager(udbApi, jobLogger, BaseJob, $q) {
  var service = this;

  /**
   * @param {string} permissionIdentifier
   *  The key for the permission
   * @return {Promise.Array<Permission>}
   */
  service.getAll = function() {
    return udbApi.getPermissions();
  };
}
