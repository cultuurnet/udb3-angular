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
function SavedSearchesService($q, $http, $cookies, appConfig, $rootScope, udbApi) {
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
    return udbApi.createSavedSearch(sapiVersion, name, query).then(function () {
      savedSearches.push({'sapiVersion': sapiVersion, 'name': name, 'query': query});
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
    return udbApi.deleteSavedSearch(sapiVersion, searchId).then(function () {
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
    var apiVersionCookieKey = 'search-api-version';
    var defaultApiVersion = _.get(appConfig, 'search.defaultApiVersion', '2');

    return 'v' + ($cookies.get(apiVersionCookieKey) || defaultApiVersion);
  }
}

