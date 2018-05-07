'use strict';

describe('Controller: Event Form Publish', function () {

  beforeEach(module('udb.event-form'));

  var $controller, $scope, EventFormData, eventCrud, $q, $location;

  beforeEach(inject(function ($rootScope, $injector) {
    $controller = $injector.get('$controller');
    $scope = $rootScope.$new();
    EventFormData = $injector.get('EventFormData');
    $q = $injector.get('$q');
    eventCrud = jasmine.createSpyObj('eventCrud', [
      'publishOffer'
    ]);
    $location = jasmine.createSpyObj('$location', ['path']);
  }));

  function getController(appConfig) {
    var dependencies = {
      $scope: $scope,
      EventFormData: EventFormData,
      eventCrud: eventCrud,
      $location: $location
    };

    if (appConfig) {
      dependencies.appConfig = appConfig;
    }

    return $controller('EventFormPublishController', dependencies);
  }

  it('should publish an offer when not published already', function () {
    var job = {
      task: {
        promise: $q.resolve()
      }
    };
    eventCrud.publishOffer.and.returnValue($q.resolve(job));
    EventFormData.init();
    EventFormData.id = 'da86358c-d52c-429b-89c6-7adffd64ab55';
    expect(EventFormData.workflowStatus).toEqual('DRAFT');

    var controller = getController();
    controller.publish();

    $scope.$digest();

    expect(EventFormData.workflowStatus).toEqual('READY_FOR_VALIDATION');
    expect($location.path).toHaveBeenCalledWith('/event/da86358c-d52c-429b-89c6-7adffd64ab55/published');
  });

  it('should preview an offer when published', function () {
    var job = {
      task: {
        promise: $q.resolve()
      }
    };
    eventCrud.publishOffer.and.returnValue($q.resolve(job));
    EventFormData.init();
    EventFormData.id = 'da86358c-d52c-429b-89c6-7adffd64ab55';
    EventFormData.workflowStatus = 'READY_FOR_VALIDATION';

    var controller = getController();
    controller.preview();

    $scope.$digest();
    expect($location.path).toHaveBeenCalledWith('/event/da86358c-d52c-429b-89c6-7adffd64ab55/saved');
  });

  it('should display publish errors', function () {
    var job = {
      task: {
        promise: $q.reject()
      }
    };
    eventCrud.publishOffer.and.returnValue($q.resolve(job));
    EventFormData.init();
    EventFormData.id = 'da86358c-d52c-429b-89c6-7adffd64ab55';
    expect(EventFormData.workflowStatus).toEqual('DRAFT');

    var controller = getController();
    controller.publish();

    $scope.$digest();

    expect(controller.error).toEqual('Dit event kon niet gepubliceerd worden, gelieve later opnieuw te proberen.');
  });

  it('should detect a draft workflowStatus', function () {
    var controller = getController();
    expect(controller.isDraft('DRAFT')).toEqual(true);
  });

  it('should detect a different workflowStatus', function () {
    var controller = getController();
    expect(controller.isDraft('READY_FOR_VALIDATION')).toEqual(false);
  });

  it('should show the publicationDate in the future', function () {
    var controller = getController();
    EventFormData.init();
    EventFormData.availableFrom = 'da86358c-d52c-429b-89c6-7adffd64ab55';
  });

  it('should use the default publication date if a valid date is configured', function () {
    var configWithDefaultPublicationDate = {
      offerEditor: {
        defaultPublicationDate: "2017-08-01"
      }
    };
    var controller = getController(configWithDefaultPublicationDate);

    expect(controller.hasNoDefault).toEqual(false);
  });

  it('should ask for a publication date if no valid date is configured', function () {
    var configWithEmptyPublicationDate = {
      offerEditor: {
        defaultPublicationDate: ""
      }
    };
    var controller = getController(configWithEmptyPublicationDate);

    expect(controller.hasNoDefault).toEqual(true);
  });

  it('should show the "Publish later"-button if an event has an earliest startdate later then tomorrow', function () {
    EventFormData.init();
    EventFormData.calendar.calendarType = "multiple";
    EventFormData.calendar.timeSpans = [
      {
        start: new Date(2017, 9, 23)
      },
      {
        start: new Date(2017, 8, 22)
      }
    ];
    EventFormData.hasNoDefault = true;
    EventFormData.workflowStatus = 'DRAFT';
    var today = new Date(2017, 8, 19);
    jasmine.clock().mockDate(today);
    var controller = getController();
    expect(controller.canPublishLater()).toEqual(true);
  });

  it('should not show the "Publish later"-button if an event has an earliest startdate earlier then tomorrow', function () {
    EventFormData.init();
    EventFormData.calendar.calendarType = "multiple";
    EventFormData.calendar.timeSpans = [
      {
        start: new Date(2017, 9, 23)
      },
      {
        start: new Date(2017, 8, 22)
      }
    ];
    EventFormData.hasNoDefault = true;
    EventFormData.workflowStatus = 'DRAFT';
    var today = new Date(2017, 8, 23);
    jasmine.clock().mockDate(today);
    var controller = getController();
    expect(controller.canPublishLater()).toEqual(false);
  });

  it('should show the "Publish later"-button for periodic events that start after today', function () {
    EventFormData.init();
    EventFormData.calendarType = "periodic";
    EventFormData.hasNoDefault = true;
    EventFormData.workflowStatus = 'DRAFT';
    EventFormData.setStartDate(new Date(2017, 8, 24));
    EventFormData.setEndDate(new Date(2018, 8, 23));
    var today = new Date(2017, 8, 23);
    jasmine.clock().mockDate(today);
    var controller = getController();
    expect(controller.canPublishLater()).toEqual(true);
  });

  it('should not show the "Publish later"-button for periodic events that start today', function () {
    EventFormData.init();
    EventFormData.calendar.calendarType = "periodic";
    EventFormData.hasNoDefault = true;
    EventFormData.workflowStatus = 'DRAFT';
    EventFormData.setStartDate(new Date(2017, 8, 23));
    EventFormData.setEndDate(new Date(2018, 8, 23));
    var today = new Date(2017, 8, 23);
    jasmine.clock().mockDate(today);
    var controller = getController();
    expect(controller.canPublishLater()).toEqual(false);
  });

  it('should not show the "Publish later"-button for periodic events that already started', function () {
    EventFormData.init();
    EventFormData.calendar.calendarType = "periodic";
    EventFormData.hasNoDefault = true;
    EventFormData.workflowStatus = 'DRAFT';
    EventFormData.setStartDate(new Date(2016, 8, 23));
    EventFormData.setEndDate(new Date(2018, 8, 23));
    var today = new Date(2017, 8, 23);
    jasmine.clock().mockDate(today);
    var controller = getController();
    expect(controller.canPublishLater()).toEqual(false);
  });

  it('should always show the "Publish later"-button for permanent events ', function () {
    EventFormData.init();
    EventFormData.calendar.calendarType = "permanent";
    EventFormData.hasNoDefault = true;
    EventFormData.workflowStatus = 'DRAFT';
    var today = new Date(2017, 8, 23);
    jasmine.clock().mockDate(today);
    var controller = getController();
    expect(controller.canPublishLater()).toEqual(true);
  });
});
