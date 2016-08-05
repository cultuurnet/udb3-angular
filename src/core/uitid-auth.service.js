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

  this.getToken = function () {
    return $cookieStore.get('token');
  };

  // TODO: Have this method return a promise, an event can be broadcast to keep other components updated.
  /**
   * Returns the currently logged in user
   */
  this.getUser = function () {
    return $cookieStore.get('user');
  };
}
