'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:RoleFormController
 * @description
 * # RoleFormController
 */
angular
  .module('udb.management.roles')
  .controller('RoleFormController', RoleFormController);

/** @ngInject */
function RoleFormController(
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
  editor.loadedRole = false;
  editor.loadedRolePermissions = false;
  editor.loadedRoleUsers = false;
  editor.addingUser = false;
  editor.role = {
    permissions: [],
    users: [],
    labels: []
  };
  editor.permissions = [];
  editor.originalRole = {
    permissions: [],
    users: [],
    labels: []
  };

  editor.save = save;
  editor.addUser = addUser;
  editor.addLabel = addLabel;
  editor.createRole = createRole;

  var roleId = $stateParams.id;

  function init() {
    getAllRolePermissions()
      .then(function() {
        return roleId ? loadRole(roleId) : $q.resolve();
      })
      .finally(function() {
        // done loading role
        editor.loadedRole = true;
        editor.loadedRolePermissions = true;
      });
  }

  function loadRole(roleId) {
    return RoleManager
      .get(roleId)
      .then(function(role) {
        editor.role = jsonLDLangFilter(role, 'nl');
      }, showLoadingError)
      .then(function() {
        return getRolePermissions(roleId);
      })
      .then(function () {
        return loadRoleUsers(roleId);
      })
      .finally(function() {
        // save a copy of the original role before changes
        editor.originalRole = _.cloneDeep(editor.role);
      });
  }

  function showLoadingError () {
    editor.loadingError = 'Rol niet gevonden!';
  }

  function getRolePermissions(roleId) {
    return RoleManager
        .getRolePermissions(roleId)
        .then(function(rolePermissions) {

          // loaded all permissions & permissions linked to role
          editor.role.permissions = {};
          angular.forEach(rolePermissions, function(permission, key) {
            editor.role.permissions[permission.key] = true;
          });

          return rolePermissions;
        }, showProblem);
  }

  function getAllRolePermissions() {
    return PermissionManager
        .getAll()
        .then(function(retrievedPermissions) {
          editor.permissions = retrievedPermissions;
          return retrievedPermissions;
        }, showProblem);
  }

  function loadRoleUsers(roleId) {
    return $q.resolve(
      RoleManager
      .getRoleUsers(roleId)
        .then(function (users) {
          editor.role.users = users;
        }, function() {
          editor.role.users = [];
        })
        .finally(function () {
          editor.loadedRoleUsers = true;
        })
    );
  }

  function roleCreated (response) {
    roleId = response.roleId;
    editor.role['@id'] = roleId;
    editor.originalRole['@id'] = roleId;
  }

  function createRole() {
    if (!editor.role.id && editor.role.name) {
      RoleManager
        .create(editor.role.name)
        .then(roleCreated, showProblem)
        .finally(function () {
          editor.saving = false;
        });
    }
  }

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

  function addLabel(label) {
    editor.saving = true;

    RoleManager
      .addLabelToRole(roleId, label.id)
      .then(function () {
        if (!editor.role.labels) {
          editor.role.labels = [];
        }
        editor.role.labels.push(label);
      }, showProblem)
      .finally(function() {
        editor.saving = false;
      });
  }

  function addUser() {
    editor.addingUser = true;
    var email = editor.email;

    UserManager.findUserWithEmail(email)
      .then(function(user) {
        var uuid = user.uuid;
        var userExists = false;

        angular.forEach(editor.role.users, function(roleUser) {
          if (roleUser.uuid === uuid) {
            userExists = true;
          }
        });

        if (!userExists) {
          editor.role.users.push(user);
          editor.form.email.$setViewValue('');
          editor.form.email.$setPristine(true);
          editor.form.email.$render();
        }
        else {
          userAlreadyAdded();
        }
      }, showProblem);

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

  init();
}
