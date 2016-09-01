'use strict';

describe('Controller: Roles Form', function() {
  var
    RoleManager,
    Usermanager,
    $uibModal,
    $stateParams,
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
    "name": "Beheerder west-vlaanderen",
    "constraint": "city:leuven",
    "permissions": [
      "AANBOD_BEWERKEN",
      "AANBOD_INVOEREN",
      "AANBOD_MODEREREN",
      "AANBOD_VERWIJDEREN"
    ]
  };

  var expectedRole = {
    "uuid": id,
    "name": "Beheerder west-vlaanderen",
    "constraint": "city:leuven",
    "permissions": [
      "AANBOD_BEWERKEN",
      "AANBOD_INVOEREN",
      "AANBOD_MODEREREN",
      "AANBOD_VERWIJDEREN"
    ],
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
    { key: 'AANBOD_INVOEREN', name: 'AANBOD_INVOEREN' },
    { key: 'AANBOD_BEWERKEN', name: 'AANBOD_BEWERKEN' },
    { key: 'AANBOD_MODEREREN', name: 'AANBOD_MODEREREN' },
    { key: 'AANBOD_VERWIJDEREN', name: 'AANBOD_VERWIJDEREN' },
    { key: 'ORGANISATIES_BEHEREN', name: 'ORGANISATIES_BEHEREN' },
    { key: 'GEBRUIKERS_BEHEREN', name: 'GEBRUIKERS_BEHEREN' },
    { key: 'LABELS_BEHEREN', name: 'LABELS_BEHEREN' }
  ];



  beforeEach(module('udb.management'));
  beforeEach(module('udb.management.roles'));

  beforeEach(inject(function(_$rootScope_, _$q_, _$controller_) {
    $controller = _$controller_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();

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
      'getRoleLabels',
      'removeLabelFromRole',
      'removeUserFromRole',
    ]);

    Usermanager = jasmine.createSpyObj('UserManager', ['find', 'findUserWithEmail']);
    $uibModal = jasmine.createSpyObj('$uibModal', ['open']);
  }));

  function getController() {
    return $controller(
      'RoleFormController', {
        RoleManager: RoleManager,
        UserManager: Usermanager,
        $uibModal: $uibModal,
        $stateParams: $stateParams,
        $q: $q
      }
    );
  }

  function getMockups() {
    RoleManager.getRolePermissions.and.returnValue($q.resolve(rolePermissions));
    RoleManager.getRoleUsers.and.returnValue($q.resolve(roleUsers));
    RoleManager.getRoleLabels.and.returnValue($q.resolve([]));
    RoleManager.get.and.returnValue($q.resolve(angular.copy(role)));
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
    expect(editor.availablePermissions).toEqual(allPermissions);
  });

  it('should load the role permissions', function() {
    getMockups();

    $stateParams = { "id": id };

    var editor = getController();

    $scope.$digest();
    expect(editor.role.permissions).toEqual(expectedRole.permissions);
  });

  it('should update the name of the role', function() {
    getMockups();

    $stateParams = { "id": id};

    var editor = getController();

    $scope.$digest();
    editor.role.name = "Andere naam";
    RoleManager.updateRoleName.and.returnValue($q.resolve());

    editor.updateName();
    $scope.$digest();

    expect(RoleManager.updateRoleName).toHaveBeenCalledWith(id, "Andere naam");
    expect(editor.editName).toEqual(false);
    expect(editor.saving).toEqual(false);
  });

  it('should update the constraint of the role', function() {
    getMockups();

    $stateParams = { "id": id};

    var editor = getController();

    $scope.$digest();
    editor.role.constraint = "Ander constraint";
    RoleManager.updateRoleConstraint.and.returnValue($q.resolve());

    editor.updateConstraint();
    $scope.$digest();

    expect(RoleManager.updateRoleConstraint).toHaveBeenCalledWith(id, "Ander constraint");
    expect(editor.editConstraint).toEqual(false);
    expect(editor.saving).toEqual(false);
  });

  it('should add a permission to a role', function() {
    getMockups();

    $stateParams = { "id": id };

    var editor = getController();

    $scope.$digest();
    editor.role.permissions = [
      "ORGANISATIES_BEHEREN"
    ];

    RoleManager.addPermissionToRole.and.returnValue($q.resolve());

    editor.updatePermission('AANBOD_BEWERKEN');
    $scope.$digest();

    expect(RoleManager.addPermissionToRole).toHaveBeenCalledWith('AANBOD_BEWERKEN', id);
    expect(editor.loadedRolePermissions).toEqual(true);
  });

  it('should remove a permission from a role', function() {
    getMockups();

    $stateParams = { "id": id };

    var editor = getController();

    $scope.$digest();
    editor.role.permissions = [
      "AANBOD_BEWERKEN"
    ];

    RoleManager.removePermissionFromRole.and.returnValue($q.resolve());

    editor.updatePermission('AANBOD_BEWERKEN');
    $scope.$digest();

    expect(RoleManager.removePermissionFromRole).toHaveBeenCalledWith('AANBOD_BEWERKEN', id);
    expect(editor.loadedRolePermissions).toEqual(true);
  });

  it('should add a user to a role', function() {
    var user = {
      uuid: '6f072ba8-c510-40ac-b387-51f582650e27',
      email: 'alberto@email.es',
      username: 'El Pistolero'
    };

    var expectedRole = {
      "uuid": id,
      "name": "Beheerder west-vlaanderen",
      "constraint": "city:leuven"
    };

    RoleManager.getRolePermissions.and.returnValue($q.resolve([]));
    RoleManager.getRoleUsers.and.returnValue($q.resolve([]));
    RoleManager.getRoleLabels.and.returnValue($q.resolve([]));
    RoleManager.get.and.returnValue($q.resolve(role));

    $stateParams = { "id": id };

    var editor = getController();
    $scope.$digest();

    Usermanager.findUserWithEmail.and.returnValue($q.resolve(user));
    RoleManager.addUserToRole.and.returnValue($q.resolve());

    editor.form = {
        email: {
        $setViewValue: function (blub) {},
        $setPristine: function (blub) {},
        $render: function () {}
      }
    };
    editor.email = 'alberto@email.es';
    editor.addUser();
    $scope.$digest();

    expect(RoleManager.addUserToRole).toHaveBeenCalledWith(user, expectedRole);
    expect(Usermanager.findUserWithEmail).toHaveBeenCalledWith('alberto@email.es');
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
    RoleManager.get.and.returnValue($q.resolve(role));
    RoleManager.addLabelToRole.and.returnValue($q.resolve());

    var label = {
      uuid: 'label-uuid',
      name: 'Mijn label'
    };

    $stateParams = { "id": id };

    var editor = getController();
    $scope.$digest();

    editor.addLabel(label);
    $scope.$digest();

    expect(RoleManager.addLabelToRole).toHaveBeenCalledWith(id, label.uuid);
  });

  it('should load all permissions without a roleId', function() {

    $stateParams = {};

    var editor = getController();
    $scope.$digest();

    expect(RoleManager.get).not.toHaveBeenCalled();
    expect(RoleManager.getRolePermissions).not.toHaveBeenCalled();
    expect(RoleManager.getRoleUsers).not.toHaveBeenCalled();
    expect(editor.availablePermissions).toEqual(allPermissions);
  });

  it('should create a role when no roleId specified', function() {
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
    expect(editor.role.id).toEqual('uuid-test123');
    expect(editor.originalRole.id).toEqual('uuid-test123');
  });

  it('should load the role labels', function() {
    var labels = [{
      uuid: 'label-uuid',
      name: 'Mijn label'
    }];
    RoleManager.getRolePermissions.and.returnValue($q.resolve([]));
    RoleManager.getRoleUsers.and.returnValue($q.resolve([]));
    RoleManager.getRoleLabels.and.returnValue($q.resolve(labels));
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
    RoleManager.get.and.returnValue($q.resolve(role));

    $stateParams = { "id": id };

    var editor = getController();
    $scope.$digest();

    expect(RoleManager.getRoleUsers).toHaveBeenCalledWith(id);
    expect(editor.role.users).toEqual([]);
    expect($uibModal.open).toHaveBeenCalled();
    expect(editor.errorMessage).toEqual('De leden van deze rol konden niet geladen worden. Problem.');
  });

  it('should delete a label from the role', function() {
    var labels = [{
      uuid: 'uuid',
      name: 'bloso',
      privacy: 'public',
      visibility: 'invisible'
    },
    {
      uuid: 'uuid2',
      name: 'blabla',
      privacy: 'private',
      visibility: 'invisible'
    }];

    RoleManager.getRolePermissions.and.returnValue($q.resolve([]));
    RoleManager.getRoleUsers.and.returnValue($q.resolve([]));
    RoleManager.getRoleLabels.and.returnValue($q.resolve(labels));
    RoleManager.get.and.returnValue($q.resolve(role));

    $stateParams = { "id": id };

    var editor = getController();
    $scope.$digest();

    RoleManager.removeLabelFromRole.and.returnValue($q.resolve({commandId:'blub'}));
    editor.removeLabel(labels[0]);
    $scope.$digest();

    expect(RoleManager.removeLabelFromRole).toHaveBeenCalledWith(id, 'uuid');
    expect(editor.role.labels).toEqual([{
      uuid: 'uuid2',
      name: 'blabla',
      privacy: 'private',
      visibility: 'invisible'
    }]);
  });

  it('should delete a user from the role', function() {
    var users = [{
      uuid: '6f072ba8-c510-40ac-b387-51f582650e27',
      email: 'alberto@email.es',
      username: 'El Pistolero'
    },
    {
      uuid: '7f072ba8-c510-40ac-b387-51f582650e27',
      email: 'gertie@email.es',
      username: 'Gertie'
    }];

    var expectedRole = {
      "uuid": id,
      "name": "Beheerder west-vlaanderen",
      "constraint": "city:leuven"
    };

    var expectedUser = {
      uuid: '6f072ba8-c510-40ac-b387-51f582650e27',
      email: 'alberto@email.es',
      username: 'El Pistolero'
    };

    RoleManager.getRolePermissions.and.returnValue($q.resolve([]));
    RoleManager.getRoleUsers.and.returnValue($q.resolve(users));
    RoleManager.getRoleLabels.and.returnValue($q.resolve([]));
    RoleManager.get.and.returnValue($q.resolve(role));

    $stateParams = { "id": id };

    var editor = getController();
    $scope.$digest();

    RoleManager.removeUserFromRole.and.returnValue($q.resolve({commandId:'blub'}));
    editor.removeUser(users[0]);
    $scope.$digest();

    expect(RoleManager.removeUserFromRole).toHaveBeenCalledWith(expectedRole, expectedUser);
    expect(editor.role.users).toEqual([{
      "uuid": "7f072ba8-c510-40ac-b387-51f582650e27",
      "email": "gertie@email.es",
      "username": "Gertie"
    }]);
  });

});
