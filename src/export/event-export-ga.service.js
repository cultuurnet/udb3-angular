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
  .factory('eventExportGALogger', eventExportGALogger);

/* @ngInject */
function eventExportGALogger() {

  var ega = this; // jshint ignore:line

  ega.gaInfo = {};

  ega.setGAInfo = function(info) {
    ega.gaInfo = info;
  }

  ega.getGAInfo = function(){
      return JSON.stringify(ega.gaInfo);
  }

  return {
      getGAInfo : ega.getGAInfo,
      setGAInfo : ega.setGAInfo
  }

}
