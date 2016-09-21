'use strict';

/**
 * @ngdoc service
 * @name udb.core.authorizationService
 * @description
 * # authorizationService
 * Service in the udb.core.
 */
angular
  .module('udb.core')
  .constant('authorization', {
    'editOffer': 'AANBOD_BEWERKEN',
    'moderateOffer': 'AANBOD_MODEREREN',
    'removeOffer': 'AANBOD_VERWIJDEREN',
    'manageOrganisations': 'ORGANISATIES_BEHEREN',
    'manageUsers': 'GEBRUIKERS_BEHEREN',
    'manageLabels': 'LABELS_BEHEREN'
  })
  .service('authorizationService', AuthorizationService);

/* @ngInject */
function AuthorizationService($q, uitidAuth, udbApi, $location) {
  this.isLoggedIn = function () {
    var deferred = $q.defer();

    var deferredUser = udbApi.getMe();
    deferredUser.then(
      function (user) {
        deferred.resolve(user);
      },
      function () {
        uitidAuth.login();

        // We are redirecting away from the current page, so no need to
        // resolve or reject the deferred.
      }
    );

    return deferred.promise;
  };

  /**
   * @param {string} path
   * @return {Promise.<boolean>}
   *  Resolves to TRUE when no user is logged in and no redirect has occurred.
   */
  this.redirectIfLoggedIn = function (path) {
    var deferredRedirect = $q.defer();

    function redirect() {
      $location.path(path);
      deferredRedirect.resolve(false);
    }

    if (uitidAuth.getToken()) {
      udbApi
        .getMe()
        .then(redirect, deferredRedirect.reject);
    } else {
      deferredRedirect.resolve(true);
    }

    return deferredRedirect.promise;
  };

  /**
   * @param {string} permission - One of the authorization constants
   */
  this.hasPermission = function (permission) {
    var deferredHasPermission = $q.defer();

    function findPermission(permissionList) {
      var foundPermission = _.find(permissionList, function(p) { return p.key === permission; });
      deferredHasPermission.resolve(foundPermission ? true : false);
    }

    udbApi
      .getMyPermissions()
      .then(findPermission, deferredHasPermission.reject);

    return deferredHasPermission.promise;
  };

  /**
   * @return RolePermission[]
   */
  this.getPermissions = function () {
    /**
     * @return RolePermission[]
     * TODO: The API response is not up to spec and contains a list of {key, value} objects
     */
    function fixAPIResponse(permissions) {
      return _.map(permissions, 'key');
    }

    return udbApi
      .getMyPermissions()
      .then(fixAPIResponse);
  };
}
