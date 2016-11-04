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
   *
   * @return {Promise.<string[]>}
   */
  this.getEventUitpasData = function(eventId) {
    return $http
      .get(uitpasApiUrl + 'events/' + eventId + '/distributionKeys/', defaultApiConfig)
      .then(returnUnwrappedData);
  };

  /**
   * Update UiTPAS info for an event.
   * @param {string[]} distributionKeys
   * @param {string} eventId
   *
   * @return {Promise.<CommandInfo>}
   */
  this.updateEventUitpasData = function(distributionKeys, eventId) {
    return $http
      .put(uitpasApiUrl + 'events/' + eventId + '/distributionKeys/', distributionKeys, defaultApiConfig)
      .then(returnUnwrappedData);
  };

  /**
   * @param {string} organizerId of the organizer
   *
   * @return {Promise.<Cardsystem[]>}
   */
  this.findOrganisationsCardSystems = function(organizerId) {
    return $http
      .get(uitpasApiUrl + 'organizers/' + organizerId + '/cardSystems/', defaultApiConfig)
      .then(returnUnwrappedData);
  };

  function returnUnwrappedData(response) {
    return $q.resolve(response.data);
  }
}
