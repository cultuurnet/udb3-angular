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
    $uibModalInstance = jasmine.createSpyObj('$uibModalInstance', ['close','dismiss']);
    eventFormData = $injector.get('EventFormData');
    eventCrud = jasmine.createSpyObj('eventCrud', [
      'publishOffer'
    ]);
    publishEvent = eventCrud.publishOffer;
  }));

  function getController() {
    return $controller(
      'EventFormPublishModalController', {
        $scope: $scope,
        $uibModalInstance: $uibModalInstance,
        eventFormData: eventFormData,
        eventCrud: eventCrud,
        publishEvent: publishEvent,
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

 it('should not throw an error when the publicationdate is a day in the future', function(){
    var controller = getController();
    controller.publicationDate = new Date('10/03/3000');
    controller.savePublicationDate();
    expect(controller.error).toBeFalsy();
  });

  it('should throw an error when the publicationdate is a day in the past',function(){
    var controller = getController();
    controller.publicationDate = new Date('10/03/300');
    controller.savePublicationDate();
    expect(controller.error).toBeTruthy();
  });

  it('should dismiss the modal when dimissed', function(){
    var controller = getController();
    controller.dismiss();
  })

});
