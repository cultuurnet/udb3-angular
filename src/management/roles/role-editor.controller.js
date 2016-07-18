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
function RoleEditorController(RoleManager, PermissionManager, $uibModal, $state, $stateParams, $q) {
  var editor = this;
  editor.creating = false;
  editor.save = save;
  editor.loadedRole = false;
  editor.loadedRolePermissions = false;

  function loadRoleFromParams () {
    var roleId = $stateParams.id;
    loadRole(roleId);
    loadRolePermissions(roleId);
  }
  function loadRole(roleId){
    RoleManager
      .get(roleId).then(function(role){
        editor.role = role;
      }, showLoadingError)
      .finally(function() {
        editor.loadedRole = true;
      });
  }
  function showLoadingError () {
    editor.loadingError = 'Role niet gevonden!';
  }
  function loadRolePermissions(roleId){
    RoleManager
      .getPermissions(roleId).then(function(permissions){
        editor.rolePermissions = permissions;
      }, showProblem)
      .finally(function() {
        editor.loadedRolePermissions = true;
      });
  }
  loadRoleFromParams();

  function save() {
    function goToOverview() {
      $state.go('split.manageRoles');
    }

    function sendPermissions (createdRole) {
      var roleId = createdRole.roleId;
      console.log('going to send permissions', editor.role.permissions);
      var promisses = [];
      Object.keys(editor.role.permissions).forEach(function(permissionKey){
        promisses.push(RoleManager.addPermissionToRole(permissionKey, roleId));
      });
      $q.all(promisses).then(function(){
        goToOverview();
      }).catch(showProblem);
    }


    editor.creating = true;
    RoleManager
      .create(editor.role.name, editor.role.editPermission)
      .then(sendPermissions, showProblem)
      .finally(function () {
        editor.creating = false;
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
