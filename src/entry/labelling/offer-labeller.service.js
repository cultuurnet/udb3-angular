'use strict';

/**
 * @ngdoc service
 * @name udb.entry.evenLabeller
 * @description
 * # offerLabeller
 * Service in the udb.entry.
 */
angular
  .module('udb.entry')
  .service('offerLabeller', OfferLabeller);

/* @ngInject */
function OfferLabeller(jobLogger, udbApi, OfferLabelJob, OfferLabelBatchJob, QueryLabelJob, $q, $uibModal) {
  var offerLabeller = this;

  /**
   * A helper function to create and log jobs
   *
   * This partial function takes a constructor for a specific job type and passes on the arguments.
   *
   * @param {BaseJob} jobType
   *  A job type that's based on BaseJob.
   */
  function jobCreatorFactory(jobType) {
    var args =  Array.prototype.slice.call(arguments);
    var info = args.shift(); // contains a function with argument info etc.

    function jobCreator(response) {
      args.unshift(response.data.commandId);
      args.unshift(info); // needs to be the first element
      var job = new (Function.prototype.bind.apply(jobType, args))();

      jobLogger.addJob(job);

      return $q.resolve(job);
    }

    return jobCreator;
  }

  /**
   * Label an event with a label
   * @param {UdbEvent|UdbPlace} offer
   * @param {string} labelName
   */
  this.label = function (offer, labelName) {
    var result = {
      success: false,
      name: labelName
    };

    return udbApi
      .labelOffer(offer.apiUrl, labelName)
      .then(jobCreatorFactory(OfferLabelJob, offer, labelName))
      .then(function(response) {
        offer.label(labelName);
        result.success = true;
        result.message = response.id;
        return result;
      })
      .catch(function(error) {
        result.message = error.data.title;
        return result;
      });
  };

  /**
   * Unlabel a label from an event
   * @param {UdbEvent|UdbPlace} offer
   * @param {string} labelName
   *
   * @return {Promise.<OfferLabelJob|ApiProblem>}
   */
  this.unlabel = function (offer, labelName) {
    function eagerlyUnlabelAndPassOnResponse(response) {
      offer.unlabel(labelName);
      return response;
    }

    return udbApi
      .unlabelOffer(offer.apiUrl, labelName)
      .then(eagerlyUnlabelAndPassOnResponse)
      .then(jobCreatorFactory(OfferLabelJob, offer, labelName, true));
  };

  /**
   * @param {OfferIdentifier[]} offers
   * @param {string} labelName
   */
  this.labelOffersById = function (offers, labelName) {
    return udbApi
      .labelOffers(offers, labelName)
      .then(jobCreatorFactory(OfferLabelBatchJob, offers, labelName));
  };

  /**
   *
   * @param {string} query
   * @param {string} labelName
   * @param {Number} eventCount
   */
  this.labelQuery = function (query, labelName, eventCount) {
    eventCount = eventCount || 0;

    return udbApi
      .labelQuery(query, labelName)
      .then(jobCreatorFactory(QueryLabelJob, eventCount, labelName));
  };

  /**
   * @param {string} labelName
   * @param {Number} [maxItems]
   * @return {Promise.<Label[]>}
   */
  offerLabeller.getSuggestions = function (labelName, maxItems) {
    var max = typeof maxItems !== 'undefined' ?  maxItems : 5;
    /** @param {PagedCollection} pagedSearchResults */
    function returnSimilarLabels(pagedSearchResults) {
      return pagedSearchResults.member;
    }

    return udbApi
      .findLabels(labelName, max)
      .then(returnSimilarLabels);
  };
}
