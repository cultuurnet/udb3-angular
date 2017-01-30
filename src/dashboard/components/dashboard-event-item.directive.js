'use strict';

/**
 * @ngdoc directive
 * @name udb.dashboard.directive:udbDashboardEventItem
 * @description
 *  Renders a dashboard item for place
 */
angular
  .module('udb.dashboard')
  .directive('udbDashboardEventItem', udbDashboardEventItem);

/* @ngInject */
function udbDashboardEventItem() {
  var dashboardEventItemDirective = {
    restrict: 'AE',
    controller: 'OfferController',
    controllerAs: 'offerCtrl',
    templateUrl: 'templates/dashboard-item.directive.html'
  };

  return dashboardEventItemDirective;
}
