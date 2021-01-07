'use strict';

/**
 * @ngdoc function
 * @name udb.migration.component:udbEventMigrationFooter
 * @description
 * # Event Migration Footer
 * Footer component for migrating events
 */
angular
  .module('udb.migration')
  .component('udbEventMigrationFooter', {
    templateUrl: 'templates/event-migration-footer.component.html',
    controller: EventMigrationFooterController,
    controllerAs: 'migration'
  });

/* @ngInject */
function EventMigrationFooterController(EventFormData, $stateParams, $state, $translate) {
  var controller = this;

  controller.completeMigration = completeMigration;
  var fallbackDestination = {description: $translate.instant('eventForm.step4.continue'), state: 'split.eventEdit'};
  controller.destination = $stateParams.destination || fallbackDestination;
  controller.migrationReady = migrationReady;

  function completeMigration () {
    if (migrationReady()) {
      $state.go(controller.destination, {id: EventFormData.id});
    }
  }

  function migrationReady () {
    return !!_.get(EventFormData, 'location.id');
  }
}
