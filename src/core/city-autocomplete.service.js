'use strict';

/**
 * @ngdoc service
 * @name udb.core.CityAutocomplete
 * @description
 * Service for city autocompletes.
 */
angular
  .module('udb.core')
  .service('cityAutocomplete', CityAutocomplete);

/* @ngInject */
function CityAutocomplete($q, $http, appConfig, UdbPlace, jsonLDLangFilter) {
  /**
   *
   * Get the places for a city
   *
   * @param {string} zipcode
   * @param {string} country
   * @param {string} freeTextSearch
   * @returns {Promise}
   */
  this.getPlacesByZipcode = function(zipcode, country, freeTextSearch) {
    var deferredPlaces = $q.defer();
    var url = appConfig.baseUrl + 'places/';
    var asyncPlaceSuggestionsFeatureToggle = appConfig.asyncPlaceSuggestionsFeatureToggle;
    var config = {
      headers: {
        'X-Api-Key': _.get(appConfig, 'apiKey')
      },
      params: {
        'postalCode': zipcode,
        'addressCountry': country,
        'workflowStatus': 'DRAFT,READY_FOR_VALIDATION,APPROVED',
        'disableDefaultFilters': true,
        'embed': true,
        'limit': (asyncPlaceSuggestionsFeatureToggle) ? 1000 : 3000,
        'sort[created]': 'asc'
      }
    };

    // Add extra param to config if the free text search is defined
    if (freeTextSearch) {
      config.params.text = '*' + freeTextSearch + '*';
    }

    var parsePagedCollection = function (response) {
      var locations = _.map(response.data.member, function (placeJson) {
        var place = new UdbPlace(placeJson);
        return jsonLDLangFilter(place, 'nl');
      });

      deferredPlaces.resolve(locations);
    };

    var failed = function () {
      deferredPlaces.reject('something went wrong while getting places for city with zipcode: ' + zipcode);
    };

    $http.get(url, config).then(parsePagedCollection, failed);

    return deferredPlaces.promise;
  };

  /**
   *
   * Get the places for a city
   *
   * @param {string} city
   * @param {string} country
   * @returns {Promise}
   */
  this.getPlacesByCity = function(city, country) {

    var deferredPlaces = $q.defer();
    var url = appConfig.baseUrl + 'places/';
    var config = {
      headers: {
        'X-Api-Key': _.get(appConfig, 'apiKey')
      },
      params: {
        'q': 'address.\\*.addressLocality:' + city,
        'addressCountry': country,
        'workflowStatus': 'DRAFT,READY_FOR_VALIDATION,APPROVED',
        'disableDefaultFilters': true,
        'embed': true,
        'limit': 1000,
        'sort[created]': 'asc'
      }
    };

    var parsePagedCollection = function (response) {
      var locations = _.map(response.data.member, function (placeJson) {
        var place = new UdbPlace(placeJson);
        return jsonLDLangFilter(place, 'nl');
      });

      deferredPlaces.resolve(locations);
    };

    var failed = function () {
      deferredPlaces.reject('something went wrong while getting places for city with city: ' + city);
    };

    $http.get(url, config).then(parsePagedCollection, failed);

    return deferredPlaces.promise;
  };

  /**
   *
   * Get place by id
   *
   * @param {string} id
   * @returns {Promise}
   */
  this.getPlaceById = function(id) {

    var deferredPlace = $q.defer();
    var url = appConfig.baseUrl + 'place/' + id;
    var config = {
      headers: {
        'X-Api-Key': _.get(appConfig, 'apiKey')
      }
    };

    var parsePagedCollection = function (response) {
      var location = new UdbPlace(response.data);
      location = jsonLDLangFilter(location, 'nl');

      deferredPlace.resolve(location);
    };

    var failed = function () {
      deferredPlace.reject('something went wrong while getting place by id with id: ' + id);
    };

    $http.get(url, config).then(parsePagedCollection, failed);

    return deferredPlace.promise;
  };

}
