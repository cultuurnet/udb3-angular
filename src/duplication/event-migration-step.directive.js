'use strict';

/**
 * @ngdoc directive
 * @name udb.duplication.directive:udbEventMigrationStep
 * @description
 *  Shows the event migration step.
 */
angular
  .module('udb.duplication')
  .directive('udbEventMigrationStep', udbEventMigrationStep);

/* @ngInject */
function udbEventMigrationStep() {
  return {
    restrict: 'AE',
    controller: EventMigrationStepController,
    controllerAs: 'migration',
    templateUrl: 'templates/event-migration-step.directive.html'
  };
}

/* @ngInject */
function EventMigrationStepController(eventMigration, EventFormData) {
  var controller = this;

  controller.required = !!eventMigration.checkRequirements(EventFormData).length;
}
