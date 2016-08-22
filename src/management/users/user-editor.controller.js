'use strict';

/**
 * @typedef {Object} RoleAction
 * @property {Role} item
 * @property {ActionCallback} perform
 *  The API action that has to be performed for this action.
 */

/**
 * @callback ActionCallback
 * @param {Promise.<BaseJob>} job
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
function UserEditorController(UserManager, $stateParams, RoleManager) {
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
    var deleteAction = {
      role: role,
      perform: _.once(function () {
        return RoleManager.removeUserFromRole(role.id, userId);
      })
    };

    editor.queueAction(deleteAction);
  };

  /**
   * @param {RoleAction} action
   */
  editor.queueAction = function (action) {
    var currentActions = editor.actions ? editor.actions : [];
    currentActions.push(action);
    editor.actions = currentActions;
  };

  /**
   * @param {Role} role
   */
  editor.roleHasActions = function(role) {
    return _.find(editor.actions, {
      role: {
        uuid: role.uuid
      }
    });
  };
}
