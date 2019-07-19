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

  beforeEach(inject(function (RoleManager, $rootScope, _$q_) {
    service = RoleManager;
    $scope = $rootScope.$new();
    $q = _$q_;
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

    function assertAPICall (role) {
      expect(role).toEqual(role);
      done();
    }

    service
      .get('blub-id')
      .then(assertAPICall);

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
    udbApi.addPermissionToRole.and.returnValue($q.resolve());

    function assertAPICall() {
      expect(udbApi.addPermissionToRole).toHaveBeenCalledWith(
        'TEST_PERMISSION',
        '0823f57e-a6bd-450a-b4f5-8459b4b11043'
      );
      done();
    }

    service
      .addPermissionToRole('TEST_PERMISSION', '0823f57e-a6bd-450a-b4f5-8459b4b11043')
      .then(assertAPICall);

      $scope.$apply();
  });

  it('should remove a permission from a role', function(done) {
    udbApi.removePermissionFromRole.and.returnValue($q.resolve());

    function assertAPICall() {
      expect(udbApi.removePermissionFromRole).toHaveBeenCalledWith(
        'AANBOD_INVOEREN',
        '0823f57e-a6bd-450a-b4f5-8459b4b11043'
      );
      done();
    }

    service
      .removePermissionFromRole('AANBOD_INVOEREN', '0823f57e-a6bd-450a-b4f5-8459b4b11043')
      .then(assertAPICall);

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
    udbApi.updateRoleName.and.returnValue($q.resolve());

    function assertAPICall() {
      expect(udbApi.updateRoleName).toHaveBeenCalledWith('0823f57e-a6bd-450a-b4f5-8459b4b11043', 'andere rolnaam');
      done();
    }

    service
      .updateRoleName('0823f57e-a6bd-450a-b4f5-8459b4b11043', 'andere rolnaam')
      .then(assertAPICall);

    $scope.$apply();
  });

  it('should add a constraint of a role', function(done) {
    udbApi.createRoleConstraint.and.returnValue($q.resolve());

    function assertAPICall() {
      expect(udbApi.createRoleConstraint).toHaveBeenCalledWith(
        '0823f57e-a6bd-450a-b4f5-8459b4b11043',
        'v2',
        'andere constraint'
      );
      done();
    }

    service
        .createRoleConstraint('0823f57e-a6bd-450a-b4f5-8459b4b11043', 'v2', 'andere constraint')
        .then(assertAPICall);

    $scope.$apply();
  });

  it('should update the constraint of a role', function(done) {
    udbApi.updateRoleConstraint.and.returnValue($q.resolve());

    function assertAPICall() {
      expect(udbApi.updateRoleConstraint).toHaveBeenCalledWith(
        '0823f57e-a6bd-450a-b4f5-8459b4b11043',
        'v2',
        'andere constraint'
      );
      done();
    }

    service
      .updateRoleConstraint('0823f57e-a6bd-450a-b4f5-8459b4b11043', 'v2', 'andere constraint')
      .then(assertAPICall);

    $scope.$apply();
  });

  it('should remove the constraint of a role', function(done) {
    udbApi.removeRoleConstraint.and.returnValue($q.resolve());

    function assertAPICall() {
      expect(udbApi.removeRoleConstraint).toHaveBeenCalledWith('0823f57e-a6bd-450a-b4f5-8459b4b11043', 'v2');
      done();
    }

    service
        .removeRoleConstraint('0823f57e-a6bd-450a-b4f5-8459b4b11043', 'v2')
        .then(assertAPICall);

    $scope.$apply();
  });

  it('should delete a role', function (done) {
    var role = {
      uuid: 'blub-id',
      name: 'Blub'
    };
    udbApi.removeRole.and.returnValue($q.resolve());

    function assertAPICall() {
      expect(udbApi.removeRole).toHaveBeenCalledWith(role.uuid);
      done();
    }

    service
      .deleteRole(role)
      .then(assertAPICall);

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
    udbApi.addLabelToRole.and.returnValue($q.resolve());

    function assertAPICall() {
      expect(udbApi.addLabelToRole).toHaveBeenCalledWith('role-id', 'label-id');
      done();
    }

    service
      .addLabelToRole('role-id', 'label-id')
      .then(assertAPICall);

    $scope.$apply();
  });

  it('should remove a label from a role', function(done) {
    udbApi.removeLabelFromRole.and.returnValue($q.resolve());

    function assertAPICall() {
      expect(udbApi.removeLabelFromRole).toHaveBeenCalledWith(
        '0823f57e-a6bd-450a-b4f5-8459b4b11043',
        'label-id'
      );
      done();
    }

    service
      .removeLabelFromRole('0823f57e-a6bd-450a-b4f5-8459b4b11043', 'label-id')
      .then(assertAPICall);

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
