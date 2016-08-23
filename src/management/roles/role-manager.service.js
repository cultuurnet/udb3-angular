'use strict';

/**
 * @typedef {Object} Role
 * @property {string}   uuid
 * @property {string}   name
 * @property {string}   constraint
 */

/**
 * @typedef {Object} roleUpdate
 * @property {string} @name
 * @property {string} @constraint
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
function RoleManager(udbApi, jobLogger, BaseJob, $q, DeleteRoleJob, UserRoleJob) {
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
  service.getRolePermissions = function(roleId) {
    return udbApi.getRolePermissions(roleId);
  };

  /**
   * @param {string|uuid} roleId
   *  The name or uuid of a role.
   * @return {Promise.<Role>}
   */
  service.getRoleUsers = function(roleId) {
    return udbApi.getRoleUsers(roleId);
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
    return udbApi
      .addPermissionToRole(permissionKey, roleId)
      .then(logRoleJob);
  };

  /**
   * @param {string} permissionKey
   *  The key for the permission
   * @param {string} roleId
   *  roleId for the role
   * @return {Promise}
   */
  service.removePermissionFromRole = function(permissionKey, roleId) {
    return udbApi
      .removePermissionFromRole(permissionKey, roleId)
      .then(logRoleJob);
  };

  /**
   * @param {User} user
   *  The user you want to add a role to
   * @param {Role} role
   *  The role you want added to the user
   * @return {Promise.<UserRoleJob>}
   */
  service.addUserToRole = function(user, role) {
    return udbApi
      .addUserToRole(user.uuid, role.uuid)
      .then(userRoleJobCreator(user, role));
  };

  /**
   * @param {uuid} roleId
   * @param {string} name
   * @return {Promise}
   */
  service.updateRoleName = function(roleId, name) {
    return udbApi
      .updateRoleName(roleId, name)
      .then(logRoleJob);
  };

  /**
   * @param {uuid} roleId
   * @param {string} constraint
   * @return {Promise}
   */
  service.updateRoleConstraint = function(roleId, constraint) {
    return udbApi
      .updateRoleConstraint(roleId, constraint)
      .then(logRoleJob);
  };

  /**
   * @param {uuid} roleId
   * @param {uuid} labelId
   * @return {Promise.<BaseJob>}
   */
  service.addLabelToRole = function(roleId, labelId) {
    return udbApi
      .addLabelToRole(roleId, labelId)
      .then(logRoleJob);
  };

  /**
   * @param {uuid} roleId
   * @return {Promise}
   */
  service.getRoleLabels = function(roleId) {
    return udbApi
      .getRoleLabels(roleId);
  };

  /**
   * @param {uuid} roleId
   * @param {uuid} labelId
   * @return {Promise.<BaseJob>}
   */
  service.removeLabelFromRole = function(roleId, labelId) {
    return udbApi
      .removeLabelFromRole(roleId, labelId)
      .then(logRoleJob);
  };

  /**
   * @param {Role} role
   * @param {User} user
   * @return {Promise.<UserRoleJob>}
   */
  service.removeUserFromRole = function(role, user) {
    return udbApi
      .removeUserFromRole(role.uuid, user.uuid)
      .then(userRoleJobCreator(user, role));
  };

  /**
   * @param {Role} role
   * @return {Promise}
   */
  service.deleteRole = function (role) {
    function logDeleteJob(jobData) {
      var job = new DeleteRoleJob(jobData.commandId, role);
      jobLogger.addJob(job);

      return $q.resolve(job);
    }

    return udbApi
      .removeRole(role.uuid)
      .then(logDeleteJob);
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

  /**
   * Returns a callable function that takes a command info and returns a user role job promise.
   *
   * @param {User} user
   * @param {Role} role
   */
  function userRoleJobCreator(user, role) {
    /**
     * @param {CommandInfo} commandInfo
     * @return {Promise.<UserRoleJob>}
     */
    return function(commandInfo) {
      var job = new UserRoleJob(commandInfo.commandId, user, role);
      jobLogger.addJob(job);

      return $q.resolve(job);
    };
  }
}
