'use strict';

describe('Controller: Form Calendar', function () {
  var $controller, EventFormData, $scope;

  beforeEach(module('udb.event-form'));

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

  it('should default to the "single" calendar type when initializing', function () {
    var controller = getController();
    expect(controller.formData.calendarType).toEqual('single');
    expect(controller.type).toEqual('single');
  });

  it('should set today as the default bootstrap start-time-span when creating a new offer', function () {
    var today = new Date(2013, 9, 23, 1);
    jasmine.clock().mockDate(today);
    var controller = getController();
    var expectedStart = new Date(2013, 9, 23, 2);
    expect(controller.bootstrapDate).toEqual(expectedStart);
  });

  it('should bootstrap timestamps', function () {
    var controller = getController();
    controller.timeSpans = [];
    spyOn(controller.formData, 'timingChanged');
    controller.createTimeSpan();
    expect(controller.showBootstrapTimeSpans).toEqual(true);
  });

  it('should init timestamps after bootstrapping', function () {
    var controller = getController();
    controller.bootstrapDate = new Date(2013, 9, 23, 2);
    controller.timeSpans = [];
    controller.confirmBootstrap();
    var expectedTimeSpans = [
      {
        allDay: true,
        start: new Date(2013, 9, 23, 2),
        end: new Date(2013, 9, 23, 6)
      }
    ];
    spyOn(controller.formData, 'timingChanged');
    expect(controller.timeSpans).toEqual(expectedTimeSpans);
  });

  it('should automatically move to the next day and save on adding new day', function(){
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
        start: new Date(2013, 9, 24, 9),
        end: new Date(2013, 9, 24, 9)
      }
    ];
    spyOn(controller, 'instantTimeSpanChanged');

    controller.createTimeSpan();
    expect(controller.timeSpans).toEqual(expectedTimeSpans);
    expect(controller.instantTimeSpanChanged).toHaveBeenCalled();
  })

  it('should save timestamps to form-data when time-spans change', function () {
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
    var expectedTimestamps = [
      {
        date: new Date(2013, 9, 23),
        startHour: '00:00',
        startHourAsDate: new Date(2013, 9, 23, 0, 0),
        showStartHour: true,
        endHour: '23:59',
        endHourAsDate: new Date(2013, 9, 23, 23, 59),
        showEndHour: true
      },
      {
        date: new Date(2013, 9, 23),
        startHour: '09:00',
        startHourAsDate: new Date(2013, 9, 23, 9),
        showStartHour: true,
        endHour: '17:00',
        endHourAsDate: new Date(2013, 9, 23, 17),
        showEndHour: true
      }
    ];
    spyOn(controller.formData, 'timingChanged');
    controller.instantTimeSpanChanged();
    expect(controller.formData.timestamps).toEqual(expectedTimestamps);
  });

  it('should load form-data timestamps as time-spans', function () {
    var formData = EventFormData;

    var expectedTimeSpans = [
      {
        start: new Date(2013, 9, 23),
        end: new Date(2013, 9, 23, 23, 59),
        allDay: true
      },
      {
        start: new Date(2013, 9, 23, 9),
        end: new Date(2013, 9, 23, 17),
        allDay: false
      }
    ];
    var timestamps = [
      {
        date: new Date(2013, 9, 23),
        startHour: '00:00',
        startHourAsDate: new Date(2013, 9, 23, 0, 0),
        showStartHour: true,
        endHour: '23:59',
        endHourAsDate: moment(new Date(2013, 9, 23)).endOf('day').startOf('minute').toDate(),
        showEndHour: true
      },
      {
        date: new Date(2013, 9, 23),
        startHour: '09:00',
        startHourAsDate: new Date(2013, 9, 23, 9),
        showStartHour: true,
        endHour: '17:00',
        endHourAsDate: new Date(2013, 9, 23, 17),
        showEndHour: true
      }
    ];

    EventFormData.init();
    EventFormData.initCalendar();
    spyOn(EventFormData, 'timingChanged');
    EventFormData.saveTimestamps(timestamps);

    var controller = getController(formData);

    controller.instantTimeSpanChanged();
    expect(controller.timeSpans).toEqual(expectedTimeSpans);
  });

  it('should update the time-span list when removing a time-span', function () {
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
      }
    ];
    spyOn(controller.formData, 'timingChanged');
    controller.removeTimeSpan(controller.timeSpans[1]);
    expect(controller.timeSpans).toEqual(expectedTimeSpans);
  });

  it('should validate time-spans before saving them and show missing requirements', function () {
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
    spyOn(controller.formData, 'saveTimestamps');

    controller.instantTimeSpanChanged();
    expect(controller.timeSpanRequirements).toEqual(expectedRequirements);
    expect(controller.formData.saveTimestamps).not.toHaveBeenCalled();
  });

  it('should show a time-span requirement when the start- is before end-day', function () {
    var controller = getController();
    controller.timeSpans = [
      {
        allDay: false,
        start: new Date(2013, 9, 23, 13),
        end: new Date(2013, 9, 21, 9)
      },
      {
        allDay: true,
        start: new Date(2013, 9, 23, 13),
        end: new Date(2013, 9, 21, 9)
      }
    ];
    var expectedRequirements = [['startBeforeEndDay'], ['startBeforeEndDay']];
    spyOn(controller.formData, 'saveTimestamps');

    controller.instantTimeSpanChanged();
    expect(controller.timeSpanRequirements).toEqual(expectedRequirements);
    expect(controller.formData.saveTimestamps).not.toHaveBeenCalled();
  });

  it('should show a time-span requirement when the begin- is before end-time', function () {
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
    spyOn(controller.formData, 'saveTimestamps');

    controller.instantTimeSpanChanged();
    expect(controller.timeSpanRequirements).toEqual(expectedRequirements);
    expect(controller.formData.saveTimestamps).not.toHaveBeenCalled();
  });

  it('should switch the calendar type to multiple when there is more than one time-span', function () {
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

  it('should switch the calendar type to single when a time-span is removed and there is only one left', function () {
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
