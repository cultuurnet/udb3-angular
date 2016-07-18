'use strict';

/**
 * @typedef {Object} Label
 * @property {string}   id
 * @property {string}   name
 * @property {boolean}  isVisible
 * @property {boolean}  isPrivate
 */

/**
 * @ngdoc service
 * @name udb.management.labels
 * @description
 * # Label Manager
 * This service allows you to lookup labels and perform actions on them.
 */
angular
  .module('udb.management.labels')
  .service('LabelManager', LabelManager);

/* @ngInject */
function LabelManager(udbApi, jobLogger, BaseJob, $q) {
  var service = this;

  /**
   * @param {string} query
   * @param {int} limit
   * @param {int} start
   *
   * @return {Promise.<PagedCollection>}
   */
  service.find = function(query, limit, start) {
    return udbApi.findLabels(query, limit, start);
  };

  /**
   * @param {string|uuid} labelIdentifier
   *  The name or uuid of a label.
   * @return {Promise.<Label>}
   */
  service.get = function(labelIdentifier) {
    return udbApi.getLabelById(labelIdentifier);
  };

  /**
   * @param {string} name
   * @param {boolean} isVisible
   * @param {boolean} isPrivate
   *
   * @return {Promise.<BaseJob>}
   */
  service.create = function (name, isVisible, isPrivate) {
    return udbApi
      .createLabel(name, isVisible, isPrivate)
      .then(createNewLabelJob);
  };

  /**
   * @param {Label} label
   * @return {Promise.<BaseJob>}
   */
  service.copy = function (label) {
    return udbApi
      .createLabel(label.name, label.isVisible, label.isPrivate, label.id)
      .then(createNewLabelJob);
  };

  /**
   * @param {Label} label
   * @return {Promise.<BaseJob>}
   */
  service.delete = function (label) {
    return udbApi
      .deleteLabel(label.id)
      .then(logLabelJob);
  };

  /**
   * @param {Label} label
   * @return {Promise.<BaseJob>}
   */
  service.makeInvisible = function (label) {
    return udbApi
      .updateLabel(label.id, 'MakeInvisible')
      .then(logLabelJob);
  };

  /**
   * @param {Label} label
   * @return {Promise.<BaseJob>}
   */
  service.makeVisible = function (label) {
    return udbApi
      .updateLabel(label.id, 'MakeVisible')
      .then(logLabelJob);
  };

  /**
   *
   * @param {Label} label
   * @return {Promise.<BaseJob>}
   */
  service.makePrivate = function (label) {
    return udbApi
      .updateLabel(label.id, 'MakePrivate')
      .then(logLabelJob);
  };

  /**
   * @param {Label} label
   * @return {Promise.<BaseJob>}
   */
  service.makePublic = function (label) {
    return udbApi
      .updateLabel(label.id, 'MakePublic')
      .then(logLabelJob);
  };

  /**
   * @param {Object} commandInfo
   * @return {Promise.<BaseJob>}
   */
  function logLabelJob(commandInfo) {
    var job = new BaseJob(commandInfo.commandId);
    jobLogger.addJob(job);

    return $q.resolve(job);
  }

  /**
   * @param {Object} commandInfo
   * @return {Promise.<BaseJob>}
   */
  function createNewLabelJob(commandInfo) {
    var job = new BaseJob(commandInfo.commandId);
    job.labelId = commandInfo.uuid;
    jobLogger.addJob(job);

    return $q.resolve(job);
  }
}
