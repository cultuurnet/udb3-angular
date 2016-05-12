'use strict';

/**
 * @ngdoc service
 * @name udb.entry.OfferTranslationJob
 * @description
 * # Offer Label Job
 * This Is the factory that creates an offer label job
 */
angular
  .module('udb.entry')
  .factory('OfferTranslationJob', OfferTranslationJobFactory);

/* @ngInject */
function OfferTranslationJobFactory(BaseJob, JobStates) {

  /**
   * @class OfferTranslationJob
   * @constructor
   * @param {string} commandId
   * @param {UdbEvent|UdbPlace} offer
   * @param {string} property
   * @param {string} language
   * @param {string} translation
   */
  var OfferTranslationJob = function (commandId, offer, property, language, translation) {
    BaseJob.call(this, commandId);
    this.offer = offer;
    this.property = property;
    this.language = language;
    this.translation = translation;
  };

  OfferTranslationJob.prototype = Object.create(BaseJob.prototype);
  OfferTranslationJob.prototype.constructor = OfferTranslationJob;

  OfferTranslationJob.prototype.getDescription = function () {
    var job = this,
        description;

    if (this.state === JobStates.FAILED) {
      description = 'Vertalen van aanbod mislukt';
    } else {
      var propertyName;

      switch (job.property) {
        case 'name':
          propertyName = 'titel';
          break;
        case 'description':
          propertyName = 'omschrijving';
          break;
        default:
          propertyName = job.property;
      }

      description = 'Vertaal ' + propertyName + ' van "' + job.event.name.nl + '"';
    }

    return description;
  };

  return (OfferTranslationJob);
}
