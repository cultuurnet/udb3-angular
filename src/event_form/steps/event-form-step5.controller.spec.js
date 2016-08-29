'use strict';

describe('Controller: event form step 5', function () {

  beforeEach(module('udb.event-form'));

  var $controller, stepController, scope, EventFormData, udbOrganizers, UdbOrganizer, $q, eventCrud, uibModal;
  var AgeRange = {
    'ALL': {'value': 0, 'label': 'Alle leeftijden'},
    'KIDS': {'value': 12, 'label': 'Kinderen tot 12 jaar', min: 1, max: 12},
    'TEENS': {'value': 18, 'label': 'Jongeren tussen 12 en 18 jaar', min: 13, max: 18},
    'ADULTS': {'value': 99, 'label': 'Volwassenen (+18 jaar)', min: 19}
  };

  beforeEach(inject(function ($rootScope, $injector) {
    $controller = $injector.get('$controller');
    scope = $rootScope;
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
      'selectMainImage'
    ]);
    stepController = getController();
    spyOn(stepController, 'eventFormSaved');
  }));

  function getController() {
    return $controller('EventFormStep5Controller', {
      $scope: scope,
      EventFormData: EventFormData,
      udbOrganizers: udbOrganizers,
      $uibModal: uibModal,
      eventCrud: eventCrud
    });
  }

  it('should save a description and toggle the state-complete class', function () {
    scope.description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus in dui at dolor pretium consequat sit amet a erat. Quisque pretium dolor sed arcu fringilla elementum. Donec sodales vestibulum nibh, ut imperdiet est luctus sed. Sed vitae faucibus orci, rhoncus interdum eros. Aliquam commodo turpis sed metus tempus, vel mollis mi elementum. Donec finibus interdum magna non tristique. Praesent viverra ullamcorper nulla in tristique.';
    spyOn(EventFormData, 'setDescription');

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
    var fakeModal = {
      result: {
        then: function() {}
      }
    };

    spyOn(uibModal, 'open').and.returnValue(fakeModal);
    scope.openOrganizerModal();
    scope.$apply();

    expect(uibModal.open).toHaveBeenCalled();
  });

  it('should save the organizer for the event', function () {
    eventCrud.updateOrganizer.and.returnValue($q.resolve());

    var organizer = new UdbOrganizer();
    spyOn(EventFormData, 'organizer');

    stepController.saveOrganizer(organizer);
    scope.$apply();

    expect(EventFormData.organizer).toEqual(organizer);
    expect(stepController.eventFormSaved).toHaveBeenCalled();
    expect(scope.organizerCssClass).toEqual('state-complete');
    expect(scope.savingOrganizer).toBeFalsy();
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
    stepController = getController();

    expect(scope.ageRange).toEqual(AgeRange.TEENS);
    expect(scope.minAge).toEqual(18);
  });

  it('should fill out existing contact info when editing an event', function () {
    EventFormData.contactPoint = {
      email: ['foo@bar.com'],
      phone: ['016985682'],
      url: ['http://foo.com', 'http://bar.com', 'https://foobar.com'],
      dude: ['sweet']
    };
    EventFormData.id = 1;
    stepController = getController();
    var expectedContactInfo = [
      {type:'email', value:'foo@bar.com', booking: false},
      {type:'phone', value:'016985682', booking: false},
      {type:'url', value:'http://foo.com', booking: false},
      {type:'url', value:'http://bar.com', booking: false},
      {type:'url', value:'https://foobar.com', booking: false}
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