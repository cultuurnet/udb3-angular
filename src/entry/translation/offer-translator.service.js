'use strict';

/**
 * @ngdoc service
 * @name udb.entry.offerTranslator
 * @description
 * # offerTranslator
 * Service in the udb.entry.
 */
angular
  .module('udb.entry')
  .service('offerTranslator', OfferTranslator);

/* @ngInject */
function OfferTranslator(jobLogger, udbApi, OfferTranslationJob) {

  /**
   * Translates an offer property to a given language and adds the job to the logger
   *
   * @param {UdbEvent|UdbPlace} offer The offer that needs translating
   * @param {string}  property  The name of the property to translate
   * @param {string}  language  The abbreviation of the translation language
   * @param {string}  translation Translation to save
   */
  this.translateProperty = function (offer, property, language, translation) {
    function logTranslationJob(response) {
      var jobData = response.data;

      if (property === 'title') {
        property = 'name';
      }

      offer[property][language] = translation;
      var job = new OfferTranslationJob(jobData.commandId, offer, property, language, translation);
      jobLogger.addJob(job);
    }

    if (offer.detailUrl && offer.detailUrl.split('/').shift() === 'organizer') {
      return udbApi
          .translateOrganizerProperty(offer.id, property, language, translation)
          .then(logTranslationJob);
    } else {
      return udbApi
          .translateProperty(offer.apiUrl, property, language, translation)
          .then(logTranslationJob);
    }
  };

  this.translateAddress = function (offer, language, translation, offerType) {
    function logTranslationJob(response) {
      var jobData = response.data;

      offer.address[language] = translation;
      var job = new OfferTranslationJob(jobData.commandId, offer, 'address', language, translation);
      jobLogger.addJob(job);
    }

    return udbApi
        .translateAddress(offer.id, language, translation, offerType)
        .then(logTranslationJob);
  };
}
