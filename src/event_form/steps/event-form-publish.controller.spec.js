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

  function getController() {
    return $controller('EventFormPublishController', {
      $scope: $scope,
      EventFormData: EventFormData,
      eventCrud: eventCrud,
      $location: $location
    });
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
    expect($location.path).toHaveBeenCalledWith('/event/da86358c-d52c-429b-89c6-7adffd64ab55');
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
    expect($location.path).toHaveBeenCalledWith('/event/da86358c-d52c-429b-89c6-7adffd64ab55');
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
});