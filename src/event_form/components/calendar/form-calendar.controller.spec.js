'use strict';

describe('Controller: Form Calendar', function () {
  var $controller, EventFormData, $scope;

  beforeEach(module('udb.event-form', function ($provide) {
    var appConfig = {
      'calendarHighlight': {
        'date': '2017-09-10',
        'startTime': '10:00',
        'endTime': '18:00',
        'extraClass': 'omd'
      }
    };

    $provide.constant('appConfig', appConfig);
  }));

  beforeEach(inject(function($injector, $rootScope) {
    $controller = $injector.get('$controller');
    EventFormData = $injector.get('EventFormData');
    $scope = $rootScope.$new();
  }));

  function getController(formData) {
    if (!formData) {
      EventFormData.init();
      EventFormData.initCalendar();

      formData = EventFormData;
    }
    return $controller('FormCalendarController', {
      EventFormData: formData,
      $scope: $scope
    });
  }

  it('should default to the "single" calendar type when initializing', function (done) {
    EventFormData
        .timingChanged$
        .subscribe(done);

    var controller = getController();
    expect(controller.formData.calendar.calendarType).toEqual('single');
    expect(controller.type).toEqual('single');
  });

  it('should set today as the default time-span when creating a new offer', function (done) {
    EventFormData
        .timingChanged$
        .subscribe(done);

    var today = new Date(2013, 9, 23);
    jasmine.clock().mockDate(today);
    var controller = getController();
    var expectedTimeSpans = [{
        allDay: true,
        start: moment(today).startOf('day').toDate(),
        end: moment(today).endOf('day').toDate(),
        endTouched: false,
        status: { type: 'Available' }
    }];
    expect(controller.timeSpans).toEqual(expectedTimeSpans);
  });

  it('should copy the last time-span without triggering a change when creating a new one', function (done) {
    EventFormData
        .timingChanged$
        .subscribe(done);

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
    spyOn(controller, 'instantTimeSpanChanged');

    controller.createTimeSpan();
    expect(controller.timeSpans).toEqual(expectedTimeSpans);
    expect(controller.instantTimeSpanChanged).not.toHaveBeenCalled();
  });

  it('should initialize time-spans and trigger a change when starting a new list', function (done) {
    EventFormData
        .timingChanged$
        .subscribe(done);

    var controller = getController();
    var today = new Date(2013, 9, 23);
    jasmine.clock().mockDate(today);
    var expectedTimeSpans = [
      {
        allDay: true,
        start: moment(today).startOf('day').toDate(),
        end: moment(today).endOf('day').toDate(),
        endTouched: false,
        status: { type: 'Available' }
      }
    ];
    spyOn(controller, 'instantTimeSpanChanged');

    controller.timeSpans = [];
    controller.createTimeSpan();
    expect(controller.timeSpans).toEqual(expectedTimeSpans);
    expect(controller.instantTimeSpanChanged).toHaveBeenCalled();
  });

  it('should save timespans to form-data when timespans change', function (done) {
    EventFormData
        .timingChanged$
        .subscribe(done);

    var controller = getController();
    controller.timeSpans = [
      {
        start: new Date(2013, 9, 23, 2),
        end: new Date(2013, 9, 23, 5)
      },
      {
        start: new Date(2013, 9, 23, 9),
        end: new Date(2013, 9, 23, 17)
      }
    ];
    var expectedTimeSpans = [
      {
        start: new Date(2013, 9, 23, 2),
        end: new Date(2013, 9, 23, 5)
      },
      {
        start: new Date(2013, 9, 23, 9),
        end: new Date(2013, 9, 23, 17)
      }
    ];
    spyOn(controller.formData, 'timingChanged');
    controller.instantTimeSpanChanged();
    expect(controller.formData.calendar.timeSpans).toEqual(expectedTimeSpans);
  });

  it('should update the time-span list when removing a time-span', function (done) {
    EventFormData
        .timingChanged$
        .subscribe(done);

    var controller = getController();
    controller.timeSpans = [
      {
        allDay: false,
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
        allDay: false,
        start: new Date(2013, 9, 23, 2),
        end: new Date(2013, 9, 23, 5)
      }
    ];
    spyOn(controller.formData, 'timingChanged');
    controller.removeTimeSpan(controller.timeSpans[1]);
    expect(controller.timeSpans).toEqual(expectedTimeSpans);
  });

  it('should validate time-spans before saving them and show missing requirements', function (done) {
    EventFormData
        .timingChanged$
        .subscribe(done);

    var controller = getController();
    controller.timeSpans = [
      {
        allDay: false,
        start: undefined,
        end: undefined
      },
      {
        allDay: false,
        start: new Date(2013, 9, 23, 13),
        end: new Date(2013, 9, 23, 9)
      }
    ];
    var expectedRequirements = [
      ['timedWhenNotAllDay'],
      ['startBeforeEnd']
    ];
    spyOn(controller.formData, 'saveTimeSpans');

    controller.instantTimeSpanChanged();
    expect(controller.timeSpanRequirements).toEqual(expectedRequirements);
    expect(controller.formData.saveTimeSpans).not.toHaveBeenCalled();
  });

  it('should show a time-span requirement when the start- is before end-day', function (done) {
    EventFormData
        .timingChanged$
        .subscribe(done);

    var controller = getController();
    controller.timeSpans = [
      {
        allDay: false,
        start: new Date(2013, 9, 23, 13),
        end: new Date(2013, 9, 21, 9),
        endTouched: true
      },
      {
        allDay: true,
        start: new Date(2013, 9, 23, 13),
        end: new Date(2013, 9, 21, 9),
        endTouched: true
      }
    ];
    var expectedRequirements = [['startBeforeEndDay'], ['startBeforeEndDay']];
    spyOn(controller.formData, 'saveTimeSpans');

    controller.instantTimeSpanChanged();
    expect(controller.timeSpanRequirements).toEqual(expectedRequirements);
    expect(controller.formData.saveTimeSpans).not.toHaveBeenCalled();
  });

  it('should show a time-span requirement when the begin- is before end-time', function (done) {
    EventFormData
        .timingChanged$
        .subscribe(done);

    var controller = getController();
    controller.timeSpans = [
      {
        allDay: true,
        start: new Date(2013, 9, 23, 13),
        end: new Date(2013, 9, 23, 9)
      },
      {
        allDay: false,
        start: new Date(2013, 9, 23, 13),
        end: new Date(2013, 9, 23, 9)
      }
    ];
    var expectedRequirements = [[], ['startBeforeEnd']];
    spyOn(controller.formData, 'saveTimeSpans');

    controller.instantTimeSpanChanged();
    expect(controller.timeSpanRequirements).toEqual(expectedRequirements);
    expect(controller.formData.saveTimeSpans).not.toHaveBeenCalled();
  });

  it('should show a time-span requirement when the begin or end date is too far in the future', function (done) {
    EventFormData
        .timingChanged$
        .subscribe(done);

    // Get current date
    var d = new Date();
    var controller = getController();
    controller.timeSpans = [
      {
        allDay: true,
        start: new Date(2013, 9, 23, 9),
        end: new Date(2023, 9, 23, 9)
      }
    ];
    var expectedRequirements = [['tooFarInFuture']];

    spyOn(controller.formData, 'saveTimeSpans');
    controller.instantTimeSpanChanged();
    expect(controller.timeSpanRequirements).toEqual(expectedRequirements);
    expect(controller.formData.saveTimeSpans).not.toHaveBeenCalled();
  });

  it('should switch the calendar type to multiple when there is more than one time-span', function (done) {
      EventFormData
        .timingChanged$
        .subscribe(done);

      var controller = getController();
      controller.type = 'single';
      controller.timeSpans = [
          {
              allDay: true,
              start: new Date(2013, 9, 23, 2),
              end: new Date(2013, 9, 23, 5)
          },
          {
              allDay: false,
              start: new Date(2013, 9, 23, 9),
              end: new Date(2013, 9, 23, 19)
          }
      ];
      spyOn(controller.formData, 'timingChanged');
      controller.instantTimeSpanChanged();
      expect(controller.type).toEqual('multiple');
  });

  it('should switch the calendar type to single when a time-span is removed and there is only one left', function (done) {
      EventFormData
        .timingChanged$
        .subscribe(done);

      var controller = getController();
      controller.type = 'multiple';
      controller.timeSpans = [
          {
              allDay: true,
              start: new Date(2013, 9, 23, 2),
              end: new Date(2013, 9, 23, 5)
          },
          {
              allDay: false,
              start: new Date(2013, 9, 23, 9),
              end: new Date(2013, 9, 23, 19)
          }
      ];

      spyOn(controller.formData, 'timingChanged');
      controller.removeTimeSpan(controller.timeSpans[1]);
      expect(controller.type).toEqual('single');
  });
});
