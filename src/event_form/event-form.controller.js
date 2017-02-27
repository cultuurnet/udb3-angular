'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormController
 * @description
 * # EventFormController
 * Init the event form
 */
angular
  .module('udb.event-form')
  .controller('EventFormController', EventFormController);

/* @ngInject */
function EventFormController($scope, offerId, EventFormData, udbApi, moment, jsonLDLangFilter, $q) {

  // Other controllers won't load until this boolean is set to true.
  $scope.loaded = false;

  // Make sure we start off with clean data every time this controller gets called
  EventFormData.init();

  $q.when(offerId)
    .then(fetchOffer, startCreating);

  function startCreating() {
    $scope.loaded = true;
  }

  /**
   * @param {string} offerId
   */
  function fetchOffer(offerId) {
    udbApi
      .getOffer(offerId)
      .then(startEditing);
  }

  /**
   *
   * @param {UdbPlace|UdbEvent} offer
   */
  function startEditing(offer) {
    var offerType = offer.url.split('/').shift();

    if (offerType === 'event') {
      EventFormData.isEvent = true;
      EventFormData.isPlace = false;
      copyItemDataToFormData(offer);

      // Copy location.
      if (offer.location && offer.location.id) {
        var location = jsonLDLangFilter(offer.location, 'nl');
        EventFormData.location = {
          id : location.id.split('/').pop(),
          name : location.name,
          address : location.address
        };
      }

      EventFormData.audienceType = offer.audience.audienceType;
    }

    if (offerType === 'place') {
      EventFormData.isEvent = false;
      EventFormData.isPlace = true;
      copyItemDataToFormData(offer);

      // Places only have an address
      if (offer.address) {
        EventFormData.address = offer.address;
      }
    }
  }

  /**
   * Copy all item data to form data so it can be used for edting.
   * var {UdbEvent|UdbPlace} item
   */
  function copyItemDataToFormData(item) {

    // Properties that exactly match.
    var sameProperties = [
      'id',
      'type',
      'theme',
      'openingHours',
      'description',
      'typicalAgeRange',
      'organizer',
      'bookingInfo',
      'contactPoint',
      'priceInfo',
      'facilities',
      'image',
      'additionalData',
      'apiUrl',
      'workflowStatus',
      'labels'
    ];
    for (var i = 0; i < sameProperties.length; i++) {
      if (item[sameProperties[i]]) {
        EventFormData[sameProperties[i]] = item[sameProperties[i]];
      }
    }

    if (item.mediaObject) {
      EventFormData.mediaObjects = item.mediaObject || [];

      if (item.image) {
        var mainImage = _.find(EventFormData.mediaObjects, {'contentUrl': item.image});
        EventFormData.selectMainImage(mainImage);
      }
    }

    EventFormData.name = item.name;

    EventFormData.calendarType = item.calendarType === 'multiple' ? 'single' : item.calendarType;

    // Set correct date object for start and end.
    if (item.startDate) {
      EventFormData.startDate = moment(item.startDate).toDate();
    }

    if (item.endDate) {
      EventFormData.endDate = moment(item.endDate).toDate();
    }

    // SubEvents are timestamps.
    if (item.calendarType === 'multiple' && item.subEvent) {
      for (var j = 0; j < item.subEvent.length; j++) {
        var subEvent = item.subEvent[j];
        addTimestamp(subEvent.startDate, subEvent.endDate);
      }
    }
    else if (item.calendarType === 'single') {
      addTimestamp(item.startDate, item.endDate);
    }

    if (EventFormData.calendarType) {
      EventFormData.initCalendar();
    }

    if (!!EventFormData.openingHours.length) {
      EventFormData.initOpeningHours(EventFormData.openingHours);
    }

    $scope.loaded = true;
    EventFormData.showStep(1);
    EventFormData.showStep(2);
    EventFormData.showStep(3);
    EventFormData.showStep(4);
    EventFormData.showStep(5);

  }

  /**
   * Add a timestamp based on a given start and enddate.
   */
  function addTimestamp(startDateString, endDateString) {

    var startDate = moment(startDateString);
    var endDate = moment(endDateString);

    var startHour = startDate.format('HH:mm');
    var endHour = endDate.format('HH:mm');

    startHour = startHour === '00:00' ? '' : startHour;
    endHour = endHour === '00:00' ? '' : endHour;

    var startHourAsDate = moment(startDateString).toDate();
    var endHourAsDate = moment(endDateString).toDate();

    // reset startDate hours to 0 to avoid date indication problems with udbDatepicker
    EventFormData.addTimestamp(startDate.hours(0).toDate(), startHour, startHourAsDate, endHour, endHourAsDate);

  }
}
