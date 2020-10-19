'use strict';

describe('Controller: Publish Form Modal', function() {
  var
    $scope,
    $controller,
    $uibModalInstance,
    eventFormData,
    eventCrud,
    publishEvent;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function($rootScope, _$controller_, $injector) {
    $controller = _$controller_;
    $scope = $rootScope.$new();
    $uibModalInstance = jasmine.createSpyObj('$uibModalInstance', ['close', 'dismiss']);
    eventFormData = $injector.get('EventFormData');
    eventFormData.calendar.calendarType = 'single';
    eventFormData.calendar.timeSpans = [
      {
        start : new Date()
      }
    ];
    eventCrud = jasmine.createSpyObj('eventCrud', [
      'publishOffer'
    ]);
    publishEvent = eventCrud.publishOffer;
  }));

  function getController(formData) {
    return $controller(
      'EventFormPublishModalController', {
        $scope: $scope,
        $uibModalInstance: $uibModalInstance,
        eventFormData: formData || eventFormData,
        eventCrud: eventCrud,
        publishEvent: publishEvent
      }
    );
  }

  it('should initialize the controller', function () {
    var controller = getController();
    expect(controller).toBeDefined();
    expect(controller.error).toBeFalsy();
  });

  it('should set the necessary fields when on focus', function () {
    var controller = getController();
    controller.onFocus();
    expect(controller.drp.startOpened).toBeTruthy();
  });

 it('should not throw an error when the publication date is a day in the future', function(){
    var controller = getController();
    controller.publicationDate = new Date('10/03/3000');
    controller.savePublicationDate();
    expect(controller.error).toBeFalsy();
  });

  it('should throw an error when the publication date is a day in the past',function(){
    var controller = getController();
    controller.publicationDate = new Date('10/03/300');
    controller.savePublicationDate();
    expect(controller.error).toBeTruthy();
  });

  it('should dismiss the modal when dismissed', function(){
    var controller = getController();
    controller.dismiss();
    expect($uibModalInstance.dismiss).toHaveBeenCalled();
  });

  it('should lower limit the publication dates to choose from to a day after today', function () {
    var formData = _.cloneDeep(eventFormData);
    var today = new Date(2017, 9, 23);

    jasmine.clock().mockDate(today);

    var controller = getController(formData);
    var earliestPublicationDate = controller.drp.options.minDate;

    expect(earliestPublicationDate).toEqual(new Date('10/24/2017'));
  });
});
