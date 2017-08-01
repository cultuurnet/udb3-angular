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
   * @param   {Object}    gaObject
   */
  var EventExportJob = function (commandId, eventCount, format, gaObject) {
    BaseJob.call(this, commandId);
    this.exportUrl = '';
    this.eventCount = eventCount;
    this.format = format;
    this.extension = _.find(ExportFormats, {type: format}).extension;
    this.gaObject = gaObject;
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
    var description = '';

    if (this.state === JobStates.FAILED) {
      description = 'Exporteren van evenementen mislukt';
    } else {
      description = 'Document .' + this.extension + ' met ' + this.eventCount + ' evenementen';
    }

    return description;
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
