'use strict';

/**
 * @ngdoc service
 * @name udb.entry.eventExporter
 * @description
 * # eventExporter
 * Event Exporter Service
 */
angular
  .module('udb.export')
  .service('eventExporter', eventExporter);

/* @ngInject */
function eventExporter(jobLogger, udbApi, EventExportJob) {

  var ex = this; // jshint ignore:line

  ex.activeExport = {
    query: {},
    eventCount: 0,
    selection: []
  };

  /**
   * Send the active export job to the server
   *
   * @param {'json'|'csv'}  format
   * @param {string}        email
   * @param {string[]}      properties
   * @param {boolean}       perDay
   * @param {Object}        customizations
   *
   * @return {object}
   */
  ex.export = function (format, email, properties, perDay, customizations) {
    var queryString = ex.activeExport.query.queryString,
        selection = ex.activeExport.selection || [],
        eventCount = ex.activeExport.eventCount;

    var jobPromise = udbApi.exportEvents(queryString, email, format, properties, perDay, selection, customizations);

    jobPromise.success(function (jobData) {
      var job = new EventExportJob(jobData.commandId, eventCount, format);
      jobLogger.addJob(job);
      job.start();
    });

    return jobPromise;
  };
}
