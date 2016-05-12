'use strict';

describe('Service: Event crud', function () {

  var eventCrud, $rootScope, $q, logger, udbApi;

  beforeEach(module('udb.entry', function ($provide) {
    logger = jasmine.createSpyObj('jobLogger', ['addJob']);
    udbApi = jasmine.createSpyObj('udbApi', ['updateProperty', 'translateProperty']);
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
});