'use strict';

/**
 * @ngdoc service
 * @name udb.search.searchApiSwitcher
 * @description
 * # searchApiSwitcher
 * This service provides context to switch between SAPI2 and SAPI3
 */
angular
  .module('udb.search')
  .service('searchApiSwitcher', SearchApiSwitcher);

/* @ngInject */
function SearchApiSwitcher(udbApi) {
  var switcher = this;
  var apiVersion = 3;

  switcher.findOffers = function (queryString, start) {
    start = start || 0;
    return (apiVersion > 2) ? udbApi.findOffers(queryString, start) : udbApi.findEvents(queryString, start);
  };

  switcher.getDuplicateSearchConditions = function (formData) {
    var location = formData.getLocation();

    if (apiVersion > 2) {
      if (formData.isEvent) {
        /*jshint camelcase: false*/
        /*jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
        return {
          'name.\\*': formData.name.nl,
          'location.name.\\*' : location.name
        };
      }
      else {
        /*jshint camelcase: false */
        return {
          'name.\\*': formData.name.nl,
          'postalCode': formData.address.postalCode,
          'labels': 'UDB3 place'
        };
      }
    } else {
      if (formData.isEvent) {
        /*jshint camelcase: false*/
        /*jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
        return {
          text: formData.name.nl,
          location_label : location.name
        };
      }
      else {
        /*jshint camelcase: false */
        return {
          text: formData.name.nl,
          zipcode: formData.address.postalCode,
          keywords: 'UDB3 place'
        };
      }
    }
  };
}
