'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:OrganizerDetailController
 * @description
 * # OrganizerDetailController
 */
angular
  .module('udb.management.organizers')
  .controller('OrganizerDetailController', OrganizerDetailController);

/* @ngInject */
function OrganizerDetailController(OrganizerManager, $uibModal, $stateParams) {
  var controller = this;
  var organizerId = $stateParams.id;

  controller.labelSaving = false;

  controller.addLabel = addLabel;
  controller.deleteLabel = deleteLabel;

  loadOrganizer(organizerId);

  function loadOrganizer(organizerId) {
    OrganizerManager
      .get(organizerId)
      .then(showOrganizer);
  }

  /**
   * @param {udbOrganizer} organizer
   */
  function showOrganizer(organizer) {
    controller.organizer = organizer;
  }

  function addLabel(label) {
    controller.labelSaving = true;

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

    OrganizerManager
        .deleteLabelFromOrganizer(organizerId, label.name)
        .catch(showProblem)
        .finally(function() {
          controller.labelSaving = false;
          removeFromCache();
        });
  }

  function removeFromCache() {
    OrganizerManager.removeOrganizerFromCache(organizerId);
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

}
