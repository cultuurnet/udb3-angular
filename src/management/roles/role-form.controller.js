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

  editor.save = save;
  editor.addUser = addUser;
  editor.addLabel = addLabel;
  editor.createRole = createRole;

  var roleId = $stateParams.id;

  // @todo delete label
  // @todo delete user
  // @todo opsplitsen form in kleine eventsourced stukken aka bye bye submit button

  function init() {
    getAllRolePermissions()
      .then(function() {
        return roleId ? loadRole(roleId) : $q.resolve();
      })
      .catch(showProblem) // stop loading when there's an error
      .finally(function() {
        // done loading role
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
      })
      .finally(function() {
        // save a copy of the original role before changes
        editor.originalRole = _.cloneDeep(editor.role);
      });
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
          showProblem({
            title: 'De gebruiker hangt al aan deze rol.'
          });
        }
      }, showProblem);

    editor.addingUser = false;
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
