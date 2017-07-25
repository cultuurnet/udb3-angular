'use strict';

/**
 * @ngdoc service
 * @name udb.entry.eventExportGALogger
 * @description
 * # eventExportGALogger
 * eventExportGALogger
 */
angular
  .module('udb.export')
  .service('eventExportGALogger', eventExportGALogger);

/* @ngInject */
function eventExportGALogger() {

  var ega = this; // jshint ignore:line

  ega.gaInfo = {};

  ega.setGAInfo = function(info) {
    ega.gaInfo = info;
  }

}
