'use strict';

describe('Controller: Form Calendar', function () {
  var $controller, EventFormData;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function($injector) {
    $controller = $injector.get('$controller');
    EventFormData = $injector.get('EventFormData');
  }));

  function getController(formData) {
    if (!formData) {
      formData = EventFormData;
      EventFormData.initCalendar();
    }
    return $controller('FormCalendarController', {
      EventFormData: formData
    });
  };

  it('should default to the "single" calendar type when initializing', function () {
    var controller = getController();
    expect(controller.formData.calendarType).toEqual('single');
    expect(controller.type).toEqual('single');
  });

  it('should set today as the default time-span when creating a new offer', function () {
    var today = new Date(2013, 9, 23, 1);
    jasmine.clock().mockDate(today);
    var controller = getController();
    var expectedTimeSpans = [{
        allDay: true,
        start: new Date(2013, 9, 23, 2),
        end: new Date(2013, 9, 23, 5)
    }];
    expect(controller.timeSpans).toEqual(expectedTimeSpans);
  });

  it('should copy the last time-span when creating a new one', function () {
    var controller = getController();
    controller.timeSpans = [
      {
        allDay: true,
        start: new Date(2013, 9, 23, 2),
        end: new Date(2013, 9, 23, 5)
      },
      {
        allDay: false,
        start: new Date(2013, 9, 23, 9),
        end: new Date(2013, 9, 23, 17)
      }
    ];
    var expectedTimeSpans = [
      {
        allDay: true,
        start: new Date(2013, 9, 23, 2),
        end: new Date(2013, 9, 23, 5)
      },
      {
        allDay: false,
        start: new Date(2013, 9, 23, 9),
        end: new Date(2013, 9, 23, 17)
      },
      {
        allDay: false,
        start: new Date(2013, 9, 23, 9),
        end: new Date(2013, 9, 23, 17)
      }
    ];

    controller.createTimeSpan();
    expect(controller.timeSpans).toEqual(expectedTimeSpans);
  });
});
