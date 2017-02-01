'use strict';

/**
 * @ngdoc function
 * @name udb.duplication.component:udbEventDuplicationStep
 * @description
 * # Event Duplication Step
 * Step component for migrating events
 */
angular
  .module('udb.duplication')
  .component('udbEventDuplicationStep', {
    templateUrl: 'templates/event-duplication-step.component.html',
    controller: EventDuplicationStepController,
    controllerAs: 'duplication'
  });

/* @ngInject */
function EventDuplicationStepController(EventFormData) {
  var controller = this;

  controller.eventId = EventFormData.id;

  controller.readyToDuplicate = function () {
    return false;
  };
}
