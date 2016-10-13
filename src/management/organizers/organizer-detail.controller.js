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
function OrganizerDetailController(OrganizerManager, LabelManager, $uibModal, $stateParams, $q) {
  var controller = this;
  var organizerId = $stateParams.id;

  controller.organizerLabels = [];
  controller.labelSaving = false;
  controller.searchedLabels = [];

  controller.addLabel = addLabel;
  controller.deleteLabel = deleteLabel;
  controller.searchLabels = searchLabels;

  loadOrganizer(organizerId);

  function loadOrganizer(organizerId) {
    OrganizerManager
      .get(organizerId)
      .then(showOrganizer);
  }

  /**
   * @param {Organizer} organizer
   */
  function showOrganizer(organizer) {
    controller.organizer = organizer;
    mapLabels(organizer.labels);
    controller.organizerLabels = angular.copy(organizer.labels);
  }

  function addLabel(label) {
    controller.labelSaving = true;

    OrganizerManager
      .addLabelToOrganizer(organizerId, label.uuid)
      .catch(showProblem)
      .finally(function() {
        controller.labelSaving = false;
      });
  }

  function deleteLabel(label) {
    controller.labelSaving = true;

    OrganizerManager
        .deleteLabelFromOrganizer(organizerId, label.uuid)
        .catch(showProblem)
        .finally(function() {
          controller.labelSaving = false;
        });
  }

  function searchLabels(query) {
    return LabelManager
        .find(query, 6, 0)
        .then(function (labels) {
          return mapLabels(labels.member);
        }, showProblem);
  }

  function mapLabels(labels) {
    for (var i = 0; i < labels.length; i++) {
      if (labels[i].hasOwnProperty('name')) {
        labels[i].text = angular.copy(labels[i].name);
      }
    }
    return labels;
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
    controller.organizer.labels = angular.copy(controller.organizerLabels);
  }

}
