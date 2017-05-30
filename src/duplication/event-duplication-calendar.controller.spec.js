'use strict';

describe('Controller: Event Duplication Calendar', function () {

  var $controller, EventFormData, $scope, $rootScope, $timeout;

  beforeEach(module('udb.duplication'));

  beforeEach(inject(function($injector, _$rootScope_) {
    $controller = $injector.get('$controller');
    EventFormData = $injector.get('EventFormData');
    $timeout = $injector.get('$timeout');
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
  }));

  function getController(formData) {
    if (!formData) {
      EventFormData.init();
      EventFormData.initCalendar();

      formData = EventFormData;
    }
    return $controller('DuplicationCalendarController', {
      EventFormData: formData,
      $scope: $scope
    });
  }

  it('should not edit the original event when changing timing info', function(done) {
    EventFormData.setCalendarType('single');
    var calendarController = getController(EventFormData);

    calendarController.formData
      .timingChanged$
      .subscribe(done);

    calendarController.formData.setCalendarType('permanent');

    expect(EventFormData.calendarType).toEqual('single');
  });

  it('should emit a message when the timing of a duplicate changes', function (done) {
    var calendarController = getController();
    spyOn($rootScope, '$emit');

    calendarController.formData
      .timingChanged$
      .subscribe(done);

    calendarController.formData.timingChanged();

    expect($rootScope.$emit).toHaveBeenCalledWith('duplicateTimingChanged', jasmine.any(Object));
  });
});
