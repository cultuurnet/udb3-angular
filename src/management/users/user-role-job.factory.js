'use strict';

/**
 * @ngdoc service
 * @name udb.management.users.UserRoleJob
 * @description
 * # User Role Job
 * This Is the factory that creates a user role job
 */
angular
  .module('udb.management.users')
  .factory('UserRoleJob', UserRoleJobFactory);

/* @ngInject */
function UserRoleJobFactory(BaseJob, JobStates, $q) {

  /**
   * @class UserRoleJob
   * @constructor
   * @param {string} commandId
   * @param {User} user
   * @param {Role} role
   */
  var UserRoleJob = function (commandId, user, role) {
    BaseJob.call(this, commandId);

    this.role = role;
    this.user = user;
    this.task = $q.defer();
  };

  UserRoleJob.prototype = Object.create(BaseJob.prototype);
  UserRoleJob.prototype.constructor = UserRoleJob;

  UserRoleJob.prototype.finish = function () {
    BaseJob.prototype.finish.call(this);

    if (this.state !== JobStates.FAILED) {
      this.task.resolve();
    }
  };

  UserRoleJob.prototype.fail = function () {
    BaseJob.prototype.fail.call(this);

    this.task.reject();
  };

  UserRoleJob.prototype.getDescription = function () {
    var job = this,
      description;

    var failedDescriptionTemplate = _.template(
      'Het toekennen of verwijderen van de rol: "${role.name}" is mislukt voor "${user.username}".'
    );
    var descriptionTemplate = _.template(
      'Toevoegen of verwijderen van de rol: "${role.name}" voor gebruiker "${user.username}".'
    );

    if (this.state === JobStates.FAILED) {
      description = failedDescriptionTemplate(job);
    } else {
      description = descriptionTemplate(job);
    }

    return description;
  };

  return (UserRoleJob);
}
