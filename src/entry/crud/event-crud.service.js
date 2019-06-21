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
  jobLogger,
  udbApi,
  udbUitpasApi,
  EventCrudJob,
  DeleteOfferJob,
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

    majorInfo.location = majorInfo.location.id;

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
   * @return {Promise.<EventCrudJob>}
   */
  service.deleteOffer = function (offer) {
    function logJobAndFlagAsDeleted(response) {
      var jobData = response.data;
      var job = new DeleteOfferJob(jobData.commandId, offer);
      offer.showDeleted = true;
      jobLogger.addJob(job);

      return $q.resolve(job);
    }

    return udbApi
      .deleteOffer(offer)
      .then(logJobAndFlagAsDeleted);
  };

  /**
   * Update the major info of an event / place.
   * @param {EventFormData} eventFormData
   */
  service.updateMajorInfo = function(eventFormData) {
    var majorInfo = pickMajorInfoFromFormData(eventFormData);

    udbApi
      .updateMajorInfo(eventFormData.apiUrl, majorInfo)
      .then(jobCreatorFactory(eventFormData, 'updateItem'));
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
   * @returns {Promise.<EventCrudJob>}
   */
  service.updateDescription = function(item) {
    return udbApi
      .translateProperty(item.apiUrl, 'description', item.mainLanguage, item.description[item.mainLanguage])
      .then(jobCreatorFactory(item, 'updateDescription'));
  };

  /**
   * Update the adress of a place and add it to the job logger.
   *
   * @param {EventFormData} item
   * @returns {Promise.<EventCrudJob>}
   */
  service.translateAddress = function(item) {
    return updateOfferProperty(item, 'typicalAgeRange', 'updateTypicalAgeRange');
  };

  /**
   * Update the typical age range and add it to the job logger.
   *
   * @param {EventFormData} item
   * @returns {Promise.<EventCrudJob>}
   */
  service.updateTypicalAgeRange = function(item) {
    return updateOfferProperty(item, 'typicalAgeRange', 'updateTypicalAgeRange');
  };

  /**
   * Update the typical age range and add it to the job logger.
   *
   * @param {EventFormData} item
   * @returns {Promise.<EventCrudJob>}
   */
  service.deleteTypicalAgeRange = function(item) {
    return udbApi
      .deleteTypicalAgeRange(item.apiUrl)
      .then(jobCreatorFactory(item, 'updateTypicalAgeRange'));
  };

  /**
   * Update the connected organizer and it to the job logger.
   *
   * @param {EventFormData} item
   * @returns {Promise.<EventCrudJob>}
   */
  service.updateOrganizer = function(item) {
    return udbApi
      .updateProperty(item.apiUrl, 'organizer', item.organizer.id)
      .then(jobCreatorFactory(item, 'updateOrganizer'));
  };

  /**
   * Delete the organizer for the event / place.
   *
   * @param {EventFormData} item
   * @returns {Promise.<EventCrudJob>}
   */
  service.deleteOfferOrganizer = function(item) {
    return udbApi
      .deleteOfferOrganizer(item.apiUrl, item.organizer.id)
      .then(jobCreatorFactory(item, 'deleteOrganizer'));
  };

  /**
   * Update UiTPAS info for the event.
   *
   * @param {EventFormData} item
   * @returns {Promise.<EventCrudJob>}
   */
  service.updateEventUitpasData = function(item) {
    return udbUitpasApi
        .updateEventUitpasData(item.usedDistributionKeys, item.id)
        .then(jobCreatorFactory(item, 'updateUitpasInfo'));
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
   * @param {EventFormData} item
   * @param {string} jobName
   *
   * @return {Function}
   *  Return a job creator that takes an http job creation response and turns it into a EventCrudJob promise.
   */
  function jobCreatorFactory(item, jobName) {
    function jobCreator(response) {
      var jobData = response.data ? response.data : response;
      var job = new EventCrudJob(jobData.commandId, item, jobName);
      addJobAndInvalidateCache(jobLogger, job);

      return $q.resolve(job);
    }

    return jobCreator;
  }

  /**
   * Update the price info and add it to the job logger.
   *
   * @param {EventFormData} item
   * @returns {Promise.<EventCrudJob>}
   */
  service.updatePriceInfo = function(item) {
    return udbApi
      .updatePriceInfo(item.apiUrl, item.priceInfo)
      .then(function (response) {
        var jobData = response.data;
        var job = new EventCrudJob(jobData.commandId, item, 'updatePriceInfo');
        addJobAndInvalidateCache(jobLogger, job);

        return $q.resolve(job);
      });
  };

  /**
   * Update the contact point and add it to the job logger.
   *
   * @param {EventFormData} item
   * @returns {Promise.<EventCrudJob>}
   */
  service.updateContactPoint = function(item) {
    return updateOfferProperty(item, 'contactPoint', 'updateContactInfo');
  };

  /**
   * Update the booking info and add it to the job logger.
   *
   * @param {EventFormData} item
   *
   * @returns {Promise.<EventCrudJob>}
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

    if (bookingInfo.availabilityStarts) {
      bookingInfo.availabilityStarts = bookingInfo.availabilityStarts;
    }

    if (bookingInfo.availabilityEnds) {
      bookingInfo.availabilityEnds = bookingInfo.availabilityEnds;
    }

    if (!_.has(bookingInfo, 'url')) {
      bookingInfo = _.omit(bookingInfo, 'urlLabel');
    }

    if (_.intersection(_.keysIn(bookingInfo), ['url', 'phone', 'email']).length === 0) {
      bookingInfo = {};
    }

    return udbApi
      .updateProperty(item.apiUrl, 'bookingInfo', bookingInfo)
      .then(jobCreatorFactory(item, 'updateBookingInfo'));
  };

  /**
   * @param {EventFormData} offer
   * @param {string} propertyName
   * @param {string} jobName
   *
   * @return {Promise.<EventCrudJob>}
   */
  function updateOfferProperty(offer, propertyName, jobName) {
    return udbApi
      .updateProperty(offer.apiUrl, propertyName, offer[propertyName])
      .then(function (response) {
        var jobData = response.data;
        var job = new EventCrudJob(jobData.commandId, offer, jobName);
        addJobAndInvalidateCache(jobLogger, job);

        return $q.resolve(job);
      });
  }

  /**
   * @param {udbEvent|udbPlace} item
   * @param {Object[]} facilities
   *
   * @return {Promise.<EventCrudJob>}
   */
  service.updateFacilities = function(item, facilities) {
    return udbApi
      .updateOfferFacilities(item.apiUrl, _.map(facilities, 'id'))
      .then(jobCreatorFactory(item, 'updateFacilities'));
  };

  /**
   * Add a new image to the item.
   *
   * @param {EventFormData} item
   * @param {MediaObject} image
   * @returns {Promise.<EventCrudJob>}
   */
  service.addImage = function(item, image) {
    var imageId = image.id || image['@id'].split('/').pop();

    return udbApi
      .addImage(item.apiUrl, imageId)
      .then(jobCreatorFactory(item, 'addImage'));
  };

  /**
   * Update an image of the item.
   *
   * @param {EventFormData} item
   * @param {MediaObject} image
   * @param {string} description
   * @param {string} copyrightHolder
   * @returns {Promise.<EventCrudJob>}
   */
  service.updateImage = function(item, image, description, copyrightHolder) {
    var imageId = image['@id'].split('/').pop();

    return udbApi
      .updateImage(item.apiUrl, imageId, description, copyrightHolder)
      .then(jobCreatorFactory(item, 'updateImage'));
  };

  /**
   * Remove an image from an item.
   *
   * @param {EventFormData} item
   * @param {image} image
   * @returns {Promise.<EventCrudJob>}
   */
  service.removeImage = function(item, image) {
    var imageId = image['@id'].split('/').pop();

    return udbApi
      .removeImage(item.apiUrl, imageId)
      .then(jobCreatorFactory(item, 'removeImage'));
  };

  /**
   * Select the main image for an item.
   *
   * @param {EventFormData} item
   * @param {image} image
   * @returns {Promise.<EventCrudJob>}
   */
  service.selectMainImage = function (item, image) {
    var imageId = image['@id'].split('/').pop();

    return udbApi
      .selectMainImage(item.apiUrl, imageId)
      .then(jobCreatorFactory(item, 'selectMainImage'));
  };

  /**
   * Select the main image for an item.
   *
   * @param {EventFormData} item
   * @param {string} audienceType
   * @returns {Promise.<EventCrudJob>}
   */
  service.setAudienceType = function (item, audienceType) {
    return udbApi
      .setAudienceType(item.apiUrl, audienceType)
      .then(jobCreatorFactory(item, 'setAudienceType'));
  };

  /**
   * @param {EventFormData} offer
   * @param {Date} [publicationDate]
   *
   * @return {Promise.<EventCrudJob>}
   */
  service.publishOffer = function(offer, publicationDate) {
    return udbApi
      .publishOffer(offer.apiUrl, publicationDate)
      .then(function (response) {
        var job = new EventCrudJob(response.commandId, offer, 'publishOffer');

        addJobAndInvalidateCache(jobLogger, job);

        return $q.resolve(job);
      });
  };

  /**
   * @param {Object} event Angular event object
   * @param {EventFormData} eventFormData
   */
  function updateMajorInfo(event, eventFormData) {
    service.updateMajorInfo(eventFormData);
  }

  /**
   * @param {JobLogger} jobLogger
   * @param {EventCrudJob} job
     */
  function addJobAndInvalidateCache(jobLogger, job) {
    jobLogger.addJob(job);

    // unvalidate cache on success
    job.task.promise.then(function (offerLocation) {
      udbApi.removeItemFromCache(offerLocation.toString());
    }, function() {});
  }

  $rootScope.$on('eventTypeChanged', updateMajorInfo);
  $rootScope.$on('eventThemeChanged', updateMajorInfo);
  $rootScope.$on('eventTimingChanged', updateMajorInfo);
  $rootScope.$on('eventTitleChanged', updateMajorInfo);
}
