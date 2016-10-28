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
    this.removeCookies();

    // reset url
    $location.search('');
    $location.path('/');
  };

  this.removeCookies = function () {
    $cookieStore.remove('token');
    $cookieStore.remove('user');
  };

  /**
   * Login by redirecting to UiTiD
   */
  this.login = function () {
    var currentLocation = $location.absUrl(),
        loginUrl = appConfig.authUrl + 'connect';

    this.removeCookies();

    // redirect to login page
    loginUrl += '?destination=' + currentLocation;
    $window.location.href = loginUrl;
  };

  this.register = function () {
    var currentLocation = $location.absUrl(),
        registrationUrl = appConfig.authUrl + 'register';

    this.removeCookies();

    // redirect to login page
    registrationUrl += '?destination=' + currentLocation;
    $window.location.href = registrationUrl;
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
