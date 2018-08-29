'use strict';

/**
 * @ngdoc directive
 * @name udb.dashboard.directive:udbDashboardEventItem
 * @description
 *  Renders a dashboard item for place
 */
angular
  .module('udb.dashboard')
  .directive('udbDashboardOrganizerItem', udbDashboardOrganizerItem);

/* @ngInject */
function udbDashboardOrganizerItem() {
  var dashboardOrganizerItemDirective = {
    restrict: 'AE',
    controller: 'OrganizerController',
    controllerAs: 'organizerCtrl',
    templateUrl: 'templates/dashboard-organizer-item.directive.html'
  };

  return dashboardOrganizerItemDirective;
}
