'use strict';

describe('Controller: event form step 1', function () {

  beforeEach(module('udb.event-form'));

  var $controller, stepController, scope, $q, EventFormData, $rootScope;

  beforeEach(inject(function ($injector) {
    $controller = $injector.get('$controller');
    $rootScope = $injector.get('$rootScope');
    scope = $rootScope;
    $q = $injector.get('$q');
    EventFormData = $injector.get('EventFormData');
    stepController = $controller('EventFormStep1Controller', {
      $scope: scope,
      $rootScope: $rootScope
    });
  }));

  it('should trigger an update by notifying that the event theme has changed after resetting it', function () {
    spyOn(stepController, 'eventThemeChanged');
    stepController.resetTheme();
    expect(stepController.eventThemeChanged).toHaveBeenCalled();
  });

  it('should update the picker when resetting the event type', function () {
    spyOn(stepController, 'updateEventTypeAndThemePicker');
    stepController.resetEventType();
    expect(stepController.updateEventTypeAndThemePicker).toHaveBeenCalled();
  });

  it('should update the event type and theme when initializing the step with an existing event', function () {
    EventFormData.id = 1;
    spyOn(stepController, 'updateEventTypeAndThemePicker');

    stepController.init(EventFormData);

    expect(stepController.updateEventTypeAndThemePicker).toHaveBeenCalled();
  });

  it('should should disable split type view (event/place) when initializing the step with an existing event', function () {
    EventFormData.id = 1;
    spyOn(stepController, 'updateEventTypeAndThemePicker');

    stepController.init(EventFormData);

    expect(scope.splitTypes).toEqual(false);
  });

  it('should immediately show step 3 when the event type is set and a date is preselected', function () {
    EventFormData.setCalendarType('single');

    stepController.init(EventFormData);
    expect(EventFormData.showStep3).toEqual(true);
  });
});