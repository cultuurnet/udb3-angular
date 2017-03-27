'use strict';

/**
 * @ngdoc directive
 * @name udb.management.organizers.directive:udbOrganizationSearchItem
 * @description
 * # Organizer search item Directive
 */
angular
  .module('udb.management.organizers')
  .directive('udbOrganizationSearchItem', OrganizationSearchItem);

function OrganizationSearchItem() {
  return {
    restrict: 'A',
    templateUrl: 'templates/organization-search-item.html',
    bindToController: {
      organizationSearchItem: '<udbOrganizationSearchItem'
    },
    controller: OrganizationSearchItemController,
    controllerAs: 'osic'
  };
}

/* @ngInject */
function OrganizationSearchItemController(udbApi) {
  var controller = this;

  udbApi
    .getOrganizerByLDId(controller.organizationSearchItem['@id'])
    .then(showOrganization);

  /**
   *
   * @param {UdbOrganizer} organization
   */
  function showOrganization(organization) {
    controller.organization = organization;
  }
}
