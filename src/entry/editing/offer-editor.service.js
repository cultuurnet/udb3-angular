'use strict';

/**
 * @ngdoc service
 * @name udb.entry.offerEditor
 * @description
 * # offerEditor
 * Service in the udb.entry.
 */
angular
  .module('udb.entry')
  .service('offerEditor', OfferEditor);

/* @ngInject */
function OfferEditor(jobLogger, udbApi, VariationCreationJob, BaseJob, $q, variationRepository) {
  var editor = this;
  /**
   * Edit the description of an offer. We never edit the original offer but use a variation instead.
   *
   * @param {UdbEvent|UdbPlace} offer        The original offer
   * @param {string}   description           The new description text
   * @param {string}   [purpose=personal]    The purpose of the variation that will be edited
   */
  this.editDescription = function (offer, description, purpose) {
    var deferredUpdate = $q.defer();
    var variationPromise = variationRepository.getPersonalVariation(offer);

    var removeDescription = function (variation) {
      var deletePromise = editor.deleteVariation(offer, variation.id);
      deletePromise.then(function () {
        deferredUpdate.resolve(false);
      }, rejectUpdate);
    };

    var rejectUpdate = function (reason) {
      deferredUpdate.reject(reason);
    };

    var createVariation = function () {
      purpose = purpose || 'personal';
      var creationRequest = udbApi.createVariation(offer, description, purpose);
      creationRequest.success(handleCreationJob);
      creationRequest.error(rejectUpdate);
    };

    var handleCreationJob = function (jobData) {
      var variation = angular.copy(offer);
      variation.description.nl = description;
      var variationCreationJob = new VariationCreationJob(jobData.commandId, offer.id);
      jobLogger.addJob(variationCreationJob);

      variationCreationJob.task.promise.then(function (jobInfo) {
        variation.id = jobInfo['offer_variation_id']; // jshint ignore:line
        variationRepository.save(offer.id, variation);
        deferredUpdate.resolve();
      }, rejectUpdate);
    };

    var editDescription = function (variation) {
      var editRequest = udbApi.editDescription(variation.id, description);

      editRequest.success(function (jobData) {
        variation.description.nl = description;
        jobLogger.addJob(new BaseJob(jobData.commandId));
        deferredUpdate.resolve();
      });

      editRequest.error(rejectUpdate);
    };

    var revertToOriginal = function () {
      deferredUpdate.resolve(false);
    };

    if (description) {
      variationPromise.then(editDescription, createVariation);
    } else {
      variationPromise.then(removeDescription, revertToOriginal);
    }

    return deferredUpdate.promise;
  };

  this.deleteVariation = function (offer, variationId) {
    var deletePromise = udbApi.deleteVariation(variationId);

    deletePromise.success(function (jobData) {
      jobLogger.addJob(new BaseJob(jobData.commandId));
      variationRepository.remove(offer.id);
    });

    return deletePromise;
  };
}
