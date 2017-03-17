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
function EventFormDataFactory(rx, calendarLabels, moment, OpeningHoursCollection, $rootScope) {

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
      // Events have a location
      this.location = {
        'id' : null,
        'name': '',
        'address': {
          'addressCountry': 'BE',
          'addressLocality': '',
          'postalCode': '',
          'streetAddress': ''
        }
      };
      // Places only have an address
      this.address = {
        'addressCountry': 'BE',
        'addressLocality': '',
        'postalCode': '',
        'streetAddress': ''
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
      this.priceInfo = [];
      this.workflowStatus = 'DRAFT';

      /**
       * @type {string[]}
       */
      this.labels = [];

      this.audienceType = 'everyone';

      this.timingChanged$ = rx.createObservableFunction(this, 'timingChangedCallback');
    },

    clone: function () {
      var clone = _.cloneDeep(this);
      clone.timingChanged$ = rx.createObservableFunction(clone, 'timingChangedCallback');

      return clone;
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
     * Reset the location.
     */
    resetLocation: function(location) {
      this.location = {
        'id' : null,
        'name': '',
        'address': {
          'addressCountry': 'BE',
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
     * @param {Date} date
     * @param {string} startHour HH:MM
     * @param {Date} startHourAsDate
     * @param {string} endHour HH:MM
     * @param {Date} endHourAsDate
     */
    addTimestamp: function(date, startHour, startHourAsDate, endHour, endHourAsDate) {
      this.timestamps.push({
        'date' : date,
        'startHour' : startHour,
        'startHourAsDate' : startHourAsDate,
        'endHourAsDate' : endHourAsDate,
        'endHour' : endHour,
        'showStartHour' : !!startHour,
        'showEndHour' : (endHour && endHour !== startHour)
      });
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
    },

    /**
     * Init the calendar for the current selected calendar type.
     */
    initCalendar: function () {
      var formData = this;
      var calendarType = _.findWhere(calendarLabels, {id: formData.calendarType});

      if (calendarType) {
        this.activeCalendarLabel = calendarType.label;
        this.activeCalendarType = formData.calendarType;
      }
    },

    timingChanged: function () {
      this.timingChangedCallback(this);
    },

    resetCalender: function () {
      this.activeCalendarType = '';
      this.calendarType = '';
    },

    initOpeningHours: function(openingHours) {
      OpeningHoursCollection.deserialize(openingHours);
    },

    /**
     * Click listener on the calendar type buttons.
     * Activate the selected calendar type.
     */
    setCalendarType: function (type) {
      var formData = this;

      formData.showStep(3);

      // Check if previous calendar type was the same.
      // If so, we don't need to create new opening hours. Just show the previous entered data.
      if (formData.calendarType === type) {
        return;
      }

      // A type is chosen, start a complete new calendar, removing old data
      formData.resetCalendar();
      formData.calendarType = type;

      if (formData.calendarType === 'single') {
        formData.addTimestamp('', '', '', '', '');
      }

      if (formData.calendarType === 'permanent') {
        formData.timingChanged();
      }

      formData.initCalendar();

      if (formData.id) {
        formData.majorInfoChanged = true;
      }

    },

    /**
     * Check if the given timestamp is a valid date object.
     * @param {Object} timestamp
     * @returns {boolean}
     */
    isValidDate: function(timestamp) {
      return timestamp instanceof Date;
    },

    /**
     * Toggle the starthour field for given timestamp.
     * @param {Object} timestamp
     *   Timestamp to change
     */
    toggleStartHour: function(timestamp) {
      // If we hide the textfield, empty all other time fields.
      if (!timestamp.showStartHour) {
        timestamp.startHour = '';
        timestamp.startHourAsDate = '';
        timestamp.endHour = '';
        timestamp.endHourAsDate = '';
        timestamp.showEndHour = false;
        timestamp.date.setHours(0);
        timestamp.date.setMinutes(0);
        this.timingChanged();
      }
      else {
        var nextHour = moment().add(1, 'hours').minutes(0);
        var startHourAsDate = angular.copy(timestamp.date);
        var endHourAsDate = angular.copy(timestamp.date);
        startHourAsDate.setHours(nextHour.hours());
        startHourAsDate.setMinutes(nextHour.minutes());
        endHourAsDate.setHours(23);
        endHourAsDate.setMinutes(59);

        timestamp.startHour = moment(startHourAsDate).format('HH:mm');
        timestamp.startHourAsDate = startHourAsDate;
        timestamp.endHour = moment(endHourAsDate).format('HH:mm');
        timestamp.endHourAsDate = endHourAsDate;
        timestamp.showEndHour = false;
      }
    },

    /**
     * Toggle the endhour field for given timestamp
     * @param {Object} timestamp
     *   Timestamp to change
     */
    toggleEndHour: function(timestamp) {
      var endHourAsDate = timestamp.date;
      // If we hide the textfield, empty also the input.
      if (!timestamp.showEndHour) {
        endHourAsDate.setHours(23);
        endHourAsDate.setMinutes(59);

        timestamp.endHour = '23:59';
        timestamp.endHourAsDate = endHourAsDate;
        this.timingChanged();
      }
      else {
        var nextThreeHours = moment(timestamp.startHourAsDate).add(3, 'hours').minutes(0);
        endHourAsDate.setHours(nextThreeHours.hours());
        endHourAsDate.setMinutes(nextThreeHours.minutes());

        timestamp.endHour = moment(endHourAsDate).format('HH:mm');
        timestamp.endHourAsDate = endHourAsDate;
      }
    },

    hoursChanged: function (timestamp) {
      var startHourAsDate;
      var endHourAsDate;
      if (timestamp.showStartHour || timestamp.showEndHour) {
        if (timestamp.showStartHour) {
          if (timestamp.startHourAsDate !== undefined) {
            startHourAsDate = moment(timestamp.startHourAsDate);
          }
          else {
            startHourAsDate = moment(timestamp.startHourAsDate);
            startHourAsDate.hours(0);
            startHourAsDate.minutes(0);
          }
          timestamp.startHour = startHourAsDate.format('HH:mm');
        }

        if (timestamp.showEndHour) {
          // if the endhour is invalid, send starthour to backend.
          if (timestamp.endHourAsDate !== undefined) {
            endHourAsDate = moment(timestamp.endHourAsDate);
          }
          else {
            endHourAsDate = startHourAsDate;
          }
          timestamp.endHour = endHourAsDate.format('HH:mm');
        }
        this.timingChanged();
      }
    },

    saveOpeningHours: function (openingHours) {
      this.openingHours = openingHours;
      this.timingChanged();
    },

    periodicTimingChanged: function () {
      var formData = this;

      if (formData.id) {
        if (formData.hasValidPeriodicRange()) {
          formData.periodicRangeError = false;
          formData.timingChanged();
        } else {
          formData.periodicRangeError = true;
        }
      }
    }

  };

  // initialize the data
  eventFormData.init();

  return eventFormData;
}
