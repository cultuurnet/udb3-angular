'use strict';

/**
 * @ngdoc service
 * @name udb.entry.QueryLabelJob
 * @description
 * # BaseJob
 * This Is the factory that creates an event export job
 */
angular
  .module('udb.entry')
  .factory('QueryLabelJob', QueryLabelJobFactory);

/* @ngInject */
function QueryLabelJobFactory(BaseJob, JobStates) {

  /**
   * @class QueryLabelJob
   * @constructor
   * @param {string} commandId
   * @param {number} eventCount
   * @param {string} label
   */
  var QueryLabelJob = function (commandId, eventCount, label) {
    BaseJob.call(this, commandId);
    this.type = 'label_query';
    this.eventCount = eventCount;
    this.label = label;

    this.messages = {};
    this.messages[JobStates.CREATED] = getQueryLabelJobDescription(this);
    this.messages[JobStates.STARTED] = getQueryLabelJobDescription(this);
    this.messages[JobStates.FINISHED] = getQueryLabelJobDescription(this);
    this.messages[JobStates.FAILED] = getQueryLabelJobDescription(this);
  };

  QueryLabelJob.prototype = Object.create(BaseJob.prototype);
  QueryLabelJob.prototype.constructor = QueryLabelJob;

  QueryLabelJob.prototype.getTaskCount = function () {
    return this.eventCount;
  };

  QueryLabelJob.prototype.getDescription = function() {
    return getQueryLabelJobDescription(this);
  };

  return (QueryLabelJob);
}

function getQueryLabelJobDescription (job) {
  return 'Label ' + job.eventCount + ' items met label "' + job.label + '".';
}
