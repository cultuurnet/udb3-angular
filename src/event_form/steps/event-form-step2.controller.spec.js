'use strict';

describe('Controller: event form step 2', function () {

  beforeEach(module('udb.event-form'));

  var $controller, stepController, $scope, $q, EventFormData, OpeningHoursCollection, calendarLabels;

  beforeEach(inject(function ($rootScope, $injector) {
    $controller = $injector.get('$controller');
    $scope = $rootScope;
    $q = $injector.get('$q');
    EventFormData = $injector.get('EventFormData');
    EventFormData.initCalendar();
    calendarLabels = $injector.get('calendarLabels');
    OpeningHoursCollection = $injector.get('OpeningHoursCollection');
    stepController = $controller('EventFormStep2Controller', {
      $scope: $scope,
      $rootScope: $rootScope,
      EventFormData: EventFormData,
      calendarLabels: calendarLabels,
      OpeningHoursCollection: OpeningHoursCollection
    });
  }));

  it('should initialise the controller', function () {
    expect($scope.eventFormData).toEqual(EventFormData);
    expect($scope.calendarLabels).toEqual(calendarLabels);
    expect($scope.openingHours).toEqual(OpeningHoursCollection);
  });

  it('should fire an emit when EventFormData has an id', function () {
    spyOn($scope, '$emit');
    EventFormData.id = '1234567890';

    stepController.eventTimingChanged();

    expect($scope.$emit).toHaveBeenCalledWith('eventTimingChanged', EventFormData);
  })
});