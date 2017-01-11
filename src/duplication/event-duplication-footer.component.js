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

    eventDuplicator
      .duplicate(controller.readyForDuplication)
      .then(showDuplicate);
  };

  /**
   * @param {string} duplicateId
   */
  function showDuplicate(duplicateId) {
    $state.go('split.footer.event', {id: duplicateId});
  }

  function duplicateTimingChanged(angularEvent, formData) {
    controller.readyForDuplication = formData;
  }

  $rootScope.$on('duplicateTimingChanged', duplicateTimingChanged);
}
