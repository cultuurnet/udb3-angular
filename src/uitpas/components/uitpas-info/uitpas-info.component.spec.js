'use strict';

describe('Component: Uitpas Info', function () {

  beforeEach(module('udb.core'));
  beforeEach(module('udb.event-form'));
  beforeEach(module('udb.uitpas'));

  var uitpasInfo, $q, $rootScope, $scope, $componentController, EventFormData,
    udbOrganizers, UdbOrganizer, eventCrud, fakeModal, passedData, organizerJson;

  organizerJson = {
    '@id': 'http/du.de/organisation/357D5297-9E37-1DE9-62398987EA110D38',
    'name': 'Club Silo',
    'addresses': [
      {
        addressCountry: 'BE',
        addressLocality: 'Leuven',
        postalCode: '3000',
        streetAddress: 'Vaartkom 39'
      }
    ],
    'email': [
      'info@silo.be'
    ],
    'phone': [
      '+32 476 838982'
    ],
    'url': [],
    'labels': [
      {
        name: 'green',
        uuid: '6befb6d0-aefe-42bb-8496-960e9ceec05f'
      },
      {
        name: 'UiTPAS',
        uuid: '10e44536-44e2-4b42-98c8-b8dd86a6d60b'
      }
    ],
    'isUitpas': true
  };

  var price = [
    {
      category: 'base',
      name: 'Basisprijs',
      price: 15,
      priceCurrency: 'EUR'
    },
    {
      category: 'tariff',
      name: 'voordeeltarief',
      price: 12,
      priceCurrency: 'EUR'
    }
  ];

  var organizerCardSystems = [
    {
      id: '1',
      name: 'ACME INC.',
      distributionKeys: [
        {
          id: '182',
          name: 'CC Cultureel Centrum - 1,5 EUR / dag'
        }
      ]
    },
    {
      id: '2',
      name: 'foo bar balie',
      distributionKeys: [
        {
          id: '194',
          name: 'CC qwerty - 3 EUR / dag'
        }
      ]
    }
  ];

  var usedDistributionKeys = ['182', '194'];

  var expectedCheckedCardSystems = [
    {
      distributionKeyId: '182',
      distributionKeyName: 'CC Cultureel Centrum - 1,5 EUR / dag',
      cardSystemId: '1',
      cardSystemName: 'ACME INC.'
    },
    { distributionKeyId: '194',
      distributionKeyName: 'CC qwerty - 3 EUR / dag',
      cardSystemId: '2',
      cardSystemName: 'foo bar balie'
    }
  ];

  beforeEach(inject(function ($injector){
    $rootScope = $injector.get('$rootScope');
    $scope = $rootScope.$new();
    $componentController = $injector.get('$componentController');
    EventFormData = $injector.get('EventFormData');
    UdbOrganizer = $injector.get('UdbOrganizer');
    udbOrganizers = jasmine.createSpyObj('udbOrganizers', ['findOrganizersCardsystem']);
    eventCrud = jasmine.createSpyObj('eventCrud', ['updateEventUitpasData', 'getEventUitpasData']);
    $q = $injector.get('$q');
    EventFormData.isEvent = true;

    udbOrganizers.findOrganizersCardsystem.and.returnValue($q.resolve(organizerCardSystems));
    eventCrud.getEventUitpasData.and.returnValue($q.resolve(usedDistributionKeys));
  }));

  function getOrganizerObject() {
    return new UdbOrganizer(organizerJson);
  }

  /**
   * Get the UiTPAS info component controller
   *
   * @param {Object} [bindings]
   *  The bindings scoped above will be used by default if you don't provide any.
   * @return {*}
   */
  function getController(bindings) {
    var controller = $componentController('uitpasInfo',
    {
      $scope: $scope,
      $rootScope: $rootScope,
      EventFormData: EventFormData,
      udbOrganizers: udbOrganizers,
      eventCrud: eventCrud
    },
    bindings || {
      organizer: getOrganizerObject(),
      price: price,
      uitpasData: []
    });

    if (!bindings) {
      controller.$onInit();
    }

    return controller;
  }

  it('should initialize the uitpas info component when organizer is an uitpas organizer', function () {
    var controller = getController();

    $scope.$apply();

    expect($scope.showUitpasInfo).toEqual(true);
    expect(controller.organizerCardSystems).toEqual(organizerCardSystems);
    expect($scope.usedDistributionKeys).toEqual(usedDistributionKeys);
    expect(EventFormData.usedDistributionKeys).toEqual(usedDistributionKeys);
    expect($scope.hasUitpasData).toBeTruthy();
    expect($scope.checkedCardSystems).toEqual(expectedCheckedCardSystems);
  });

  it('should not further initialize when organizer is not an uitpas organizer', function () {
    var organizer = new UdbOrganizer({
      '@id': 'http/du.de/organisation/3bddd7e9-9d2c-4162-9210-67d7d88c0e45',
      'name': 'Club Silo',
      'addresses': [
        {
          addressCountry: 'BE',
          addressLocality: 'Leuven',
          postalCode: '3000',
          streetAddress: 'Vaartkom 39'
        }
      ],
      'email': [
        'info@silo.be'
      ],
      'phone': [
        '+32 476 838982'
      ],
      'url': [],
      'labels': [
        {
          name: 'green',
          uuid: '6befb6d0-aefe-42bb-8496-960e9ceec05f'
        }
      ]
    });

    var controller = getController({
      organizer: organizer,
      price: [],
      uitpasData: []
    });

    $scope.$apply();

    expect($scope.showUitpasInfo).toEqual(false);
  });

  it('should fire an emit when saving the UiTPAS data', function () {
    eventCrud.updateEventUitpasData.and.returnValue($q.resolve([]));
    spyOn($rootScope, '$emit');
    var controller = getController();

    controller.saveUitpasData(expectedCheckedCardSystems);
    $scope.$apply();

    expect(controller.checkedCardSystems).toEqual(expectedCheckedCardSystems);
    expect($scope.hasUitpasData).toBeTruthy();
    expect(EventFormData.uitpasData).toEqual(expectedCheckedCardSystems);
    expect(EventFormData.usedDistributionKeys).toEqual(['182', '194']);
    expect($rootScope.$emit).toHaveBeenCalledWith('eventFormSaved', EventFormData);
    expect($scope.uitpasCssClass).toEqual('state-complete');
    expect($scope.savingUitpas).toBeFalsy();
  });

  it('should handle all errors when saving UiTPAS data failed', function () {
    eventCrud.updateEventUitpasData.and.returnValue($q.reject());
    var controller = getController();

    controller.saveUitpasData(expectedCheckedCardSystems);
    $scope.$apply();

    expect($scope.uitpasError).toBeTruthy();
    expect($scope.savingUitpas).toBeFalsy();
  });

  it('should not show the card systems when pricing is unknown', function () {
    var controller = getController({
      organizer: getOrganizerObject(),
      price: [],
      uitpasData: []
    });

    controller.$onInit();

    expect(controller.showCardSystems).toEqual(false);
  });

  it('should show the card systems when pricing is free', function () {
    var controller = getController({
      organizer: getOrganizerObject(),
      price: [ {
        "category": "base",
        "name": "Senioren",
        "price": 0
      }],
      uitpasData: []
    });

    controller.$onInit();

    expect(controller.showCardSystems).toEqual(true);
  });

  it('should show the card systems when pricing is set', function (done) {
    var controller = getController({
      organizer: getOrganizerObject(),
      price: [],
      uitpasData: []
    });

    function assertCardSystemsShown () {
      expect(controller.showCardSystems).toEqual(true);
      done();
    }

    assertPostHandling(controller, 'showCardSystemsIfPriceIsSelected', assertCardSystemsShown);

    controller.$onInit();
    expect(controller.showCardSystems).toEqual(false);

    $rootScope.$emit('eventFormSaved', {
      priceInfo: [{
        "category": "base",
        "name": "Senioren",
        "price": 3
      }]
    });
    $rootScope.$apply();
  });

  it('should not show UiTPAS info after removing the UiTPAS organizer and price is still set', function (done) {
    var controller = getController({
      organizer: getOrganizerObject(),
      price: [{
        "category": "base",
        "name": "Senioren",
        "price": 3
      }],
      uitpasData: []
    });
    eventCrud.updateEventUitpasData.and.returnValue($q.reject());
    assertPostHandling(controller, 'reset', assertUitpasInfoVisibility);

    function assertUitpasInfoVisibility () {
      expect($scope.showUitpasInfo).toEqual(false);
      done();
    }

    controller.$onInit();
    $scope.$apply();
    expect($scope.showUitpasInfo).toEqual(true);

    $rootScope.$emit('eventOrganizerDeleted', {});
    $rootScope.$apply();
  });

  /**
   *
   * @param {Object} controller
   * @param {string} handlerReference
   * @param {Function} assertion
   */
  function assertPostHandling(controller, handlerReference, assertion) {
    var originalMethod = controller[handlerReference];
    spyOn(controller, handlerReference)
      .and.callFake(mockHandler);

    function mockHandler() {
      originalMethod.apply(this, arguments);
      assertion.apply(this, arguments);
    }
  }
});