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
function OrganizationSearchItemController(udbApi, $rootScope) {
  var controller = this;
  var organizationDeletedListener = $rootScope.$on('organizationDeleted', matchAndMarkAsDeleted);

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

  function markAsDeleted() {
    organizationDeletedListener();
    controller.organizationDeleted = true;
  }

  /**
   * @param {Object} angularEvent
   * @param {UdbOrganizer} deletedOrganization
   */
  function matchAndMarkAsDeleted(angularEvent, deletedOrganization) {
    if (!controller.organization) {
      return;
    }

    if (controller.organization.id === deletedOrganization.id) {
      markAsDeleted();
    }
  }
}
