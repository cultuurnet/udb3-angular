'use strict';

describe('Service: Event Duplicator', function () {

  var udbApi = jasmine.createSpyObj('udbApi', ['duplicateEvent']),
      duplicator,
      $q,
      $rootScope;

  beforeEach(module('udb.duplication', function ($provide) {
    $provide.provider('udbApi', {
      $get: function () {
        return udbApi;
      }
    });
  }));

  beforeEach(inject(function ($injector) {
    duplicator = $injector.get('eventDuplicator');
    $q = $injector.get('$q');
    $rootScope = $injector.get('$rootScope');
  }));

  it('should duplicate an event with timing from form-data and return its id', function (done) {
    var formData = {
      apiUrl: new URL('http://du.de/event/1da2bb3c-616f-4e89-9b17-f142413046d2'),
      calendarType: 'periodic',
      startDate: new Date('2013-03-01T00:00:00Z'),
      endDate: new Date('2013-03-03T00:00:00Z')
    };
    var expectedCalenderData = {
      calendarType: 'periodic',
      startDate: new Date('2013-03-01T00:00:00Z'),
      endDate: new Date('2013-03-03T00:00:00Z')
    };

    udbApi
      .duplicateEvent
      .and
      .returnValue($q.resolve({
        eventId: 'a81dc6aa-1bbd-4105-ac6a-7db270043481',
        url: 'http://du.de/event/a81dc6aa-1bbd-4105-ac6a-7db270043481'
      }));

    function assertDuplication(duplicateId) {
      expect(udbApi.duplicateEvent)
        .toHaveBeenCalledWith(new URL('http://du.de/event/1da2bb3c-616f-4e89-9b17-f142413046d2'), expectedCalenderData);

      expect(duplicateId)
        .toEqual('a81dc6aa-1bbd-4105-ac6a-7db270043481');

      done();
    }

    duplicator
      .duplicate(formData)
      .then(assertDuplication);

    $rootScope.$digest();
  })
});