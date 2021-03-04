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
function EventFormController(
    $scope,
    offerId,
    EventFormData,
    udbApi,
    moment,
    jsonLDLangFilter,
    $q,
    appConfig,
    $translate
) {

  // Other controllers won't load until this boolean is set to true.
  $scope.loaded = false;
  $scope.showLangWarning = false;

  // Make sure we start off with clean data every time this controller gets called
  EventFormData.init();

  $q.when(offerId)
    .then(fetchOffer, startCreating);

  function startCreating() {

    EventFormData.initOpeningHours([]);

    var calendarConfig = _.get(appConfig, 'calendarHighlight');

    if (EventFormData.isEvent && calendarConfig && calendarConfig.date) {
      preselectDate(calendarConfig);
    }

    $scope.language = EventFormData.mainLanguage;
    $scope.loaded = true;
  }

  function preselectDate(calendarConfig) {
    EventFormData.calendar.calendarType = 'single';
    EventFormData.addTimeSpan(
      calendarConfig.startTime ? moment(calendarConfig.date + ' ' + calendarConfig.startTime, 'YYYY-MM-DD HH:mm') : '',
      calendarConfig.endTime ? moment(calendarConfig.date + ' ' + calendarConfig.endTime, 'YYYY-MM-DD HH:mm') : ''
    );
    EventFormData.initCalendar();
    //EventFormData.showStep(3);
  }

  /**
   * @param {string|null} offerId
   */
  function fetchOffer(offerId) {
    if (!offerId) {
      startCreating();
    } else {
      udbApi
        .getOffer(offerId)
        .then(startEditing);
    }
  }

  /**
   *
   * @param {UdbPlace|UdbEvent} offer
   */
  function startEditing(offer) {
    var offerType = offer.url.split('/').shift();

    EventFormData.status = offer.status;

    if (offerType === 'event') {
      EventFormData.isEvent = true;
      EventFormData.isPlace = false;

      EventFormData.subEvent = offer.subEvent;

      copyItemDataToFormData(offer);

      // Copy location.
      if (offer.location && offer.location.id) {
        var location = jsonLDLangFilter(offer.location, offer.mainLanguage, true);
        EventFormData.location = {
          id : location.id.split('/').pop(),
          name : location.name,
          address : location.address,
          isDummyPlaceForEducationEvents: location.isDummyPlaceForEducationEvents
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
        var translatedOffer = jsonLDLangFilter(offer, offer.mainLanguage, true);
        EventFormData.address = translatedOffer.address;
      }
    }

    if ($translate.use() !== $scope.language) {
      $scope.showLangWarning = true;
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
      'availableFrom',
      'labels',
      'mainLanguage'
    ];

    if (item.isDummyPlaceForEducationEvents) {
      EventFormData.isDummyPlaceForEducationEvents = item.isDummyPlaceForEducationEvents;
    }

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

    // 1. Main language is now a required property.
    // Events can be created in a given main language.
    // 2. Previous projections had a default main language of nl.
    // 3. Even older projections had a non-translated name.
    // @todo @mainLanguage after a full replay only case 1 needs to be supported.
    EventFormData.name = _.get(item.name, item.mainLanguage, null) ||
        _.get(item.name, 'nl', null) ||
        _.get(item, 'name', '');

    // Prices tariffs can be translated since III-2545
    // @todo @mainLanguage after a full replay only case 1 needs to be supported.

    if (!_.isEmpty(EventFormData.priceInfo)) {
      if (!EventFormData.priceInfo[0].name.nl && !EventFormData.priceInfo[0].name.en &&
        !EventFormData.priceInfo[0].name.fr && !EventFormData.priceInfo[0].name.de) {
        EventFormData.priceInfo = _.map(EventFormData.priceInfo, function(item) {
          var priceInfoInDutch = _.cloneDeep(item);
          priceInfoInDutch.name = {'nl': item.name};
          item = priceInfoInDutch;
          return item;
        });
      }
    }

    EventFormData.calendar.calendarType = item.calendarType; // === 'multiple' ? 'single' : item.calendarType;

    // Set correct date object for start and end.
    if (item.startDate) {
      EventFormData.calendar.startDate = moment(item.startDate).toDate();
    }

    if (item.endDate) {
      EventFormData.calendar.endDate = moment(item.endDate).toDate();
    }

    // SubEvents are timeSpans.
    if (item.calendarType === 'multiple' && item.subEvent) {
      for (var j = 0; j < item.subEvent.length; j++) {
        var subEvent = item.subEvent[j];
        EventFormData.addTimeSpan(subEvent.startDate, subEvent.endDate);
      }
    }
    else if (item.calendarType === 'single') {
      EventFormData.addTimeSpan(item.startDate, item.endDate);
    }

    if (EventFormData.calendar.calendarType) {
      EventFormData.initCalendar();
    }

    EventFormData.initOpeningHours(_.get(EventFormData, 'calendar.openingHours', []));

    $scope.language = EventFormData.mainLanguage;
    $scope.loaded = true;
    EventFormData.showStep(1);
    EventFormData.showStep(2);
    EventFormData.showStep(3);
    EventFormData.showStep(4);
    EventFormData.showStep(5);

  }
}
