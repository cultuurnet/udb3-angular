'use strict';

describe('AuthorizationService: ', function () {
  var $q, udbApi, authorizationService, deferredPermissions, $scope, $rootScope;
  var permissionsList = [
    'SWIMMINGPOOL',
    'BBQ',
    'WINE_CELLAR'
  ];

  beforeEach(module('udb.core', function($provide) {
    udbApi = jasmine.createSpyObj('udbApi', ['getMyPermissions', 'getMe']);
    $provide.provider('udbApi', {
      $get: function () {
        return udbApi;
      }
    });
  }));

  beforeEach(inject(function (_authorizationService_, _$q_, _$rootScope_) {
    authorizationService = _authorizationService_;
    $q = _$q_;
    $rootScope = _$rootScope_;

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
  });

  it('should notify when a user is logged in', function (done) {
    spyOn($rootScope, '$emit');
    var userInfo = {
      name: 'dirk',
      email: 'dirk@du.de',
      externalId: '857a06e1-593d-460a-b787-6d5122e1ddc9'
    };
    udbApi.getMe.and.returnValue($q.resolve(userInfo));

    function assertEventFired() {
      expect($rootScope.$emit).toHaveBeenCalledWith('userLoggedIn', userInfo);
      done();
    }

    authorizationService
      .isLoggedIn()
      .then(assertEventFired);

    $scope.$apply();
  });
});
