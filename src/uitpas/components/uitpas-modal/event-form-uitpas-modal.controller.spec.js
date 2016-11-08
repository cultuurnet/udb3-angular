'use strict';

describe('Controller: UiTPAS modal', function() {

  var $controller, $rootScope, scope, $uibModalInstance, udbUitpasApi, $q;

  var organizerCardSystems = [
    {
      id: '1',
      name: 'UiTPAS Dender',
      distributionKeys: [
        {
          id: '182',
          name: 'CC Cultureel Centrum - 1,5 EUR / dag'
        }
      ]
    }
  ];

  var checkedCardSystems = [
    {
      distributionKeyId: '182',
      distributionKeys: [
        {
          id: '182',
          name: 'CC Cultureel Centrum - 1,5 EUR / dag'
        }
      ]
    }
  ];

  beforeEach(module('udb.uitpas'));

  beforeEach(inject(function ($injector) {
    $controller = $injector.get('$controller');
    $rootScope = $injector.get('$rootScope');
    $q = $injector.get('$q');
    scope = $rootScope;
    $uibModalInstance = jasmine.createSpyObj('$uibModalInstance', ['close', 'dismiss']);
    udbUitpasApi = jasmine.createSpyObj('udbUitpasApi', ['getEventUitpasData', 'findOrganisationsCardSystems']);
  }));

  function getController() {
    udbUitpasApi.findOrganisationsCardSystems.and.returnValue($q.resolve(organizerCardSystems));
    udbUitpasApi.getEventUitpasData.and.returnValue($q.resolve(['182']));

    var controller =  $controller('EventFormUitpasModalController', {
      $scope: scope,
      organisation: {},
      offerData: {
        id: '276e3283-a9ba-4eac-aa25-3c797d37532a',
        labels: ['UiTPAS Dender']
      },
      udbUitpasApi: udbUitpasApi,
      $uibModalInstance: $uibModalInstance
    });

    $scope.$digest();

    return controller;
  }

  xit('should make sure all selected cardsystems have a distribution key set', function () {
    var controller = getController();
    scope.validate();
    expect(scope.disableSubmit).toEqual(false);
  });

  xit('should disable the submit button when an active cardsystem does not have a key selected', function () {
    var controller = getController();
    scope.checkedCardSystems[0].distributionKeyId = '';
    scope.validate();
    expect(scope.disableSubmit).toEqual(true);
  });
});