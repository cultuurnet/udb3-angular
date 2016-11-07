'use strict';

describe('Component: Uitpas Info', function () {

  beforeEach(module('udb.core'));
  beforeEach(module('udb.event-form'));
  beforeEach(module('udb.uitpas'));

  var uitpasInfo, $q, $rootScope, $scope, $componentController, EventFormData,
    udbOrganizers, UdbOrganizer, eventCrud, $uibModal, fakeModal, passedData, organizerJson;

  organizerJson = {
    '@id': '357D5297-9E37-1DE9-62398987EA110D38',
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
    $uibModal = jasmine.createSpyObj('$uibModal', ['open', 'dismiss']);
    $q = $injector.get('$q');

    spyOn($rootScope, '$emit');

    EventFormData.isEvent = true;
  }));

  function getOrganizerObject(organizer) {
    return new UdbOrganizer(organizer);
  }

  function getController() {
    return $componentController('uitpasInfo',
    {
      $scope: $scope,
      $rootScope: $rootScope,
      EventFormData: EventFormData,
      udbOrganizers: udbOrganizers,
      eventCrud: eventCrud,
      $uibModal: $uibModal
    },
    {
      organizer: getOrganizerObject(organizerJson),
      price: price,
      uitpasData: []
    });
  }

  it('should initialize the uitpas info component when organizer is an uitpas organizer', function () {
    udbOrganizers.findOrganizersCardsystem.and.returnValue($q.resolve(organizerCardSystems));
    eventCrud.getEventUitpasData.and.returnValue($q.resolve(usedDistributionKeys));

    var controller = getController();

    $scope.$apply();

    expect($scope.showUitpasInfo).toBeTruthy();
    expect(controller.organizerCardSystems).toEqual(organizerCardSystems);
    expect($scope.usedDistributionKeys).toEqual(usedDistributionKeys);
    expect(EventFormData.usedDistributionKeys).toEqual(usedDistributionKeys);
    expect($scope.hasUitpasData).toBeTruthy();
    expect($scope.checkedCardSystems).toEqual(expectedCheckedCardSystems);
  });

  it('should not further initialize when organizer is not an uitpas organizer', function () {
    organizerJson = {
      '@id': '357D5297-9E37-1DE9-62398987EA110D38',
      'isUitpas': false
    };

    var controller = getController();

    $scope.$apply();

    expect($scope.showUitpasInfo).toBeFalsy();
  });

  it('should fire an emit when saving the UiTPAS data', function () {
    eventCrud.updateEventUitpasData.and.returnValue($q.resolve([]));
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
});