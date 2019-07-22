'use strict';

/**
 * @typedef {Object} RoleAction
 * @property {Role} item
 * @property {ActionCallback} perform
 *  The API action that has to be performed for this action.
 */

/**
 * @callback ActionCallback
 */

/**
 * @ngdoc function
 * @name udbApp.controller:UserEditorController
 * @description
 * # UserEditorController
 */
angular
  .module('udb.management.users')
  .controller('UserEditorController', UserEditorController);

/* @ngInject */
function UserEditorController(UserManager, RoleManager, $stateParams, $q) {
  var editor = this;
  var userId = $stateParams.id;

  loadUser(userId);

  function loadUser(userId) {
    UserManager
      .get(userId)
      .then(showUser);

    UserManager
      .getRoles(userId)
      .then(showUserRoles);
  }

  /**
   * @param {User} user
   */
  function showUser(user) {
    editor.user = user;
  }

  /**
   * @param {Role[]} roles
   */
  function showUserRoles(roles) {
    editor.roles = roles;
  }

  /**
   * @param {Role} role
   */
  editor.deleteRole = function (role) {
    var deleteRoleAction = {
      role: role,
      style: 'list-group-item-danger',
      perform: _.once(function () {
        return RoleManager
          .removeUserFromRole(role, editor.user)
          .then(returnTaskPromise);
      }),
      undo: function () {
        console.log('¯\\_(ツ)_/¯');
      }
    };

    editor.queueAction(deleteRoleAction);
  };

  function returnTaskPromise(job) {
    return $q.when(job.task.promise);
  }

  /**
   * @param {RoleAction} action
   */
  editor.queueAction = function (action) {
    var currentActions = editor.actions ? editor.actions : [];

    if (!editor.getRoleAction(action.role)) {
      currentActions.push(action);
      editor.actions = currentActions;
    }
  };

  /**
   * @param {Role} role
   */
  editor.getRoleStyle = function(role) {
    var action = editor.getRoleAction(role);

    return action ? action.style : null;
  };

  /**
   * @param {Role} role
   */
  editor.getRoleAction =  function (role) {
    return _.find(editor.actions, {
      role: {
        uuid: role.uuid
      }
    });
  };

  /**
   * @param {string} roleName
   * @return {Promise.<Role[]>}
   */
  editor.lookupRoles = function (roleName) {
    return RoleManager
      .find(roleName, 20)
      .then(function (pagedRoleCollection) {
        return _.reject(pagedRoleCollection.member, function (role) {
          return _.find(editor.roles, {uuid: role.uuid});
        });
      });
  };

  /**
   * @param {Role} role
   */
  editor.addRole = function (role) {
    if (_.find(editor.roles, {uuid: role.uuid})) {
      return; // do nothing when the user already has the role
    }

    editor.roles.push(role);
    editor.roleLookupName = '';

    var addRoleAction = {
      role: role,
      style: 'list-group-item-success',
      perform: _.once(function () {
        return RoleManager
          .addUserToRole(editor.user, role)
          .then(returnTaskPromise);
      }),
      undo: function () {
        editor.roles = _.reject(editor.roles, {uuid: role.uuid});
      }
    };

    editor.queueAction(addRoleAction);
  };

  editor.save = function() {
    editor.saving = true;
    var actionPromises = _.map(editor.actions, performAction);

    $q.all(actionPromises)
      .then(function () {
        loadUser(userId);
        editor.saving = false;
        editor.actions = [];
      });
  };

  /**
   * @param {RoleAction} action
   */
  function performAction(action) {
    return action
      .perform()
      .catch(action.undo);
  }

  /**
   * @param {Role} role
   */
  editor.undoAction = function(role) {
    var action = editor.getRoleAction(role);
    action.undo();

    editor.actions = _.reject(
      editor.actions,
      {
        role: {
          uuid: role.uuid
        }
      }
    );
  };
}
