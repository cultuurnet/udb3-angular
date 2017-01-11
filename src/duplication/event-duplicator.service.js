'use strict';

/**
 * @ngdoc service
 * @name udb.duplication.eventDuplicator
 * @description
 * Event Duplicator Service
 */
angular
  .module('udb.duplication')
  .service('eventDuplicator', EventDuplicatorService);

/* @ngInject */
function EventDuplicatorService($q) {
  /**
   * Duplicate an event using form date with the new timing info
   * @param {EventFormData} formData
   * @return {Promise.<string>} id
   *  promise the id of the duplicates
   */
  this.duplicate = function(formData) {
    return $q.resolve(formData.id);
  };
}
