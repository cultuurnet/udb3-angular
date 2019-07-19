'use strict';

/**
 * @typedef {Object} Role
 * @property {string}   uuid
 * @property {string}   name
 * @property {string}   constraint
 * @property {RolePermission[]} permissions
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
function RoleManager(udbApi, jobLogger, BaseJob, $q, DeleteRoleJob) {
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
   * @param {RolePermission} permission
   *  The permission to add to the role
   * @param {string} roleId
   *  roleId for the role
   * @return {Promise}
   */
  service.addPermissionToRole = function(permission, roleId) {
    return udbApi
      .addPermissionToRole(permission, roleId)
      .then(logRoleJob);
  };

  /**
   * @param {RolePermission} permission
   *  The key for the permission
   * @param {string} roleId
   *  roleId for the role
   * @return {Promise}
   */
  service.removePermissionFromRole = function(permission, roleId) {
    return udbApi
      .removePermissionFromRole(permission, roleId)
      .then(logRoleJob);
  };

  /**
   * @param {User} user
   *  The user you want to add a role to
   * @param {Role} role
   *  The role you want added to the user
   * @return {Promise}
   */
  service.addUserToRole = function(user, role) {
    return udbApi
      .addUserToRole(user.uuid, role.uuid);
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
   *
   * @param {uuid} roleId
   * @param {string} version
   * @param {string} constraint
   * @returns {Promise}
   */
  service.createRoleConstraint = function(roleId, version, constraint) {
    return udbApi
        .createRoleConstraint(roleId, version, constraint)
        .then(logRoleJob);
  };

  /**
   * @param {uuid} roleId
   * @param {string} version
   * @param {string} constraint
   * @return {Promise}
   */
  service.updateRoleConstraint = function(roleId, version, constraint) {
    return udbApi
        .updateRoleConstraint(roleId, version, constraint)
        .then(logRoleJob);
  };

  /**
   * @param {uuid} roleId
   * @param {string} version
   * @param {string} constraint
   * @return {Promise}
   */
  service.removeRoleConstraint = function(roleId, version) {
    return udbApi
        .removeRoleConstraint(roleId, version)
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
   * @return {Promise}
   */
  service.removeUserFromRole = function(role, user) {
    return udbApi
      .removeUserFromRole(role.uuid, user.uuid);
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
}
