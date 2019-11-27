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
function EventDuplicatorService(udbApi, offerLocator) {
  var calendarDataProperties = [
    'calendar'
  ];

  /**
   * @param {object} duplicateInfo
   * @return {string}
   */
  function rememberDuplicateLocationAndReturnId(duplicateInfo) {
    offerLocator.add(duplicateInfo.eventId, duplicateInfo.url);

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

    if (formData.openingHours) {
      calendarData.calendar.openingHours = formData.openingHours;
    }

    return udbApi
      .duplicateEvent(formData.apiUrl, calendarData.calendar)
      .then(rememberDuplicateLocationAndReturnId);
  };
}
