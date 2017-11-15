'use strict';

/**
 * @ngdoc service
 * @name udb.entry.BaseJob
 * @description
 * # BaseJob
 * This Is the factory that creates base jobs
 */
angular
  .module('udb.entry')
  .factory('BaseJob', BaseJobFactory);

/* @ngInject */
function BaseJobFactory(JobStates) {

  /**
   * @class BaseJob
   * @constructor
   * @param {string}        commandId       - The commandId assigned to this job by the server
   *
   * @property {object[]}   tasks           - A list of tasks
   * @property {string}     id              - The command ID that uniquely identifies this job
   * @property {number}     progress        - Percentage based progress (0-100)
   * @property {Date}       created         - The date this job was returned by the server and created
   * @property {string}     state           - One of the job states defined in JobStates
   * @property {number} completedTaskCount  - Keeps count of the completed tasks to render the view
   */
  var BaseJob = function (commandId) {
    this.id = commandId;
    this.state = JobStates.CREATED;
    this.progress = 0;
    this.created = new Date();
    this.finished = null;
    this.tasks = [];
    this.completedTaskCount = 0;
  };

  /**
   * Always define the constructor, also when you use this class' prototype to prevent any weird stuff.
   * @type {Function}
   */
  BaseJob.prototype.constructor = BaseJob;

  // The following functions are used to update the job state based on feedback of the server.

  BaseJob.prototype.fail = function () {
    this.finished = new Date();
    this.state = JobStates.FAILED;
    this.progress = 100;
  };

  BaseJob.prototype.start = function () {
    this.state = JobStates.STARTED;
  };

  BaseJob.prototype.finish = function () {
    if (this.state !== JobStates.FAILED) {
      this.state = JobStates.FINISHED;
      this.finished = new Date();
    }
    this.progress = 100;
  };

  /**
   * Update the event with additional job data. This method does nothing by default but can be used by more specific
   * job types.
   *
   * @param {object}  jobData
   */
  BaseJob.prototype.info = function (jobData) {
  };

  /**
   * Renders the job description based on its details.
   * Overwrite this function if you want to show a more customized message.
   *
   * @return {string}
   */
  BaseJob.prototype.getDescription = function () {
    return 'Job with id: ' + this.id;
  };

  /**
   * Returns a date string to use for the job log based on job state.
   *
   * @return {string}
   */
  BaseJob.prototype.getLogDateByState = function () {
    if (_.contains([JobStates.FAILED, JobStates.FINISHED], this.state) && this.finished !== null) {
      return this.finished;
    }
    return this.created;
  };

  /**
   * This name is used by the job directive to find the right template.
   * The name will prepended with 'templates/' and a appended with '.template.html'.
   * A Grunt task is set up to automatically include the templates following this format when exporting the project.
   *
   * @return {string}
   */
  BaseJob.prototype.getTemplateName = function () {
    var templateName;

    if (this.state === JobStates.FAILED) {
      templateName = 'failed-job';
    } else {
      templateName = 'base-job';
    }

    return templateName;
  };

  /**
   * Adds a simple task with a unique id property to the job.
   *
   * @param {object} task
   */
  BaseJob.prototype.addTask = function (task) {

    var duplicateTask = _.find(this.tasks, {id: task.id});

    if (!duplicateTask) {
      this.tasks.push(task);
    }
  };

  BaseJob.prototype.getTaskCount = function () {
    return this.tasks.length;
  };

  /**
   * Find a task based on the task data received from the server.
   * Currently all tasks are identifiable by an event_id property.
   *
   * @param {object} taskData
   * @return {object}
   */
  BaseJob.prototype.findTask = function (taskData) {
    var taskId = taskData['event_id'], // jshint ignore:line
        task = _.find(this.tasks, {id: taskId});

    if (!task) {
      task = {id: taskId};
      this.addTask(task);
    }

    return task;
  };

  // These functions are used to update this job's task state based on feedback from the server.

  BaseJob.prototype.failTask = function (taskData) {
    var task = this.findTask(taskData);

    if (task) {
      task.state = 'failed';
      this.updateProgress();
    }
  };

  BaseJob.prototype.finishTask = function (taskData) {
    var task = this.findTask(taskData);

    if (task) {
      task.state = 'finished';
      this.updateProgress();
    }
  };

  /**
   * Update job progress and completed task count.
   * This information is used to render the view of batch jobs.
   */
  BaseJob.prototype.updateProgress = function () {
    var job = this;

    ++job.completedTaskCount;
    job.progress = (job.completedTaskCount / job.getTaskCount()) * 100;
  };

  return (BaseJob);
}
