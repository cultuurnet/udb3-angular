'use strict';

describe('Service: Role Manager', function () {
  var udbApi, jobLogger, BaseJob, $q, service, DeleteRoleJob, $scope;

  var baseUrl = 'http://example.com/';

  beforeEach(module('udb.core', function ($provide) {
    var appConfig = {
      baseUrl: baseUrl
    };

    $provide.constant('appConfig', appConfig);

    udbApi = jasmine.createSpyObj('udbApi', ['removeRole']);
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

  beforeEach(inject(function (_DeleteRoleJob_, RoleManager, $rootScope, _$q_, _BaseJob_) {
    DeleteRoleJob = _DeleteRoleJob_;
    service = RoleManager;
    $scope = $rootScope.$new();
    $q = _$q_;
    BaseJob = _BaseJob_;
  }));

  xit('should return a list of roles for a given query', function () {
    udbApi = jasmine.createSpyObj('udbApi', ['findRoles']);
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
    service.find.and.returnValue(expectedRoles);
    udbApi.findRoles.and.returnValue(expectedRoles);

    //expect(service.find).toHaveBeenCalled();
    //expect(udbApi.findRoles).toHaveBeenCalled();
  });

  it('should return a new DeleteRoleJob when a role is deleted', function (done) {
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