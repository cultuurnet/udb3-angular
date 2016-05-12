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
function EventFormController($scope, eventId, placeId, offerType, EventFormData, udbApi, moment, jsonLDLangFilter) {

  // Other controllers won't load until this boolean is set to true.
  $scope.loaded = false;

  // Make sure we start off with clean data every time this controller gets called
  EventFormData.init();

  // Fill the event form data if an event is being edited.
  if (eventId) {

    if (offerType === 'event') {
      udbApi.getEventById(eventId).then(function(event) {
        EventFormData.isEvent = true;
        EventFormData.isPlace = false;
        copyItemDataToFormData(event);

        // Copy location.
        if (event.location && event.location.id) {
          var location = jsonLDLangFilter(event.location, 'nl');
          EventFormData.location = {
            id : location.id.split('/').pop(),
            name : location.name,
            address : location.address
          };
        }
      });
    }
  }
  else if (placeId) {

    udbApi.getPlaceById(placeId).then(function(place) {

      EventFormData.isEvent = false;
      EventFormData.isPlace = true;
      copyItemDataToFormData(place);

      // Places only have an address, form uses location property.
      if (place.address) {
        EventFormData.location = {
          address : place.address
        };
      }

    });

  }
  else {
    $scope.loaded = true;
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
      'facilities',
      'image',
      'additionalData',
      'apiUrl'
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

    var startHour = '';
    startHour = startDate.hours() <= 9 ? '0' + startDate.hours() : startDate.hours();
    if (startDate.minutes() <= 9) {
      startHour += ':0' + startDate.minutes();
    }
    else {
      startHour += ':' + startDate.minutes();
    }

    var endHour = '';
    endHour = endDate.hours() <= 9 ? '0' + endDate.hours() : endDate.hours();
    if (endDate.minutes() <= 9) {
      endHour += ':0' + endDate.minutes();
    }
    else {
      endHour += ':' + endDate.minutes();
    }

    startHour = startHour === '00:00' ? '' : startHour;
    endHour = endHour === '00:00' ? '' : endHour;

    // reset startDate hours to 0 to avoid date indication problems with udbDatepicker
    EventFormData.addTimestamp(startDate.hours(0).toDate(), startHour, endHour);

  }

}
