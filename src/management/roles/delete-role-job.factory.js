'use strict';

/**
 * @ngdoc service
 * @name udb.management.roles.DeleteRoleJob
 * @description
 * This is the factory that creates jobs to delete roles.
 */
angular
  .module('udb.management.roles')
  .factory('DeleteRoleJob', DeleteRoleJobFactory);

/* @ngInject */
function DeleteRoleJobFactory(BaseJob, $q, JobStates) {

  /**
   * @class DeleteRoleJob
   * @constructor
   * @param {string} commandId
   * @param {Role} role
   */
  var DeleteRoleJob = function (commandId, role) {
    BaseJob.call(this, commandId);

    this.role = role;
    this.task = $q.defer();
  };

  DeleteRoleJob.prototype = Object.create(BaseJob.prototype);
  DeleteRoleJob.prototype.constructor = DeleteRoleJob;

  DeleteRoleJob.prototype.finish = function () {
    BaseJob.prototype.finish.call(this);

    if (this.state !== JobStates.FAILED) {
      this.task.resolve();
    }
  };

  DeleteRoleJob.prototype.fail = function () {
    BaseJob.prototype.fail.call(this);

    this.task.reject();
  };

  DeleteRoleJob.prototype.getDescription = function() {
    return 'Rol verwijderen: "' +  this.role.name + '".';
  };

  return (DeleteRoleJob);
}
