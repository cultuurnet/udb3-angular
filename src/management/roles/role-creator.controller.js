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
    isPrivate: false,
    isVisible: true
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

    function sendPermissions (createdRole) {
      var roleId = createdRole.roleId;
      console.log('going to send permissions', creator.role.permissions);
      var promisses = [];
      Object.keys(creator.role.permissions).forEach(function(permissionKey) {
        promisses.push(RoleManager.addPermissionToRole(permissionKey, roleId));
      });
      $q.all(promisses).then(function() {
        goToOverview();
      }).catch(showProblem);
    }

    creator.creating = true;
    RoleManager
      .create(creator.role.name, creator.role.editPermission)
      .then(sendPermissions, showProblem)
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
