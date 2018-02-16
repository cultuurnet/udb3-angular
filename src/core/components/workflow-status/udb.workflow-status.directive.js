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
function WorkflowStatusDirectiveController($scope, appConfig) {
  var cm = this;
  cm.event = $scope.event;
  cm.eventIds = eventIds;
  cm.isUrl = isUrl;

  cm.publicationRulesLink = appConfig.publicationRulesLink;

  function eventIds (event) {
    return _.union([event.id], event.sameAs);
  }

  function isUrl (potentialUrl) {
    return /^(https?)/.test(potentialUrl);
  }
}
