'use strict';

describe('EventFormPlaceModalController', function() {
  var
    $scope,
    $controller,
    $uibModalInstance,
    categories,
    eventCrud,
    location,
    title,
    UdbPlace,
    controller;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function($rootScope, _$controller_, $injector) {
    $controller = _$controller_;
    $scope = $rootScope.$new();

    $uibModalInstance = jasmine.createSpyObj('$uibModalInstance', ['close', 'dismiss']);
    eventCrud = $injector.get('eventCrud');
    UdbPlace = $injector.get('UdbPlace');

  }));

  beforeEach(function(){
    categories = getCategories();
    location = {
      address : {
        addressLocality : '',
        postalCode : ''
      }
    };
    title= 'Test';
    controller = getController();
  });

  function getController() {
    return $controller(
      'EventFormPlaceModalController', {
        $scope: $scope,
        $uibModalInstance: $uibModalInstance,
        eventCrud : eventCrud,
        UdbPlace : UdbPlace,
        location: location,
        categories: categories,
        title: title
      }
    );
  }

  function getCategories() {
    return [
      {
        label: 'Bioscoop',
        id: 'BtVNd33sR0WntjALVbyp3w'
      },
      {
        label: 'Horeca',
        id: 'ekdc4ATGoUitCa0e6me6xA'
      },
      {
        label: 'Archeologische Site',
        id: '3CuHvenJ+EGkcvhXLg9Ykg'
      }
    ];
  }

  it('should return the id of Archeologische Site', function () {
    expect($scope.categories).toEqual(categories);
    expect($scope.newPlace.eventType.id).toEqual('3CuHvenJ+EGkcvhXLg9Ykg');
  });

});
