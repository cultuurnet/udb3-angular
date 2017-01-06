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

function ContactPointDetailController() {
  this.isEmpty = function (contactPoint) {
    return _(contactPoint).map().union().isEmpty();
  };
}
