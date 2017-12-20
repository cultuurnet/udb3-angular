'use strict';

/**
 * @ngdoc directive
 * @name udb.core.directive: udbWorkflowStatus
 * @description
 * # udbWorkflowStatus
 */
angular
  .module('udb.core')
  .directive('udbWorkflowStatus', function () {
    return {
      templateUrl: 'templates/udb.workflow-status.directive.html',
      controller: WorkflowStatusDirectiveController,
      controllerAs: 'cm',
      restrict: 'A',
      scope: {
        event: '<udbWorkflowStatus'
      }
    };
  });

/* @ngInject */
function WorkflowStatusDirectiveController($scope, $translate) {
  var cm = this;
  cm.event = $scope.event;
  cm.status = translateStatus(cm.event.workflowStatus);
  cm.eventIds = eventIds;
  cm.isUrl = isUrl;

  function eventIds (event) {
    return _.union([event.id], event.sameAs);
  }

  function translateStatus (status) {
    return $translate.instant('workflowStatus.' + status);
  }

  function isUrl (potentialUrl) {
    return /^(https?)/.test(potentialUrl);
  }

  $scope.translateWorkFlow = function (label) {
    return $translate.instant('workflowStatus.' + label);
  };
}
