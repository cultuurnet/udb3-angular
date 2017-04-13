'use strict';

/**
 * @ngdoc controller
 * @name udb.event-form.controller:OpeningHoursEditorModalController
 * @description
 * # OpeningHoursEditorModalController
 * Controller for editing opening hours
 */
angular
  .module('udb.event-form')
  .controller('OpeningHoursEditorModalController', OpeningHoursEditorModalController);

/* @ngInject */
function OpeningHoursEditorModalController($uibModalInstance, openingHoursCollection) {
  var controller = this;
  var originalOpeningHoursList;

  init(openingHoursCollection);
  controller.saveOpeningHours = saveOpeningHours;
  controller.createNewOpeningHours = createNewOpeningHours;
  controller.removeOpeningHours = removeOpeningHours;
  controller.errors = {};

  function init(openingHoursCollection) {
    originalOpeningHoursList = _.cloneDeep(openingHoursCollection.getOpeningHours());

    if (originalOpeningHoursList.length === 0) {
      openingHoursCollection.createNewOpeningHours();
    }

    controller.openingHoursCollection = openingHoursCollection;
  }

  function saveOpeningHours() {
    clearErrors();
    var errors = controller.openingHoursCollection.validate();

    if (_.isEmpty(errors)) {
      $uibModalInstance.close(controller.openingHoursCollection.serialize());
    } else {
      showErrors(errors);
    }
  }

  /**
   * @param {string[]} errorList
   */
  function showErrors(errorList) {
    controller.errors = errorList;
  }

  function clearErrors() {
    controller.errors = {};
  }

  function createNewOpeningHours() {
    controller.openingHoursCollection.createNewOpeningHours();
  }

  function removeOpeningHours(openingHours) {
    controller.openingHoursCollection.removeOpeningHours(openingHours);
  }
}
