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
 * @ngdoc service
 * @name udb.core.EventFormData
 * @description
 * Contains data needed for the steps in the event form.
 */
angular
  .module('udb.event-form')
  .factory('EventFormData', EventFormDataFactory);

/* @ngInject */
function EventFormDataFactory() {

  /**
   * @class EventFormData
   */
  var eventFormData = {
    /**
     * Initialize the properties with default data
     */
    init: function() {
      this.isEvent = true; // Is current item an event.
      this.isPlace = false; // Is current item a place.
      this.showStep1 = true;
      this.showStep2 = false;
      this.showStep3 = false;
      this.showStep4 = false;
      this.showStep5 = false;
      this.majorInfoChanged = false;
      // Properties that will be copied to UdbEvent / UdbPlace.
      this.id = '';
      this.name = {
        nl : ''
      };
      this.description = {};
      this.location = {
        'id' : null,
        'name': '',
        'address': {
          'addressCountry': '',
          'addressLocality': '',
          'postalCode': '',
          'streetAddress': ''
        }
      };
      this.place = {};
      /** @type {EventType} */
      this.type = {};
      /** @type {EventTheme} */
      this.theme = {};
      this.activeCalendarType = ''; // only needed for the angular.
      this.activeCalendarLabel = ''; // only needed for the angular.
      this.calendarType = '';
      this.startDate = '';
      this.endDate = '';
      this.timestamps = [];
      this.openingHours = [];
      this.typicalAgeRange = '';
      this.organizer = {};
      this.contactPoint = {
        url : [],
        phone : [],
        email : []
      };
      this.facilities = [];
      /** @type {BookingInfo} **/
      this.bookingInfo = {};
      /** @type {MediaObject[]} **/
      this.mediaObjects = [];
      this.image = [];
      this.additionalData = {};
    },

    /**
     * Show the given step.
     * @param {number} stepNumber
     */
    showStep: function(stepNumber) {
      this['showStep' + stepNumber] = true;
    },

    /**
     * Hide the given step.
     * @param {number} stepNumber
     */
    hideStep: function (stepNumber) {
      this['showStep' + stepNumber] = false;
    },

    /**
     * Set the name of the offer for a given langcode.
     */
    setName: function(name, langcode) {
      this.name[langcode] = name;
    },

    /**
     * Get the name of the offer for a given langcode.
     */
    getName: function(langcode) {
      return this.name[langcode];
    },

    /**
     * Set the description for a given langcode.
     */
    setDescription: function(description, langcode) {
      this.description[langcode] = description;
    },

    /**
     * Get the description for a given langcode.
     */
    getDescription: function(langcode) {
      return this.description[langcode];
    },

    /**
     * Set the event type and clear the selected theme.
     * @param {EventType} eventType
     */
    setEventType: function(eventType) {
      this.type = eventType;
      this.removeTheme();
    },

    removeType: function () {
      this.type = {};
    },

    /**
     * Get the event type.
     * @return {EventType}
     */
    getEventType: function() {
      return this.type;
    },

    /**
     * Get the label for the event type.
     */
    getEventTypeLabel: function() {
      return this.type.label ? this.type.label : '';
    },

    /**
     * Set the theme.
     * @param {EventTheme} theme
     */
    setTheme: function(theme) {
      this.theme = theme;
    },

    removeTheme: function () {
      this.theme = {};
    },

    /**
     * Get the theme.
     * @return {EventTheme}
     */
    getTheme: function() {
      return this.theme;
    },

    /**
     * Get the label for the theme.
     */
    getThemeLabel: function() {
      return this.theme.label ? this.theme.label : '';
    },

    getStartDate : function() {
      return this.startDate;
    },

    setStartDate: function(startDate) {
      this.startDate = startDate;
    },

    getEndDate : function() {
      return this.endDate;
    },

    setEndDate: function(endDate) {
      this.endDate = endDate;
    },

    /**
     * Get the opening hours.
     */
    getOpeningHours: function() {
      return this.openingHours;
    },

    /**
     * Reset the location.
     */
    resetLocation: function(location) {
      this.location = {
        'id' : null,
        'name': '',
        'address': {
          'addressCountry': '',
          'addressLocality': '',
          'postalCode': '',
          'streetAddress': ''
        }
      };
    },

    /**
     * Set the location.
     */
    setLocation: function(location) {
      this.location = location;
    },

    /**
     * Get the calendar.
     */
    getLocation: function() {
      return this.location;
    },

    /**
     * Add a timestamp to the timestamps array.
     */
    addTimestamp: function(date, startHour, endHour) {

      this.timestamps.push({
        'date' : date,
        'startHour' : startHour,
        'endHour' : endHour,
        'showStartHour' : startHour !== '',
        'showEndHour' : endHour !== '',
      });

    },

    /**
     * Add a timestamp to the timestamps array.
     */
    addOpeningHour: function(dayOfWeek, opens, closes) {

      this.openingHours.push({
        'dayOfWeek' : dayOfWeek,
        'opens' : opens,
        'closes' : closes,
        'label' : ''
      });

    },

    /**
     * Remove the openinghour with the given index.
     */
    removeOpeningHour: function(index) {
      this.openingHours.splice(index, 1);
    },

    /**
     * Reset the calendar.
     */
    resetCalendar: function() {
      this.openingHours = [];
      this.timestamps = [];
      this.startDate = '';
      this.endDate = '';
      this.calendarType = '';
      this.activeCalendarType = '';
    },

    /**
     * Get the type that will be saved.
     */
    getType: function() {
      return this.isEvent ? 'event' : 'place';
    },

    /**
     * Reset the selected organizers.
     */
    resetOrganizer: function() {
      this.organizer = {};
    },

    /**
     * Reset the contact point.
     */
    resetContactPoint: function() {
      this.contactPoint = {
        url : [],
        phone : [],
        email : []
      };
    },

    /**
     * Sets the booking info array.
     *
     * @param {BookingInfo} bookingInfo
     */
    setBookingInfo : function(bookingInfo) {
      this.bookingInfo = bookingInfo;
    },

    /**
     * Add a new image.
     *
     * @param {MediaObject} mediaObject
     */
    addImage : function(mediaObject) {
      this.mediaObjects = _.union(this.mediaObjects, [mediaObject]);
    },

    /**
     * Edit a media object.
     */
    editMediaObject : function(indexToEdit, url, thumbnailUrl, description, copyrightHolder) {
      this.image[indexToEdit] = {
        url : url,
        thumbnailUrl : thumbnailUrl,
        description : description,
        copyrightHolder : copyrightHolder
      };
      this.image[indexToEdit]['@type'] = 'ImageObject';
    },

    /**
     * Update the info of the given media object.
     * @param {MediaObject} updatedMediaObject
     */
    updateMediaObject: function (updatedMediaObject)  {
      this.mediaObjects = _.map(this.mediaObjects, function (existingMediaObject) {
        var mediaObject;

        if (existingMediaObject['@id'] === updatedMediaObject['@id']) {
          mediaObject = updatedMediaObject;
        } else {
          mediaObject = existingMediaObject;
        }

        return mediaObject;
      });
    },

    /**
     * Remove a media object from this item.
     *
     *@param {MediaObject} mediaObject
     */
    removeMediaObject: function(mediaObject) {
      this.mediaObjects = _.reject(this.mediaObjects, {'@id': mediaObject['@id']});
    },

    /**
     * Select the main image for this item.
     *
     * @param {mediaObject} image
     */
    selectMainImage: function (image) {
      var reindexedMedia = _.without(this.mediaObjects, image);
      reindexedMedia.unshift(image);

      this.mediaObjects = reindexedMedia;
    },

    /**
     * Check if the timing of the event is periodic and has a valid range.
     * @return {boolean}
     */
    hasValidPeriodicRange: function () {
      var startDate = this.getStartDate();
      var endDate = this.getEndDate();

      return this.calendarType === 'periodic' && !!startDate && !!endDate && startDate < endDate;
    }

  };

  // initialize the data
  eventFormData.init();

  return eventFormData;
}
