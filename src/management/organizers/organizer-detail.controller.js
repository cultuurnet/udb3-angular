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
function OrganizerDetailController(OrganizerManager, LabelManager, $uibModal, $stateParams) {
  var controller = this;
  var organizerId = $stateParams.id;

  controller.saving = false;
  controller.searchedLabels = [];

  controller.addLabel = addLabel;
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
  }

  function addLabel(label) {
    controller.saving = true;

    OrganizerManager
      .addLabelToOrganizer(organizerId, label.uuid)
      .then(function () {
        controller.organizer.labels.push(label);
      }, showProblem)
      .finally(function() {
        controller.saving = false;
      });
  }

  function searchLabels(query) {
    LabelManager
      .find(query, 6, 0)
      .then(function (labels) {
        console.log(labels);
      }, showProblem);
  }

  function mapLabels(labels) {
    for (var i = 0; i < labels.length; i++) {
      if (labels[i].hasOwnProperty('name')) {
        labels[i].text = labels[i].name;
      }
    }
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
