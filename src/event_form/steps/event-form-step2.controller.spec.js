'use strict';

describe('Controller: event form step 2', function () {

  beforeEach(module('udb.event-form'));

  var $controller, stepController, scope, $q, EventFormData;

  beforeEach(inject(function ($rootScope, $injector) {
    $controller = $injector.get('$controller');
    scope = $rootScope;
    $q = $injector.get('$q');
    EventFormData = $injector.get('EventFormData');
    EventFormData.initCalendar();
    stepController = $controller('EventFormStep2Controller', {
      $scope: scope
    });
  }));

  it('should reset both activeCalendarType and calendarType when resetting the calendar', function (){
    EventFormData.calendarType = 'periodic';
    EventFormData.activeCalendarType = 'periodic';
    scope.$digest();
    scope.resetCalendar();

    expect(EventFormData.calendarType).toEqual('');
    expect(EventFormData.activeCalendarType).toEqual('');
  });
});