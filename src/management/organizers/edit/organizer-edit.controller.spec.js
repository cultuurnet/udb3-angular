'use strict';

describe('Controller: Organizer Edit', function() {
  var OrganizerManager, udbOrganizers, $state, $stateParams,
      $q, $controller, $scope, organizerEditForm, fakeSearchResult;

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

  beforeEach(module('ui.router'));
  beforeEach(module('udb.management'));
  beforeEach(module('udb.management.organizers'));

  beforeEach(inject(function(_$q_, _$controller_, $rootScope, _$state_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = $rootScope.$new();
    $state = _$state_;

    OrganizerManager = jasmine.createSpyObj('OrganizerManager', [
      'get',
      'updateOrganizerWebsite',
      'updateOrganizerName',
      'updateOrganizerAddress',
      'updateOrganizerContact',
      'removeOrganizerFromCache'
    ]);
    udbOrganizers = jasmine.createSpyObj('udbOrganizers', ['findOrganizersWebsite']);
    spyOn($state, 'go');
    $state.current.name = 'manage.organizers.edit';
    $stateParams = { "id": id };
    organizerEditForm = {
      $valid: true,
      website: {
        $valid: true
      },
      name: 'STUK'
    };

    fakeSearchResult = {
      "itemsPerPage": 30,
      "totalItems": 3562,
      "member": [
        {
          "name": "STUK2",
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

  }));

  function getController() {
    return $controller(
      'OrganizerEditController', {
        OrganizerManager: OrganizerManager,
        udbOrganizers: udbOrganizers,
        $state: $state,
        $stateParams: $stateParams,
        $q: $q,
        $scope: $scope
      }
    );
  }

  function getMockUps() {
    OrganizerManager.get.and.returnValue($q.resolve(fakeOrganizer));
    OrganizerManager.updateOrganizerWebsite.and.returnValue($q.resolve(result));
    OrganizerManager.updateOrganizerName.and.returnValue($q.resolve(result));
    OrganizerManager.updateOrganizerAddress.and.returnValue($q.resolve(result));
    OrganizerManager.updateOrganizerContact.and.returnValue($q.resolve(result));
    OrganizerManager.removeOrganizerFromCache.and.returnValue($q.resolve());
  }

  it ('should load the organizer detail', function () {
    getMockUps();

    var controller = getController();
    $scope.$digest();

    expect(OrganizerManager.get).toHaveBeenCalledWith(id);
    expect(controller.organizer).toEqual(fakeOrganizer);
    expect(controller.originalName).toEqual(fakeOrganizer.name);
    expect(controller.contact).toEqual(contact);
  });

  it ('should load the organizer detail and set an empty address object when address is empty', function () {
    fakeOrganizer.address = {};
    var emptyAddress = {
      streetAddress : '',
      addressLocality : '',
      postalCode: '',
      addressCountry : ''
    };
    getMockUps();

    var controller = getController();
    $scope.$digest();

    expect(OrganizerManager.get).toHaveBeenCalledWith(id);
    expect(controller.originalName).toEqual(fakeOrganizer.name);
    expect(controller.contact).toEqual(contact);
    expect(controller.organizer.address).toEqual(emptyAddress);
  });

  it ('shouldn\'t validate the website when the form field isn\'t valid', function () {
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

    expect(udbOrganizers.findOrganizersWebsite).toHaveBeenCalledWith(fakeOrganizer.url);
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

    expect(udbOrganizers.findOrganizersWebsite).toHaveBeenCalledWith(fakeOrganizer.url);
    expect(controller.organizersWebsiteFound).toBeFalsy();
    expect(controller.showWebsiteValidation).toBeFalsy();
  });

  it ('should validate the website and don\'t throw an error when the given website is used by the current organizer',
      function () {
        getMockUps();

        var controller = getController();
        $scope.$digest();

        controller.organizerEditForm = organizerEditForm;
        fakeSearchResult.totalItems = 1;
        fakeSearchResult.member[0].name = 'STUK';

        udbOrganizers.findOrganizersWebsite.and.returnValue($q.resolve(fakeSearchResult));
        controller.validateWebsite();
        $scope.$digest();

        expect(udbOrganizers.findOrganizersWebsite).toHaveBeenCalledWith(fakeOrganizer.url);
        expect(controller.organizersWebsiteFound).toBeFalsy();
        expect(controller.showWebsiteValidation).toBeFalsy();
        expect(controller.hasErrors).toBeFalsy();
      });

  it ('should fail in validating the website', function () {
    getMockUps();

    var controller = getController();
    $scope.$digest();

    controller.organizerEditForm = organizerEditForm;
    udbOrganizers.findOrganizersWebsite.and.returnValue($q.reject());
    controller.validateWebsite();
    $scope.$digest();

    expect(udbOrganizers.findOrganizersWebsite).toHaveBeenCalledWith(fakeOrganizer.url);
    expect(controller.websiteError).toBeTruthy();
    expect(controller.showWebsiteValidation).toBeFalsy();
  });

  it ('should validate the name', function () {
    organizerEditForm = {
      name: {
        $valid: true
      }
    };

    getMockUps();
    var controller = getController();
    controller.organizerEditForm = organizerEditForm;
    $scope.$digest();

    controller.validateName();

    expect(controller.nameError).toBeFalsy();
  });

  it ('should throw an error when the name is not valid', function() {
    organizerEditForm = {
      name: {
        $valid: false
      }
    };

    getMockUps();
    var controller = getController();
    controller.organizerEditForm = organizerEditForm;
    $scope.$digest();

    controller.validateName();

    expect(controller.nameError).toBeTruthy();
  });

  it ('should validate the address', function () {
    getMockUps();
    var controller = getController();
    $scope.$digest();
    controller.organizerEditForm = {
      $valid: true
    };
    controller.validateAddress(false);

    expect(controller.addressError).toBeFalsy();
  });

  it ('should validate the contact info', function () {
    getMockUps();
    var controller = getController();
    $scope.$digest();
    controller.organizerEditForm = {
      $valid: true
    };
    controller.validateContact(false);

    expect(controller.contactError).toBeFalsy();
  });

  it ('shouldn\'t validate the organizer when the form is invalid', function () {
    organizerEditForm = {
      $valid: false
    };

    getMockUps();
    var controller = getController();
    $scope.$digest();

    controller.organizerEditForm = organizerEditForm;
    controller.organizer.url = 'http://asdfasdf.com';
    controller.validateOrganizer();

    expect(OrganizerManager.updateOrganizerWebsite).not.toHaveBeenCalled();
  });

  it ('should validate the organizer and save the changes', function () {
    organizerEditForm = {
      $valid: true,
      website: {
        $valid: true
      },
      name: 'STUK'
    };

    getMockUps();
    udbOrganizers.findOrganizersWebsite.and.returnValue($q.resolve(fakeSearchResult));
    spyOn($q, 'all').and.returnValue($q.resolve());

    var controller = getController();
    $scope.$digest();

    controller.organizerEditForm = organizerEditForm;

    controller.organizer.url = 'http://yahoo.com';
    controller.organizer.name = 'Cnet Vlaanderen';
    controller.organizer.address = {
      addressCountry: 'BE',
      addressLocality: 'Brussel',
      postalCode: 1080,
      streetAddress: 'Henegouwenkaai 41-43'
    };
    controller.contact = [
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
        type: 'url',
        value: 'http://cultuurnet.be'
      },
      {
        type: 'email',
        value: 'test@cultuurnet.be'
      }
    ];

    controller.organizersWebsiteFound = false;
    controller.websiteError = false;
    controller.urlError = false;
    controller.nameError = false;
    controller.addressError = false;
    controller.contactError = false;

    controller.checkChanges();
    controller.validateOrganizer();
    $scope.$apply();

    expect(OrganizerManager.updateOrganizerWebsite).toHaveBeenCalledWith(id, controller.organizer.url);
    expect(OrganizerManager.updateOrganizerName).toHaveBeenCalledWith(id, controller.organizer.name);
    expect(OrganizerManager.updateOrganizerAddress).toHaveBeenCalledWith(id, controller.organizer.address);
    expect(OrganizerManager.updateOrganizerContact).toHaveBeenCalledWith(id, controller.contact);
    expect(OrganizerManager.removeOrganizerFromCache).toHaveBeenCalledWith(id);
    expect($state.go).toHaveBeenCalledWith('management.organizers.search', {}, {reload:true});
  });

  it ('should show an error message when saving failed', function () {
    organizerEditForm = {
      $valid: true
    };

    getMockUps();
    spyOn($q, 'all').and.returnValue($q.reject());
    var controller = getController();
    $scope.$digest();

    controller.organizerEditForm = organizerEditForm;
    controller.organizer.url = 'http://yahoo.com';

    controller.validateOrganizer();
    $scope.$apply();

    expect(controller.hasErrors).toBeTruthy();
    expect(controller.saveError).toBeTruthy();

  });

  it ('should handle the cancel request', function () {
    getMockUps();
    var controller = getController();

    controller.cancel();

    expect(OrganizerManager.removeOrganizerFromCache).toHaveBeenCalledWith(id);
    expect($state.go).toHaveBeenCalledWith('management.organizers.search', {}, {reload:true});
  });
});