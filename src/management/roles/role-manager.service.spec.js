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
      'getRoleById',
      'getRoleLabels',
      'addLabelToRole'
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
  });

  it('should fetch the role labels', function (done) {
    var labels = [
      {
        "uuid": "3aad5023-84e2-4ba9-b1ce-201cee64504c",
        "name": "Bloso",
        "visibility": "visible",
        "privacy": "public",
        "parentUuid": "3aad5023-84e2-4ba9-b1ce-201cee64504c"
      }
    ];
    udbApi.getRoleLabels.and.returnValue($q.resolve(labels));

    function assertLabels (labels) {
      expect(labels).toEqual(labels);
      done();
    }

    service
      .getRoleLabels('blub-id')
      .then(assertLabels);

    $scope.$apply();
  });

  it('should add a label to a role', function (done) {
    var command = {
      "commandId": "8cdc13e62efaecb9d8c21d59a29b9de4"
    };
    udbApi.addLabelToRole.and.returnValue($q.resolve(command));

    function assertJob (job) {
      expect(job.id).toEqual(command.commandId);
      done();
    }

    service
      .addLabelToRole('blub-id')
      .then(assertJob);

    $scope.$apply();
  });
});