'use strict';

describe('Controller: Reject Offer Confirm Modal', function() {
  var
    $q,
    $scope,
    $controller,
    $uibModalInstance;

  beforeEach(module('udb.management'));
  beforeEach(module('udb.management.moderation'));

  beforeEach(inject(function($rootScope, _$q_, _$controller_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = $rootScope.$new();

    $uibModalInstance = jasmine.createSpyObj('$uibModalInstance', ['close', 'dismiss']);
  }));

  function getController() {
    return $controller(
      'RejectOfferConfirmModalCtrl', {
        $scope: $scope,
        $uibModalInstance: $uibModalInstance,
        $q: $q
      }
    );
  }

  it('should return DUPLICATE', function() {
    var controller = getController();
    $scope.$digest();

    $scope.response.type = 'DUPLICATE';

    $scope.reject();

    expect($uibModalInstance.close).toHaveBeenCalledWith($q.resolve('DUPLICATE'));
  });

  it('should return INAPPROPRIATE', function() {
    var controller = getController();
    $scope.$digest();

    $scope.response.type = 'INAPPROPRIATE';

    $scope.reject();

    expect($uibModalInstance.close).toHaveBeenCalledWith($q.resolve('INAPPROPRIATE'));
  });

  it('should return the free text reason for OTHER', function() {
    var controller = getController();
    $scope.$digest();

    $scope.response.type = 'OTHER';
    $scope.response.reason = 'Just because!';

    $scope.reject();

    expect($uibModalInstance.close).toHaveBeenCalledWith($q.resolve('Just because!'));
  });

  it('should show an error when nothing has been chosen', function() {
    var controller = getController();
    $scope.$digest();

    $scope.reject();

    expect($scope.error).toEqual('Gelieve een reden op te geven.');
  });

  it('should show an error when no free text reason has been specified for OTHER', function() {
    var controller = getController();
    $scope.$digest();

    $scope.response.type = 'OTHER';

    $scope.reject();

    expect($scope.error).toEqual('Gelieve een reden op te geven.');
  });

  it('should just close the modal on cancel', function() {
    var controller = getController();
    $scope.$digest();

    $scope.cancel();

    expect($uibModalInstance.dismiss).toHaveBeenCalled();
  });
});
