'use strict';

describe('Service: Event crud', function () {

  var eventCrud, $rootScope, $q, logger, udbApi;

  beforeEach(module('udb.entry', function ($provide) {
    logger = jasmine.createSpyObj('jobLogger', ['addJob']);
    udbApi = jasmine.createSpyObj('udbApi', [
      'updateProperty',
      'translateProperty',
      'patchOffer',
      'createOffer',
      'updateMajorInfo'
    ]);
    udbApi.mainLanguage = 'nl';

    $provide.provider('jobLogger', {
      $get: function () {
        return logger;
      }
    });

    $provide.provider('udbApi', {
      $get: function () {
        return udbApi;
      }
    });
  }));

  beforeEach(inject(function (_eventCrud_, _$rootScope_, _$q_) {
    eventCrud = _eventCrud_;
    $rootScope = _$rootScope_;
    $q = _$q_;
  }));

  it('should persist major info after any of the basic properties changed', function () {
    var propertyChangedEvents = [
      'eventTypeChanged',
      'eventThemeChanged',
      'eventTimingChanged',
      'eventTitleChanged'
    ];
    var eventFormData = {'some': 'data'};
    spyOn(eventCrud, 'updateMajorInfo');

    propertyChangedEvents.forEach(function (eventName) {
      eventCrud.updateMajorInfo.calls.reset();
      $rootScope.$emit(eventName, eventFormData);
      $rootScope.$apply();
      expect(eventCrud.updateMajorInfo).toHaveBeenCalledWith(eventFormData);
    });
  });

  it('should create a job and log it when updating an offer property', function () {
    var eventFormData = {
      apiUrl: 'http://du.de/event/217781E3-F644-4243-8D1C-1A55AB8EFA2E',
      bookingInfo: {
        url: 'foobier',
        urlLabel: 'foobier',
        email: 'foobier',
        phone: 'foobier'
      }
    };

    promisePropertyUpdate();

    eventCrud.updateBookingInfo(eventFormData);
    $rootScope.$digest();

    expect(logger.addJob).toHaveBeenCalled();
  });

  it('should create a job when updating the description of an Offer', function () {
    var eventFormData = {
      apiUrl: 'http://du.de/event/217781E3-F644-4243-8D1C-1A55AB8EFA2E',
      description: {
        nl: 'foodier'
      }
    };

    udbApi.translateProperty.and.returnValue($q.resolve({
      data: {
        commandId: 'D3F6B805-ECE7-4042-A495-35E26766512A'
      }
    }));

    eventCrud.updateDescription(eventFormData);
    $rootScope.$digest();

    expect(logger.addJob).toHaveBeenCalled();
  });

  function promisePropertyUpdate() {
    udbApi.updateProperty.and.returnValue($q.resolve({
      data: {
        commandId: 'D3F6B805-ECE7-4042-A495-35E26766512A'
      }
    }));
  }

  it('should create a job when publishing an offer', function() {
    var eventFormData = {
      apiUrl: new URL('http://du.de/event/217781E3-F644-4243-8D1C-1A55AB8EFA2E'),
      description: {
        nl: 'foodier'
      }
    };

    udbApi.patchOffer.and.returnValue($q.resolve({
      commandId: 'D3F6B805-ECE7-4042-A495-35E26766512A'
    }));

    eventCrud.publishOffer(eventFormData, 'publishOffer');
    $rootScope.$digest();

    expect(logger.addJob).toHaveBeenCalled();
  });

  it('should not throw away dates when picking major info from form-data when creating an offer', function () {
    var formData = {
      calendarType: 'periodic',
      startDate: new Date('2013-03-01T00:00:00Z'),
      endDate: new Date('2013-03-03T00:00:00Z')
    };

    var expectedInfo = {
      calendarType: 'periodic',
      startDate: new Date('2013-03-01T00:00:00Z'),
      endDate: new Date('2013-03-03T00:00:00Z')
    };

    function assertMajorInfo() {
      expect(udbApi.createOffer).toHaveBeenCalledWith('event', expectedInfo);
    }

    udbApi.createOffer.and.returnValue($q.resolve());

    eventCrud
      .createOffer(formData)
      .then(assertMajorInfo);
  });

  it('should not throw away dates when picking major info from form-data when updating an offer', function (done) {
    var offerLocation = new URL('http://du.de/event/217781E3-F644-4243-8D1C-1A55AB8EFA2E');

    var formData = {
      apiUrl: offerLocation,
      calendarType: 'periodic',
      startDate: new Date('2013-03-01T00:00:00Z'),
      endDate: new Date('2013-03-03T00:00:00Z')
    };

    var expectedInfo = {
      calendarType: 'periodic',
      startDate: new Date('2013-03-01T00:00:00Z'),
      endDate: new Date('2013-03-03T00:00:00Z')
    };


    function assertMajorInfo() {
      expect(udbApi.updateMajorInfo).toHaveBeenCalledWith(offerLocation, expectedInfo);
      done();
    }

    udbApi.updateMajorInfo.and.returnValue($q.resolve(formData));

    $rootScope.$emit('eventTimingChanged', formData);

    $rootScope.$digest();
    assertMajorInfo();
  });
});