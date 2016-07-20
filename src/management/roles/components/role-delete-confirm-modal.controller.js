
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:RoleDeleteConfirmModalCtrl
 * @description
 * # RoleDeleteConfirmModalCtrl
 * Modal to delete a role.
 */
angular
  .module('udb.management.roles')
  .controller('RoleDeleteConfirmModalCtrl', RoleDeleteConfirmModalController);

/* @ngInject */
function RoleDeleteConfirmModalController($scope, $uibModalInstance, RoleManager, item) {

  $scope.item = item;
  $scope.saving = false;
  $scope.error = false;

  $scope.cancelRemoval = cancelRemoval;
  $scope.deleteRole = deleteRole;

  /**
   * Delete the role.
   */
  function deleteRole() {
    $scope.error = false;
    $scope.saving = true;

    function showError() {
      $scope.saving = false;
      $scope.error = true;
    }

    RoleManager
      .deleteRole(item.uuid)
      .then($uibModalInstance.close)
      .catch(showError);
  }

  /**
   * Cancel, modal dismiss.
   */
  function cancelRemoval() {
    $uibModalInstance.dismiss();
  }

}
