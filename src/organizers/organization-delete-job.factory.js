'use strict';

/**
 * @ngdoc service
 * @name udbApp.organizers.CreateDeleteOrganizerJob
 * @description
 * # Oragnizer deletion job
 * This factory creates a job that tracks organizer deletion.
 */
angular
  .module('udb.organizers')
  .factory('CreateDeleteOrganizerJob', CreateDeleteOrganizerFactory);

/* @ngInject */
function CreateDeleteOrganizerFactory(BaseJob, JobStates, $q) {

  /**
   * @class CreateDeleteOrganizerJob
   * @constructor
   * @param {string} commandId
   */
  var CreateDeleteOrganizerJob = function (commandId) {
    BaseJob.call(this, commandId);
    this.task = $q.defer();
  };

  CreateDeleteOrganizerJob.prototype = Object.create(BaseJob.prototype);
  CreateDeleteOrganizerJob.prototype.constructor = CreateDeleteOrganizerJob;

  CreateDeleteOrganizerJob.prototype.finish = function () {
    if (this.state !== JobStates.FAILED) {
      this.state = JobStates.FINISHED;
      this.finished = new Date();
      this.task.resolve();
    }
    this.progress = 100;
  };

  CreateDeleteOrganizerJob.prototype.fail = function () {
    this.finished = new Date();
    this.state = JobStates.FAILED;
    this.progress = 100;
    this.task.reject('Failed to delete the organization');
  };

  return (CreateDeleteOrganizerJob);
}
