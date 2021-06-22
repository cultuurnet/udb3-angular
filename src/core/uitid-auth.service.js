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
function UitidAuth($window, $location, appConfig, $cookies, jwtHelper) {

  function removeCookies () {
    $cookies.remove('token');
    $cookies.remove('user');
  }

  function buildBaseUrl() {
    var baseUrl = $location.protocol() + '://' + $location.host();
    var port = $location.port();

    return (port === 80) ? baseUrl : baseUrl + ':' + port;
  }

  /**
   * Log the active user out.
   */
  this.logout = function () {
    var destination = buildBaseUrl(),
      logoutUrl = appConfig.authUrl + 'logout';

    removeCookies();

    // redirect to login page
    logoutUrl += '?destination=' + encodeURIComponent(destination);
    $window.location.href = logoutUrl;
  };

  /**
   * Login by redirecting to UiTiD
   */
  this.login = function (language) {
    var currentLocation = $location.absUrl(),
        loginUrl = appConfig.authUrl + 'connect';

    removeCookies();

    // redirect to login page
    loginUrl += '?destination=' + encodeURIComponent(currentLocation) + '&lang=' + language;
    $window.location.href = loginUrl;
  };

  this.register = function (language) {
    var currentLocation = $location.absUrl(),
        registrationUrl = appConfig.authUrl + 'register';

    removeCookies();

    // redirect to login page
    registrationUrl += '?destination=' + encodeURIComponent(currentLocation) + '&lang=' + language;
    $window.location.href = registrationUrl;
  };

  this.setToken = function (token) {
    $cookies.put('token', token);
    // When setting a new token the stored user cookie, which is used in API calls as a parameter, should be removed.
    // The next time an API call is made this user cookie will be recreated from the token cookie.
    $cookies.remove('user');
  };

  /**
   * @return {string|undefined}
   *  The JWToken of the currently logged in user or undefined.
   */
  this.getToken = function () {
    var service = this;
    var currentToken = $cookies.get('token');

    // check if a new JWT is set in the search parameters and parse it
    var queryParameters = $location.search();
    var newToken = queryParameters.jwt;

    if (newToken && newToken !== currentToken) {
      currentToken = newToken;
      service.setToken(newToken);

      if (window === window.parent) {
        // Redirect to the current URL but without jwt param, but only if the app is not running in an iframe.
        // @see https://jira.uitdatabank.be/browse/III-3408
        $location.search('jwt', null);
      }
    }

    return currentToken;
  };

  // TODO: Have this method return a promise, an event can be broadcast to keep other components updated.
  /**
   * Returns the currently logged in user
   */
  this.getUser = function () {
    return $cookies.getObject('user');
  };
}
