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
 * @property {Object} urlLabel
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
 * @name udb.core.EventFormData
 * @description
 * Contains data needed for the steps in the event form.
 */
angular
  .module('udb.event-form')
  .factory('EventFormData', EventFormDataFactory);

/* @ngInject */
function EventFormDataFactory(rx, calendarLabels, moment, OpeningHoursCollection, appConfig, $translate) {

  /**
   * @class EventFormData
   */
  var eventFormData = {
    /**
     * Initialize the properties with default data
     */
    init: function() {
      this.apiUrl = '';
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
      this.mainLanguage = $translate.use() || 'nl';
      this.name = '';
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
      //
      this.calendar = {};
      this.calendar.calendarType = '';
      this.calendar.timeSpans = [];
      this.calendar.openingHours = [];
      //
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
      this.availableFrom = '';
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
     * Gets the mainLanguage for a offer.
     */
    getMainLanguage: function() {
      return this.mainLanguage;
    },

    /**
     * Sets the mainLanguage for a offer.
     */
    setMainLanguage: function(langcode) {
      this.mainLanguage = langcode;
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

    getPeriodicStartDate : function() {
      return this.calendar.startDate;
    },

    setPeriodicStartDate: function(startDate) {
      this.calendar.startDate = startDate;
    },

    getPeriodicEndDate : function() {
      return this.calendar.endDate;
    },

    setPeriodicEndDate: function(endDate) {
      this.calendar.endDate = endDate;
    },

    /**
     * Reset the location.
     */
    resetLocation: function() {
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
     * Get the location.
     */
    getLocation: function() {
      return this.location;
    },

    /**
     * @param {Date|string} start
     * @param {Date|string} end
     * @param {Object} status
     * @param {Object} bookingAvailability
     */
    addTimeSpan: function(start, end, status, bookingAvailability) {
      var allDay = moment(start).format('HH:mm') === '00:00' && moment(end).format('HH:mm') === '23:59';
      this.calendar.timeSpans.push({
        'start': moment(start).toISOString(),
        'end': moment(end).toISOString(),
        'allDay': allDay,
        'status': status ? status : {type: 'Available'},
        'bookingAvailability': bookingAvailability ? bookingAvailability : {type: 'Available'}
      });
    },

    /**
     * Reset the calendar.
     */
    resetCalendar: function() {
      this.calendar.timeSpans = [];
      this.calendar.calendarType = '';
      this.calendar.activeCalendarLabel = '';
      this.calendar.activeCalendarType = '';
    },

    /**
     * Get the earliest date of an offer, or null for permanent events
     */
    getFirstStartDate: function() {
      var firstStartDate = null;
      if (this.calendar.calendarType === 'single' || this.calendar.calendarType === 'multiple') {
        firstStartDate = _.first(this.calendar.timeSpans).start;
      }

      if (eventFormData.calendar.calendarType === 'periodic') {
        firstStartDate = this.calendar.startDate;
      }
      return firstStartDate;
    },

    /**
     * Get the earliest date of an offer, or null for permanent events
     */
    getLastEndDate: function() {
      var lastEndDate = null;
      if (this.calendar.calendarType === 'single' || this.calendar.calendarType === 'multiple') {
        lastEndDate = _.last(this.calendar.timeSpans).end;
      }

      if (eventFormData.calendar.calendarType === 'periodic') {
        lastEndDate = this.calendar.endDate;
      }
      return lastEndDate;
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
     * @param {number|undefined} min
     * @param {number|undefined} max
     */
    setTypicalAgeRange: function(min, max) {
      this.typicalAgeRange = (isNaN(min) ? '' : min) + '-' + (isNaN(max) ? '' : max);
    },

    /**
     * Get the typical age range as an object or undefined when no range is set.
     * When the offer is intended for all ages, you do get a range but both min and max will be undefined.
     *
     * @return {{min: number|undefined, max: number|undefined}|undefined}
     */
    getTypicalAgeRange: function () {
      if (_.isEmpty(this.typicalAgeRange)) {
        return;
      }

      var ageRange = {min: undefined, max: undefined};
      var rangeArray = this.typicalAgeRange.split('-');

      if (rangeArray[0]) {ageRange.min =  parseInt(rangeArray[0]);}
      if (rangeArray[1]) {ageRange.max =  parseInt(rangeArray[1]);}

      return ageRange;
    },

    /**
     * Check if the timing of the event is periodic and has a valid range.
     * @return {boolean}
     */
    hasValidPeriodicRange: function () {
      var startDate = this.getPeriodicStartDate();
      var endDate = this.getPeriodicEndDate();

      return this.calendar.calendarType === 'periodic' && !!startDate && !!endDate && startDate < endDate;
    },

    /**
     * Init the calendar for the current selected calendar type.
     */
    initCalendar: function () {
      var formData = this;
      var calendarType = _.findWhere(calendarLabels, {id: formData.calendar.calendarType});
      if (calendarType) {
        this.calendar.activeCalendarLabel = calendarType.label;
        this.calendar.activeCalendarType = formData.calendar.calendarType;
      }
    },

    timingChanged: function () {
      if (this.showStep2) {
        this.showStep(3);
      }
      this.timingChangedCallback(this);
    },

    timingChangedCallback: function () {
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

      // Set start & endDate to undefined if calendarType is permanent
      if (type === 'permanent') {
        formData.calendar.startDate = undefined;
        formData.calendar.endDate = undefined;
        formData.timingChanged();
      }

      // Check if previous calendar type was the same.
      // If so, we don't need to create new opening hours. Just show the previous entered data.
      if (formData.calendar.calendarType === type) {
        return;
      }

      // A type is chosen, start a complete new calendar, removing old data
      formData.resetCalendar();
      formData.calendar.calendarType = type;

      if (formData.calendar.calendarType === 'single') {
        formData.openingHours = []; // Major info is created from this property and not the one in calendar
        if (appConfig.calendarHighlight.date) {
          var startTime = appConfig.calendarHighlight.startTime ?
          moment(appConfig.calendarHighlight.date + ' ' + appConfig.calendarHighlight.startTime, 'YYYY-MM-DD HH:mm')
          .toDate() : '';

          var endTime = appConfig.calendarHighlight.endTime ?
          moment(appConfig.calendarHighlight.date + ' ' + appConfig.calendarHighlight.endTime, 'YYYY-MM-DD HH:mm')
          .toDate() : '';

          formData.addTimeSpan(startTime, endTime);
        } else {
          formData.addTimeSpan(moment().startOf('day'), moment().endOf('day'));
        }
        formData.saveTimeSpans(formData.calendar.timeSpans);
      }

      if (formData.calendar.calendarType === 'periodic') {
        formData.calendar.startDate = moment().startOf('day').toDate();
        if (appConfig.addOffer && appConfig.addOffer.defaultEndPeriod) {
          var defaultEndPeriod = appConfig.addOffer.defaultEndPeriod;
          formData.calendar.endDate =
              moment(formData.calendar.startDate).add(defaultEndPeriod, 'd').startOf('day').toDate();
        } else {
          formData.calendar.endDate = moment().add(1, 'y').startOf('day').toDate();
        }
        formData.timingChanged();
      }

      formData.initCalendar();

      if (formData.id) {
        formData.majorInfoChanged = true;
      }

    },

    /**
     * Check if the given timeSpan is a valid date object.
     * @param {Object} timeSpan
     * @returns {boolean}
     */
    isValidDate: function(timeSpan) {
      return timeSpan instanceof Date;
    },

    /**
     * Toggle the starthour field for given timeSpan.
     * @param {Object} timeSpan
     *   Timespan to change
     */
    toggleStartHour: function(timeSpan) {
      // If we hide the textfield, empty all other time fields.
      if (!timeSpan.showStartHour) {
        timeSpan.start.setHours(0);
        timeSpan.start.setMinutes(0);
        timeSpan.end.setHours(0);
        timeSpan.end.setMinutes(0);
        this.timingChanged();
      }
      else {
        var startHour = moment(timeSpan.date);
        var endHour = moment(timeSpan.date).endOf('day');

        timeSpan.startHour = startHour.format('HH:mm');
        timeSpan.startHourAsDate = startHour.toDate();
        timeSpan.endHour = endHour.format('HH:mm');
        timeSpan.endHourAsDate = endHour.toDate();
        timeSpan.showEndHour = false;
      }
    },

    /**
     * Toggle the endhour field for given timeSpan
     * @param {Object} timeSpan
     *   Timestamp to change
     */
    toggleEndHour: function(timeSpan) {
      var endHourAsDate = timeSpan.date;
      // If we hide the textfield, empty also the input.
      if (!timeSpan.showEndHour) {
        endHourAsDate.setHours(23);
        endHourAsDate.setMinutes(59);

        timeSpan.endHour = '23:59';
        timeSpan.endHourAsDate = endHourAsDate;
        this.timingChanged();
      }
      else {
        var nextThreeHours = moment(timeSpan.startHourAsDate).add(3, 'hours').minutes(0);
        endHourAsDate.setHours(nextThreeHours.hours());
        endHourAsDate.setMinutes(nextThreeHours.minutes());

        timeSpan.endHour = moment(endHourAsDate).format('HH:mm');
        timeSpan.endHourAsDate = endHourAsDate;
      }
    },

    hoursChanged: function (timeSpan) {
      var startHourAsDate;
      var endHourAsDate;
      if (timeSpan.showStartHour || timeSpan.showEndHour) {
        if (timeSpan.showStartHour) {
          if (timeSpan.startHourAsDate !== undefined) {
            startHourAsDate = moment(timeSpan.startHourAsDate);
          }
          else {
            startHourAsDate = moment(timeSpan.startHourAsDate);
            startHourAsDate.hours(0);
            startHourAsDate.minutes(0);
          }
          timeSpan.startHour = startHourAsDate.format('HH:mm');
        }

        if (timeSpan.showEndHour) {
          // if the endhour is invalid, send starthour to backend.
          if (timeSpan.endHourAsDate !== undefined) {
            endHourAsDate = moment(timeSpan.endHourAsDate);
          }
          else {
            endHourAsDate = startHourAsDate;
          }
          timeSpan.endHour = endHourAsDate.format('HH:mm');
        }
        this.timingChanged();
      }
    },

    saveOpeningHours: function (openingHours) {
      this.calendar.openingHours = openingHours;
      this.timingChanged();
    },

    saveTimeSpans: function (timeSpans) {
      this.calendar.timeSpans = timeSpans;
      this.calendar.startDate = this.getFirstStartDate();
      this.calendar.endDate = this.getLastEndDate();
      this.timingChanged();
    },

    periodicTimingChanged: function () {
      var formData = this;

      if (formData.id) {
        //TODO: this was wrapping the code below, not sure why...
      }

      if (formData.hasValidPeriodicRange()) {
        formData.periodicRangeError = false;
        formData.timingChanged();
      } else {
        formData.periodicRangeError = true;
      }
    }
  };

  // initialize the data
  eventFormData.init();

  return eventFormData;
}
