'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:OrganizerDetailController
 * @description
 * # OrganizerDetailController
 */
angular
  .module('udb.organizers')
  .controller('OrganizerDetailController', OrganizerDetailController);

/* @ngInject */
function OrganizerDetailController(OrganizerManager, $uibModal, $stateParams, $location, $state, udbApi) {
  var controller = this;
  var organizerId = $stateParams.id;
  var stateName = $state.current.name;

  // labels scope variables and functions
  controller.labelSaving = false;
  controller.addLabel = addLabel;
  controller.deleteLabel = deleteLabel;
  controller.labelResponse = '';
  controller.labelsError = '';
  controller.deleteOrganization = deleteOrganization;
  controller.isManageState = isManageState;
  controller.finishedLoading = finishedLoading;
  controller.canEdit = canEdit;
  controller.isOwnershipEnabled = isOwnershipEnabled;
  controller.permissions = [];

  function loadOrganizer(organizerId) {
    OrganizerManager
      .get(organizerId)
      .then(showOrganizer);

    udbApi.getOrganizerPermissions(organizerId)
      .then(function (response) {
        controller.permissions = response.permissions;
      });
  }

  loadOrganizer(organizerId);

  /**
   * @param {udbOrganizer} organizer
   */
  function showOrganizer(organizer) {
    controller.organizer = organizer;
  }

  function addLabel(label) {
    controller.labelSaving = true;
    clearLabelsError();

    OrganizerManager
      .addLabelToOrganizer(organizerId, label.name)
      .catch(showProblem)
      .finally(function() {
        controller.labelSaving = false;
        removeFromCache();
      });
  }

  function deleteLabel(label) {
    controller.labelSaving = true;
    clearLabelsError();
    removeFromCache();

    OrganizerManager
        .deleteLabelFromOrganizer(organizerId, label.name)
        .catch(showUnlabelProblem)
        .finally(function() {
          controller.labelSaving = false;
        });
  }

  function removeFromCache() {
    OrganizerManager.removeOrganizerFromCache(organizerId);
  }

  function clearLabelsError() {
    controller.labelResponse = '';
    controller.labelsError = '';
  }

  function isManageState() {
    return (stateName.indexOf('manage') !== -1);
  }

  function goToOrganizerOverview() {
    $location.path('/manage/organizations');
  }

  function deleteOrganization() {
    openOrganizationDeleteConfirmModal(controller.organizer);
  }

  function isOwnershipEnabled () {
    var searchParams = $location.search();
    return searchParams.ownership === 'true';
  }

  function openOrganizationDeleteConfirmModal(organizer) {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/organization-delete.modal.html',
      controller: 'OrganizationDeleteModalController',
      controllerAs: 'odc',
      resolve: {
        organization: function () {
          return organizer;
        }
      }
    });

    modalInstance.result
      .then(goToOrganizerOverview);
  }

  /**
   * @param {ApiProblem} problem
   */
  function showUnlabelProblem(problem) {
    loadOrganizer(organizerId);
    controller.labelResponse = 'unlabelError';
    controller.labelsError = problem.title;
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    controller.errorMessage = problem.title + (problem.detail ? ' ' + problem.detail : '');

    var modalInstance = $uibModal.open(
      {
        templateUrl: 'templates/unexpected-error-modal.html',
        controller: 'UnexpectedErrorModalController',
        size: 'sm',
        resolve: {
          errorMessage: function() {
            return controller.errorMessage;
          }
        }
      }
    );
  }

  function finishedLoading () {
    return (controller.organizer && !controller.loadingError);
  }

  function canEdit() {
    return controller.permissions.indexOf('Organisaties bewerken') !== -1;
  }
}
