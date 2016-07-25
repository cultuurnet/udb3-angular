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
        // save a copy of the original role before changes
        editor.originalRole = _.cloneDeep(editor.role);
        // done loading role
        editor.loadedRole = true;
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
    });
  }

  function loadRoleUsers(roleId) {
    RoleManager
      .getRoleUsers(roleId).then(function (users) {
        editor.role.users = users;
      });

    editor.loadedRoleUsers = true;
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

    $q.all(promisses).then(function() {
      $state.go('split.manageRoles.list', {reload:true});
    }).catch(showProblem);
  }

  function addUser() {
    editor.addingUser = true;

    console.log(editor.email);

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
}
