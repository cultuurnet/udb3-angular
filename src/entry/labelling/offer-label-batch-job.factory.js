'use strict';

/**
 * @ngdoc service
 * @name udb.entry.OfferLabelBatchJob
 * @description
 * # BaseJob
 * This Is the factory that creates an event export job
 */
angular
  .module('udb.entry')
  .factory('OfferLabelBatchJob', OfferLabelBatchJobFactory);

/* @ngInject */
function OfferLabelBatchJobFactory(BaseJob, JobStates) {

  /**
   * @class OfferLabelBatchJob
   * @constructor
   * @param {string} commandId
   * @param {string[]} offers
   * @param {string} label
   */
  var OfferLabelBatchJob = function (commandId, offers, label) {
    BaseJob.call(this, commandId);
    this.type = 'label_batch';
    this.events = offers;
    this.addEventsAsTask(offers);
    this.label = label;

    this.messages = {};
    this.messages[JobStates.CREATED] = getOfferLabelBatchJobDescription(this, JobStates.CREATED, JobStates);
    this.messages[JobStates.STARTED] = getOfferLabelBatchJobDescription(this, JobStates.STARTED, JobStates);
    this.messages[JobStates.FINISHED] = getOfferLabelBatchJobDescription(this, JobStates.FINISHED, JobStates);
    this.messages[JobStates.FAILED] = getOfferLabelBatchJobDescription(this, JobStates.FAILED, JobStates);
  };

  OfferLabelBatchJob.prototype = Object.create(BaseJob.prototype);
  OfferLabelBatchJob.prototype.constructor = OfferLabelBatchJob;

  OfferLabelBatchJob.prototype.addEventsAsTask = function (offers) {
    var job = this;
    _.forEach(offers, function (offer) {
      job.addTask({id: offer});
    });
  };

  OfferLabelBatchJob.prototype.getDescription = function () {
    return getOfferLabelBatchJobDescription(this, this.state, JobStates);
  };

  return (OfferLabelBatchJob);
}

function getOfferLabelBatchJobDescription (job, state, JobStates) {
  var description;

  if (state === JobStates.FAILED) {
    description = 'Labelen van items mislukt';
  } else {
    description = 'Label ' + job.events.length + ' items met "' + job.label + '"';
  }

  return description;
}
