'use strict';

/**
 * @typedef {Object} EventType
 * @property {string} id
 * @property {string} label
 */

/**
 * @typedef {Object} EventTheme
 * @property {string} id
 * @property {string} label
 */

/**
 * @typedef {Object} MediaObject
 * @property {string} @id
 * @property {string} @type
 * @property {string} id
 * @property {string} url
 * @property {string} thumbnailUrl
 * @property {string} description
 * @property {string} copyrightHolder
 */

/**
 * @typedef {Object} BookingInfo
 * @property {string} url
 * @property {string} urlLabel
 * @property {string} email
 * @property {string} phone
 */

/**
 * @typedef {Object} OpeningHoursData
 * @property {string} opens
 * @property {string} closes
 * @property {string[]} dayOfWeek
 */

/**
 * @ngdoc service
 * @name udb.core.EventTranslateData
 * @description
 * Contains data needed for the translation of an offer
 */
angular
  .module('udb.event-translate')
  .factory('EventTranslateData', EventTranslateDataFactory);

/* @ngInject */
function EventTranslateDataFactory(rx, calendarLabels, moment, OpeningHoursCollection, appConfig, $translate) {

  /**
   * @class EventFormData
   */
  var eventTranslateData = {
    /**
     * Initialize the properties with default data
     */
    init: function() {

    },

    clone: function () {
      var clone = _.cloneDeep(this);
      clone.timingChanged$ = rx.createObservableFunction(clone, 'timingChangedCallback');

      return clone;
    }
  }

  // initialize the data
  eventTranslateData.init();

  return eventTranslateData;
}
