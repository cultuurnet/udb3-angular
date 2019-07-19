'use strict';

describe('Service: Role Manager', function () {
  var udbApi, jobLogger, BaseJob, $q, service, DeleteRoleJob, $scope;

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
      'addLabelToRole',
      'getRolePermissions',
      'getRoleUsers',
      'createRole',
      'addPermissionToRole',
      'removePermissionFromRole',
      'addUserToRole',
      'updateRoleName',
      'createRoleConstraint',
      'updateRoleConstraint',
      'removeRoleConstraint',
      'removeLabelFromRole',
      'removeUserFromRole'
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

  beforeEach(inject(function (_DeleteRoleJob_, RoleManager, $rootScope, _$q_, _BaseJob_) {
    DeleteRoleJob = _DeleteRoleJob_;
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
    };
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

  it('should get the permissions of a role', function (done) {
    var expectedPermissions = [
      {
        "key": "MANAGE_USERS",
        "name": "Gebruikers beheren"
      }
    ];
    udbApi.getRolePermissions.and.returnValue($q.resolve(expectedPermissions));

    function assertPermissions (permissions) {
      expect(permissions).toEqual(expectedPermissions);
      done();
    }

    service
      .getRolePermissions('blub-id')
      .then(assertPermissions);

    $scope.$apply();
  });

  it('should get the users of a role', function (done) {
    var expectedUsers = [
      {
        "uuid": "6f072ba8-c510-40ac-b387-51f582650e27",
        "email": "alberto@email.es",
        "username": "El Pistolero"
      }
    ];
    udbApi.getRoleUsers.and.returnValue($q.resolve(expectedUsers));

    function assertUsers (users) {
      expect(users).toEqual(expectedUsers);
      done();
    }

    service
      .getRoleUsers('blub-id')
      .then(assertUsers);

    $scope.$apply();
  });

  it('should create a new role', function (done) {
    var expectedRoleId = {
      roleId: "0823f57e-a6bd-450a-b4f5-8459b4b11043"
    };

    udbApi.createRole.and.returnValue($q.resolve(expectedRoleId));

    function assertNewRole (roleId) {
      expect(roleId).toEqual(expectedRoleId);
      done();
    }

    service
      .create('nieuwe rol')
      .then(assertNewRole);

    $scope.$apply();
  });

  it('should add a permission to a role', function(done) {
    var expectedCommandId = {
      commandId: '8cdc13e62efaecb9d8c21d59a29b9de4'
    };

    udbApi.addPermissionToRole.and.returnValue($q.resolve(expectedCommandId));

    function assertPermission(job) {
      expect(job.id).toEqual(expectedCommandId.commandId);
      done();
    }

    service
      .addPermissionToRole('TEST_PERMISSION', '0823f57e-a6bd-450a-b4f5-8459b4b11043')
      .then(assertPermission);

      $scope.$apply();
  });

  it('should remove a permission from a role', function(done) {
    var expectedCommandId = {
      commandId: '8cdc13e62efaecb9d8c21d59a29b9de4'
    };

    udbApi.removePermissionFromRole.and.returnValue($q.resolve(expectedCommandId));

    function assertPermission(job) {
      expect(job.id).toEqual(expectedCommandId.commandId);
      done();
    }

    service
      .removePermissionFromRole('AANBOD_INVOEREN', '0823f57e-a6bd-450a-b4f5-8459b4b11043')
      .then(assertPermission);

    $scope.$apply();
  });

  it('should add a user to a role', function(done) {
    udbApi.addUserToRole.and.returnValue($q.resolve());

    function assertAPICall() {
      expect(udbApi.addUserToRole).toHaveBeenCalledWith(
          '6f072ba8-c510-40ac-b387-51f582650e27',
          '0823f57e-a6bd-450a-b4f5-8459b4b11043'
      );
      done();
    }

    service
      .addUserToRole(
          { 'uuid': '6f072ba8-c510-40ac-b387-51f582650e27' },
          { 'uuid': '0823f57e-a6bd-450a-b4f5-8459b4b11043' }
      )
      .then(assertAPICall);

    $scope.$apply();
  });

  it('should update the name of a role', function(done) {
    var expectedCommandId = {
      commandId: "8cdc13e62efaecb9d8c21d59a29b9de4"
    };

    udbApi.updateRoleName.and.returnValue($q.resolve(expectedCommandId));

    function assertRole(job) {
      expect(job.id).toEqual(expectedCommandId.commandId);
      done();
    }

    service
      .updateRoleName('0823f57e-a6bd-450a-b4f5-8459b4b11043', 'andere rolnaam')
      .then(assertRole);

    $scope.$apply();
  });

  it('should add a constraint of a role', function(done) {
    var expectedCommandId = {
      "id": "8cdc13e62efaecb9d8c21d59a29b9de4"
    };

    udbApi.createRoleConstraint.and.returnValue($q.resolve(expectedCommandId));

    function assertRole(job) {
      expect(job.id).toEqual(expectedCommandId.commandId);
      done();
    }

    service
        .createRoleConstraint('0823f57e-a6bd-450a-b4f5-8459b4b11043', 'v2', 'andere constraint')
        .then(assertRole);

    $scope.$apply();
  });

  it('should update the constraint of a role', function(done) {
    var expectedCommandId = {
      "id": "8cdc13e62efaecb9d8c21d59a29b9de4"
    };

    udbApi.updateRoleConstraint.and.returnValue($q.resolve(expectedCommandId));

    function assertRole(job) {
      expect(job.id).toEqual(expectedCommandId.commandId);
      done();
    }

    service
      .updateRoleConstraint('0823f57e-a6bd-450a-b4f5-8459b4b11043', 'v2', 'andere constraint')
      .then(assertRole);

    $scope.$apply();
  });

  it('should remove the constraint of a role', function(done) {
    var expectedCommandId = {
      "id": "8cdc13e62efaecb9d8c21d59a29b9de4"
    };

    udbApi.removeRoleConstraint.and.returnValue($q.resolve(expectedCommandId));

    function assertRole(job) {
      expect(job.id).toEqual(expectedCommandId.commandId);
      done();
    }

    service
        .removeRoleConstraint('0823f57e-a6bd-450a-b4f5-8459b4b11043', 'v2')
        .then(assertRole);

    $scope.$apply();
  });

  it('should return a new DeleteRoleJob when a role is deleted', function (done) {
    var role = {
      uuid: 'blub-id',
      name: 'Blub'
    };
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

  it('should remove a label from a role', function(done) {
    var expectedCommandId = {
      commandId: '8cdc13e62efaecb9d8c21d59a29b9de4'
    };

    udbApi.removeLabelFromRole.and.returnValue($q.resolve(expectedCommandId));

    function assertCommand(job) {
      expect(job.id).toEqual(expectedCommandId.commandId);
      expect(udbApi.removeLabelFromRole).toHaveBeenCalledWith(
        '0823f57e-a6bd-450a-b4f5-8459b4b11043',
        'label-id'
      );
      done();
    }

    service
      .removeLabelFromRole('0823f57e-a6bd-450a-b4f5-8459b4b11043', 'label-id')
      .then(assertCommand);

    $scope.$apply();
  });

  it('should remove a user from a role', function(done) {
    var user = {
      'uuid': '6f072ba8-c510-40ac-b387-51f582650e27',
      'email': 'alberto@email.es',
      'username': 'El Pistolero'
    };
    var role = {
      'uuid': '4bd7dc40-4571-4469-b52c-c5481885bc27',
      'name': 'godmode',
      'constraint': '*:*'
    };

    udbApi.removeUserFromRole.and.returnValue($q.resolve());

    function assertAPICall() {
      expect(udbApi.removeUserFromRole).toHaveBeenCalledWith(
        '4bd7dc40-4571-4469-b52c-c5481885bc27',
        '6f072ba8-c510-40ac-b387-51f582650e27'
      );
      done();
    }

    service
      .removeUserFromRole(role, user)
      .then(assertAPICall);

    $scope.$apply();
  });
});
