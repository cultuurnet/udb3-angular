'use strict';

describe('Controller: event form step 2', function () {

  beforeEach(module('udb.event-form'));

  var $controller, stepController, $scope, $q, EventFormData;

  beforeEach(inject(function ($rootScope, $injector) {
    $controller = $injector.get('$controller');
    $scope = $rootScope;
    $q = $injector.get('$q');
    EventFormData = $injector.get('EventFormData');
    EventFormData.initCalendar();
    stepController = $controller('EventFormStep2Controller', {
      $scope: $scope,
      $rootScope: $rootScope,
      EventFormData: EventFormData
    });
  }));

  it('should initialise the controller', function () {
    expect($scope.eventFormData).toEqual(EventFormData);
  });

  it('should fire an emit when EventFormData has an id', function () {
    spyOn($scope, '$emit');
    EventFormData.id = '1234567890';

    stepController.eventTimingChanged();

    expect($scope.$emit).toHaveBeenCalledWith('eventTimingChanged', EventFormData);
  })
});