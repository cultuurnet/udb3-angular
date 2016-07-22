'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:LabelEditorController
 * @description
 * # LabelEditorController
 */
angular
  .module('udb.management.labels')
  .controller('LabelEditorController', LabelEditorController);

/** @ngInject */
function LabelEditorController(LabelManager, $uibModal, $stateParams) {
  var editor = this;
  editor.updateVisibility = updateVisibility;
  editor.updatePrivacy = updatePrivacy;
  editor.renaming = false;
  editor.rename = rename;

  function rename() {
    function showRenamedLabel(jobInfo) {
      loadLabel(jobInfo.labelId);
    }

    editor.renaming = true;
    LabelManager
      .copy(editor.label)
      .then(showRenamedLabel, showProblem)
      .finally(function () {
        editor.renaming = false;
      });
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    loadLabel(editor.label.id);
    var modalInstance = $uibModal.open(
      {
        templateUrl: 'templates/unexpected-error-modal.html',
        controller: 'UnexpectedErrorModalController',
        size: 'sm',
        resolve: {
          errorMessage: function() {
            return problem.title + ' ' + problem.detail;
          }
        }
      }
    );
  }

  function loadLabelFromParams() {
    var id = $stateParams.id;
    loadLabel(id);
  }

  /**
   *
   * @param {Label} label
   */
  function showLabel(label) {
    editor.label = label;
    getVisibility(label);
    getPrivacy(label);
  }

  function loadLabel(id) {
    editor.loadingError = false;
    editor.label = false;
    LabelManager
      .get(id)
      .then(showLabel, showLoadingError);
  }

  function getVisibility(label) {
    if (label.visibility === 'visible') {
      label.isVisible = true;
    }
    else {
      label.isVisible = false;
    }

    return label;
  }

  function getPrivacy(label) {
    if (label.privacy === 'public') {
      label.isPrivate = false;
    }
    else {
      label.isPrivate = true;
    }

    return label;
  }

  function showLoadingError () {
    editor.loadingError = 'Label niet gevonden!';
  }

  function updateVisibility () {
    var isVisible = editor.label.isVisible;
    var jobPromise = isVisible ? LabelManager.makeVisible(editor.label) : LabelManager.makeInvisible(editor.label);
    jobPromise.catch(showProblem);
  }

  function updatePrivacy () {
    var isPrivate = editor.label.isPrivate;
    var jobPromise = isPrivate ? LabelManager.makePrivate(editor.label) : LabelManager.makePublic(editor.label);
    jobPromise.catch(showProblem);
  }

  loadLabelFromParams();
}
