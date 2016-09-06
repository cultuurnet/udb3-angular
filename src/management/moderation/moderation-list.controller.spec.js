'use strict';

describe('Controller: Moderation List', function() {
  var
    $q,
    $scope,
    $controller,
    Moderationmanager,
    $uibModal;

  var roles = [
    {
      "uuid": "3aad5023-84e2-4ba9-b1ce-201cee64504c",
      "name": "Moderator Leuven",
      "constraint": "city:leuven",
      "permissions": [
        "AANBOD_MODEREREN"
      ]
    },
    {
      "uuid": "3aad5023-84e2-4ba9-b1ce-201cee64505d",
      "name": "Beheerder Leuven",
      "constraint": "city:leuven",
      "permissions": [
        "GEBRUIKERS_BEHEREN"
      ]
    }
  ];

  beforeEach(module('udb.management'));
  beforeEach(module('udb.management.moderation'));

  beforeEach(inject(function($rootScope, _$q_, _$controller_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = $rootScope.$new();

    Moderationmanager = jasmine.createSpyObj('ModerationManager', ['getMyRoles']);
    $uibModal = jasmine.createSpyObj('$uibModal', ['open']);
  }));

  function getController() {
    return $controller(
      'ModerationListController', {
        ModerationManager: Moderationmanager,
        $uibModal: $uibModal
      }
    );
  }

  it('should load the roles of the current user', function() {
    Moderationmanager.getMyRoles.and.returnValue($q.resolve(roles));

    var moderator = getController();

    $scope.$digest();

    expect(Moderationmanager.getMyRoles).toHaveBeenCalled();
    expect(moderator.roles).toEqual([{
      "uuid": "3aad5023-84e2-4ba9-b1ce-201cee64504c",
      "name": "Moderator Leuven",
      "constraint": "city:leuven",
      "permissions": [
        "AANBOD_MODEREREN"
      ]
    }]);
  });

  it('should set an error with detail on failure to load the roles of a user', function() {
    Moderationmanager.getMyRoles.and.returnValue($q.reject({
      title:'What are you doing?',
      detail:'Detail'
    }));

    var moderator = getController();

    $scope.$digest();

    expect($uibModal.open).toHaveBeenCalled();
    expect(moderator.errorMessage).toEqual(
      'What are you doing? Detail'
    );
  });

  it('should set an error on failure to load the roles of a user', function() {
    Moderationmanager.getMyRoles.and.returnValue($q.reject({
      title:'What are you doing?'
    }));

    var moderator = getController();

    $scope.$digest();

    expect($uibModal.open).toHaveBeenCalled();
    expect(moderator.errorMessage).toEqual(
      'What are you doing?'
    );
  });

});
