'use strict';

/**
 * @typedef {Object} MediaObject
 * @property {string}   @id
 * @property {string}   @type
 * @property {string}   contentUrl
 * @property {string}   thumbnailUrl
 * @property {string}   description
 * @property {string}   copyrightHolder
 */

/**
 * @ngdoc function
 * @name udb.media.service:MediaManager
 * @description
 * # MediaManager
 * Service to manage media.
 */
angular
  .module('udb.media')
  .service('MediaManager', MediaManager);

/**
 * @ngInject
 */
function MediaManager(jobLogger, appConfig, CreateImageJob, $q, udbApi) {
  var service = this;

  /**
   * @param {File} imageFile
   * @param {string} description
   * @param {string} copyrightHolder
   *
   * @return {Promise.<MediaObject>}
   */
  service.createImage = function(imageFile, description, copyrightHolder) {
    var deferredMediaObject = $q.defer();

    function logCreateImageJob(uploadResponse) {
      var jobData = uploadResponse.data;
      var job = new CreateImageJob(jobData  .commandId);
      jobLogger.addJob(job);

      job.task.promise
        .then(fetchAndReturnMedia);
    }

    function fetchAndReturnMedia(jobInfo) {
      var imageId = _.get(jobInfo, 'file_id');
      service
        .getImage(imageId)
        .then(deferredMediaObject.resolve, deferredMediaObject.reject);
    }

    udbApi
      .uploadMedia(imageFile, description, copyrightHolder)
      .then(logCreateImageJob, deferredMediaObject.reject);

    return deferredMediaObject.promise;
  };

  /**
   * @param {string} imageId
   *
   * @return {Promise.<MediaObject>}
   */
  service.getImage = function (imageId) {
    function returnMediaObject(data) {
      var mediaObject = data;
      mediaObject.id = imageId;

      return $q.resolve(mediaObject);
    }

    return udbApi
      .getMedia(imageId)
      .then(returnMediaObject);
  };
}
