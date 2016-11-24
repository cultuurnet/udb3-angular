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

    stepController.toggleStartHour(timestamp);
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
});