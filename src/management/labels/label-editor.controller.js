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
function LabelEditorController(LabelManager, $uibModal, $stateParams, $q) {
  var editor = this;
  editor.updateVisibility = updateVisibility;
  editor.updatePrivacy = updatePrivacy;
  editor.saving = false;
  editor.renaming = false;
  editor.save = save;

  function rename() {
    function showRenamedLabel(response) {
      loadLabel(response.uuid);
    }

    editor.renaming = true;
    LabelManager
      .copy(editor.label)
      .then(showRenamedLabel, showProblem)
      .finally(function () {
        editor.renaming = false;
        editor.saving = false;
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
        promisses.push(updateVisibility());
      }

      if (editor.originalLabel.isPrivate !== editor.label.isPrivate) {
        promisses.push(updatePrivacy());
      }

      $q.all(promisses).finally(function() {
          editor.saving = false;
        }).catch(showProblem);
    }
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    loadLabel(editor.label.uuid);
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

    return isVisible ? LabelManager.makeVisible(editor.label) : LabelManager.makeInvisible(editor.label);
  }

  function updatePrivacy () {
    var isPrivate = editor.label.isPrivate;

    return isPrivate ? LabelManager.makePrivate(editor.label) : LabelManager.makePublic(editor.label);
  }

  loadLabelFromParams();
}
