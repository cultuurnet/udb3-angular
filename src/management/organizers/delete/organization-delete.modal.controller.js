'use strict';

/**
 * @ngdoc controller
 * @name udbApp.management.organizers.controller:OrganizationDeleteModalController
 * @var OrganizationDeleteModalController odc
 * @description
 * # OrganizationDeleteModalController
 * Modal to delete an organization
 */
angular
  .module('udb.management.organizers')
  .controller('OrganizationDeleteModalController', OrganizationDeleteModalController);

/* @ngInject */
function OrganizationDeleteModalController($uibModalInstance, OrganizerManager, organization, $rootScope) {
  var controller = this;

  controller.organization = organization;
  controller.saving = false;
  controller.error = false;

  controller.cancelRemoval = cancelRemoval;
  controller.deleteOrganization = deleteOrganization;

  /**
   * Delete the role.
   */
  function deleteOrganization() {
    controller.error = false;
    controller.saving = true;

    function showError() {
      controller.saving = false;
      controller.error = true;
    }

    OrganizerManager
      .delete(organization)
      .then(function () {
        $uibModalInstance.close();
        $rootScope.$emit('organizationDeleted', organization);
      })
      .catch(showError);
  }

  /**
   * Cancel, modal dismiss.
   */
  function cancelRemoval() {
    $uibModalInstance.dismiss();
  }
}
