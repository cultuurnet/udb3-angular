'use strict';

/**
 * @ngdoc component
 * @name udb.event-detail.component:ContactPointDetail
 * @description
 * # udbContactPointDetail
 */
angular
  .module('udb.event-detail')
  .directive('udbContactPointDetail', function () {
    return {
      templateUrl: 'templates/contact-point-detail.directive.html',
      controller: ContactPointDetailController,
      restrict: 'A',
      scope: {
        contactPoint: '<udbContactPointDetail'
      }
    };
  });

/* @ngInject */
function ContactPointDetailController($scope, $translate) {
  $scope.isEmpty = function (contactPoint) {
    return _(contactPoint).values().flatten().isEmpty();
  };

  $scope.translateContactPoint = function (label) {
    return $translate.instant('contact.' + label);
  };
}
