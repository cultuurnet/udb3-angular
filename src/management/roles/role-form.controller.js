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
  $stateParams,
  jsonLDLangFilter,
  $q
) {
  var editor = this;

  editor.saving = false;
  editor.loadedRole = false;
  editor.loadedRolePermissions = false;
  editor.loadedRoleUsers = false;
  editor.loadedRoleLabels = false;
  editor.addingUser = false;
  editor.role = {
    permissions: {},
    users: [],
    labels: []
  };
  editor.permissions = [];
  editor.originalRole = {
    permissions: {},
    users: [],
    labels: []
  };
  editor.errorMessage = false;
  editor.editName = false;
  editor.editConstraint = false;

  editor.addUser = addUser;
  editor.addLabel = addLabel;
  editor.createRole = createRole;
  editor.removeLabel = removeLabel;
  editor.removeUser = removeUser;
  editor.updatePermission = updatePermission;
  editor.updateName = updateName;
  editor.updateConstraint = updateConstraint;

  var roleId = $stateParams.id;

  function init() {
    getAllRolePermissions()
      .then(function() {
        return roleId ? loadRole(roleId) : $q.resolve();
      })
      .catch(showProblem) // stop loading when there's an error
      .finally(function() {
        // no matter what resest loading indicators
        editor.loadedRole = true;
        editor.loadedRolePermissions = true;
        editor.loadedRoleUsers = true;
        editor.loadedRoleLabels = true;
      });
  }

  function loadRole(roleId) {
    return RoleManager
      .get(roleId)
      .then(function(role) {
        editor.role = jsonLDLangFilter(role, 'nl');

        editor.role.permissions = {};
        editor.role.users = [];
        editor.role.labels = [];
      }, function(problem) {
        problem.detail = problem.title;
        problem.title = 'De rol kon niet gevonden worden.';
        return $q.reject(problem);
      })
      .then(function() {
        return getRolePermissions(roleId);
      })
      .then(function () {
        return loadRoleUsers(roleId);
      })
      .then(function () {
        return loadRoleLabels(roleId);
      });
  }

  function getRolePermissions(roleId) {
    return RoleManager
      .getRolePermissions(roleId)
      .then(function(rolePermissions) {
        editor.role.permissions = {};
        angular.forEach(rolePermissions, function(permission, key) {
          editor.role.permissions[permission.key] = true;
        });

        return rolePermissions;
      }, function(problem) {
        problem.detail = problem.title;
        problem.title = 'De permissies van deze rol konden niet geladen worden.';
        return $q.reject(problem);
      });
  }

  function getAllRolePermissions() {
    return PermissionManager
      .getAll()
      .then(function(retrievedPermissions) {
        editor.permissions = retrievedPermissions;
        return retrievedPermissions;
      }, function(problem) {
        problem.detail = problem.title;
        problem.title = 'De permissie lijst kon niet geladen worden.';
        return $q.reject(problem);
      });
  }

  function loadRoleUsers(roleId) {
    return RoleManager
      .getRoleUsers(roleId)
      .then(function (users) {
        editor.role.users = users;
      }, function(problem) {
        problem.detail = problem.title;
        problem.title = 'De leden van deze rol konden niet geladen worden.';
        return $q.reject(problem);
      });
  }

  function loadRoleLabels(roleId) {
    return RoleManager
      .getRoleLabels(roleId)
      .then(function (labels) {
        editor.role.labels = labels;
      }, function(problem) {
        problem.detail = problem.title;
        problem.title = 'De labels van deze rol konden niet geladen worden.';
        return $q.reject(problem);
      });
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

  function updateConstraint() {
    editor.saving = true;
    RoleManager
      .updateRoleConstraint(roleId, editor.role.constraint)
      .then(function() {
        editor.editConstraint = false;
      }, showProblem)
      .finally(function() {
        editor.saving = false;
      });
  }

  function updateName() {
    editor.saving = true;
    RoleManager
      .updateRoleName(roleId, editor.role.name)
      .then(function() {
        editor.editName = false;
      }, showProblem)
      .finally(function() {
        editor.saving = false;
      });
  }

  function updatePermission(key) {
    // permission added
    if (editor.role.permissions[key] === true) {
      editor.loadedRolePermissions = false;
      RoleManager
        .addPermissionToRole(key, roleId)
        .catch(showProblem)
        .finally(function() {
          editor.loadedRolePermissions = true;
        });
    }
    // permission removed
    if (editor.role.permissions[key] === false) {
      editor.loadedRolePermissions = false;
      RoleManager
        .removePermissionFromRole(key, roleId)
        .catch(showProblem)
        .finally(function() {
          editor.loadedRolePermissions = true;
        });
    }
  }

  function addLabel(label) {
    editor.saving = true;

    RoleManager
      .addLabelToRole(roleId, label.id)
      .then(function () {
        editor.role.labels.push(label);
      }, showProblem)
      .finally(function() {
        editor.saving = false;
      });
  }

  function removeLabel(label) {
    editor.saving = true;

    RoleManager
      .removeLabelFromRole(roleId, label.id)
      .then(function () {
        var pos = editor.role.labels.indexOf(label);
        editor.role.labels.splice(pos, 1);
      }, showProblem)
      .finally(function() {
        editor.saving = false;
      });
  }

  function removeUser(user) {
    editor.saving = true;

    RoleManager
      .removeUserFromRole(roleId, user.uuid)
      .then(function () {
        var pos = editor.role.users.indexOf(user);
        editor.role.users.splice(pos, 1);
      }, showProblem)
      .finally(function() {
        editor.saving = false;
      });
  }

  function addUser() {
    editor.addingUser = true;
    var userAdded = false;

    UserManager
      .findUserWithEmail(editor.email)
      .then(function(user) {
        var userExists = false;
        userAdded = user;

        angular.forEach(editor.role.users, function(roleUser) {
          if (roleUser.uuid === user.uuid) {
            userExists = true;
          }
        });

        if (userExists) {
          return $q.reject({
            title: 'De gebruiker hangt al aan deze rol.'
          });
        } else {
          return user;
        }
      })
      .then(function(user) {
        return RoleManager.addUserToRole(user.uuid, roleId);
      })
      .then(function() {
        editor.role.users.push(userAdded);
        editor.form.email.$setViewValue('');
        editor.form.email.$setPristine(true);
        editor.form.email.$render();
      })
      .catch(showProblem)
      .finally(function() {
        editor.addingUser = false;
      });
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    editor.errorMessage = problem.title + (problem.detail ? ' ' + problem.detail : '');

    var modalInstance = $uibModal.open(
      {
        templateUrl: 'templates/unexpected-error-modal.html',
        controller: 'UnexpectedErrorModalController',
        size: 'sm',
        resolve: {
          errorMessage: function() {
            return editor.errorMessage;
          }
        }
      }
    );
  }

  init();
}
