'use strict';

describe('Service: Role Manager', function () {
  var udbApi, jobLogger, BaseJob, $q, service, $scope;

  var baseUrl = 'http://example.com/';

  beforeEach(module('udb.core', function ($provide) {
    var appConfig = {
      baseUrl: baseUrl
    };

    $provide.constant('appConfig', appConfig);

    udbApi = jasmine.createSpyObj('udbApi', [
      'removeRole',
      'findRoles',
      'getRoleById'
    ]);
    $provide.provider('udbApi', {
      $get: function () {
        return udbApi;
      }
    });

    jobLogger = jasmine.createSpyObj('jobLogger', ['addJob']);
    $provide.provider('jobLogger', {
      $get: function () {
        return jobLogger;
      }
    });
  }));

  beforeEach(inject(function (RoleManager, $rootScope, _$q_, _BaseJob_) {
    service = RoleManager;
    $scope = $rootScope.$new();
    $q = _$q_;
    BaseJob = _BaseJob_;
  }));

  it('should return a list of roles for a given query', function (done) {
    var expectedRoles = {
      "itemsPerPage": 10,
      "member": [
        {
          "uuid": "3",
          "name": "test rol 3"
        },
        {
          "uuid": "1",
          "name": "test rol"
        },
        {
          "uuid": "2",
          "name": "test rol 2"
        }
      ],
      "totalItems": "3"
    };
    udbApi.findRoles.and.returnValue($q.resolve(expectedRoles));

    function assertResultset (result) {
      expect(result).toEqual(expectedRoles);
      done();
    }

    service
      .find('', 10, 0)
      .then(assertResultset);

    $scope.$apply();
  });

  it('should fetch a role', function (done) {
    var role = {
      uuid: 'blub-id',
      name: 'Blub'
    }
    udbApi.getRoleById.and.returnValue($q.resolve(role));

    function assertRole (role) {
      expect(role).toEqual(role);
      done();
    }

    service
      .get('blub-id')
      .then(assertRole);

    $scope.$apply();
  });

  xit('should return a new DeleteRoleJob when a role is deleted', function (done) {
    var role = {
      uuid: 'blub-id',
      name: 'Blub'
    }
    udbApi.removeRole.and.returnValue($q.resolve({commandId: 'blubblub'}));

    function assertJobCreation (job) {
      expect(job.role).toEqual(role);
      expect(job.id).toEqual('blubblub');
      done();
    }

    service
      .deleteRole(role)
      .then(assertJobCreation);

    $scope.$apply();
  })
});