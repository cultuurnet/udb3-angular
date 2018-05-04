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
function EventDuplicatorService(udbApi, offerLocator, $rootScope) {
  var calendarDataProperties = [
    'calendarType',
    'openingHours',
    'timestamps',
    'startDate',
    'endDate'
  ];

  /**
   * @param {object} duplicateInfo
   * @return {string}
   */
  function rememberDuplicateLocationAndReturnId(duplicateInfo) {
    offerLocator.add(duplicateInfo.eventId, duplicateInfo.url);
    $rootScope.$emit('offerDuplicated', duplicateInfo);

    return duplicateInfo.eventId;
  }

  /**
   * Duplicate an event using form date with the new timing info
   * @param {EventFormData} formData
   * @return {Promise.<string>}
   *  promises the duplicate id
   */
  this.duplicate = function(formData) {
    var calendarData = _.pick(formData, calendarDataProperties);

    return udbApi
      .duplicateEvent(formData.apiUrl, calendarData)
      .then(rememberDuplicateLocationAndReturnId);
  };
}
