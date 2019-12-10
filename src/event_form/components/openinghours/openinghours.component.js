'use strict';

/**
 * @typedef {Object} OpeningHours
 * @property {Date} opensAsDate
 * @property {Date} closesAsDate
 * @property {string} opens
 * @property {string} closes
 * @property {string[]} dayOfWeek
 */

angular
  .module('udb.event-form')
  .component('udbEventFormOpeningHours', {
    bindings: {
      openingHoursCollection: '=openingHours',
      formData: '='
    },
    templateUrl: 'templates/event-form-openinghours.html',
    controller: OpeningHourComponentController,
    controllerAs: 'cm'
  });

/**
 * @ngInject
 */
function OpeningHourComponentController($uibModal) {
  var cm = this;

  cm.edit = openEditorModal;

  function openEditorModal() {
    var editorModal = $uibModal.open({
      templateUrl: 'templates/opening-hours-editor.modal.html',
      controller: 'OpeningHoursEditorModalController',
      controllerAs: 'ohemc',
      size: 'lg',
      resolve: {
        openingHoursCollection: function () {
          return angular.copy(cm.openingHoursCollection);
        }
      }
    });

    editorModal.result.then(saveOpeningHours);
  }

  /**
   *
   * @param {OpeningHoursData[]} openingHoursList
   */
  function saveOpeningHours(openingHoursList) {
    cm.formData.openingHours = openingHoursList;
    cm.formData.saveOpeningHours(openingHoursList);
    cm.openingHoursCollection.deserialize(openingHoursList);
  }
}
