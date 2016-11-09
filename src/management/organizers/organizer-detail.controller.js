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
function OrganizerDetailController(OrganizerManager, LabelManager, jobLogger, BaseJob, $uibModal, $stateParams, $q) {
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
  }

  function addLabel(label) {
    controller.labelSaving = true;

    OrganizerManager
      .addLabelToOrganizer(organizerId, label.uuid)
      .then(function(commandInfo) {
        logOrganizerLabelJob(commandInfo);
      }, showProblem)
      .finally(function() {
        controller.labelSaving = false;
        removeFromCache();
      });
  }

  function deleteLabel(label) {
    controller.labelSaving = true;

    OrganizerManager
        .deleteLabelFromOrganizer(organizerId, label.uuid)
        .then(function(commandInfo) {
          logOrganizerLabelJob(commandInfo);
        }, showProblem)
        .finally(function() {
          controller.labelSaving = false;
          removeFromCache();
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
    controller.organizer.labels = angular.copy(controller.organizerLabels);
  }

  /**
   * @param {Object} commandInfo
   * @return {Promise.<BaseJob>}
   */
  function logOrganizerLabelJob(commandInfo) {
    var job = new BaseJob(commandInfo.commandId);
    jobLogger.addJob(job);

    return $q.resolve(job);
  }

}
