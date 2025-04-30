'use strict';

/**
 * @ngdoc directive
 * @name udb.management.organizers.directive:udbOrganizationSearchItemNew
 * @var udbOrganizationSearchItemNew osic
 * @description
 * # Organizer search item Directive
 */
angular
  .module('udb.management.organizers')
  .directive('udbOrganizationSearchItemNew', OrganizationSearchItemNew);

function OrganizationSearchItemNew() {
  return {
    restrict: 'A',
    templateUrl: 'templates/organization-search-item-new.html',
    bindToController: {
      organizationSearchItem: '<udbOrganizationSearchItemNew'
    },
    controller: OrganizationSearchItemControllerNew,
    controllerAs: 'osic'
  };
}

/* @ngInject */
function OrganizationSearchItemControllerNew($rootScope, jsonLDLangFilter, $translate, $q, udbApi) {
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

  function hasPermission (permission) {
    var deferredHasPermission = $q.defer();

    function findPermission(permissionList) {
      var foundPermission = _.find(permissionList, function(p) { return p === permission; });
      deferredHasPermission.resolve(foundPermission ? true : false);
    }

    udbApi
      .getMyPermissions()
      .then(findPermission, deferredHasPermission.reject);

    return deferredHasPermission.promise;
  }

  hasPermission('GEBRUIKERS_BEHEREN').then(function (isAllowed) {
    controller.isGodUser = isAllowed;
  });

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
