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
function LabelManager(udbApi) {
  var service = this;

  /**
   * @param {string} query
   * @param {int} limit
   * @param {int} start
   *
   * @return {Promise.<PagedCollection>}
   */
  service.find = function(query, limit, start) {
    return udbApi.findLabels(query, limit, start, true);
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
   * @return {Promise}
   */
  service.create = function (name, isVisible, isPrivate) {
    return udbApi
      .createLabel(name, isVisible, isPrivate);
  };

  /**
   * @param {Label} label
   * @return {Promise}
   */
  service.copy = function (label) {
    return udbApi
      .createLabel(label.name, label.isVisible, label.isPrivate, label.uuid);
  };

  /**
   * @param {Label} label
   * @return {Promise}
   */
  service.delete = function (label) {
    return udbApi
      .deleteLabel(label.uuid);
  };

  /**
   * @param {Label} label
   * @return {Promise}
   */
  service.makeInvisible = function (label) {
    return udbApi
      .updateLabel(label.uuid, 'MakeInvisible');
  };

  /**
   * @param {Label} label
   * @return {Promise}
   */
  service.makeVisible = function (label) {
    return udbApi
      .updateLabel(label.uuid, 'MakeVisible');
  };

  /**
   *
   * @param {Label} label
   * @return {Promise}
   */
  service.makePrivate = function (label) {
    return udbApi
      .updateLabel(label.uuid, 'MakePrivate');
  };

  /**
   * @param {Label} label
   * @return {Promise}
   */
  service.makePublic = function (label) {
    return udbApi
      .updateLabel(label.uuid, 'MakePublic');
  };
}
