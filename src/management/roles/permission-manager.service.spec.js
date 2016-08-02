'use strict';

describe('Service: Permission Manager', function () {
  var udbApi, service, $scope, $q;

  var baseUrl = 'http://example.com/';

  beforeEach(module('udb.core', function ($provide) {
    var appConfig = {
      baseUrl: baseUrl
    };

    $provide.constant('appConfig', appConfig);

    udbApi = jasmine.createSpyObj('udbApi', [
      'getPermissions'
    ]);

    $provide.provider('udbApi', {
      $get: function () {
        return udbApi;
      }
    });

  }));

  beforeEach(inject(function (PermissionManager, $rootScope, _$q_) {
    service = PermissionManager;
    $scope = $rootScope.$new();
    $q = _$q_;
  }));

  it('should return all the permissions', function (done) {
    var expectedPermissions = [
      {
        "key": "MANAGE_USERS",
        "name": "Gebruikers beheren"
      }
    ];
    udbApi.getPermissions.and.returnValue($q.resolve(expectedPermissions));

    function assertPermissions (permissions) {
      expect(permissions).toEqual(expectedPermissions);
      done();
    }

    service
      .getAll()
      .then(assertPermissions);

    $scope.$apply();
  });

});