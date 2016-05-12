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
  EventCrudJob,
  DeleteOfferJob,
  $rootScope ,
  $q
) {

  var service = this;

  /**
   * Creates a new event and add the job to the logger.
   *
   * @param {UdbEvent}  event
   * The event to be created
   */
  service.createEvent = function (event) {

    var jobPromise = null;

    if (event.isEvent) {
      jobPromise = udbApi.createEvent(event);
    }
    else {
      jobPromise = udbApi.createPlace(event);
    }

    return jobPromise;
  };

  /**
   * Find all the events that take place here.
   *
   * @param {UdbPlace} place
   *
   * @return {Promise.<OfferIdentifier[]>}
   */
  service.findEventsAtPlace = function(place) {
    return udbApi.findEventsAtPlace(place.apiUrl);
  };

  /**
   * Creates a new place.
   */
  service.createPlace = function(place) {
    return udbApi.createPlace(place);
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
    udbApi
      .updateMajorInfo(eventFormData)
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
      .translateProperty(item.apiUrl, 'description', udbApi.mainLanguage, item.description.nl)
      .then(jobCreatorFactory(item, 'updateDescription'));
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
      .updateProperty(item.id, item.getType(), 'organizer', item.organizer.id)
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
   * @param {EventFormData} item
   * @param {string} jobName
   *
   * @return {Function}
   *  Return a job creator that takes an http job creation response and turns it into a EventCrudJob promise.
   */
  function jobCreatorFactory(item, jobName) {
    function jobCreator(response) {
      var jobData = response.data;
      var job = new EventCrudJob(jobData.commandId, item, jobName);
      addJobAndInvalidateCache(jobLogger, job);

      return $q.resolve(job);
    }

    return jobCreator;
  }

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
   * Update the facilities and add it to the job logger.
   *
   * @param {EventFormData} item
   * @returns {Promise.<EventCrudJob>}
   */
  service.updateFacilities = function(item) {
    return updateOfferProperty(item, 'facilities', 'updateFacilities');
  };

  /**
   * Update the booking info and add it to the job logger.
   *
   * @param {EventFormData} item
   *
   * @returns {Promise.<EventCrudJob>}
   */
  service.updateBookingInfo = function(item) {
    return updateOfferProperty(item, 'bookingInfo', 'updateBookingInfo');
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
    job.task.promise.then(function (itemId) {
      udbApi.removeItemFromCache(itemId);
    }, function() {});
  }

  $rootScope.$on('eventTypeChanged', updateMajorInfo);
  $rootScope.$on('eventThemeChanged', updateMajorInfo);
  $rootScope.$on('eventTimingChanged', updateMajorInfo);
  $rootScope.$on('eventTitleChanged', updateMajorInfo);
}
