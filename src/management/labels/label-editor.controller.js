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
function LabelEditorController(LabelManager, $uibModal, $state, $stateParams, $q) {
  var editor = this;
  editor.updateVisibility = updateVisibility;
  editor.updatePrivacy = updatePrivacy;
  editor.saving = false;
  editor.renaming = false;
  editor.save = save;

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

  function save() {
    editor.saving = true;

    var promisses = [];
    var checkRenaming = editor.originalLabel.name !== editor.label.name;

    if (checkRenaming) {
      rename();
    }

    else {
      if (editor.originalLabel.isVisible !== editor.label.isVisible) {
        if (editor.label.isVisible) {
          promisses.push(LabelManager.makeVisible(editor.label));
        }
        else {
          promisses.push(LabelManager.makeInvisible(editor.label));
        }
      }

      if (editor.originalLabel.isPrivate !== editor.label.isPrivate) {
        if (editor.label.isPrivate) {
          promisses.push(LabelManager.makePrivate(editor.label));
        }
        else {
          promisses.push(LabelManager.makePublic(editor.label));
        }
      }

      $q.all(promisses).finally(function() {
          editor.saving = false;
          $state.reload();
        }).catch(showProblem);
    }
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
    editor.originalLabel = _.cloneDeep(editor.label);
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
