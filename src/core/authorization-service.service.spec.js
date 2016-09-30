'use strict';

describe('AuthorizationService: ', function () {
  var $q, udbApi, authorizationService, deferredPermissions, $scope;
  var permissionsList = [
    'SWIMMINGPOOL',
    'BBQ',
    'WINE_CELLAR'
  ];

  beforeEach(module('udb.core', function($provide) {
    udbApi = jasmine.createSpyObj('udbApi', ['getMyPermissions']);
    $provide.provider('udbApi', {
      $get: function () {
        return udbApi;
      }
    });
  }));

  beforeEach(inject(function (_authorizationService_, _$q_, $rootScope) {
    authorizationService = _authorizationService_;
    $q = _$q_;

    deferredPermissions = $q.defer();
    udbApi.getMyPermissions.and.returnValue(deferredPermissions.promise);
    deferredPermissions.resolve(permissionsList);

    $scope = $rootScope.$new();
  }));

  it('should find a permission in my permissions list', function (done) {
    authorizationService
      .hasPermission('BBQ')
      .then(function(result) {
        expect(result).toEqual(true);
        done();
      });

    $scope.$apply();
  });

  it('should find not a permission in my permissions list', function (done) {
    authorizationService
      .hasPermission('MEATY_THINGS')
      .then(function(hasPermission) {
        expect(hasPermission).toEqual(false);
        done();
      });

    $scope.$apply();
  })
});
