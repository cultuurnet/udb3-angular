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
function OfferLabeller(jobLogger, udbApi, OfferLabelJob, OfferLabelBatchJob, QueryLabelJob, $q) {

  var offerLabeller = this;

  // keep a cache of all the recently used labels
  offerLabeller.recentLabels = ['some', 'recent', 'label'];

  function updateRecentLabels() {
    udbApi
      .getRecentLabels()
      .then(function (labels) {
        offerLabeller.recentLabels = labels;
      });
  }

  // warm up the cache
  updateRecentLabels();

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
    function jobCreator(response) {
      args.unshift(response.data.commandId);
      var job = new (Function.prototype.bind.apply(jobType, args))();

      jobLogger.addJob(job);

      return $q.resolve(job);
    }

    return jobCreator;
  }

  /**
   * Label an event with a label
   * @param {UdbEvent|UdbPlace} offer
   * @param {string} label
   */
  this.label = function (offer, label) {
    offer.label(label);

    return udbApi
      .labelOffer(offer.apiUrl, label)
      .then(jobCreatorFactory(OfferLabelJob, offer, label));
  };

  /**
   * Unlabel a label from an event
   * @param {UdbEvent|UdbPlace} offer
   * @param {string} label
   */
  this.unlabel = function (offer, label) {
    offer.unlabel(label);

    return udbApi
      .unlabelOffer(offer.apiUrl, label)
      .then(jobCreatorFactory(OfferLabelJob, offer, label, true));
  };

  /**
   * @param {OfferIdentifier[]} offers
   * @param {string} label
   */
  this.labelOffersById = function (offers, label) {
    return udbApi
      .labelOffers(offers, label)
      .then(jobCreatorFactory(OfferLabelBatchJob, offers, label));
  };

  /**
   *
   * @param {string} query
   * @param {string} label
   */
  this.labelQuery = function (query, label, eventCount) {
    eventCount = eventCount || 0;

    return udbApi
      .labelQuery(query, label)
      .then(jobCreatorFactory(QueryLabelJob, eventCount, label));
  };
}
