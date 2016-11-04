'use strict';

describe('Controller: UiTPAS modal', function() {

  var $controller, $rootScope, scope, $uibModalInstance;

  var organizerCardSystems = [
    {
      id: '1',
      name: 'ACME INC.',
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
    scope = $rootScope;
    $uibModalInstance = jasmine.createSpyObj('$uibModalInstance', ['close', 'dismiss']);
  }));

  function getController() {
    return $controller('EventFormUitpasModalController', {
      $scope: scope,
      organizer: {},
      organizerCardSystems: organizerCardSystems,
      checkedCardSystems: checkedCardSystems,
      $uibModalInstance: $uibModalInstance
    });
  }

  it('should make sure all selected cardsystems have a distribution key set', function () {
    var controller = getController();
    scope.validate();
    expect(scope.disableSubmit).toEqual(false);
  });

  it('should disable the submit button when an active cardsystem does not have a key selected', function () {
    var controller = getController();
    scope.checkedCardSystems[0].distributionKeyId = '';
    scope.validate();
    expect(scope.disableSubmit).toEqual(true);
  });
});