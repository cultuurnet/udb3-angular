'use strict';

describe('Component: Uitpas Info', function () {
  beforeEach(module('udb.core'));
  beforeEach(module('udb.event-form'));
  beforeEach(module('udb.uitpas'));

  var UdbOrganizer, $q, udbUitpasApi, UitpasLabels, EventFormData, $componentController, $rootScope, $scope;

  var organizerJson = {
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
    'hiddenLabels': [
        'Paspartoe'
    ],
    'isUitpas': true
  };

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

  beforeEach(inject(function ($injector) {
    $rootScope = $injector.get('$rootScope');
    $scope = $rootScope.$new();
    UitpasLabels = $injector.get('UitpasLabels');
    $componentController = $injector.get('$componentController');
    EventFormData = $injector.get('EventFormData');
    UdbOrganizer = $injector.get('UdbOrganizer');
    $q = $injector.get('$q');
    EventFormData.isEvent = true;
    udbUitpasApi = jasmine.createSpyObj(
      'udbUitpasApi',
      [
        'getEventUitpasData',
        'updateEventUitpasData',
        'findOrganisationsCardSystems'
      ]
    );

  }));

  function getComponentController(bindings) {
    var controller = $componentController('cardSystemSelector',
      {
        $q: $q,
        udbUitpasApi: udbUitpasApi,
        UitpasLabels: UitpasLabels
      },
      bindings || {
        organisation: new UdbOrganizer(organizerJson),
        offerData: EventFormData
      });

    if (!bindings) {
      controller.$onInit();
    }

    return controller;
  }

  it('should show card systems for an event not known by UiTPAS', function () {
    udbUitpasApi.getEventUitpasData.and.returnValue($q.reject());
    udbUitpasApi.findOrganisationsCardSystems.and.returnValue($q.resolve(organizerCardSystems));
    var controller = getComponentController();

    var expectedCardSystems = [
      {
        id: '1',
        name: 'ACME INC.',
        distributionKeys: [
          {
            id: '182',
            name: 'CC Cultureel Centrum - 1,5 EUR / dag'
          }
        ],
        assignedDistributionKey: undefined,
        active: false
      },
      {
        id: '2',
        name: 'foo bar balie',
        distributionKeys: [
          {
            id: '194',
            name: 'CC qwerty - 3 EUR / dag'
          }
        ],
        assignedDistributionKey: undefined,
        active: false
      },
      {
        name: 'Paspartoe',
        active: true,
        distributionKeys: []
      },
      {
        name: 'UiTPAS',
        active: true,
        distributionKeys: []
      }
    ];

    $scope.$digest();
    expect(controller.availableCardSystems).toEqual(expectedCardSystems);
  });

  it('should show the assigned distribution keys retrieved from UiTPAS for each card systems ', function () {
    udbUitpasApi.getEventUitpasData.and.returnValue($q.resolve(['182']));
    udbUitpasApi.findOrganisationsCardSystems.and.returnValue($q.resolve(organizerCardSystems));
    var controller = getComponentController();

    var expectedCardSystems = [
      {
        id: '1',
        name: 'ACME INC.',
        distributionKeys: [
          {
            id: '182',
            name: 'CC Cultureel Centrum - 1,5 EUR / dag'
          }
        ],
        assignedDistributionKey: {
          id: '182',
          name: 'CC Cultureel Centrum - 1,5 EUR / dag'
        },
        active: true
      },
      {
        id: '2',
        name: 'foo bar balie',
        distributionKeys: [
          {
            id: '194',
            name: 'CC qwerty - 3 EUR / dag'
          }
        ],
        assignedDistributionKey: undefined,
        active: false
      },
      {
        name: 'Paspartoe',
        active: true,
        distributionKeys: []
      },
      {
        name: 'UiTPAS',
        active: true,
        distributionKeys: []
      }
    ];

    $scope.$digest();
    expect(controller.availableCardSystems).toEqual(expectedCardSystems);
  });
});
