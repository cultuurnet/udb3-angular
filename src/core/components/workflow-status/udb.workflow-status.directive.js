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
  cm.audienceType = $scope.event.audience.audienceType;
  cm.sameAsRelations = sameAsRelations;
  cm.isUrl = isUrl;
  cm.getPublicUrl = getPublicUrl;
  cm.getCultuurKuurKUrl = getCultuurKuurKUrl;

  cm.publicationRulesLink = appConfig.publicationRulesLink;
  cm.publicationBrand = appConfig.publicationUrl.brand;

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
      if (appConfig.publicationUrl.place) {
        return appConfig.publicationUrl.place + id;
      } else {
        return false;
      }
    } else {
      if (appConfig.publicationUrl.event) {
        return appConfig.publicationUrl.event + id;
      } else {
        return false;
      }
    }
  }

  /**
   * get the url for cultuurkuur
   * @param {string} cdbid
   */
  function getCultuurKuurKUrl (cdbid) {
    if (appConfig.cultuurkuurUrl) {
      return appConfig.cultuurkuurUrl + 'agenda/e//' + cdbid;
    } else {
      return false;
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
