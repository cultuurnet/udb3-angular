'use strict';

describe('Controller: event form step 5', function () {

  beforeEach(module('udb.event-form'));

  var $controller, stepController, scope, rootScope, EventFormData, udbOrganizers, UdbOrganizer, $q, eventCrud, uibModal, udbUitpasApi;
  var appConfig = {
    uitpasUrl: 'http://foo.bar/',
    offerEditor: {
      'excludeOrganizerLabel': '',
      'includeOrganizerLabel': 'foo'
    }
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
      'updateBookingInfo'
    ]);
    udbUitpasApi = jasmine.createSpyObj('udbUitpasApi', ['getTicketSales']);
    stepController = getController();
  }));

  function getController() {
    return $controller('EventFormStep5Controller', {
      $scope: scope,
      EventFormData: EventFormData,
      eventCrud: eventCrud,
      udbOrganizers: udbOrganizers,
      $uibModal: uibModal,
      $rootScope: rootScope,
      appConfig: appConfig,
      udbUitpasApi: udbUitpasApi
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

  it('should not save an empty description', function () {
    scope.description = '';
    spyOn(EventFormData, 'setDescription');
    spyOn(stepController, 'eventFormSaved');

    eventCrud.updateDescription.and.returnValue($q.resolve());

    scope.saveDescription();
    scope.$apply();

    expect(scope.savingDescription).toBeFalsy();
  });

  it('should save an empty description when allowEmpty is true', function () {
    scope.description = '';
    spyOn(EventFormData, 'setDescription');
    spyOn(stepController, 'eventFormSaved');

    eventCrud.updateDescription.and.returnValue($q.resolve());

    scope.saveDescription(true);
    scope.$apply();

    expect(EventFormData.setDescription).toHaveBeenCalled();
    expect(scope.savingDescription).toBeFalsy();
    expect(stepController.eventFormSaved).toHaveBeenCalled();
    expect(scope.descriptionCssClass).toEqual('state-incomplete');
  });

  it('should save an altered description', function () {
    scope.originalDescription = 'same description';
    scope.description = 'other description';

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

  it('should not save the same description', function () {
    scope.description = 'same description';
    scope.originalDescription = 'same description';

    spyOn(EventFormData, 'setDescription');
    spyOn(stepController, 'eventFormSaved');

    eventCrud.updateDescription.and.returnValue($q.resolve());

    scope.saveDescription();
    scope.$apply();

    expect(scope.savingDescription).toBeFalsy();
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

  it('should delete an organizer when there is no priceInfo', function() {
      eventCrud.deleteOfferOrganizer.and.returnValue($q.resolve());

      scope.deleteOrganizerHandler();
      scope.$apply();

      expect(eventCrud.deleteOfferOrganizer).toHaveBeenCalled();
  });

  it('should not delete the organizer when the event has sold tickets', function() {
      EventFormData.priceInfo = [
          {
            category: 'base',
            name: 'Basistarief',
            priceCurrency: 'EUR',
            price: 4.00
          }
      ];
      udbUitpasApi.getTicketSales.and.returnValue($q.resolve(true));

      scope.deleteOrganizerHandler();
      scope.$apply();

      expect(udbUitpasApi.getTicketSales).toHaveBeenCalled();
      expect(scope.hasTicketSales).toBeTruthy();
  });

  it('should delete the organizer when the event has no sold tickets', function() {
    EventFormData.priceInfo = [
      {
        category: 'base',
        name: 'Basistarief',
        priceCurrency: 'EUR',
        price: 4.00
      }
    ];
    udbUitpasApi.getTicketSales.and.returnValue($q.resolve(false));
    eventCrud.deleteOfferOrganizer.and.returnValue($q.resolve());

    scope.deleteOrganizerHandler();
    scope.$apply();

    expect(udbUitpasApi.getTicketSales).toHaveBeenCalled();
    expect(eventCrud.deleteOfferOrganizer).toHaveBeenCalled();
  });

  it('should throw an error when the call to UiTPAS fails', function() {
    EventFormData.priceInfo = [
      {
        category: 'base',
        name: 'Basistarief',
        priceCurrency: 'EUR',
        price: 4.00
      }
    ];
    udbUitpasApi.getTicketSales.and.returnValue($q.reject());

    scope.deleteOrganizerHandler();
    scope.$apply();

    expect(udbUitpasApi.getTicketSales).toHaveBeenCalled();
    expect(scope.hasUitpasError).toBeTruthy();
  });

  it('should persist and reset the event organizer when removing it', function () {
    eventCrud.deleteOfferOrganizer.and.returnValue($q.resolve());
    spyOn(EventFormData, 'resetOrganizer');

    scope.deleteOrganizerHandler();
    scope.$apply();

    expect(eventCrud.deleteOfferOrganizer).toHaveBeenCalled();
    expect(EventFormData.resetOrganizer).toHaveBeenCalled();
  });

  it('should show an async error when failing to remove the organizer', function () {
    eventCrud.deleteOfferOrganizer.and.returnValue($q.reject('BOOOM!'));
    spyOn(stepController, 'showAsyncOrganizerError');

    scope.deleteOrganizerHandler();
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
    scope.contactInfo = [
      {type: 'phone', value: '0987654321', booking: false}
    ];
    scope.contactInfoForm = {};
    scope.contactInfoForm.$valid = true;

    eventCrud.updateContactPoint.and.returnValue($q.resolve());
    spyOn(scope, 'saveContactInfo');

    scope.deleteContactInfo(0);
    scope.$apply();

    expect(scope.contactInfo).toEqual([]);
    expect(scope.contactInfoCssClass).toEqual('state-incomplete');
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

    scope.bookingModel = {
      phone:'0987654321',
      url:'http://google.be',
      email:'dude@sweet.com'
    };

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

  it('should show the booking info toggles based on contact info type', function () {
    var contactInfo = [
      {type: 'phone', value: '1234567890', booking: false},
      {type: 'phone', value: '0987654321', booking: true},
      {type: 'url', value: 'http://cultuurnet.be', booking: false},
      {type: 'email', value: 'info@mail.com', booking: false},
      {type: 'url', value: 'http://google.be', booking: true},
      {type: 'email', value: 'dude@sweet.com', booking: false}
    ];
    scope.contactInfo = contactInfo;

    scope.$apply();
    expect(scope.showBookingOption(contactInfo[0])).toEqual(false);
    expect(scope.showBookingOption(contactInfo[1])).toEqual(true);
    expect(scope.showBookingOption(contactInfo[2])).toEqual(false);
    expect(scope.showBookingOption(contactInfo[3])).toEqual(true);
    expect(scope.showBookingOption(contactInfo[4])).toEqual(true);
    expect(scope.showBookingOption(contactInfo[5])).toEqual(true);
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

    scope.bookingModel.urlLabel['nl'] = {
      value: 'reserve_places',
      label: 'Reserveer plaatsen'
    };

    eventCrud.updateBookingInfo.and.returnValue($q.resolve());

    scope.toggleBookingType(contactInfos[0]);
    scope.$digest();
    expect(scope.bookingModel.url).toEqual('');

    scope.toggleBookingType(contactInfos[1]);
    scope.$digest();
    expect(scope.bookingModel.url).toEqual(contactInfos[1].value);
  });

  it('should toggle the booking type for phone', function () {
    var contactInfos = [
      {type: 'phone', value: '1234567890', booking: false},
      {type: 'phone', value: '0987654321', booking: true}
    ];
    scope.contactInfoForm = {};

    scope.bookingModel.urlLabel['nl'] = {
      value: 'reserve_places',
      label: 'Reserveer plaatsen'
    };

    eventCrud.updateBookingInfo.and.returnValue($q.resolve());

    scope.toggleBookingType(contactInfos[0]);
    scope.$digest();
    expect(scope.bookingModel.phone).toEqual('');

    scope.toggleBookingType(contactInfos[1]);
    scope.$digest();
    expect(scope.bookingModel.phone).toEqual(contactInfos[1].value);
  });

  it('should toggle the booking type for email', function () {
    var contactInfos = [
      {type: 'email', value: 'info@mail.com', booking: false},
      {type: 'email', value: 'dude@sweet.com', booking: true}
    ];
    scope.contactInfoForm = {};

    scope.bookingModel.urlLabel['nl'] = {
      value: 'reserve_places',
      label: 'Reserveer plaatsen'
    };

    eventCrud.updateBookingInfo.and.returnValue($q.resolve());

    scope.toggleBookingType(contactInfos[0]);
    scope.$digest();
    expect(scope.bookingModel.email).toEqual('');

    scope.toggleBookingType(contactInfos[1]);
    scope.$digest();
    expect(scope.bookingModel.email).toEqual(contactInfos[1].value);
  });

  it('should save the website preview settings', function () {
    EventFormData.bookingInfo.availabilityStarts = new Date();
    EventFormData.bookingInfo.availabilityEnds = new Date();
    EventFormData.bookingInfo.urlLabel = 'Dit is een url label';

    scope.bookingModel = {
      urlLabel: 'Dit is een url label'
    };
    var expectedBookingInfoFormData = {
      "url": "",
      "urlLabel": "Dit is een url label",
      "email": "",
      "phone": "",
      availabilityStarts : EventFormData.bookingInfo.availabilityStarts,
      availabilityEnds : EventFormData.bookingInfo.availabilityEnds
    };
    spyOn(scope, 'saveWebsitePreview');

    eventCrud.updateBookingInfo
      .and.returnValue($q.resolve())
      .and.callFake(function(evenFormData) {
        expect(evenFormData.bookingInfo).toEqual(expectedBookingInfoFormData);
      });

    scope.saveWebsitePreview();

    expect(EventFormData.bookingInfo.urlLabel).toEqual(scope.bookingModel.urlLabel);
  });

  it('should enable the website preview modal', function () {
    scope.enableWebsitePreview();

    expect(scope.websitePreviewEnabled).toBeTruthy();
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

    EventFormData.bookingInfo = {
      url : '',
      urlLabel : 'Reserveer plaatsen',
      email : '',
      phone : '0987654321',
      availabilityStarts : new Date(),
      availabilityEnds : new Date()
    };

    scope.bookingModel = {
      urlLabel: 'Reserveer plaatsen'
    };

    var expectedBookingInfoFormData = {
      "url": "",
      "urlLabel": "Reserveer plaatsen",
      "email": "",
      "phone": "0987654321",
      availabilityStarts : EventFormData.bookingInfo.availabilityStarts,
      availabilityEnds : EventFormData.bookingInfo.availabilityEnds
    };

    spyOn(scope, 'deleteBookingInfo').and.callFake(function () {
      expect(scope.toggleBookingType).toHaveBeenCalled();
    });

    eventCrud.updateBookingInfo
      .and.returnValue($q.resolve())
      .and.callFake(function(evenFormData) {
        expect(evenFormData.bookingInfo).toEqual(expectedBookingInfoFormData);
      });
  });

  it('should save the booking info', function () {
    scope.bookingModel = {
      url: 'http://google.be',
      phone: '1234567890',
      email: 'info@mail.com'
    };
    scope.contactInfoForm = {};
    EventFormData.bookingInfo.availabilityEnds = new Date();
    EventFormData.bookingInfo.availabilityStarts = new Date();

    var expectedBookingInfoFormData = {
      "url": "http://google.be",
      "urlLabel": "Reserveer plaatsen",
      "email": "info@mail.com",
      "phone": "1234567890",
      "availabilityStarts": EventFormData.bookingInfo.availabilityStarts,
      "availabilityEnds": EventFormData.bookingInfo.availabilityEnds
    };

    spyOn(scope, 'saveBookingInfo');

    eventCrud.updateBookingInfo
      .and.returnValue($q.resolve())
      .and.callFake(function(evenFormData) {
        expect(evenFormData.bookingInfo).toEqual(expectedBookingInfoFormData);
      });

    scope.saveBookingInfo();
    scope.$apply();

    expect(scope.savingBookingInfo).toBeFalsy();
    expect(scope.bookingInfoError).toBeFalsy();
  });

  it('should fail in saving the booking info', function () {
    scope.mainLanguage = 'nl';
    scope.bookingModel.url = 'http://google.be';
    scope.bookingModel.urlLabel['nl'] = {
      value: 'reserve_places',
      label: 'Reserveer plaatsen'
    };
    scope.bookingModel.phone = '1234567890';
    scope.bookingModel.email = 'info@mail.com';

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
