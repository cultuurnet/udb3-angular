
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:RoleDeleteConfirmModalCtrl
 * @description
 * # RoleDeleteConfirmModalCtrl
 * Modal to delete a role.
 */
angular
  .module('udb.management.moderation')
  .controller('RejectOfferConfirmModalCtrl', RejectOfferConfirmModalCtrl);

/* @ngInject */
function RejectOfferConfirmModalCtrl($scope, $uibModalInstance, $q) {

  $scope.cancel = cancel;
  $scope.reject = reject;
  $scope.response = {};

  /**
   * Delete the role.
   */
  function reject() {
    var answer;
    $scope.error = false;

    // if no type chosen or the reason hasn't been filled in for OTHER
    if (!$scope.response.type ||
          ($scope.response.type === 'OTHER' &&
            (!$scope.response.reason || !$scope.response.reason.length))) {
      $scope.error = 'Gelieve een reden op te geven.';
      return;
    }

    if ($scope.response.type === 'OTHER') {
      answer = $scope.response.reason;
    } else {
      answer = $scope.response.type;
    }

    $uibModalInstance.close($q.resolve(answer));
  }

  /**
   * Cancel, modal dismiss.
   */
  function cancel() {
    $uibModalInstance.dismiss();
  }

}
