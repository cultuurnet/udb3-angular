'use strict';

describe('Controller: event form step 5', function () {

  beforeEach(module('udb.event-form'));

  var $controller, stepController, scope, rootScope, EventFormData, udbOrganizers, UdbOrganizer, $q, eventCrud, uibModal, modalInstance;
  var AgeRange = {
    'ALL': {'value': 0, 'label': 'Alle leeftijden'},
    'KIDS': {'value': 12, 'label': 'Kinderen tot 12 jaar', min: 1, max: 12},
    'TEENS': {'value': 18, 'label': 'Jongeren tussen 12 en 18 jaar', min: 13, max: 18},
    'ADULTS': {'value': 99, 'label': 'Volwassenen (+18 jaar)', min: 19}
  };

  beforeEach(inject(function ($rootScope, $injector) {
    $controller = $injector.get('$controller');
    scope = $rootScope.$new();
    rootScope = $rootScope;
    EventFormData = $injector.get('EventFormData');
    UdbOrganizer = $injector.get('UdbOrganizer');
    $q = $injector.get('$q');
    uibModal = $injector.get('$uibModal');
    udbOrganizers = jasmine.createSpyObj('udbOrganizers', ['suggestOrganizers']);
    eventCrud = jasmine.createSpyObj('eventCrud', [
      'updateDescription',
      'updateOrganizer',
      'updateTypicalAgeRange',
      'deleteTypicalAgeRange',
      'deleteOfferOrganizer',
      'selectMainImage',
      'updateContactPoint',
      'updateFacilities',
      'updateBookingInfo'
    ]);
    stepController = getController();
  }));

  function getController() {
    return $controller('EventFormStep5Controller', {
      $scope: scope,
      EventFormData: EventFormData,
      eventCrud: eventCrud,
      udbOrganizers: udbOrganizers,
      $uibModal: uibModal,
      $rootScope: rootScope
    });
  }

  it('should save a description and toggle the state-complete class', function () {
    scope.description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus in dui at dolor pretium consequat sit amet a erat. Quisque pretium dolor sed arcu fringilla elementum. Donec sodales vestibulum nibh, ut imperdiet est luctus sed. Sed vitae faucibus orci, rhoncus interdum eros. Aliquam commodo turpis sed metus tempus, vel mollis mi elementum. Donec finibus interdum magna non tristique. Praesent viverra ullamcorper nulla in tristique.';
    spyOn(EventFormData, 'setDescription');
    spyOn(stepController, 'eventFormSaved');

    eventCrud.updateDescription.and.returnValue($q.resolve());

    scope.saveDescription();
    scope.$apply();

    expect(EventFormData.setDescription).toHaveBeenCalled();
    expect(scope.savingDescription).toBeFalsy();
    expect(stepController.eventFormSaved).toHaveBeenCalled();
    expect(scope.descriptionCssClass).toEqual('state-complete');
  });

  it('should save a description and toggle the state-incomplete class', function () {
    scope.description = '';
    spyOn(EventFormData, 'setDescription');
    spyOn(stepController, 'eventFormSaved');

    eventCrud.updateDescription.and.returnValue($q.resolve());

    scope.saveDescription();
    scope.$apply();

    expect(EventFormData.setDescription).toHaveBeenCalled();
    expect(scope.savingDescription).toBeFalsy();
    expect(stepController.eventFormSaved).toHaveBeenCalled();
    expect(scope.descriptionCssClass).toEqual('state-incomplete');
  });

  it('should handle the error when save a description fails', function () {
    scope.description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus in dui at dolor pretium consequat sit amet a erat. Quisque pretium dolor sed arcu fringilla elementum. Donec sodales vestibulum nibh, ut imperdiet est luctus sed. Sed vitae faucibus orci, rhoncus interdum eros. Aliquam commodo turpis sed metus tempus, vel mollis mi elementum. Donec finibus interdum magna non tristique. Praesent viverra ullamcorper nulla in tristique.';
    spyOn(EventFormData, 'setDescription');

    eventCrud.updateDescription.and.returnValue($q.reject());

    scope.saveDescription();
    scope.$apply();

    expect(EventFormData.setDescription).toHaveBeenCalled();
    expect(scope.savingDescription).toBeFalsy();
    expect(scope.descriptionError).toBeTruthy();
  });

  it('should set the right form data and save it when all ages is selected', function () {
    spyOn(scope, 'saveAgeRange');
    scope.ageRange = scope.ageRanges[0];
    scope.ageRangeChanged(scope.ageRanges[0]);

    expect(scope.saveAgeRange).toHaveBeenCalled();
  });

  it('should check if the minimum age is in range of the selected age-range when saving', function () {
    var testCases = {
      'min and max set and not in range': {
        range: { min: 12, max: 18 },
        expectedInvalid: true,
        minAge: 10
      },
      'max set and in range': {
        range: { max: 18 },
        expectedInvalid: false,
        minAge: 10
      },
      'max set and not in range': {
        range: { max: 18 },
        expectedInvalid: true,
        minAge: 69
      },
      'range without boundaries': {
        range: { },
        expectedInvalid: false,
        minAge: 10
      }
    };
    eventCrud.updateTypicalAgeRange.and.returnValue($q.resolve());

    for (var caseName in testCases) {
      var testCase = testCases[caseName];

      scope.ageRange = testCase.range;
      scope.minAge = testCase.minAge;
      scope.saveAgeRange();

      expect(scope.invalidAgeRange).toEqual(testCase.expectedInvalid);
    }
  });

  it('should format the age-range when saving', function () {
    var testCases = {
      'all ages': {
        range: scope.ageRanges[0],
        minAge: null,
        expectedResult: null
      },
      'range with max and min': {
        range: { max: 18, min: 12 },
        minAge: 12,
        expectedResult: '12-18'
      },
      'range with only min': {
        range: { min: 18 },
        minAge: 21,
        expectedResult: '21-'
      }
    };
    eventCrud.updateTypicalAgeRange.and.returnValue($q.resolve());
    eventCrud.deleteTypicalAgeRange.and.returnValue($q.resolve());

    for (var caseName in testCases) {
      var testCase = testCases[caseName];

      scope.ageRange = testCase.range;
      scope.minAge = testCase.minAge;
      scope.saveAgeRange();

      expect(EventFormData.typicalAgeRange).toEqual(testCase.expectedResult);
    }
  });

  it('should set the ageRange to all ages', function () {
    scope.setAllAges();
    expect(scope.ageRange).toEqual(AgeRange.ALL);
  });

  it('should rest the age selection', function () {
    scope.resetAgeRange();

    expect(scope.ageRange).toEqual(null);
    expect(scope.minAge).toEqual(null);
    expect(scope.ageCssClass).toEqual('state-incomplete');
  });

  it('should save the EventForm', function() {
    spyOn(rootScope, '$emit');

    stepController.eventFormSaved();

    expect(rootScope.$emit).toHaveBeenCalledWith('eventFormSaved', EventFormData);
  });

  it('should suggest creating a new organizer when looking for one yields no results', function () {
    udbOrganizers.suggestOrganizers.and.returnValue($q.resolve([]));

    scope.getOrganizers('club');
    scope.$apply();

    expect(udbOrganizers.suggestOrganizers).toHaveBeenCalledWith('club');
    expect(scope.emptyOrganizerAutocomplete).toEqual(true);
  });

  it('should promise a list of organizers and show a loading state while waiting for it', function (done) {
    var organizer = new UdbOrganizer();
    udbOrganizers.suggestOrganizers.and.returnValue($q.resolve([organizer]));

    function assertOrganizers (organizers) {
      expect(organizers).toEqual([organizer]);
      expect(scope.loadingOrganizers).toEqual(false);
      done();
    }

    scope
      .getOrganizers('club')
      .then(assertOrganizers);

    expect(scope.loadingOrganizers).toEqual(true);
    scope.$apply();
  });

  it('should update an event organizer when selecting a new one', function () {
    spyOn(stepController, 'saveOrganizer');
    var organizer = new UdbOrganizer();

    scope.selectOrganizer(organizer);
    expect(stepController.saveOrganizer).toHaveBeenCalledWith(organizer);
  });

  it('should set the correct variables on a Async Organiser Error', function () {
    stepController.showAsyncOrganizerError();

    expect(scope.organizerError).toBeTruthy();
    expect(scope.savingOrganizer).toBeFalsy();
  });

  it('should persist the organizer for the active event when saving', function () {
    eventCrud.updateOrganizer.and.returnValue($q.resolve());
    var organizer = new UdbOrganizer();

    stepController.saveOrganizer(organizer);
    expect(scope.savingOrganizer).toEqual(true);

    scope.$apply();
    expect(scope.savingOrganizer).toEqual(false);
  });

  it('should persist and reset the event organizer when removing it', function () {
    eventCrud.deleteOfferOrganizer.and.returnValue($q.resolve());
    spyOn(EventFormData, 'resetOrganizer');

    scope.deleteOrganizer();
    scope.$apply();

    expect(eventCrud.deleteOfferOrganizer).toHaveBeenCalled();
    expect(EventFormData.resetOrganizer).toHaveBeenCalled();
  });

  it('should show an async error when failing to remove the organizer', function () {
    eventCrud.deleteOfferOrganizer.and.returnValue($q.reject('BOOOM!'));
    spyOn(stepController, 'showAsyncOrganizerError');

    scope.deleteOrganizer();
    scope.$apply();

    expect(eventCrud.deleteOfferOrganizer).toHaveBeenCalled();
    expect(stepController.showAsyncOrganizerError).toHaveBeenCalled();
  });

  it('should open the organizer\'s modal', function () {
    spyOn(uibModal, 'open').and.returnValue({
      result: $q.resolve()
    });
    spyOn(stepController, 'saveOrganizer');

    scope.openOrganizerModal();
    scope.$apply();

    expect(uibModal.open).toHaveBeenCalled();
    expect(stepController.saveOrganizer).toHaveBeenCalled();
  });

  it('should fail in opening the organizer\'s modal and set the state to incomplete', function () {
    spyOn(uibModal, 'open').and.returnValue({
      result: $q.reject()
    });

    scope.openOrganizerModal();
    scope.$apply();

    expect(uibModal.open).toHaveBeenCalled();
    expect(scope.organizer).toEqual('');
    expect(scope.emptyOrganizerAutocomplete).toBeFalsy();
    expect(scope.organizerCssClass).toEqual('state-incomplete');
  });

  it('should fail in opening the organizer\'s modal and set the state to complete', function () {
    EventFormData.organizer.id = '1234567890-0987654321';
    spyOn(uibModal, 'open').and.returnValue({
      result: $q.reject()
    });

    scope.openOrganizerModal();
    scope.$apply();

    expect(uibModal.open).toHaveBeenCalled();
    expect(scope.organizer).toEqual('');
    expect(scope.emptyOrganizerAutocomplete).toBeFalsy();
    expect(scope.organizerCssClass).toEqual('state-complete');
  });

  it('should save the organizer for the event', function () {
    eventCrud.updateOrganizer.and.returnValue($q.resolve());

    var organizer = new UdbOrganizer();
    spyOn(EventFormData, 'organizer');
    spyOn(stepController, 'eventFormSaved');

    stepController.saveOrganizer(organizer);
    scope.$apply();

    expect(EventFormData.organizer).toEqual(organizer);
    expect(stepController.eventFormSaved).toHaveBeenCalled();
    expect(scope.organizerCssClass).toEqual('state-complete');
    expect(scope.savingOrganizer).toBeFalsy();
  });

  it('should add contact info to the contactInfo array', function () {
    var expectedContactInfo = [{type: 'phone', value: '', booking: false}];
    scope.contacInfo = [];

    scope.addContactInfo();
    scope.$apply();

    expect(scope.contactInfoCssClass).toEqual('state-filling');
    expect(scope.contactInfo).toEqual(expectedContactInfo);
  });

  it('should delete contact info from the contactInfo array', function () {
    var expectedContactInfo = [{type: 'phone', value: '1234567890', booking: false}];
    scope.contactInfo = [
      {type: 'phone', value: '1234567890', booking: false},
      {type: 'phone', value: '0987654321', booking: false}
    ];
    scope.contactInfoForm = {};
    scope.contactInfoForm.$valid = true;

    eventCrud.updateContactPoint.and.returnValue($q.resolve());
    spyOn(scope, 'saveContactInfo');

    scope.deleteContactInfo(1);
    scope.$apply();

    expect(scope.contactInfo).toEqual(expectedContactInfo);
  });

  it('should save the contact info', function () {
    scope.contactInfoForm = {};
    scope.contactInfoForm.$valid = true;

    var expectedContactPoints = {
      url: ['http://cultuurnet.be'],
      phone: ['1234567890'],
      email: ['info@mail.com']
    };

    scope.contactInfo = [
      {type: 'phone', value: '1234567890', booking: false},
      {type: 'phone', value: '0987654321', booking: true},
      {type: 'url', value: 'http://cultuurnet.be', booking: false},
      {type: 'url', value: 'http://google.be', booking: true},
      {type: 'email', value: 'info@mail.com', booking: false},
      {type: 'email', value: 'dude@sweet.com', booking: true}
    ];

    eventCrud.updateContactPoint.and.returnValue($q.resolve());
    spyOn(stepController, 'eventFormSaved');

    scope.saveContactInfo();
    scope.$apply();

    expect(EventFormData.contactPoint).toEqual(expectedContactPoints);
    expect(eventCrud.updateContactPoint).toHaveBeenCalled();
    expect(stepController.eventFormSaved).toHaveBeenCalled();
    expect(scope.contactInfoCssClass).toEqual('state-complete');
    expect(scope.savingContactInfo).toBeFalsy();
  });

  it('should handle the error when saving the contact info goes wrong', function () {
    scope.contactInfoForm = {};
    scope.contactInfoForm.$valid = true;

    eventCrud.updateContactPoint.and.returnValue($q.reject('KAPUTSKI!'));

    scope.saveContactInfo();
    scope.$apply();

    expect(eventCrud.updateContactPoint).toHaveBeenCalled();
    expect(scope.contactInfoError).toBeTruthy();
    expect(scope.savingContactInfo).toBeFalsy();
  });

  it('should open the facilities modal', function () {
    EventFormData.facilities = [];
    spyOn(uibModal, 'open').and.returnValue({
      result: $q.resolve()
    });

    scope.openFacilitiesModal();
    scope.$apply();

    expect(uibModal.open).toHaveBeenCalled();
    expect(scope.facilitiesCssClass).toEqual('state-complete');
    expect(scope.selectedFacilities).toEqual(EventFormData.facilities);
    expect(scope.facilitiesInapplicable).toBeTruthy();
  });

  it('should fail in opening the facilities modal and set the state to incomplete', function () {
    EventFormData.facilities = [];
    spyOn(uibModal, 'open').and.returnValue({
      result: $q.reject()
    });

    scope.openFacilitiesModal();
    scope.$apply();

    expect(uibModal.open).toHaveBeenCalled();
    expect(scope.facilitiesCssClass).toEqual('state-incomplete');
  });

  it('should fail in opening the facilities modal and set the state to complete', function () {
    EventFormData.facilities = ['faciliteit 1', 'faciliteit 2'];
    spyOn(uibModal, 'open').and.returnValue({
      result: $q.reject()
    });

    scope.openFacilitiesModal();
    scope.$apply();

    expect(uibModal.open).toHaveBeenCalled();
    expect(scope.facilitiesCssClass).toEqual('state-complete');
  });

  it('should set the facilities on inapplicable', function () {
    scope.setFacilitiesInapplicable();

    expect(scope.facilitiesInapplicable).toBeTruthy();
    expect(scope.facilitiesCssClass).toEqual('state-complete');
  });

  it('should remove all facilities and set it to inapplicable', function () {
    EventFormData.facilities = ['faciliteit 1', 'faciliteit 2'];

    eventCrud.updateFacilities.and.returnValue($q.resolve());

    scope.setFacilitiesInapplicable();
    scope.$apply();

    expect(scope.facilitiesError).toBeFalsy();
    expect(EventFormData.facilities).toEqual([]);

    expect(scope.savingFacilities).toBeFalsy();
    expect(scope.facilitiesInapplicable).toBeTruthy();
    expect(scope.facilitiesCssClass).toEqual('state-complete');
  });

  it('should remove all facilities and handle the error', function () {
    EventFormData.facilities = ['faciliteit 1', 'faciliteit 2'];

    eventCrud.updateFacilities.and.returnValue($q.reject('pakot'));

    scope.setFacilitiesInapplicable();
    scope.$apply();

    expect(EventFormData.facilities).toEqual([]);

    expect(scope.savingFacilities).toBeFalsy();
    expect(scope.facilitiesError).toBeTruthy();
  });

  it('should set the right toggle for the booking option "phone"', function () {
    var contactInfos = [
      {type: 'phone', value: '1234567890', booking: false},
      {type: 'phone', value: '0987654321', booking: true}
    ];
    scope.bookingModel = {
      phone: '0987654321',
      url: 'http://google.be',
      email: 'dude@sweet.com'
    };

    scope.showBookingOption(contactInfos[0]);
    scope.$apply();
    expect(scope.showBookingOption(contactInfos[0])).toBeFalsy();

    scope.showBookingOption(contactInfos[1]);
    scope.$apply();
    expect(scope.showBookingOption(contactInfos[1])).toBeTruthy();
  });

  it('should set the right toggle for the booking option "url"', function () {
    var contactInfos = [
      {type: 'url', value: 'http://cultuurnet.be', booking: false},
      {type: 'url', value: 'http://google.be', booking: true},
    ];
    scope.bookingModel = {
      phone: '0987654321',
      url: 'http://google.be',
      email: 'dude@sweet.com'
    };

    scope.showBookingOption(contactInfos[0]);
    scope.$apply();
    expect(scope.showBookingOption(contactInfos[0])).toBeFalsy();

    scope.showBookingOption(contactInfos[1]);
    scope.$apply();
    expect(scope.showBookingOption(contactInfos[1])).toBeTruthy();
  });

  it('should set the right toggle for the booking option "email"', function () {
    var contactInfos = [
      {type: 'email', value: 'info@mail.com', booking: false},
      {type: 'email', value: 'dude@sweet.com', booking: true},
    ];
    scope.bookingModel = {
      phone: '0987654321',
      url: 'http://google.be',
      email: 'dude@sweet.com'
    };

    scope.showBookingOption(contactInfos[0]);
    scope.$apply();
    expect(scope.showBookingOption(contactInfos[0])).toBeFalsy();

    scope.showBookingOption(contactInfos[1]);
    scope.$apply();
    expect(scope.showBookingOption(contactInfos[1])).toBeTruthy();
  });

  it('should set the right toggle when the booking option is invalid', function () {
    var contactInfos = [
      {type: '', value: 'invalid contact type', booking: false}
    ];
    scope.bookingModel = {
      phone: '0987654321',
      url: 'http://google.be',
      email: 'dude@sweet.com'
    };

    scope.showBookingOption(contactInfos[0]);
    scope.$apply();
    expect(scope.showBookingOption(contactInfos[0])).toBeFalsy();
  });

  it('should set the right toggle when there is nothing in the bookingModel', function () {
    var contactInfos = [
      {type: 'phone', value: '0987654321', booking: true},
      {type: 'url', value: 'http://google.be', booking: true},
      {type: 'email', value: 'dude@sweet.com', booking: true}
    ];
    scope.bookingModel = {
      phone: '',
      url: '',
      email: ''
    };

    scope.showBookingOption(contactInfos[0]);
    scope.$apply();
    expect(scope.showBookingOption(contactInfos[0])).toBeTruthy();

    scope.showBookingOption(contactInfos[1]);
    scope.$apply();
    expect(scope.showBookingOption(contactInfos[1])).toBeTruthy();

    scope.showBookingOption(contactInfos[2]);
    scope.$apply();
    expect(scope.showBookingOption(contactInfos[2])).toBeTruthy();
  });

  it('should toggle the booking type for url', function () {
    var contactInfos = [
      {type: 'url', value: 'http://cultuurnet.be', booking: false},
      {type: 'url', value: 'http://google.be', booking: true}
    ];
    scope.contactInfoForm = {};
    spyOn(scope, 'saveBookingType');
    eventCrud.updateBookingInfo.and.returnValue($q.resolve());

    scope.toggleBookingType(contactInfos[0]);
    scope.$digest();
    expect(scope.bookingModel.url).toEqual('');
    expect(scope.editBookingUrl).toBeFalsy();

    scope.toggleBookingType(contactInfos[1]);
    scope.$digest();
    expect(scope.bookingModel.url).toEqual(contactInfos[1].value);
    expect(scope.editBookingUrl).toBeTruthy();
  });

  it('should toggle the booking type for phone', function () {
    var contactInfos = [
      {type: 'phone', value: '1234567890', booking: false},
      {type: 'phone', value: '0987654321', booking: true}
    ];
    scope.contactInfoForm = {};
    spyOn(scope, 'saveBookingType');
    eventCrud.updateBookingInfo.and.returnValue($q.resolve());

    scope.toggleBookingType(contactInfos[0]);
    scope.$digest();
    expect(scope.bookingModel.phone).toEqual('');
    expect(scope.editBookingPhone).toBeFalsy();

    scope.toggleBookingType(contactInfos[1]);
    scope.$digest();
    expect(scope.bookingModel.phone).toEqual(contactInfos[1].value);
    expect(scope.editBookingPhone).toBeTruthy();
  });

  it('should toggle the booking type for email', function () {
    var contactInfos = [
      {type: 'email', value: 'info@mail.com', booking: false},
      {type: 'email', value: 'dude@sweet.com', booking: true}
    ];
    scope.contactInfoForm = {};
    spyOn(scope, 'saveBookingType');
    eventCrud.updateBookingInfo.and.returnValue($q.resolve());

    scope.toggleBookingType(contactInfos[0]);
    scope.$digest();
    expect(scope.bookingModel.email).toEqual('');
    expect(scope.editBookingEmail).toBeFalsy();

    scope.toggleBookingType(contactInfos[1]);
    scope.$digest();
    expect(scope.bookingModel.email).toEqual(contactInfos[1].value);
    expect(scope.editBookingEmail).toBeTruthy();
  });

  it('should save the website preview settings', function () {
    scope.bookingModel = {
      urlLabel: 'Dit is een url label'
    };
    eventCrud.updateBookingInfo.and.returnValue($q.resolve());

    scope.saveWebsitePreview();

    expect(EventFormData.bookingInfo.urlLabel).toEqual(scope.bookingModel.urlLabel);
  });

  it('should enable the website preview modal', function () {
    scope.enableWebsitePreview();

    expect(scope.websitePreviewEnabled).toBeTruthy();
  });


  it('should temporarily save the booking type "phone"', function () {
    eventCrud.updateBookingInfo.and.returnValue($q.resolve());
    scope.saveBookingType('phone');

    expect(scope.editBookingPhone).toBeFalsy();
  });

  it('should temporarily save the booking type "email"', function () {
    eventCrud.updateBookingInfo.and.returnValue($q.resolve());
    scope.saveBookingType('email');

    expect(scope.editBookingEmail).toBeFalsy();
  });

  it('should temporarily save the booking type "website"', function () {
    eventCrud.updateBookingInfo.and.returnValue($q.resolve());
    scope.saveBookingType('website');

    expect(scope.editBookingUrl).toBeFalsy();
  });

  it('should delete a given contact info item', function () {
    scope.contactInfo = [
      {type: 'phone', value: '1234567890', booking: false},
      {type: 'phone', value: '0987654321', booking: true},
      {type: 'url', value: 'http://cultuurnet.be', booking: false},
      {type: 'url', value: 'http://google.be', booking: true},
      {type: 'email', value: 'info@mail.com', booking: false},
      {type: 'email', value: 'dude@sweet.com', booking: true}
    ];
    eventCrud.updateBookingInfo.and.returnValue($q.resolve());

    scope.deleteBookingInfo({type: 'phone', value: '0987654321', booking: true}, 1);

    expect(scope.contactInfo[1].booking).toBeFalsy();
  });

  it('should save the booking info', function () {
    scope.bookingModel = {
      url: 'http://google.be',
      phone: '1234567890',
      email: 'info@mail.com'
    };
    scope.contactInfoForm = {};

    eventCrud.updateBookingInfo.and.returnValue($q.resolve());

    scope.saveBookingInfo();
    scope.$apply();

    expect(scope.bookingInfoCssClass).toEqual('state-complete');
    expect(scope.savingBookingInfo).toBeFalsy();
    expect(scope.bookingInfoError).toBeFalsy();
  });

  it('should fail in saving the booking info', function () {
    scope.bookingModel = {
      url: 'http://google.be',
      phone: '1234567890',
      email: 'info@mail.com'
    };

    eventCrud.updateBookingInfo.and.returnValue($q.reject());

    scope.saveBookingInfo();
    scope.$apply();

    expect(scope.savingBookingInfo).toBeFalsy();
    expect(scope.bookingInfoError).toBeTruthy();
  });

  it('should remove duplicate contacts which are also in the bookingModel', function () {
    scope.bookingModel = {
      url: 'http://google.be',
      phone: '1234567890',
      email: 'info@mail.com'
    };
    scope.contactInfo = [
      {type: 'phone', value: '1234567890', booking: false},
      {type: 'phone', value: '0987654321', booking: true},
      {type: 'url', value: 'http://cultuurnet.be', booking: false},
      {type: 'url', value: 'http://google.be', booking: true},
      {type: 'email', value: 'info@mail.com', booking: false},
      {type: 'email', value: 'dude@sweet.com', booking: true}
    ];
    scope.contactInfoForm = {};

    scope.removeDuplicateContactBooking();

    expect(scope.removeDuplicateContactBooking).toBeTruthy();
  });

  it('should open the image upload modal', function () {
    spyOn(uibModal, 'open');

    scope.openUploadImageModal();
    scope.$apply();

    expect(uibModal.open).toHaveBeenCalled();
  });

  it('should open the modal to edit an image', function () {
    var image = {};
    spyOn(uibModal, 'open');

    scope.editImage(image);
    scope.$apply();

    expect(uibModal.open).toHaveBeenCalled();
  });

  it('should open the modal to remove an image', function () {
    var image = {};
    spyOn(uibModal, 'open');

    scope.removeImage(image);
    scope.$apply();

    expect(uibModal.open).toHaveBeenCalled();
  });

  it('should initialize with an "adult" age range when the min age is over 18', function () {
    EventFormData.typicalAgeRange = '21-';
    EventFormData.id = 1;
    stepController = getController();

    expect(scope.ageRange).toEqual(AgeRange.ADULTS);
    expect(scope.minAge).toEqual(21);
  });

  it('should initialize with an "all" age range when no specific age range is included', function () {
    EventFormData.typicalAgeRange = '';
    EventFormData.id = 1;
    stepController = getController();

    expect(scope.ageRange).toEqual(AgeRange.ALL);
    expect(scope.minAge).toEqual(1);
  });

  it('should initialize with an "teens" age range when only for 18 year olds', function () {
    EventFormData.typicalAgeRange = 18;
    EventFormData.id = 1;
    EventFormData.facilities = ['f1', 'f2', 'f3'];
    stepController = getController();

    expect(scope.ageRange).toEqual(AgeRange.TEENS);
    expect(scope.minAge).toEqual(18);
    expect(scope.selectedFacilities).toEqual(EventFormData.facilities);
    expect(scope.facilitiesInapplicable).toBeFalsy();
  });

  it('should initialize with an "teens" age range between 12-18 years', function () {
    EventFormData.typicalAgeRange = '12-18';
    EventFormData.id = 1;
    stepController = getController();

    expect(scope.ageRange).toEqual(AgeRange.TEENS);
    expect(scope.minAge).toEqual(12);
  });

  it('should fill out existing contact info when editing an event', function () {
    EventFormData.contactPoint = {
      email: ['foo@bar.com'],
      phone: ['016985682'],
      url: ['http://foo.com', 'http://bar.com', 'https://foobar.com'],
      dude: ['sweet']
    };
    EventFormData.bookingInfo = {
      url: 'http://google.be',
      phone: '1234567890',
      email: 'info@mail.com'
    };
    EventFormData.id = 1;
    stepController = getController();
    var expectedContactInfo = [
      {type:'email', value:'foo@bar.com', booking: false},
      {type:'phone', value:'016985682', booking: false},
      {type:'url', value:'http://foo.com', booking: false},
      {type:'url', value:'http://bar.com', booking: false},
      {type:'url', value:'https://foobar.com', booking: false},
      {type:'url', value:'http://google.be', booking: true},
      {type:'phone', value:'1234567890', booking: true},
      {type:'email', value:'info@mail.com', booking: true}
    ];

    expect(scope.contactInfo).toEqual(expectedContactInfo);
    expect(scope.bookingInfoCssClass).toEqual('state-complete');
  });

  it('should update the image order when selecting a new main image', function () {
    var newMainImage = {
      '@id': 'http://culudb-silex.dev:8080/media/48f4bad5-827e-4da7-bc93-d5ff782948b4',
      '@type': 'schema:ImageObject',
      'contentUrl': 'http://culudb-silex.dev:8080/media/48f4bad5-827e-4da7-bc93-d5ff782948b4.png',
      'thumbnailUrl': 'http://culudb-silex.dev:8080/media/48f4bad5-827e-4da7-bc93-d5ff782948b4.png',
      'description': 'new main image',
      'copyrightHolder': 'Danny DeVito'
    };
    eventCrud.selectMainImage.and.returnValue($q.resolve());
    spyOn(EventFormData, 'selectMainImage');
    stepController = getController();

    scope.selectMainImage(newMainImage);
    scope.$apply();

    expect(eventCrud.selectMainImage).toHaveBeenCalledWith(EventFormData, newMainImage);
    expect(EventFormData.selectMainImage).toHaveBeenCalledWith(newMainImage);
  });
});