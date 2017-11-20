'use strict';

/**
 * @typedef {Object} CardSystem
 * @property {string} id
 *  a number serialized as a string
 * @property {string} name
 * @property {DistributionKey[]} distributionKeys
 */

/**
 * @typedef {Object} DistributionKey
 * @property {string} id
 *  a number serialized as a string
 * @property {string} name
 *  the name of the key including the price, eg: "CC De Werf - 1,5 EUR / dag"
 */

angular
  .module('udb.uitpas')
  .service('udbUitpasApi', UdbUitpasApi);

function UdbUitpasApi($q, $http, appConfig, uitidAuth, $timeout, moment) {
  var uitpasApiUrl = _.get(appConfig, 'uitpasUrl');
  var uitpasMaxDelay = _.get(appConfig, 'uitpasMaxDelay', 8);
  var defaultApiConfig = {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + uitidAuth.getToken()
    },
    params: {}
  };

  /**
   * Events are automatically registered by UiTPAS but there can be some delay.
   * In the meantime the UiTPAS API will not known about the event.
   * Make sure to poke UiTPAS a few times before giving up.
   *
   * An empty collection is returned if UiTPAS repeatedly fails on an event.
   *
   * @param {string} eventId
   * @return {Promise.<CardSystem[]>}
   */
  this.getEventCardSystems = function(eventId) {
    function request () {
      return $http.get(uitpasApiUrl + 'events/' + eventId + '/cardSystems/', defaultApiConfig);
    }

    var until = moment().add(uitpasMaxDelay, 's');

    return retry(request, 2, until).then(returnCardSystemCollection);
  };

  /**
   * @param {string} organizerId of the organizer
   * @return {Promise.<CardSystem[]>}
   */
  this.findOrganisationsCardSystems = function(organizerId) {
    return $http
      .get(uitpasApiUrl + 'organizers/' + organizerId + '/cardSystems/', defaultApiConfig)
      .then(returnCardSystemCollection, returnEmptyCollection);
  };

  function returnCardSystemCollection(response) {
    return $q.resolve(_.values(response.data));
  }

  /**
   * @param {string} eventId
   * @param {string} cardSystemId
   * @return {Promise.<Object>}
   */
  this.addEventCardSystem = function(eventId, cardSystemId) {
    return $http
      .put(
        uitpasApiUrl + 'events/' + eventId + '/cardSystems/' + cardSystemId,
        null,
        defaultApiConfig
      )
      .then(returnUnwrappedData);
  };

  /**
   * @param {string} eventId
   * @param {string} cardSystemId
   * @return {Promise.<Object>}
   */
  this.removeEventCardSystem = function(eventId, cardSystemId) {
    return $http
      .delete(
        uitpasApiUrl + 'events/' + eventId + '/cardSystems/' + cardSystemId,
        defaultApiConfig
      )
      .then(returnUnwrappedData);
  };

  /**
   * @param {string} eventId
   * @param {string} cardSystemId
   * @param {string} distributionKeyId
   * @return {Promise.<Object>}
   */
  this.addEventCardSystemDistributionKey = function(eventId, cardSystemId, distributionKeyId) {
    return $http
      .put(
        uitpasApiUrl + 'events/' + eventId + '/cardSystems/' + cardSystemId + '/distributionKey/' + distributionKeyId,
        null,
        defaultApiConfig
      )
      .then(returnUnwrappedData);
  };

  function returnUnwrappedData(response) {
    return $q.resolve(response.data);
  }

  function returnEmptyCollection() {
    return $q.resolve([]);
  }

  /**
   * @param {function} repeatable
   *  A promise returning function without arguments.
   *
   * @param {number} delay
   *  The number of seconds to delay after a response before firing a consecutive request.
   *
   * @param {moment} limit
   *  The moment that marks the time limit.
   */
  function retry(repeatable, delay, limit) {
    function retryLater(error) {
      return moment().add(delay, 'seconds').isAfter(limit) ?
        $q.reject(error) :
        $timeout(function () {
          return retry(repeatable, delay, limit);
        }, delay);
    }

    return repeatable().catch(retryLater);
  }
}
