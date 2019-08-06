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
function SearchApiSwitcher(appConfig, udbApi, $cookies) {
  var switcher = this;
  var apiVersionCookieKey = 'search-api-version';
  var defaultApiVersion = _.get(appConfig, 'search.defaultApiVersion', '2');
  switcher.getApiVersion = getApiVersion;

  /**
   * @returns {Number}
   */
  function getApiVersion() {
    return parseInt($cookies.get(apiVersionCookieKey) || defaultApiVersion);
  }

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
        controller: 'QueryEditorFieldController'
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
}
