'use strict';

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
   * @param {string} cdbid of the event
   *
   * @return {Promise}
   */
  this.getEventUitpasData = function(cdbid) {
    return $http
     .get(uitpasApiUrl + 'event/' + cdbid + '/distributionKeys', defaultApiConfig)
     .then(returnUnwrappedData);
  };

  /**
   * Update UiTPAS info for an event.
   * @param {Object} distributionKeys
   * @param {string} cdbid
   *
   * @return {Promise}
   */
  this.updateEventUitpasData = function(distributionKeys, cdbid) {
    return $http
     .put(uitpasApiUrl + 'event/' + cdbid + '/distributionKeys', distributionKeys, defaultApiConfig)
     .then(returnUnwrappedData);
  };

  /**
   * @param {string} organizerId of the organizer
   *
   * @return {Promise}
   */
  this.findOrganisationsCardSystems = function(organizerId) {
    return $http
     .get(uitpasApiUrl + 'organizers/' + organizerId + '/cardsystems/', defaultApiConfig)
     .then(returnUnwrappedData);
  };

  function returnUnwrappedData(response) {
    return $q.resolve(response.data);
  }
}
