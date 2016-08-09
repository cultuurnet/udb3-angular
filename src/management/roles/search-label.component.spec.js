'use strict';

describe('Component: LabelSearch', function() {
  var $componentController, LabelManager, $q, $scope;

  var labelResultset = {
    "itemsPerPage": 6,
    "member": [
      {
        "uuid": "3aad5023-84e2-4ba9-b1ce-201cee64504c",
        "name": "Bloso",
        "visibility": "visible",
        "privacy": "public"
      },
      {
        "uuid": "4aad5023-84e2-4ba9-b1ce-201cee64504c",
        "name": "Blasa",
        "visibility": "visible",
        "privacy": "public"
      },
      {
        "uuid": "5aad5023-84e2-4ba9-b1ce-201cee64504c",
        "name": "Blusu",
        "visibility": "visible",
        "privacy": "public"
      }
    ],
    "totalItems": "3"
  }

  beforeEach(module('udb.management'));
  beforeEach(module('udb.management.roles'));

  beforeEach(inject(function(_$componentController_, _$q_, $rootScope) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope.$new();
    LabelManager = jasmine.createSpyObj('LabelManager', ['find']);
  }));

  it('should suggest labels', function() {
    LabelManager.find.and.returnValue($q.resolve(labelResultset));
    var controller = $componentController('udbSearchLabel', {
      LabelManager: LabelManager,
      $scope: $scope
    });

    controller.findDelay = 0;

    controller
      .suggestLabels('blub');

    $scope.$digest();

    expect(LabelManager.find).toHaveBeenCalledWith('blub', 6, 0);
    expect(controller.availableLabels).toEqual(labelResultset.member);
  });
});
