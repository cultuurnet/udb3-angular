'use strict';

/**
 * @ngdoc service
 * @name udb.entry.eventCrud
 * @description
 * Service for creating / updating events.
 */
angular
  .module('udb.entry')
  .service('eventCrud', EventCrud);

/* @ngInject */
function EventCrud(
  udbApi,
  udbUitpasApi,
  $rootScope,
  $q,
  offerLocator
) {

  var service = this;

  /**
   * @param {EventFormData} formData
   */
  function pickMajorInfoFromFormData(formData) {
    var majorInfo = _.pick(formData, function(property, name) {
      var isStream = name.charAt(name.length - 1) === '$';
      return (_.isDate(property) || !_.isEmpty(property)) && !isStream;
    });

    return majorInfo;
  }

  /**
   * Creates a new offer and add the job to the logger.
   *
   * @param {EventFormData}  eventFormData
   *  The form data required to create an offer.
   *
   * @return {Promise.<EventFormData>}
   */
  service.createOffer = function (eventFormData) {

    var type = eventFormData.isEvent ? 'event' : 'place';

    var updateEventFormData = function(url) {
      eventFormData.apiUrl = url;
      eventFormData.id = url.toString().split('/').pop();

      offerLocator.add(eventFormData.id, eventFormData.apiUrl);
      $rootScope.$emit('eventFormSaved', eventFormData);

      udbApi
        .getOffer(url)
        .then(function(offer) {
          $rootScope.$emit('offerCreated', offer);
        });

      return eventFormData;
    };

    var majorInfo = pickMajorInfoFromFormData(eventFormData);

    return udbApi
      .createOffer(type, majorInfo)
      .then(updateEventFormData);
  };

  /**
   * Find all the events that take place here.
   *
   * @param {URL} url
   *
   * @return {Promise.<OfferIdentifier[]>}
   */
  service.findEventsAtPlace = function(url) {
    return udbApi.findEventsAtPlace(url);
  };

  /**
   * Delete an offer.
   *
   * @param {UdbPlace|UdbEvent} offer
   *
   * @return {Promise}
   */
  service.deleteOffer = function (offer) {
    function flagAsDeleted() {
      offer.showDeleted = true;
    }

    return udbApi
      .deleteOffer(offer)
      .then(flagAsDeleted);
  };

  /**
   * Update the major info of an event / place.
   * @param {EventFormData} eventFormData
   */
  service.updateMajorInfo = function(eventFormData) {
    var majorInfo = pickMajorInfoFromFormData(eventFormData);

    udbApi
      .updateMajorInfo(eventFormData.apiUrl, majorInfo)
      .then(responseHandlerFactory(eventFormData));
  };

  /**
   * Creates a new organizer.
   */
  service.createOrganizer = function(organizer) {
    return udbApi.createOrganizer(organizer);
  };

  /**
   * Update the main language description and add it to the job logger.
   *
   * @param {EventFormData} item
   * @returns {Promise}
   */
  service.updateDescription = function(item) {
    return udbApi
      .translateProperty(item.apiUrl, 'description', item.mainLanguage, item.description[item.mainLanguage])
      .then(responseHandlerFactory(item));
  };

  /**
   * Update the adress of a place and add it to the job logger.
   *
   * @param {EventFormData} item
   * @returns {Promise}
   */
  service.translateAddress = function(item) {
    return updateOfferProperty(item, 'typicalAgeRange', 'updateTypicalAgeRange');
  };

  /**
   * Update the typical age range and add it to the job logger.
   *
   * @param {EventFormData} item
   * @returns {Promise}
   */
  service.updateTypicalAgeRange = function(item) {
    return updateOfferProperty(item, 'typicalAgeRange', 'updateTypicalAgeRange');
  };

  /**
   * Update the typical age range and add it to the job logger.
   *
   * @param {EventFormData} item
   * @returns {Promise}
   */
  service.deleteTypicalAgeRange = function(item) {
    return udbApi
      .deleteTypicalAgeRange(item.apiUrl)
      .then(responseHandlerFactory(item));
  };

  /**
   * Update the connected organizer and it to the job logger.
   *
   * @param {EventFormData} item
   * @returns {Promise}
   */
  service.updateOrganizer = function(item) {
    return udbApi
      .updateProperty(item.apiUrl, 'organizer', item.organizer.id)
      .then(responseHandlerFactory(item));
  };

  /**
   * Delete the organizer for the event / place.
   *
   * @param {EventFormData} item
   * @returns {Promise}
   */
  service.deleteOfferOrganizer = function(item) {
    return udbApi
      .deleteOfferOrganizer(item.apiUrl, item.organizer.id)
      .then(responseHandlerFactory(item));
  };

  /**
   * Update UiTPAS info for the event.
   *
   * @param {EventFormData} item
   * @returns {Promise}
   */
  service.updateEventUitpasData = function(item) {
    return udbUitpasApi
        .updateEventUitpasData(item.usedDistributionKeys, item.id)
        .then(responseHandlerFactory(item));
  };

  /**
   * Get the Uitpas data from an event.
   * @param {string} cdbid
   * @returns {Promise}
   */
  service.getEventUitpasData = function(cdbid) {
    return udbUitpasApi.getEventUitpasData(cdbid);
  };

  /**
   * Update the price info and add it to the job logger.
   *
   * @param {EventFormData} item
   * @returns {Promise}
   */
  service.updatePriceInfo = function(item) {
    return udbApi
      .updatePriceInfo(item.apiUrl, item.priceInfo)
      .then(responseHandlerFactory(item));
  };

  /**
   * Update the contact point and add it to the job logger.
   *
   * @param {EventFormData} item
   * @returns {Promise}
   */
  service.updateContactPoint = function(item) {
    return updateOfferProperty(item, 'contactPoint', 'updateContactInfo');
  };

  /**
   * Update the booking info and add it to the job logger.
   *
   * @param {EventFormData} item
   *
   * @returns {Promise}
   */
  service.updateBookingInfo = function(item) {
    var allowedProperties = [
      'url',
      'urlLabel',
      'email',
      'phone',
      'availabilityStarts',
      'availabilityEnds'
    ];

    var bookingInfo =  _.pick(item.bookingInfo, function(property, propertyName) {
      return _.includes(allowedProperties, propertyName) && (_.isDate(property) || !_.isEmpty(property));
    });

    if (!_.has(bookingInfo, 'url')) {
      bookingInfo = _.omit(bookingInfo, 'urlLabel');
    }

    if (_.intersection(_.keysIn(bookingInfo), ['url', 'phone', 'email']).length === 0) {
      bookingInfo = {};
    }

    return udbApi
      .updateProperty(item.apiUrl, 'bookingInfo', bookingInfo)
      .then(responseHandlerFactory(item));
  };

  /**
   * @param {EventFormData} offer
   * @param {string} propertyName
   * @param {string} jobName
   *
   * @return {Promise}
   */
  function updateOfferProperty(offer, propertyName, jobName) {
    return udbApi
      .updateProperty(offer.apiUrl, propertyName, offer[propertyName])
      .then(responseHandlerFactory(offer));
  }

  /**
   * @param {udbEvent|udbPlace} item
   * @param {Object[]} facilities
   *
   * @return {Promise}
   */
  service.updateFacilities = function(item, facilities) {
    return udbApi
      .updateOfferFacilities(item.apiUrl, _.map(facilities, 'id'))
      .then(responseHandlerFactory(item));
  };

  /**
   * Add a new image to the item.
   *
   * @param {EventFormData} item
   * @param {MediaObject} image
   * @returns {Promise}
   */
  service.addImage = function(item, image) {
    var imageId = image.id || image['@id'].split('/').pop();

    return udbApi
      .addImage(item.apiUrl, imageId)
      .then(responseHandlerFactory(item));
  };

  /**
   * Update an image of the item.
   *
   * @param {EventFormData} item
   * @param {MediaObject} image
   * @param {string} description
   * @param {string} copyrightHolder
   * @returns {Promise}
   */
  service.updateImage = function(item, image, description, copyrightHolder) {
    var imageId = image['@id'].split('/').pop();

    return udbApi
      .updateImage(item.apiUrl, imageId, description, copyrightHolder)
      .then(responseHandlerFactory(item));
  };

  /**
   * Remove an image from an item.
   *
   * @param {EventFormData} item
   * @param {image} image
   * @returns {Promise}
   */
  service.removeImage = function(item, image) {
    var imageId = image['@id'].split('/').pop();

    return udbApi
      .removeImage(item.apiUrl, imageId)
      .then(responseHandlerFactory(item));
  };

  /**
   * Select the main image for an item.
   *
   * @param {EventFormData} item
   * @param {image} image
   * @returns {Promise}
   */
  service.selectMainImage = function (item, image) {
    var imageId = image['@id'].split('/').pop();

    return udbApi
      .selectMainImage(item.apiUrl, imageId)
      .then(responseHandlerFactory(item));
  };

  /**
   * Select the main image for an item.
   *
   * @param {EventFormData} item
   * @param {string} audienceType
   * @returns {Promise}
   */
  service.setAudienceType = function (item, audienceType) {
    return udbApi
      .setAudienceType(item.apiUrl, audienceType)
      .then(responseHandlerFactory(item));
  };

  /**
   * @param {EventFormData} offer
   * @param {Date} [publicationDate]
   *
   * @return {Promise}
   */
  service.publishOffer = function(offer, publicationDate) {
    return udbApi
      .publishOffer(offer.apiUrl, publicationDate)
      .then(responseHandlerFactory(offer));
  };

  /**
   * @param {Object} event Angular event object
   * @param {EventFormData} eventFormData
   */
  function updateMajorInfo(event, eventFormData) {
    service.updateMajorInfo(eventFormData);
  }

  function responseHandlerFactory(offer) {
    function responseHandler(response) {
      udbApi.removeItemFromCache(offer.apiUrl.toString());
    }

    return responseHandler;
  }

  $rootScope.$on('eventTypeChanged', updateMajorInfo);
  $rootScope.$on('eventThemeChanged', updateMajorInfo);
  $rootScope.$on('eventTimingChanged', updateMajorInfo);
  $rootScope.$on('eventTitleChanged', updateMajorInfo);
}
