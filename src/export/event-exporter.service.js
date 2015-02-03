'use strict';

/**
 * @ngdoc service
 * @name udb.entry.eventExporter
 * @description
 * # eventExporter
 * Service in the udb.export.
 */
angular
  .module('udb.export')
  .service('eventExporter', eventExporter);

/* @ngInject */
function eventExporter(jobLogger, udbApi, EventExportJob) {

  var eventExporter = this;

  eventExporter.activeExport = {
    query: {},
    eventCount: 0
  };

  eventExporter.export = function (format, email) {
    var queryString = eventExporter.activeExport.query.queryString;

    var jobPromise = udbApi.exportQuery(queryString, email, format);

    jobPromise.success(function (jobData) {
      var job = new EventExportJob(jobData.commandId);
      jobLogger.addJob(job);
      job.start();
      console.log([job, job.getDescription()]);
    });

    return jobPromise;
  }
}
