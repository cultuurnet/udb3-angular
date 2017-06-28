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
function SearchApiSwitcher(appConfig, udbApi, $cookies, sapi2QueryBuilder, LuceneQueryBuilder) {
  var switcher = this;
  var apiVersionCookieKey = 'search-api-version';
  var defaultApiVersion = _.get(appConfig, 'search.defaultApiVersion', "2");

  /**
   * @returns {Number}
   */
  function getApiVersion() {
    return parseInt($cookies.get(apiVersionCookieKey) || initApiVersion(defaultApiVersion));
  }

  /**
   * @param {string} searchApiVersion
   * @returns {string}
   */
  function initApiVersion(searchApiVersion) {
    $cookies.put(apiVersionCookieKey, searchApiVersion);

    return searchApiVersion;
  }

  /**
   * @param {string} queryString
   * @param {number} start
   * @returns {Promise.<PagedCollection>}
   */
  switcher.findOffers = function (queryString, start) {
    start = start || 0;
    return (getApiVersion() > 2) ? udbApi.findOffers(queryString, start) : udbApi.findEvents(queryString, start);
  };

  /**
   * @param {EventFormData} formData
   * @returns {object}
   */
  switcher.getDuplicateSearchConditions = function (formData) {
    var location = formData.getLocation();

    if (getApiVersion() > 2) {
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

  /**
   * @returns {object}
   *  An angular directive definition object.
   */
  switcher.getQueryEditorFieldDefinition = function() {
    if (getApiVersion() > 2) {
      return {
        templateUrl: 'templates/query-editor-field.directive.html',
        restrict: 'E',
        controller: 'QueryEditorFieldController'
      };
    } else {
      return {
        templateUrl: 'templates/sapi2.query-editor-field.directive.html',
        restrict: 'E',
        controller: 'sapi2QueryEditorFieldController'
      };
    }
  };

  /**
   * @returns {string}
   *  A query editor controller name.
   */
  switcher.getQueryEditorController = function() {
    if (getApiVersion() > 2) {
      return 'QueryEditorController';
    } else {
      return 'sapi2QueryEditorController';
    }
  };

  /**
   * @returns {object}
   *  A query builder instance.
   */
  switcher.getQueryBuilder = function () {
    if (getApiVersion() > 2) {
      return LuceneQueryBuilder;
    } else {
      return sapi2QueryBuilder;
    }
  };
}
