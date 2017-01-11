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
function EventDuplicationFooterController($rootScope) {
  var controller = this;
  var duplicator = {
    duplicate: function() {
      console.log(controller.readyForDuplication);
    }
  };

  controller.readyForDuplication = false;
  controller.duplicate = duplicator.duplicate;

  function duplicateTimingChanged(formData) {
    controller.readyForDuplication = formData;
  }

  $rootScope.$on('duplicateTimingChanged', duplicateTimingChanged);
}
