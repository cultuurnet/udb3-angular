'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:RoleCreatorController
 * @description
 * # RoleCreatorController
 */
angular
  .module('udb.management.roles')
  .controller('RoleCreatorController', RoleCreatorController);

/** @ngInject */
function RoleCreatorController(RoleManager, PermissionManager, $uibModal, $state, $q) {
  var creator = this;
  creator.creating = false;
  creator.create = create;
  creator.loadedPermissions = false;
  creator.role = {
    name: '',
    constraint: '',
    permissions: {}
  };

  function loadPermissions () {
    PermissionManager
      .getAll().then(function(permissions) {
        creator.permissions = permissions;
      }, showProblem)
      .finally(function() {
        creator.loadedPermissions = true;
      });
  }
  loadPermissions();

  function create() {
    function goToOverview() {
      $state.go('split.manageRoles');
    }

    function roleCreated (createdRole) {
      var roleId = createdRole.roleId;
      // role is created
      var promisses = [];

      // update constraint if not empty
      if (creator.role.constraint.length > 0) {
        promisses.push(RoleManager.updateRoleConstraint(roleId, creator.role.constraint));
      }

      // set all permissions for the role in parallel
      Object.keys(creator.role.permissions).forEach(function(permissionKey) {
        promisses.push(RoleManager.addPermissionToRole(permissionKey, roleId));
      });

      // when done we can return to overview or show error
      $q.all(promisses).then(function() {
        goToOverview();
      }).catch(showProblem);
    }

    creator.creating = true;
    RoleManager
      .create(creator.role.name)
      .then(roleCreated, showProblem)
      .finally(function () {
        creator.creating = false;
      });
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
