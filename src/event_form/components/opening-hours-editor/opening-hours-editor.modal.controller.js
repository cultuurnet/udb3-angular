'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:OpeningHoursEditorModalController
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

  controller.openingHoursCollection = openingHoursCollection;
  controller.saveOpeningHours = saveOpeningHours;
  controller.createNewOpeningHours = createNewOpeningHours;
  controller.removeOpeningHours = removeOpeningHours;
  controller.errors = {};

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
    controller.errors = _.zipObject(errorList, _.map(errorList, function() {
      return true;
    }));
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
