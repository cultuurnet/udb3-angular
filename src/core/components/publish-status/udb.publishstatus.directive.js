'use strict';

/**
 * @ngdoc directive
 * @name udb.core.directive: udbPublishStatus
 * @description
 * # udbPublishStatus
 */
angular
  .module('udb.core')
  .directive('udbPublishStatus', function () {
    return {
      templateUrl: 'templates/udb.publishstatus.directive.html',
      controller: PublishStatusDirectiveController,
      controllerAs: 'cm',
      restrict: 'A',
      scope: {
        event: '<udbPublishStatus'
      }
    };
  });

/* @ngInject */
function PublishStatusDirectiveController($scope, $translate) {
  var cm = this;
  cm.event = $scope.event;
  cm.status = translateStatus(cm.event.workflowStatus);
  cm.eventIds = eventIds;
  cm.isUrl = isUrl;

  function eventIds (event) {
    return _.union([event.id], event.sameAs);
  }

  function translateStatus (status) {
    return $translate.instant('publicationStatus.' + status);
  }

  function isUrl (potentialUrl) {
    return /^(https?)/.test(potentialUrl);
  }
}
