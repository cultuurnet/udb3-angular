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
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + uitidAuth.getToken(),
      'X-Api-Key': _.get(appConfig, 'apiKey')
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
   * getTicketSales
   * @param {string} eventId
   * @param {Organizer} organizer
   * @return {Promise.<hasTicketSales>}
   */
  this.getTicketSales = function(eventId, organizer) {
    var deferred = $q.defer();
    var until = moment().add(uitpasMaxDelay, 's');

    function request () {
      return $http.get(uitpasApiUrl + 'events/' + eventId, defaultApiConfig);
    }

    function returnTicketSales(response) {
      return response.data.hasTicketSales;
    }

    if (organizer.isUitpas) {
      deferred.resolve(retry(request, 2, until).then(returnTicketSales));
    } else {
      deferred.resolve(false);
    }

    return deferred.promise;
  };

  /**
   * @param {string} organizerId of the organizer
   * @return {Promise.<CardSystem[]>}
   */
  this.findOrganisationsCardSystems = function(organizerId) {
    return $http
      .get(uitpasApiUrl + 'organizers/' + organizerId + '/cardSystems/', defaultApiConfig)
      .then(returnCardSystemCollection);
  };

  /**
   * @param {CardSystem} cardSystem
   * @returns {CardSystem}
   */
  function convertDistributionKeysToList(cardSystem) {
    if ('object' === typeof cardSystem.distributionKeys) {
      cardSystem.distributionKeys = _.values(cardSystem.distributionKeys);
    }

    return cardSystem;
  }

  /**
   * @param {object} response
   *  Angular HTTP response
   * @return {CardSystem[]}
   */
  function returnCardSystemCollection(response) {
    var cardSystemCollection = 'object' === typeof response.data ? _.values(response.data) : response.data;
    return $q.resolve(_.map(cardSystemCollection, convertDistributionKeysToList));
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
