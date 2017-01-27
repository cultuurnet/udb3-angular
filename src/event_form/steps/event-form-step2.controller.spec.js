'use strict';

describe('Controller: event form step 2', function () {

  beforeEach(module('udb.event-form'));

  var $controller, stepController, scope, $q, EventFormData;

  beforeEach(inject(function ($rootScope, $injector) {
    $controller = $injector.get('$controller');
    scope = $rootScope;
    $q = $injector.get('$q');
    EventFormData = $injector.get('EventFormData');
    stepController = $controller('EventFormStep2Controller', {
      $scope: scope
    });
  }));

  it('should notify that the event timing has changed when toggling off the start time', function () {
    spyOn(stepController, 'eventTimingChanged');

    var timestamp = {
      date: new Date(),
      startHour: '',
      endHour: '',
      showEndHour: true,
      showStartHour: false
    };

    stepController.toggleStartHour(timestamp);
    expect(stepController.eventTimingChanged).toHaveBeenCalled();
  });

  it('should notify that the event timing has changed when toggling off the end time', function () {
    spyOn(stepController, 'eventTimingChanged');

    var timestamp = {
      date: new Date(),
      startHour: '',
      endHour: '',
      showEndHour: false,
      showStartHour: false
    };

    scope.toggleEndHour(timestamp);
    expect(timestamp.endHour).toEqual('23:59');
    expect(stepController.eventTimingChanged).toHaveBeenCalled();
  });

  it('should update timing when the calendar type is set to permanent', function () {
    spyOn(stepController, 'eventTimingChanged');

    scope.setCalendarType('permanent');

    expect(stepController.eventTimingChanged).toHaveBeenCalled();
  });

  it('should display an error message when the range of periodic calendar is invalid', function (){
    EventFormData.id = 1;
    EventFormData.startDate = new Date('2015-12-12');
    EventFormData.endDate = new Date('2015-12-10');
    EventFormData.calendarType = 'periodic';
    stepController.periodicEventTimingChanged();

    expect(stepController.periodicRangeError).toEqual(true);
  });

  it('should reset both activeCalendarType and calendarType when resetting the calendar', function (){
    EventFormData.calendarType = 'periodic';
    EventFormData.activeCalendarType = 'periodic';
    scope.$digest();
    scope.resetCalendar();

    expect(EventFormData.calendarType).toEqual('');
    expect(EventFormData.activeCalendarType).toEqual('');
  });

  it('should notify that the event timing has changed when the start or end hour changed', function () {
    spyOn(stepController, 'eventTimingChanged');

    var timestamp = {
      date: new Date(),
      startHour: '',
      startHourAsDate: new Date('2017', '01', '27', '14', '00'),
      endHourAsDate: new Date('2017', '01', '27', '18', '00'),
      endHour: '',
      showEndHour: true,
      showStartHour: true
    };

    scope.hoursChanged(timestamp);

    expect(timestamp.startHour).toEqual('14:00');
    expect(timestamp.endHour).toEqual('18:00');
    expect(stepController.eventTimingChanged).toHaveBeenCalled();
  });

  it('should notify that the event timing has changed when the start or end hour is reset', function () {
    spyOn(stepController, 'eventTimingChanged');

    var timestamp = {
      date: new Date(),
      startHour: '',
      endHour: '',
      showEndHour: true,
      showStartHour: true
    };

    scope.hoursChanged(timestamp);

    expect(timestamp.startHour).toEqual('00:00');
    expect(timestamp.endHour).toEqual('00:00');
    expect(stepController.eventTimingChanged).toHaveBeenCalled();
  });

  it('should add a timestamp to the event form data', function () {
    spyOn(EventFormData, 'addTimestamp');
    scope.addTimestamp();

    expect(EventFormData.addTimestamp).toHaveBeenCalledWith('', '', '', '', '');
  });

  it('should set a valid placeholder for start en end hour when toggle start hour is on', function () {
    var timestamp = {
      date: new Date('2017-01-27T23:00:00Z'),
      startHour: '',
      endHour: '',
      showEndHour: true,
      showStartHour: true
    };

    stepController.toggleStartHour(timestamp);

    expect(timestamp.startHour).toEqual('23:00');
    expect(timestamp.endHour).toEqual('23:59');
    expect(timestamp.showEndHour).toBeFalsy();
  });

  it('should set a valid placeholder for end hour when the toggle end hour is on', function () {
    var timestamp = {
      date: new Date('2017-01-27T14:00:00'),
      startHour: '',
      startHourAsDate: new Date('2017', '01', '27', '19', '00'),
      endHour: '',
      showEndHour: true,
      showStartHour: true
    };

    scope.toggleEndHour(timestamp);

    expect(timestamp.endHour).toEqual('22:00');
  });

  it('should notify that the event timing has changed when saving opening hours', function () {
    spyOn(stepController, 'eventTimingChanged');
    scope.saveOpeningHours();
    expect(stepController.eventTimingChanged).toHaveBeenCalled();
  });

  it('should fire an emit when the event timing is changed', function () {
    spyOn(scope, '$emit');
    EventFormData.id = 'dit is een fake id';

    stepController.eventTimingChanged();
    expect(scope.$emit).toHaveBeenCalledWith('eventTimingChanged', EventFormData);
  });
});