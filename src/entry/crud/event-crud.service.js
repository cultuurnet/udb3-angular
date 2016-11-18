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
  $rootScope ,
  $q,
  offerLocator
) {

  var service = this;

  /**
   * @param {EventFormData} formData
   */
  function pickMajorInfoFromFormData(formData) {
    return _.pick(formData, function(property) {
      return _.isDate(property) || !_.isEmpty(property);
    });
  }

  /**
   * End the event right before midnight.
   *
   * This trick makes sure the availableTo attribute in CDBXML includes the last day.
   *
   * @param {EventFormData} formData
   *
   * @return {EventFormData}
   *  Returns a new form data object with the updated end date
   */
  function endEventRightBeforeMidnight(formData) {
    var endDate = formData.endDate;
    var updatedFormData = _.cloneDeep(formData);

    if (endDate) {
      updatedFormData.endDate = new moment(endDate).endOf('day').toDate();
    }

    return updatedFormData;
  }

  /**
   * Creates a new offer and add the job to the logger.
   *
   * @param {EventFormData}  formData
   *  The form data required to create an offer.
   *
   * @return {Promise.<EventFormData>}
   */
  service.createOffer = function (formData) {

    var type = formData.isEvent ? 'event' : 'place';

    var updateEventFormData = function(url) {
      formData.apiUrl = url;
      formData.id = url.toString().split('/').pop();

      offerLocator.add(formData.id, formData.apiUrl);

      return formData;
    };

    var majorInfo = pickMajorInfoFromFormData(endEventRightBeforeMidnight(formData));

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
   * @param {EventFormData} formData
   */
  service.updateMajorInfo = function(formData) {
    var majorInfo = pickMajorInfoFromFormData(endEventRightBeforeMidnight(formData));

    udbApi
      .updateMajorInfo(formData.apiUrl, majorInfo)
      .then(jobCreatorFactory(formData, 'updateItem'));
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
   * @param {EventFormData} offer
   * @param {string} jobName
   *
   * @return {Promise.<EventCrudJob>}
   */
  service.publishOffer = function(offer, jobName) {
    return udbApi
      .patchOffer(offer.apiUrl.toString(), 'Publish')
      .then(function (response) {
        var job = new EventCrudJob(response.commandId, offer, jobName);

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
