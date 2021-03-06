'use strict';

describe('Controller: Event Duplication Calendar', function () {

  var $controller, EventFormData, $scope, $rootScope, $timeout;

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
    EventFormData
        .timingChanged$
        .subscribe(done);
    
    EventFormData.setCalendarType('single');
    var calendarController = getController(EventFormData);

    calendarController.formData
      .timingChanged$
      .subscribe(done);

    calendarController.formData.setCalendarType('permanent');

    expect(EventFormData.calendar.calendarType).toEqual('single');
  });

  it('should emit a message when the timing of a duplicate changes', function (done) {
    EventFormData
        .timingChanged$
        .subscribe(done);

    var calendarController = getController();
    spyOn($rootScope, '$emit');

    calendarController.formData
      .timingChanged$
      .subscribe(done);

    calendarController.formData.timingChanged();

    expect($rootScope.$emit).toHaveBeenCalledWith('duplicateTimingChanged', jasmine.any(Object));
  });
});
