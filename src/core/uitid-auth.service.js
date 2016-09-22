'use strict';

/**
 * @ngdoc service
 * @name udb.core.uitidAuth
 * @description
 * # uitidAuth
 * Service in the udb.core.
 */
angular
  .module('udb.core')
  .service('uitidAuth', UitidAuth);

/* @ngInject */
function UitidAuth($window, $location, appConfig, $cookieStore) {
  /**
   * Log the active user out.
   */
  this.logout = function () {
    $cookieStore.remove('token');
    $cookieStore.remove('user');
    // reset url
    $location.search('');
    $location.path('/');
  };

  /**
   * Login by redirecting to UiTiD
   */
  this.login = function () {
    var currentLocation = $location.absUrl(),
        authUrl = appConfig.authUrl;

    // remove cookies
    $cookieStore.remove('token');
    $cookieStore.remove('user');

    // redirect to login page
    authUrl += '?destination=' + currentLocation;
    $window.location.href = authUrl;
  };

  this.setToken = function (token) {
    $cookieStore.put('token', token);
  };

  /**
   * @return {string|undefined}
   *  The JWToken of the currently logged in user or undefined.
   */
  this.getToken = function () {
    var service = this;
    var currentToken = $cookieStore.get('token');

    // check if a new JWT is set in the search parameters and parse it
    var queryParameters = $location.search();
    var newToken = queryParameters.jwt;

    if (newToken && newToken !== currentToken) {
      currentToken = newToken;
      service.setToken(newToken);
      $location.search('jwt', null);
    }

    return currentToken;
  };

  // TODO: Have this method return a promise, an event can be broadcast to keep other components updated.
  /**
   * Returns the currently logged in user
   */
  this.getUser = function () {
    return $cookieStore.get('user');
  };
}
