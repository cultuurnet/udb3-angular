'use strict';

/**
 * @typedef {Object} Role
 * @property {string}   id
 * @property {string}   name
 * @property {boolean}  isVisible
 * @property {boolean}  isPrivate
 */

/**
 * @ngdoc service
 * @name udb.management.roles
 * @description
 * # Role Manager
 * This service allows you to lookup roles and perform actions on them.
 */
angular
  .module('udb.management.roles')
  .service('RoleManager', RoleManager);

/* @ngInject */
function RoleManager(udbApi, jobLogger, BaseJob, $q) {
  var service = this;

  /**
   * @param {string} query
   * @param {int} limit
   * @param {int} start
   *
   * @return {Promise.<PagedCollection>}
   */
  service.find = function(query, limit, start) {
    return udbApi.findRoles(query, limit, start);
  };

  /**
   * @param {string|uuid} roleIdentifier
   *  The name or uuid of a role.
   * @return {Promise.<Role>}
   */
  service.get = function(roleIdentifier) {
    return udbApi.getRoleById(roleIdentifier);
  };

  /**
   * @param {string|uuid} roleId
   *  The name or uuid of a role.
   * @return {Promise.<Role>}
   */
  service.getRolePermission = function(roleId) {
    return udbApi.getRolePermissions(roleId);
  };

  /**
   * @param {string} name
   *  The name of the new role.
   * @return {Promise.<Role>}
   */
  service.create = function(name) {
    return udbApi.createRole(name);
  };

  /**
   * @param {string} permissionKey
   *  The key for the permission
   * @param {string} roleId
   *  roleId for the role
   * @return {Promise}
   */
  service.addPermissionToRole = function(permissionKey, roleId) {
    return udbApi.addPermissionToRole(permissionKey, roleId);
  };
}
