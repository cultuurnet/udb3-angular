'use strict';

describe('Controller: Organizer Detail', function() {
  var OrganizerManager, LabelManager, $uibModal, $stateParams, $q, $controller, $scope, $rootScope;

  var fakeOrganizer = {
    "name": "STUK",
    "address": {
      "addressCountry": "BE",
      "addressLocality": "Leuven",
      "postalCode": 3000,
      "streetAddress": "Sluisstraat 79"
    },
    "contactPoint": {
      "url": [
        "http://google.be"
      ],
      "email": [
        "joske@2dotstwice.be"
      ],
      "phone": [
        "0123456789"
      ]
    },
    "creator": "evenementen@stad.diksmuide.be",
    "created": "2015-05-07T12:02:53+00:00",
    "modified": "2015-05-07T12:02:53+00:00",
    "url": "http://www.stuk.be/",
    "labels": [
      {
        "uuid": "80f63f49-5de2-42ea-9642-59fc0400f2c5",
        "name": "Mijn label"
      }
    ]
  };

  var fakeLabel = {
    'uuid':'1d470df5-75c8-4a93-a70e-61c383263738',
    'name':'Blub',
    'visibility':'visible',
    'privacy':'public'
  };

  var id = '0823f57e-a6bd-450a-b4f5-8459b4b11043';

  var result = {commandId: 'c75003dd-cc77-4424-a186-66aa4abd917f'};

  beforeEach(module('udb.management'));
  beforeEach(module('udb.management.organizers'));

  beforeEach(inject(function(_$rootScope_, _$q_, _$controller_) {
    $controller = _$controller_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();

    LabelManager = jasmine.createSpyObj('LabelManager', ['find']);
    OrganizerManager = jasmine.createSpyObj('OrganizerManager', [
      'get',
      'addLabelToOrganizer',
      'deleteLabelFromOrganizer'
    ]);
    $uibModal = jasmine.createSpyObj('$uibModal', ['open']);

    $stateParams = { "id": id };
  }));

  function getController() {
    return $controller(
      'OrganizerDetailController', {
        OrganizerManager: OrganizerManager,
        LabelManager: LabelManager,
        $uibModal: $uibModal,
        $stateParams: $stateParams,
        $scope: $scope
      }
    );
  }

  it ('should load the organizer detail', function () {
    OrganizerManager.get.and.returnValue($q.resolve(fakeOrganizer));

    var expectedLabels = [
      {
        "uuid": "80f63f49-5de2-42ea-9642-59fc0400f2c5",
        "name": "Mijn label"
      }
    ];

    var controller = getController();
    $scope.$digest();

    expect(OrganizerManager.get).toHaveBeenCalledWith(id);
    expect(controller.organizer).toEqual(fakeOrganizer);
    expect(controller.organizer.labels).toEqual(expectedLabels);
  });

  it ('should add a label to an organizer', function () {
    OrganizerManager.get.and.returnValue($q.resolve(fakeOrganizer));
    OrganizerManager.addLabelToOrganizer.and.returnValue($q.resolve(result));

    var controller = getController();
    $scope.$digest();
    controller.addLabel(fakeLabel);

    expect(OrganizerManager.addLabelToOrganizer)
      .toHaveBeenCalledWith('0823f57e-a6bd-450a-b4f5-8459b4b11043', 'Blub');

    expect(controller.labelSaving).toBeTruthy();
  });

  it ('should delete a label from an organizer', function () {
    OrganizerManager.get.and.returnValue($q.resolve(fakeOrganizer));
    OrganizerManager.deleteLabelFromOrganizer.and.returnValue($q.resolve(result));

    var controller = getController();
    $scope.$digest();
    controller.deleteLabel(fakeLabel);

    expect(OrganizerManager.deleteLabelFromOrganizer)
      .toHaveBeenCalledWith('0823f57e-a6bd-450a-b4f5-8459b4b11043', 'Blub');
  });
});