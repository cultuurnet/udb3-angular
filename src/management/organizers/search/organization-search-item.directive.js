'use strict';

/**
 * @ngdoc directive
 * @name udb.management.organizers.directive:udbOrganizationSearchItem
 * @var udbOrganizationSearchItem osic
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
function OrganizationSearchItemController($rootScope, jsonLDLangFilter, $translate) {
  var controller = this;
  var organizationDeletedListener = $rootScope.$on('organizationDeleted', matchAndMarkAsDeleted);
  var defaultLanguage = $translate.use() || 'nl';

  showOrganization(controller.organizationSearchItem);

  /**
   *
   * @param {UdbOrganizer} organization
   */
  function showOrganization(organization) {
    controller.organization = organization;
    controller.organization.id = controller.organization['@id'].split('/').pop();
    controller.organization = jsonLDLangFilter(controller.organization, defaultLanguage, true);
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
