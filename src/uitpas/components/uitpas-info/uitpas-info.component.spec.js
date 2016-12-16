'use strict';

describe('Component: Uitpas Info', function () {

  beforeEach(module('udb.core'));
  beforeEach(module('udb.event-form'));
  beforeEach(module('udb.uitpas'));

  var uitpasInfo, $q, $rootScope, $scope, $componentController, EventFormData,
    udbOrganizers, UdbOrganizer, eventCrud, passedData, organizerJson;

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
      'green',
      'UiTPAS'
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

  beforeEach(inject(function ($injector){
    $rootScope = $injector.get('$rootScope');
    $scope = $rootScope.$new();
    $componentController = $injector.get('$componentController');
    EventFormData = $injector.get('EventFormData');
    UdbOrganizer = $injector.get('UdbOrganizer');
    $q = $injector.get('$q');
    EventFormData.isEvent = true;
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
      EventFormData: EventFormData
    },
    bindings || {
      organizer: getOrganizerObject(),
      price: price
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
    expect(controller.showCardSystems).toEqual(true);
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
        'green'
      ]
    });

    var controller = getController({
      organizer: organizer,
      price: []
    });

    $scope.$apply();

    expect($scope.showUitpasInfo).toEqual(false);
  });

  it('should not show the card systems when pricing is unknown', function () {
    var controller = getController({
      organizer: getOrganizerObject(),
      price: []
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
      }]
    });

    controller.$onInit();

    expect(controller.showCardSystems).toEqual(true);
  });

  it('should show the card systems when pricing is set', function (done) {
    var controller = getController({
      organizer: getOrganizerObject(),
      price: []
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