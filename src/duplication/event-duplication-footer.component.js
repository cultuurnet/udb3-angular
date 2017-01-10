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
function EventDuplicationFooterController(EventFormData) {
  var controller = this;

  controller.eventId = EventFormData.id;

  controller.readyToEdit = function () {
    return !!_.get(EventFormData, 'location.id');
  };
}
