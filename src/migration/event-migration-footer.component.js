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
function EventMigrationFooterController(EventFormData) {
  var controller = this;

  controller.eventId = EventFormData.id;

  controller.readyToEdit = function () {
    return !!_.get(EventFormData, 'location.id');
  };
}
