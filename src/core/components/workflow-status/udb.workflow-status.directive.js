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
  cm.sameAsRelations = sameAsRelations;
  cm.isUrl = isUrl;
  cm.getPublicUrl = getPublicUrl;

  cm.publicationRulesLink = appConfig.publicationRulesLink;

  function sameAsRelations (event) {
    var sameAsRelationsWithoutUIV = _.reject(event.sameAs, function(sameAs) {
      return sameAs.contains('uitinvlaanderen');
    });
    return sameAsRelationsWithoutUIV;
  }

  function isUrl (potentialUrl) {
    return /^(https?)/.test(potentialUrl);
  }

  function getPublicUrl (id) {
    if (isPlace()) {
      return getEnvironment() + 'p//' + id;
    } else {
      return getEnvironment() + 'e//' + id;
    }
  }

  function getEnvironment() {
    if (_.includes(appConfig.baseUrl, '-acc.')) {
      return 'https://acc.uitinvlaanderen.be/agenda/';
    }
    else if (_.includes(appConfig.baseUrl, '-test.')) {
      return 'https://test.uitinvlaanderen.be/agenda/';
    }
    else {
      return 'https://www.uitinvlaanderen.be/agenda/';
    }
  }

  function isPlace() {
    if (_.includes(cm.event.url, 'place')) {
      return true;
    }
    else {
      return false;
    }
  }
}
