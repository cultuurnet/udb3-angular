'use strict';

/**
 * @ngdoc function
 * @name udb.duplication.component:udbEventDuplicationFooter
 * @description
 * # Event Duplication Footer
 * Footer component for migrating events
 */
angular
  .module('udb.duplication')
  .component('udbEventDuplicationFooter', {
    templateUrl: 'templates/event-duplication-footer.component.html',
    controller: EventDuplicationFooterController,
    controllerAs: 'duplication'
  });

/* @ngInject */
function EventDuplicationFooterController($rootScope, eventDuplicator, $state) {
  var controller = this;

  controller.readyForDuplication = false;
  controller.duplicate = function () {
    if (!controller.readyForDuplication) { return; }

    showAsyncDuplication();
    eventDuplicator
      .duplicate(controller.readyForDuplication)
      .then(showDuplicate, showAsyncError);
  };

  /**
   * @param {string} duplicateId
   */
  function showDuplicate(duplicateId) {
    $state.go('split.footer.event', {id: duplicateId});
  }

  function showAsyncError() {
    controller.asyncError = true;
    controller.duplicating = false;
  }

  function showAsyncDuplication() {
    controller.asyncError = false;
    controller.duplicating = true;
  }

  function duplicateTimingChanged(angularEvent, formData) {
    controller.readyForDuplication = formData;
  }

  $rootScope.$on('duplicateTimingChanged', duplicateTimingChanged);
}
