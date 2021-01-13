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
function SavedSearchesService($q, $http, $cookies, appConfig, $rootScope, udbApi, $translate) {
  var savedSearches = [];
  var ss = this;

  ss.createSavedSearch = function(name, query) {
    return udbApi.createSavedSearch(name, query).then(function () {
      savedSearches.push({'name': name, 'query': query});
      savedSearchesChanged();

      return $q.resolve();
    });
  };

  ss.getSavedSearches = function () {
    return udbApi.getSavedSearches().then(function (data) {
      var withTranslation = data.map(function (savedSearch) {
        var key = 'search.savedSearches.items.' + savedSearch.name.toString();
        var translated = $translate.instant(key);
        if (translated !== key) {
          savedSearch.name = translated;
        }
        return savedSearch;
      });
      savedSearches = withTranslation;
      return $q.resolve(withTranslation);
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
}

