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

      offer[property][language] = translation;
      var job = new OfferTranslationJob(jobData.commandId, offer, property, language, translation);
      jobLogger.addJob(job);
    }

    // TODO get rid of this hack;
    if (property === 'title') {
      property = 'name';
    }

    return udbApi
      .translateProperty(offer.apiUrl, property, language, translation)
      .then(logTranslationJob);
  };
}
