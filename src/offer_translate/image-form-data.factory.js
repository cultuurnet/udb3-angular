'use strict';
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
 * @ngdoc service
 * @name udb.core.ImageFormData
 * @description
 * Contains data needed for the steps in the event form.
 */
angular
  .module('udb.offer-translate')
  .factory('ImageFormData', ImageFormDataFactory);

/* @ngInject */
function ImageFormDataFactory() {

  /**
   * @class EventFormData
   */
  var imageFormData = {
    /**
     * Initialize the properties with default data
     */
    init: function() {
      this.apiUrl = '';
      this.name = {};
      this.mediaObjects = [];
    },

    /**
    * Add a new image.
    *
    * @param {MediaObject} mediaObject
    */
    addImage: function(mediaObject) {
      this.mediaObjects = _.union(this.mediaObjects, [mediaObject]);
    },

    /**
    * Update the info of the given media object.
    * @param {MediaObject} updatedMediaObject
    */
    updateMediaObject: function(updatedMediaObject) {
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
    * @param {MediaObject} mediaObject
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
    }

  };

  // initialize the data
  imageFormData.init();
  return imageFormData;
}
