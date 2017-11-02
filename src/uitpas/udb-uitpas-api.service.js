'use strict';

/**
 * @typedef {Object} Cardsystem
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

function UdbUitpasApi($q, $http, appConfig, uitidAuth) {
  var uitpasApiUrl = _.get(appConfig, 'uitpasUrl');
  var defaultApiConfig = {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + uitidAuth.getToken()
    },
    params: {}
  };

  /**
   * @param {string} eventId
   * @return {Promise.<CardSystem[]>}
   */
  this.getEventCardSystems = function(eventId) {
    return $http
      .get(uitpasApiUrl + 'events/' + eventId + '/cardSystems/', defaultApiConfig)
      .then(returnUnwrappedData, returnEmptyCollection);
  };

  /**
   * @param {string} organizerId of the organizer
   * @return {Promise.<Cardsystem[]>}
   */
  this.findOrganisationsCardSystems = function(organizerId) {
    return $http
      .get(uitpasApiUrl + 'organizers/' + organizerId + '/cardSystems/', defaultApiConfig)
      .then(returnUnwrappedData, returnEmptyCollection);
  };

  /**
   * @param {string} eventId
   * @param {string} cardSystemId
   * @return {Promise.<Object>}
   */
  this.addEventCardSystem = function(eventId, cardSystemId) {
    return $http
      .put(
        uitpasApiUrl + 'events/' + eventId + '/cardSystems/' + cardSystemId,
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
        uitpasApiUrl + 'events/' + eventId + '/cardSystems/' + cardSystemId + '/' + distributionKeyId,
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
}
