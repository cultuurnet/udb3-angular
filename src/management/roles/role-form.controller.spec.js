'use strict';

describe('Controller: Roles Form', function() {
  var
    RoleManager,
    PermissionManager,
    Usermanager,
    $uibModal,
    $state,
    $stateParams,
    jsonLDLangFilter,
    $q,
    $rootScope,
    $scope,
    $controller;

  var id = "3aad5023-84e2-4ba9-b1ce-201cee64504c";

  var rolePermissions = [
    {key: "AANBOD_BEWERKEN", name: "Aanbod bewerken"},
    {key: "AANBOD_INVOEREN", name: "Aanbod invoeren"},
    {key: "AANBOD_MODEREREN", name: "Aanbod modereren"},
    {key: "AANBOD_VERWIJDEREN", name: "Aanbod verwijderen"}
  ];

  var roleUsers = [
    {
      "uuid": "6f072ba8-c510-40ac-b387-51f582650e27",
      "email": "alberto@email.es",
      "username": "El Pistolero"
    }
  ];

  var role = {
    "uuid": id,
    "name": { nl:"Beheerder west-vlaanderen" },
    "constraint": "city:leuven"
  };

  var expectedRole = {
    "uuid": id,
    "name": "Beheerder west-vlaanderen",
    "constraint": "city:leuven",
    "permissions": {
      "AANBOD_BEWERKEN": true,
      "AANBOD_INVOEREN": true,
      "AANBOD_MODEREREN": true,
      "AANBOD_VERWIJDEREN": true
    },
    "users": [
      {
        "uuid": "6f072ba8-c510-40ac-b387-51f582650e27",
        "email": "alberto@email.es",
        "username": "El Pistolero"
      }
    ],
    "labels": []
  };

  var allPermissions = [
    {
      "key": "MANAGE_USERS",
      "name": "Gebruikers beheren"
    }
  ];

  beforeEach(module('udb.management'));
  beforeEach(module('udb.management.roles'));

  beforeEach(inject(function(_$rootScope_, _$q_, _$controller_, $injector) {
    $controller = _$controller_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    jsonLDLangFilter = $injector.get('jsonLDLangFilter');

    RoleManager = jasmine.createSpyObj('RoleManager', [
      'find',
      'get',
      'getRolePermissions',
      'getRoleUsers',
      'create',
      'addPermissionToRole',
      'removePermissionFromRole',
      'addUserToRole',
      'updateRoleName',
      'updateRoleConstraint',
      'addLabelToRole',
      'getRoleLabels'
    ]);

    PermissionManager = jasmine.createSpyObj('PermissionManager', ['getAll']);
    Usermanager = jasmine.createSpyObj('UserManager', ['find', 'findUserWithEmail']);
    $uibModal = jasmine.createSpyObj('$uibModal', ['open']);
  }));

  function getController() {
    return $controller(
      'RoleFormController', {
        RoleManager: RoleManager,
        PermissionManager: PermissionManager,
        UserManager: Usermanager,
        $uibModal: $uibModal,
        $state: $state,
        $stateParams: $stateParams,
        jsonLDLangFilter: jsonLDLangFilter,
        $q: $q
      }
    );
  }

  function getMockups() {
    RoleManager.getRolePermissions.and.returnValue($q.resolve(rolePermissions));
    RoleManager.getRoleUsers.and.returnValue($q.resolve(roleUsers));
    RoleManager.getRoleLabels.and.returnValue($q.resolve([]));
    PermissionManager.getAll.and.returnValue($q.resolve(allPermissions));
    RoleManager.get.and.returnValue($q.resolve(role));
  }

  it('should load a role', function() {
    getMockups();

    $stateParams = { "id": id };

    var editor = getController();

    $scope.$digest();

    expect(RoleManager.get).toHaveBeenCalledWith(id);
    expect(editor.role).toEqual(expectedRole);
  });

  it('should load all the permissions', function() {
    getMockups();

    $stateParams = { "id": id };

    var editor = getController();

    $scope.$digest();
    expect(PermissionManager.getAll).toHaveBeenCalled();
    expect(editor.permissions).toEqual(allPermissions);
  });

  it('should load the role permissions', function() {
    getMockups();

    $stateParams = { "id": id };

    var editor = getController();

    $scope.$digest();
    expect(RoleManager.getRolePermissions).toHaveBeenCalled();
    expect(editor.role.permissions).toEqual(expectedRole.permissions);
  });

  it('should update the name of the role', function() {
    getMockups();

    $stateParams = { "id": id};

    var editor = getController();

    $scope.$digest();
    editor.role.name = "Andere naam";
    RoleManager.updateRoleName.and.returnValue($q.resolve());

    editor.save();

    expect(RoleManager.updateRoleName).toHaveBeenCalled();
  });

  it('should update the constraint of the role', function() {
    getMockups();

    $stateParams = { "id": id};

    var editor = getController();

    $scope.$digest();
    editor.role.constraint = "Ander constraint";
    RoleManager.updateRoleConstraint.and.returnValue($q.resolve());

    editor.save();

    expect(RoleManager.updateRoleConstraint).toHaveBeenCalled();
  });

  it('should add a permission to a role', function() {
    getMockups();

    $stateParams = { "id": id };

    var editor = getController();

    $scope.$digest();
    editor.role.permissions = {
      "AANBOD_BEWERKEN": true,
      "AANBOD_INVOEREN": true,
      "AANBOD_MODEREREN": true,
      "AANBOD_VERWIJDEREN": true,
      "ORGANISATIES_BEHERER": true
    };

    RoleManager.addPermissionToRole.and.returnValue($q.resolve());

    editor.save();

    expect(RoleManager.addPermissionToRole).toHaveBeenCalled();
  });

  it('should remove a permission from a role', function() {
    getMockups();

    $stateParams = { "id": id };

    var editor = getController();

    $scope.$digest();
    editor.role.permissions = {
      "AANBOD_BEWERKEN": true,
      "AANBOD_INVOEREN": true,
      "AANBOD_MODEREREN": true,
      "AANBOD_VERWIJDEREN": false
    };

    RoleManager.removePermissionFromRole.and.returnValue($q.resolve());

    editor.save();

    expect(RoleManager.removePermissionFromRole).toHaveBeenCalled();
  });

  it('should add a user to a role', function() {
    getMockups();

    $stateParams = { "id": id };

    var editor = getController();

    var addUsers = [
      {
        "uuid": "6f072ba8-c510-40ac-b387-51f582650e27",
        "email": "alberto@email.es",
        "username": "El Pistolero"
      },
      {
        "uuid": "123456",
        "email": "alberto2@email.es",
        "username": "El Pistolerosss"
      }
    ];

    $scope.$digest();
    editor.role.users = addUsers;

    RoleManager.addUserToRole.and.returnValue($q.resolve());

    editor.save();

    expect(RoleManager.addUserToRole).toHaveBeenCalled();
  });

  it('should add a user to a role list', function() {
    getMockups();

    $stateParams = { "id": id };

    var editor = getController();

    $scope.$digest();
    editor.role.users = [];

    Usermanager.findUserWithEmail.and.returnValue($q.resolve({
      "uuid": "6f072ba8-c510-40ac-b387-51f582650e27",
      "email": "blub@example.com",
      "username": "El Pistolero"
    }));

    editor.form = {
        email: {
        $setViewValue: function (blub) {},
        $setPristine: function (blub) {},
        $render: function () {}
      }
    };
    editor.email = "blub@example.com";
    editor.addUser();
    $scope.$digest();

    expect(Usermanager.findUserWithEmail).toHaveBeenCalledWith("blub@example.com");
    expect(editor.role.users.length).toEqual(1);
  });

  it('should it should not add the same user twice to the list', function() {
    getMockups();

    $stateParams = { "id": id };

    var editor = getController();

    $scope.$digest();
    editor.role.users = [
      {
        "uuid": "6f072ba8-c510-40ac-b387-51f582650e27",
        "email": "blub@example.com",
        "username": "El Pistolero"
      }
    ];

    Usermanager.findUserWithEmail.and.returnValue($q.resolve({
      "uuid": "6f072ba8-c510-40ac-b387-51f582650e27",
      "email": "blub@example.com",
      "username": "El Pistolero"
    }));

    editor.form = {
        email: {
        $setViewValue: function (blub) {},
        $setPristine: function (blub) {},
        $render: function () {}
      }
    };
    editor.email = "blub@example.com";
    editor.addUser();
    $scope.$digest();

    expect(Usermanager.findUserWithEmail).toHaveBeenCalledWith("blub@example.com");
    expect(editor.role.users.length).toEqual(1);
    expect($uibModal.open).toHaveBeenCalled();
    expect(editor.errorMessage).toEqual('De gebruiker hangt al aan deze rol.');
  });

  it('should show a loading error', function() {
    RoleManager.getRolePermissions.and.returnValue($q.resolve(rolePermissions));
    RoleManager.getRoleUsers.and.returnValue($q.resolve(roleUsers));
    RoleManager.getRoleLabels.and.returnValue($q.resolve([]));
    PermissionManager.getAll.and.returnValue($q.resolve(allPermissions));
    RoleManager.get.and.returnValue($q.reject({
      title: 'Could not be found.'
    }));

    $stateParams = { "id": id };

    var editor = getController();
    $scope.$digest();

    expect($uibModal.open).toHaveBeenCalled();
    expect(editor.errorMessage).toEqual(
      'De rol kon niet gevonden worden. Could not be found.'
    );
  });

  it('should add a label to a role', function() {
    RoleManager.getRolePermissions.and.returnValue($q.resolve([]));
    RoleManager.getRoleUsers.and.returnValue($q.resolve([]));
    RoleManager.getRoleLabels.and.returnValue($q.resolve([]));
    PermissionManager.getAll.and.returnValue($q.resolve(allPermissions));
    RoleManager.get.and.returnValue($q.resolve(role));
    RoleManager.addLabelToRole.and.returnValue($q.resolve());

    var label = {
      id: 'label-uuid',
      name: 'Mijn label'
    };

    $stateParams = { "id": id };

    var editor = getController();
    $scope.$digest();

    editor.addLabel(label);
    $scope.$digest();

    expect(RoleManager.addLabelToRole).toHaveBeenCalledWith(id, label.id);
  });

  it('should load all permissions without a roleId', function() {
    PermissionManager.getAll.and.returnValue($q.resolve(allPermissions));

    $stateParams = {};

    var editor = getController();
    $scope.$digest();

    expect(RoleManager.get).not.toHaveBeenCalled();
    expect(RoleManager.getRolePermissions).not.toHaveBeenCalled();
    expect(RoleManager.getRoleUsers).not.toHaveBeenCalled();
    expect(PermissionManager.getAll).toHaveBeenCalled();
    expect(editor.permissions).toEqual(allPermissions);
  });

  it('should create a role when no roleId specified', function() {
    PermissionManager.getAll.and.returnValue($q.resolve(allPermissions));
    RoleManager.create.and.returnValue($q.resolve({
      roleId: 'uuid-test123'
    }));

    $stateParams = {};

    var editor = getController();
    $scope.$digest();

    editor.role.name = 'Test123';
    editor.createRole();

    $scope.$digest();

    expect(RoleManager.create).toHaveBeenCalledWith('Test123');
    expect(editor.role['@id']).toEqual('uuid-test123');
    expect(editor.originalRole['@id']).toEqual('uuid-test123');
  });

  it('should load the role labels', function() {
    var labels = [{
      id: 'label-uuid',
      name: 'Mijn label'
    }];
    RoleManager.getRolePermissions.and.returnValue($q.resolve([]));
    RoleManager.getRoleUsers.and.returnValue($q.resolve([]));
    RoleManager.getRoleLabels.and.returnValue($q.resolve(labels));
    PermissionManager.getAll.and.returnValue($q.resolve(allPermissions));
    RoleManager.get.and.returnValue($q.resolve(role));


    $stateParams = { "id": id };

    var editor = getController();
    $scope.$digest();

    expect(RoleManager.getRoleLabels).toHaveBeenCalledWith(id);
    expect(editor.role.labels).toEqual(labels);
  });

  it('should init the role labels list on load failure', function() {
    RoleManager.getRolePermissions.and.returnValue($q.resolve([]));
    RoleManager.getRoleUsers.and.returnValue($q.resolve([]));
    RoleManager.getRoleLabels.and.returnValue($q.reject({
      title: 'Problem.'
    }));
    PermissionManager.getAll.and.returnValue($q.resolve(allPermissions));
    RoleManager.get.and.returnValue($q.resolve(role));


    $stateParams = { "id": id };

    var editor = getController();
    $scope.$digest();

    expect(RoleManager.getRoleLabels).toHaveBeenCalledWith(id);
    expect(editor.role.labels).toEqual([]);
    expect($uibModal.open).toHaveBeenCalled();
    expect(editor.errorMessage).toEqual('De labels van deze rol konden niet geladen worden. Problem.');
  });

  it('should init the role users list on load failure', function() {
    RoleManager.getRolePermissions.and.returnValue($q.resolve([]));
    RoleManager.getRoleUsers.and.returnValue($q.reject({
      title: 'Problem.'
    }));
    RoleManager.getRoleLabels.and.returnValue($q.resolve([]));
    PermissionManager.getAll.and.returnValue($q.resolve(allPermissions));
    RoleManager.get.and.returnValue($q.resolve(role));


    $stateParams = { "id": id };

    var editor = getController();
    $scope.$digest();

    expect(RoleManager.getRoleUsers).toHaveBeenCalledWith(id);
    expect(editor.role.users).toEqual([]);
    expect($uibModal.open).toHaveBeenCalled();
    expect(editor.errorMessage).toEqual('De leden van deze rol konden niet geladen worden. Problem.');
  });

  it('should show an error on permission list failure', function() {
    PermissionManager.getAll.and.returnValue($q.reject({
      title: 'Problem.'
    }));


    $stateParams = { "id": id };

    var editor = getController();
    $scope.$digest();

    expect(PermissionManager.getAll).toHaveBeenCalled();
    expect(editor.permissions).toEqual([]);
    expect($uibModal.open).toHaveBeenCalled();
    expect(editor.errorMessage).toEqual('De permissie lijst kon niet geladen worden. Problem.');
  });

  it('should show an error on role permission list failure', function() {
    RoleManager.getRolePermissions.and.returnValue($q.reject({
      title: 'Problem.'
    }));
    PermissionManager.getAll.and.returnValue($q.resolve(allPermissions));
    RoleManager.get.and.returnValue($q.resolve(role));


    $stateParams = { "id": id };

    var editor = getController();
    $scope.$digest();

    expect(RoleManager.getRolePermissions).toHaveBeenCalled();
    expect(editor.role.permissions).toEqual({});
    expect($uibModal.open).toHaveBeenCalled();
    expect(editor.errorMessage).toEqual('De permissies van deze rol konden niet geladen worden. Problem.');
  });

});
