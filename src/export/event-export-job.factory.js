'use strict';

/**
 * @ngdoc service
 * @name udb.entry.EventExportJob
 * @description
 * # BaseJob
 * This Is the factory that creates an event export job
 */
angular
  .module('udb.entry')
  .factory('EventExportJob', EventExportJobFactory);

/* @ngInject */
function EventExportJobFactory(BaseJob, JobStates, ExportFormats) {

  /**
   * @class EventExportJob
   * @constructor
   * @param   {string}    commandId
   * @param   {number}    eventCount
   * @param   {string}    format
   * @param   {Object}    details
   */
  var EventExportJob = function (commandId, eventCount, format, details) {
    BaseJob.call(this, commandId);
    this.type = 'export';
    this.exportUrl = '';
    this.eventCount = eventCount;
    this.format = format;
    this.extension = _.find(ExportFormats, {type: format}).extension;
    this.details = details;

    this.messages = {};
    this.messages[JobStates.CREATED] = getEventExportDescription(this, JobStates.CREATED, JobStates);
    this.messages[JobStates.STARTED] = getEventExportDescription(this, JobStates.STARTED, JobStates);
    this.messages[JobStates.FINISHED] = getEventExportDescription(this, JobStates.FINISHED, JobStates);
    this.messages[JobStates.FAILED] = getEventExportDescription(this, JobStates.FAILED, JobStates);
  };

  EventExportJob.prototype = Object.create(BaseJob.prototype);
  EventExportJob.prototype.constructor = EventExportJob;

  EventExportJob.prototype.getTemplateName = function () {
    var templateName;

    switch (this.state) {
      case JobStates.FINISHED:
        templateName = 'export-job';
        break;
      case JobStates.FAILED:
        templateName = 'failed-job';
        break;
      default:
        templateName = 'base-job';
    }

    return templateName;
  };

  EventExportJob.prototype.getDescription = function () {
    return getEventExportDescription(this, this.state, JobStates);
  };

  EventExportJob.prototype.info = function (jobData) {
    if (jobData.location) {
      this.exportUrl = jobData.location;
    }
  };

  EventExportJob.prototype.getTaskCount = function () {
    return this.eventCount;
  };

  return (EventExportJob);
}

function getEventExportDescription (job, state, JobStates) {
  var description = '';

  if (state === JobStates.FAILED) {
    description = 'Exporteren van items mislukt';
  } else {
    description = 'Document .' + job.extension + ' met ' + job.eventCount + ' items';
  }

  return description;
}
