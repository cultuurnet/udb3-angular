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

  it('should show both step 2 and 3 right away when creating an offer with a place type', function () {
    stepController.init(EventFormData);
    var placeType = {label:'Natuur, park of tuin',id:'0.15.0.0.0',primary:true};

    scope.setEventType(placeType, false);

    expect(EventFormData.showStep2).toEqual(true);
    expect(EventFormData.showStep3).toEqual(true);
    expect(EventFormData.showStep4).toEqual(false);
    expect(EventFormData.showStep5).toEqual(false);
  });

  it('should only show the next two steps when creating an offer with an event type', function () {
    stepController.init(EventFormData);
    var eventType = {id:'1.2.1.0.0',label:'Architectuur'};

    scope.setEventType(eventType, true);

    expect(EventFormData.showStep2).toEqual(true);
    expect(EventFormData.showStep3).toEqual(true);
    expect(EventFormData.showStep4).toEqual(false);
    expect(EventFormData.showStep5).toEqual(false);
  });
});
