'use strict';

describe('Controller: Offer Label Modal', function() {
  var
    udbApi,
    $q,
    $scope,
    $controller,
    $uibModalInstance;

  var labels = [
    'blub>',
    'sla',
    'komkommer',
    'coc'
  ];

  beforeEach(module('udb.entry'));

  beforeEach(inject(function($rootScope, _$q_, _$controller_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = $rootScope.$new();

    $uibModalInstance = jasmine.createSpyObj('$uibModalInstance', [
      'close',
      'dismiss'
    ]);
  }));

  function getController() {
    return $controller(
      'OfferLabelModalCtrl', {
        $uibModalInstance: $uibModalInstance
      }
    );
  }

  it('should select checked labels', function() {
    var lmc = getController();
    $scope.$digest();

    lmc.labelSelection = [
      {name: 'test1', selected: true},
      {name: 'test2', selected: false}
    ];

    lmc.ok();

    expect(lmc.alert).toEqual(false);
    expect($uibModalInstance.close).toHaveBeenCalledWith(['test1']);
  });

  it('should not accept labels shorter than 2 chars', function() {
    var lmc = getController();
    $scope.$digest();

    lmc.labelNames = 't';
    lmc.ok();

    expect(lmc.alert).toEqual('Een label mag minimum 2 en maximum 255 karakters bevatten.');
    expect($uibModalInstance.close).not.toHaveBeenCalled();
  });

  it('should not accept labels longer than 255 chars', function() {
    var lmc = getController();
    $scope.$digest();

    lmc.labelNames = 'turnip greens yarrow ricebean rutabaga endive cauliflower sea lettuce kohlrabi amaranth water spinach avocado daikon napa cabbage asparagus winter purslane kale celery potato scallion desert raisin horseradish spinach carrot soko Lotus root water spinach fennel';
    lmc.ok();

    expect(lmc.alert).toEqual('Een label mag minimum 2 en maximum 255 karakters bevatten.');
    expect($uibModalInstance.close).not.toHaveBeenCalled();
  });

  it('should construct a list from new and recent labels', function() {
    var lmc = getController();
    $scope.$digest();

    lmc.labelSelection = [
      {name: 'test1', selected: true},
      {name: 'test2', selected: false}
    ];
    lmc.labelNames = 'turnip';
    lmc.ok();

    expect(lmc.alert).toEqual(false);
    expect($uibModalInstance.close).toHaveBeenCalledWith([
      'test1',
      'turnip'
    ]);
  });

  it('should trim spaces from new labels', function() {
    var lmc = getController();
    $scope.$digest();

    lmc.labelNames = ' turnip ';
    lmc.ok();

    expect(lmc.alert).toEqual(false);
    expect($uibModalInstance.close).toHaveBeenCalledWith([
      'turnip'
    ]);
  });

  it('should split new labels on a semicolon', function() {
    var lmc = getController();
    $scope.$digest();

    lmc.labelNames = 'turnip;carrot;';
    lmc.ok();

    expect(lmc.alert).toEqual(false);
    expect($uibModalInstance.close).toHaveBeenCalledWith([
      'turnip',
      'carrot'
    ]);
  });

  it('should not send a list of labels on cancel', function() {
    var lmc = getController();
    $scope.$digest();

    lmc.close();

    expect($uibModalInstance.close).not.toHaveBeenCalled();
    expect($uibModalInstance.dismiss).toHaveBeenCalledWith('cancel');
  });
});
