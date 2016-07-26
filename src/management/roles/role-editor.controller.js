'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:RoleEditorController
 * @description
 * # RoleEditorController
 */
angular
  .module('udb.management.roles')
  .controller('RoleEditorController', RoleEditorController);

/** @ngInject */
function RoleEditorController(
  RoleManager,
  PermissionManager,
  UserManager,
  $uibModal,
  $state,
  $stateParams,
  jsonLDLangFilter,
  $q
) {
  var editor = this;
  editor.saving = false;
  editor.save = save;
  editor.addUser = addUser;
  editor.loadedRole = false;
  editor.loadedRolePermissions = false;
  editor.loadedRoleUsers = false;
  editor.addingUser = false;

  var roleId = $stateParams.id;

  function loadRole(roleId) {
    RoleManager
      .get(roleId).then(function(role) {
        editor.role = jsonLDLangFilter(role, 'nl');
      }, showLoadingError)
      .finally(function() {
        loadRolePermissions(roleId);
        loadRoleUsers(roleId);
      });
  }
  function showLoadingError () {
    editor.loadingError = 'Role niet gevonden!';
  }
  function loadRolePermissions(roleId) {
    var permissions, rolePermissions, promisses = [];
    promisses.push(
      RoleManager
        .getRolePermissions(roleId).then(function(permissions) {
          rolePermissions = permissions;
        }, showProblem)
    );
    promisses.push(
      PermissionManager
        .getAll().then(function(retrievedPermissions) {
          permissions = retrievedPermissions;
        }, showProblem)
    );
    $q.all(promisses).then(function() {
      // loaded all permissions & permissions linked to role
      editor.role.permissions = {};
      rolePermissions.forEach(function(permission) {
        editor.role.permissions[permission.key] = true;
      });
      editor.permissions = permissions;
      editor.loadedRolePermissions = true;
      // save a copy of the original role before changes
      editor.originalRole = _.cloneDeep(editor.role);
      // done loading role
      editor.loadedRole = true;
    });
  }

  function loadRoleUsers(roleId) {
    RoleManager
      .getRoleUsers(roleId).then(function (users) {
        editor.role.users = users;
      }, function() {
        editor.role.users = [];
      });

    editor.loadedRoleUsers = true;
    // save a copy of the original role before changes
    editor.originalRole = _.cloneDeep(editor.role);
    // done loading role
    editor.loadedRole = true;
  }

  loadRole(roleId);

  function save() {
    editor.saving = true;
    var promisses = [];
    // go over the changes from the original role
    // name changed
    if (editor.originalRole.name !== editor.role.name) {
      promisses.push(RoleManager.updateRoleName(roleId, editor.role.name));
    }
    // constraint changed
    if (editor.originalRole.constraint !== editor.role.constraint) {
      promisses.push(RoleManager.updateRoleConstraint(roleId, editor.role.constraint));
    }
    Object.keys(editor.role.permissions).forEach(function(key) {
      // permission added
      if (editor.role.permissions[key] === true && !editor.originalRole.permissions[key]) {
        promisses.push(RoleManager.addPermissionToRole(key, roleId));
      }
      // permission removed
      if (editor.role.permissions[key] === false && editor.originalRole.permissions[key] === true) {
        promisses.push(RoleManager.removePermissionFromRole(key, roleId));
      }
    });
    Object.keys(editor.role.users).forEach(function(key) {
      // user added
      if (editor.role.users[key] && !editor.originalRole.users[key]) {
        promisses.push(RoleManager.addUserToRole(editor.role.users[key].uuid, roleId));
      }
    });

    $q.all(promisses).then(function() {
      $state.go('split.manageRoles.list', {reload:true});
    }).catch(showProblem);
  }

  function addUser() {
    editor.addingUser = true;
    var query = editor.email;
    var limit = 1;
    var start = 0;

    var dummyUser = {
      'uuid': '6f072ba8-c510-40ac-b387-51f582650e27',
      'email': 'alberto@email.es',
      'username': 'El Pistolero'
    };

    UserManager.find(query, limit, start)
      .then(function(user) {
        var uuid = user.uuid;
        angular.forEach(editor.role.users, function(roleUser) {
          if (roleUser.uuid !== uuid) {
            editor.role.users.push(user);
            editor.form.email.$setViewValue('');
            editor.form.email.$setPristine(true);
            editor.form.email.$render();
          }
          else {
            userAlreadyAdded();
          }
        });
      }, function() {
        editor.role.users.push(dummyUser);
      });

    editor.addingUser = false;
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    var modalInstance = $uibModal.open(
      {
        templateUrl: 'templates/unexpected-error-modal.html',
        controller: 'UnexpectedErrorModalController',
        size: 'sm',
        resolve: {
          errorMessage: function() {
            return problem.title + ' ' + problem.detail;
          }
        }
      }
    );
  }

  function userAlreadyAdded() {
    var modalInstance = $uibModal.open(
      {
        templateUrl: 'templates/unexpected-error-modal.html',
        controller: 'UnexpectedErrorModalController',
        size: 'sm',
        resolve: {
          errorMessage: function() {
            return 'De gebruiker hangt al aan deze rol.';
          }
        }
      }
    );
  }
}
