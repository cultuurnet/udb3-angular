'use strict';

/**
 * @ngdoc directive
 * @name udb.dashboard.directive:udbDashboardPlaceItem
 * @description
 *  Renders a dashboard item for place.
 */
angular
  .module('udb.dashboard')
  .directive('udbDashboardPlaceItem', udbDashboardPlaceItem);

/* @ngInject */
function udbDashboardPlaceItem() {
  var dashboardPlaceItemDirective = {
    restrict: 'AE',
    controller: 'OfferController',
    controllerAs: 'offerCtrl',
    templateUrl: 'templates/dashboard-item.directive.html'
  };

  return dashboardPlaceItemDirective;
}
