'use strict';

describe('Controller: Publish Form Modal', function() {
  var
    $scope,
    $controller,
    $uibModalInstance,
    eventFormData;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function($rootScope, _$controller_, $injector) {
    $controller = _$controller_;
    $scope = $rootScope.$new();
    $uibModalInstance = jasmine.createSpyObj('$uibModalInstance', ['close','dismiss']);
    eventFormData = $injector.get('EventFormData');
  }));

  function getController() {
    return $controller(
      'EventFormPublishModalController', {
        $scope: $scope,
        $uibModalInstance: $uibModalInstance,
        eventFormData : eventFormData,
      }
    );
  }

  it('should initialize the controller', function () {
    var controller = getController();
    expect(controller).toBeDefined();
    expect(controller.error).toBeFalsy();
    expect(controller.isToday).toBeTruthy();
  });

  it('should set the necessary fields when on focus', function () {
    var controller = getController();
    controller.onFocus();
    expect(controller.error).toBeFalsy();
    expect(controller.isToday).toBeFalsy();
    expect(controller.drp.startOpened).toBeTruthy();
  });

 it('should throw an error when publish is called on the same day', function () {
    var controller = getController();
    controller.publish();
    expect(controller.error).toBeTruthy();
  });

 it('shouldnt throw an error when publish is called on a day in the future', function(){
    var controller = getController();
    controller.date = new Date('10/03/3000');
    controller.publish();
    expect(controller.error).toBeFalsy();
    });

  it('should throw an error when publish is called on a day in the past',function(){
    var controller = getController();
    controller.date = new Date('10/03/300');
    controller.publish();
    expect(controller.error).toBeTruthy();
  });

  it('should set isToday to false if eventFormDat contains a date',function(){
      eventFormData.availableFrom = new Date('10/03/3000');
      var controller = getController();
      expect(controller.isToday).toBeFalsy();
  });

  it('should dismiss the modal when dimissed', function(){
      var controller = getController();
      controller.dismiss();
  })


});
