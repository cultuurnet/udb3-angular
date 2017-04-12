'use strict';

describe('Controller: Organizer Edit', function() {
  var OrganizerManager, udbOrganizers, $uibModal, $state, $stateParams,
      cities, Levenshtein, $q, $controller, $scope, organizerEditForm;

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

  var fakeSearchResult = {
    "itemsPerPage": 30,
    "totalItems": 3562,
    "member": [
      {
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
      }
    ]
  };

  var contact = [
    {
      type: 'url',
      value: 'http://google.be'
    },
    {
      type: 'email',
      value: 'joske@2dotstwice.be'
    },
    {
      type: 'phone',
      value: '0123456789'
    }
  ];

  var id = '0823f57e-a6bd-450a-b4f5-8459b4b11043';

  var result = {commandId: 'c75003dd-cc77-4424-a186-66aa4abd917f'};

  beforeEach(module('udb.management'));
  beforeEach(module('udb.management.organizers'));

  beforeEach(inject(function(_$q_, _$controller_, $rootScope) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = $rootScope.$new();

    OrganizerManager = jasmine.createSpyObj('OrganizerManager', [
      'get',
      'updateOrganizerWebsite',
      'updateOrganizerName',
      'updateOrganizerAddress',
      'updateOrganizerContact'
    ]);
    udbOrganizers = jasmine.createSpyObj('udbOrganizers', ['findOrganizersWebsite']);
    $uibModal = jasmine.createSpyObj('$uibModal', ['open']);
    $state = jasmine.createSpy('$state', 'go');
    $stateParams = { "id": id };
    organizerEditForm = {
      website: {
        $valid: true
      },
      name: 'STUK'
    };

  }));

  function getController() {
    return $controller(
      'OrganizerEditController', {
        OrganizerManager: OrganizerManager,
        udbOrganizers: udbOrganizers,
        $uibModal: $uibModal,
        $state: $state,
        $stateParams: $stateParams,
        $q: $q
      }
    );
  }

  function getMockUps() {
    OrganizerManager.get.and.returnValue($q.resolve(fakeOrganizer));
    OrganizerManager.updateOrganizerWebsite.and.returnValue($q.resolve(result));
    OrganizerManager.updateOrganizerName.and.returnValue($q.resolve(result));
    OrganizerManager.updateOrganizerAddress.and.returnValue($q.resolve(result));
    OrganizerManager.updateOrganizerContact.and.returnValue($q.resolve(result));
  }

  it ('should load the organizer detail', function () {
    getMockUps();

    var controller = getController();
    $scope.$digest();

    expect(OrganizerManager.get).toHaveBeenCalledWith(id);
    expect(controller.organizer).toEqual(fakeOrganizer);
    expect(controller.selectedCity).toEqual('3000 Leuven');
    expect(controller.contact).toEqual(contact);
  });

  it ('shouldn\'t validate the website when the formfield isn\'t valid', function () {
    organizerEditForm = {
      website: {
        $valid: false
      },
      name: 'STUK'
    };

    getMockUps();

    var controller = getController();
    $scope.$digest();

    controller.organizerEditForm = organizerEditForm;
    controller.validateWebsite();
    $scope.$digest();

    expect(controller.showWebsiteValidation).toBeFalsy();
  });

  it ('should validate the website when the given website is used by another organizer', function () {
    getMockUps();

    var controller = getController();
    $scope.$digest();

    controller.organizerEditForm = organizerEditForm;
    udbOrganizers.findOrganizersWebsite.and.returnValue($q.resolve(fakeSearchResult));
    controller.validateWebsite();
    $scope.$digest();

    expect(udbOrganizers.findOrganizersWebsite).toHaveBeenCalledWith(fakeOrganizer);
    expect(controller.organizersWebsiteFound).toBeTruthy();
    expect(controller.showWebsiteValidation).toBeFalsy();
    expect(controller.disableSubmit).toBeTruthy();
  });

  it ('should validate the website when the given website isn\'t used by another organizer', function () {
    getMockUps();

    var controller = getController();
    $scope.$digest();

    controller.organizerEditForm = organizerEditForm;
    fakeSearchResult.totalItems = 0;
    udbOrganizers.findOrganizersWebsite.and.returnValue($q.resolve(fakeSearchResult));
    controller.validateWebsite();
    $scope.$digest();

    expect(udbOrganizers.findOrganizersWebsite).toHaveBeenCalledWith(fakeOrganizer);
    expect(controller.organizersWebsiteFound).toBeFalsy();
    expect(controller.showWebsiteValidation).toBeFalsy();
  });

  it ('should fail in validating the website', function () {
    getMockUps();

    var controller = getController();
    $scope.$digest();

    controller.organizerEditForm = organizerEditForm;
    udbOrganizers.findOrganizersWebsite.and.returnValue($q.reject());
    controller.validateWebsite();
    $scope.$digest();

    expect(udbOrganizers.findOrganizersWebsite).toHaveBeenCalledWith(fakeOrganizer);
    expect(controller.websiteError).toBeTruthy();
    expect(controller.showWebsiteValidation).toBeFalsy();
  });

  it ('should add an empty contact item to the contact array', function () {
    var expectedContact = [
      {
        type: 'url',
        value: 'http://google.be'
      },
      {
        type: 'email',
        value: 'joske@2dotstwice.be'
      },
      {
        type: 'phone',
        value: '0123456789'
      },
      {
        type: 'phone',
        value: ''
      }
    ];
    getMockUps();

    var controller = getController();
    $scope.$digest();

    controller.addOrganizerContactInfo('phone');

    expect(controller.contact).toEqual(expectedContact);
  });

  it ('should delete a contact item from the contact array', function () {
    var expectedContact = [
      {
        type: 'url',
        value: 'http://google.be'
      },
      {
        type: 'email',
        value: 'joske@2dotstwice.be'
      }
    ];
    getMockUps();

    var controller = getController();
    $scope.$digest();

    controller.deleteOrganizerContactInfo(2);

    expect(controller.contact).toEqual(expectedContact);
  });
});