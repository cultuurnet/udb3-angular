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
}
