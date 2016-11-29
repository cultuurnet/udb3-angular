'use strict';

describe('Event Migration Service', function () {

  var eventMigration;

  beforeEach(module('udb.migration'));

  beforeEach(inject(function ($injector) {
    eventMigration = $injector.get('eventMigration');
  }));

  it('should return "location" as a required migration step when the location is not known in UDB3', function () {
    var event = {
      name: 'Orange',
      location: {
        name: 'Purple'
      }
    };

    var requiredSteps = eventMigration.checkRequirements(event);
    var expectedSteps = ['location'];

    expect(requiredSteps).toEqual(expectedSteps);
  });

  it('should return an empty list of required steps when migration is unnecessary', function () {
    var event = {
      'name': 'Green',
      'location': {
        '@id': 'http://du.de/event/ef9f6d8a-3c3e-4299-8f51-e04d0686f575',
        'id': 'ef9f6d8a-3c3e-4299-8f51-e04d0686f575'
      }
    };

    var requiredSteps = eventMigration.checkRequirements(event);
    var expectedSteps = [];

    expect(requiredSteps).toEqual(expectedSteps);
  });
});