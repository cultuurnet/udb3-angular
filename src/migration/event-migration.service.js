'use strict';

/**
 * @ngdoc service
 * @name udb.migration.eventMigration
 * @description
 * Event Migration Service
 */
angular
  .module('udb.migration')
  .service('eventMigration', EventMigrationService);

/* @ngInject */
function EventMigrationService($q, udbApi) {
  var service = this;

  var migrationRequirements = {
    location: hasKnownLocation
  };

  /**
   * @param {udbEvent} event
   */
  function hasKnownLocation(event) {
    return !!_.get(event, 'location.id');
  }

  /**
   * @param {udbEvent} event
   *
   * @return string[]
   *  A list of migrations steps needed to meet all requirements.
   */
  service.checkRequirements = function (event) {
    var migrationSteps = _(migrationRequirements)
      .pick(function (requirementCheck) {
        return !requirementCheck(event);
      })
      .keys();

    return migrationSteps.value();
  };

}
