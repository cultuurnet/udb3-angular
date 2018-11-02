'use strict';

/**
 * @typedef {Object} TranslatedPermission
 * @property {RolePermission} key
 * @property {string} name
 */

/**
 * @ngdoc function
 * @name udbApp.controller:RoleFormController
 * @description
 * # RoleFormController
 */
angular
  .module('udb.management.roles')
  .controller('RoleFormController', RoleFormController);

/**
 * @ngInject
 * @constructor
 *
 * @param {RoleManager} RoleManager
 * @param {UserManager} UserManager
 * @param {Object} $uibModal
 * @param {Object} $stateParams
 * @param {Object} $q
 * @param {Function} $translate
 * @param {RolePermission} RolePermission
 */
function RoleFormController(
  RoleManager,
  UserManager,
  $uibModal,
  $stateParams,
  $q,
  $translate,
  RolePermission
) {
  var editor = this;
  var roleId = $stateParams.id;

  editor.saving = false;
  editor.loadedRole = false;
  editor.loadedRolePermissions = false;
  editor.loadedRoleUsers = false;
  editor.loadedRoleLabels = false;
  editor.addingUser = false;
  editor.role = {
    permissions: [],
    users: [],
    labels: []
  };
  /**
   * @type {TranslatedPermission[]}
   */
  editor.availablePermissions = [];
  editor.originalRole = {
    permissions: [],
    users: [],
    labels: []
  };
  editor.errorMessage = false;
  editor.editName = false;
  editor.editConstraintV2 = false;
  editor.editConstraintV3 = false;

  editor.addUser = addUser;
  editor.addLabel = addLabel;
  editor.createRole = createRole;
  editor.removeLabel = removeLabel;
  editor.removeUser = removeUser;
  editor.updatePermission = updatePermission;
  editor.updateName = updateName;
  editor.createConstraint = createConstraint;
  editor.updateConstraint = updateConstraint;
  editor.removeConstraint = removeConstraint;
  editor.constraintExists = constraintExists;

  function init() {
    getAllRolePermissions()
      .then(function(permissions) {
        editor.availablePermissions = permissions;
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
        editor.role = role;
        editor.originalRole = role;

        editor.role.users = [];
        editor.role.labels = [];
        editor.role.permissions = _.filter(editor.availablePermissions, function (permission) {
          return _.contains(role.permissions, permission.key);
        });
      }, function(problem) {
        problem.detail = problem.title;
        problem.title = 'De rol kon niet gevonden worden.';
        return $q.reject(problem);
      })
      .then(function () {
        return loadRoleUsers(roleId);
      })
      .then(function () {
        return loadRoleLabels(roleId);
      });
  }

  /**
   * @return {TranslatedPermission[]}
   */
  function getAllRolePermissions() {
    var permissionIds = _.values(RolePermission);

    function formatTranslatedPermissions(translations) {
      return _.map(translations, function (translation, translationId) {
        return {
          key: translationId,
          name: translation
        };
      });
    }

    return $translate(permissionIds)
      .then(formatTranslatedPermissions);
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
    // set uuid because a GET role would have a uuid as well
    editor.role.uuid = roleId;
    editor.originalRole.uuid = roleId;
  }

  function createRole() {
    if (!editor.role.uuid && editor.role.name) {
      RoleManager
        .create(editor.role.name)
        .then(roleCreated, showProblem)
        .finally(function () {
          editor.saving = false;
        });
    }
  }

  function constraintExists(version) {
    return _.has(editor.originalRole.constraints, version);
  }

  function createConstraint(version) {
    editor.saving = true;
    RoleManager
        .createRoleConstraint(roleId, version, editor.role.constraints[version])
        .then(function() {
          if (version === 'v3') {
            editor.editConstraintV3 = false;
          }
          else {
            editor.editConstraintV2 = false;
          }
        }, showProblem)
        .finally(function() {
          editor.saving = false;
        });
  }

  function updateConstraint(version) {
    editor.saving = true;
    RoleManager
      .updateRoleConstraint(roleId, version, editor.role.constraints[version])
      .then(function() {
        if (version === 'v3') {
          editor.editConstraintV3 = false;
        }
        else {
          editor.editConstraintV2 = false;
        }
      }, showProblem)
      .finally(function() {
        editor.saving = false;
      });
  }

  function removeConstraint(version) {
    editor.saving = true;
    RoleManager
        .removeRoleConstraint(roleId, version)
        .then(function() {
          if (version === 'v3') {
            editor.editConstraintV3 = false;
          }
          else {
            editor.editConstraintV2 = false;
          }
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

  /**
   *
   * @param {RolePermission} permission
   */
  function updatePermission(permission) {
    editor.loadedRolePermissions = false;
    var permissionUpdate = $q.reject();

    if (_.find(editor.role.permissions, {key: permission.key})) {
      editor.role.permissions = _.reject(editor.role.permissions, {key: permission.key});
      permissionUpdate = RoleManager.removePermissionFromRole(permission.key, roleId);
    } else {
      editor.role.permissions.push(permission);
      permissionUpdate = RoleManager.addPermissionToRole(permission.key, roleId);
    }

    permissionUpdate
      .catch(showProblem)
      .finally(function() {
        editor.loadedRolePermissions = true;
      })
    ;
  }

  function addLabel(label) {
    editor.saving = true;

    RoleManager
      .addLabelToRole(roleId, label.uuid)
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
      .removeLabelFromRole(roleId, label.uuid)
      .then(function () {
        var pos = editor.role.labels.indexOf(label);
        editor.role.labels.splice(pos, 1);
      }, showProblem)
      .finally(function() {
        editor.saving = false;
      });
  }

  function removeUser(user) {
    var role = _.pick(editor.role, ['uuid', 'name', 'constraint']);

    editor.saving = true;

    RoleManager
      .removeUserFromRole(role, user)
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
        var role = _.pick(editor.role, ['uuid', 'name', 'constraint']);
        return RoleManager.addUserToRole(user, role);
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
