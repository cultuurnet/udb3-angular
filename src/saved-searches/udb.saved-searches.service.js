'use strict';

/**
 * @ngdoc service
 * @name udb.saved-searches.savedSearchesService
 * @description
 * # savedSearchesService
 * Service in udb.saved-searches.
 */
angular
  .module('udb.saved-searches')
  .service('savedSearchesService', SavedSearchesService);

/* @ngInject */
function SavedSearchesService($q, $http, $cookies, appConfig, $rootScope, udbApi, searchApiSwitcher) {
  var apiUrl = appConfig.baseUrl;
  var defaultApiConfig = {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  var savedSearches = [];
  var ss = this;
  var sapiVersion = getSapiVersion();

  ss.createSavedSearch = function(name, query) {
    return udbApi.createSavedSearch(name, query).then(function () {
      savedSearches.push({'name': name, 'query': query});
      savedSearchesChanged();

      return $q.resolve();
    });
  };

  ss.getSavedSearches = function () {
    return udbApi.getSavedSearches().then(function (data) {
      savedSearches = data;
      return $q.resolve(data);
    });
  };

  ss.deleteSavedSearch = function (searchId) {
    return udbApi.deleteSavedSearch(searchId).then(function () {
      _.remove(savedSearches, {id: searchId});
      savedSearchesChanged();

      return $q.resolve();
    });
  };

  function savedSearchesChanged () {
    $rootScope.$emit('savedSearchesChanged', savedSearches);
  }

  /**
   * @returns {String}
   */
  function getSapiVersion() {
    return 'v' + searchApiSwitcher.getApiVersion();
  }
}

