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
function UitidAuth($window, $location, $http, appConfig, $cookieStore) {
  /**
   * Log the active user out.
   */
  this.logout = function () {
    var logoutUrl = appConfig.baseUrl + 'uitid/logout',
      request = $http.get(logoutUrl, {
        withCredentials: true
      });

    request.then(function () {
      $cookieStore.remove('user');
      $location.path('/');
    });

    return request;
  };

  /**
   * Login by redirecting to UiTiD
   */
  this.login = function () {
    var currentLocation = $location.absUrl(),
        authUrl = appConfig.authUrl;

    authUrl += '?destination=' + currentLocation;
    $window.location.href = authUrl;
  };

  // TODO: Have this method return a promise, an event can be broadcast to keep other components updated.
  /**
   * Returns the currently logged in user
   */
  this.getUser = function () {
    return $cookieStore.get('user');
  };

  this.getToken = function () {
    return 'foo';
  };
}
