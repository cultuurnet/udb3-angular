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

    /*var deferred = $q.defer();
    deferred.resolve([
      '1c', '3e'
    ]);
    return deferred.promise;*/
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

    /*var deferred = $q.defer();
    deferred.resolve({
      commandId: 'c75003dd-cc77-4424-a186-66aa4abd917f'
    });
    return deferred.promise;*/
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
    /*var deferred = $q.defer();
    deferred.resolve([
      {
        id: '1a',
        name: 'UiTPAS Regio Aalst',
        distributionKeys: [
          {
            id: '1c',
            name: 'CC De Werf - 1,5 EUR / dag'
          },
          {
            id: '2d',
            name: 'CC De Werf - 3 EUR / dag'
          }
        ]
      },
      {
        id: '2b',
        name: 'UiTPAS Dender',
        distributionKeys: [
          {
            id: '3e',
            name: 'Dender - 1,5 EUR / dag'
          }
        ]
      }]);
    return deferred.promise;*/
  };

  function returnUnwrappedData(response) {
    return $q.resolve(response.data);
  }
}
