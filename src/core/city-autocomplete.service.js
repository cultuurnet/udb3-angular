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
   * @returns {Promise}
   */
  this.getPlacesByZipcode = function(zipcode, country) {

    var deferredPlaces = $q.defer();
    var url = appConfig.baseUrl + 'places/';
    var config = {
      headers: {
        'X-Api-Key': _.get(appConfig, 'apiKey')
      },
      params: {
        'postalCode': zipcode,
        'addressCountry': country,
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

}
