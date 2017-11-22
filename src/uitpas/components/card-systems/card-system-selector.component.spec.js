'use strict';

describe('Component: Uitpas Info', function () {
  beforeEach(module('udb.core'));
  beforeEach(module('udb.event-form'));
  beforeEach(module('udb.uitpas'));

  var UdbOrganizer, $q, udbUitpasApi, UitpasLabels, EventFormData, $componentController, $rootScope, $scope;

  var organizerJson = {
    '@id': 'https://udb-silex-acc.uitdatabank.be/event/b3137053-c05e-4234-b12c-554e6fbbc298',
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
      id: 1,
      name: 'ACME INC.',
      distributionKeys: [
        {
          id: 23,
          name: '€1,5 dag (regio)'
        },
        {
          id: 24,
          name: '€3 hele dag (regio)'
        },
        {
          id: 25,
          name: '25% meerdaags (regio)'
        }
      ]
    },
    {
      id: 2,
      name: 'foo bar balie',
      distributionKeys: []
    }
  ];

  var evenCardSystemWithoutDistributionKey = {
    id: 2,
    name: 'foo bar balie',
    distributionKeys: []
  };

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
        'getEventCardSystems',
        'addEventCardSystem',
        'removeEventCardSystem',
        'addEventCardSystemDistributionKey',
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

    $scope.$digest();

    return controller;
  }

  it('should show card systems for an event not known by UiTPAS', function () {
    udbUitpasApi.getEventCardSystems.and.returnValue($q.resolve([]));
    udbUitpasApi.findOrganisationsCardSystems.and.returnValue($q.resolve(organizerCardSystems));
    var controller = getComponentController();

    var expectedCardSystems = [
      {
        id: 1,
        name: 'ACME INC.',
        distributionKeys: [
          {
            id: 23,
            name: '€1,5 dag (regio)'
          },
          {
            id: 24,
            name: '€3 hele dag (regio)'
          },
          {
            id: 25,
            name: '25% meerdaags (regio)'
          }
        ],
        assignedDistributionKey: {
          id: 23,
          name: '€1,5 dag (regio)'
        },
        active: false
      },
      {
        id: 2,
        name: 'foo bar balie',
        distributionKeys: [],
        assignedDistributionKey: undefined,
        active: false
      }
    ];

    expect(controller.availableCardSystems).toEqual(expectedCardSystems);
  });

  it('should show the assigned distribution keys retrieved from UiTPAS for each card systems ', function () {
    udbUitpasApi.getEventCardSystems.and.returnValue($q.resolve([organizerCardSystems[0]]));
    udbUitpasApi.findOrganisationsCardSystems.and.returnValue($q.resolve(organizerCardSystems));
    var controller = getComponentController();

    var expectedCardSystems = [
      {
        id: 1,
        name: 'ACME INC.',
        distributionKeys: [
          {
            id: 23,
            name: '€1,5 dag (regio)'
          },
          {
            id: 24,
            name: '€3 hele dag (regio)'
          },
          {
            id: 25,
            name: '25% meerdaags (regio)'
          }
        ],
        assignedDistributionKey: {
          id: 23,
          name: '€1,5 dag (regio)'
        },
        active: true
      },
      {
        id: 2,
        name: 'foo bar balie',
        distributionKeys: [],
        assignedDistributionKey: undefined,
        active: false
      }
    ];

    expect(controller.availableCardSystems).toEqual(expectedCardSystems);
  });

  it('should add a card system to an uitpas event when actived', function () {
    udbUitpasApi.getEventCardSystems.and.returnValue($q.resolve([organizerCardSystems[0]]));
    udbUitpasApi.findOrganisationsCardSystems.and.returnValue($q.resolve(organizerCardSystems));
    udbUitpasApi.addEventCardSystem.and.returnValue($q.resolve('OK'));
    EventFormData.id = 'A2EFC5BC-B8FD-4F27-A7B2-EDF46AEA2444';

    var controller = getComponentController();
    var cardSystem = controller.availableCardSystems[1];
    cardSystem.active = true;

    controller.activeCardSystemsChanged(cardSystem);
    expect(udbUitpasApi.addEventCardSystem).toHaveBeenCalledWith('A2EFC5BC-B8FD-4F27-A7B2-EDF46AEA2444', 2);
  });

  it('should remove a card system from an uitpas event when deactived', function () {
    udbUitpasApi.getEventCardSystems.and.returnValue($q.resolve([organizerCardSystems[0]]));
    udbUitpasApi.findOrganisationsCardSystems.and.returnValue($q.resolve(organizerCardSystems));
    udbUitpasApi.removeEventCardSystem.and.returnValue($q.resolve('OK'));
    EventFormData.id = 'A2EFC5BC-B8FD-4F27-A7B2-EDF46AEA2444';

    var controller = getComponentController();
    var cardSystem = controller.availableCardSystems[1];
    cardSystem.active = false;

    controller.activeCardSystemsChanged(cardSystem);
    expect(udbUitpasApi.removeEventCardSystem).toHaveBeenCalledWith('A2EFC5BC-B8FD-4F27-A7B2-EDF46AEA2444', 2);
  });

  it('should add a card system to an uitpas event by distribution key when selected', function () {
    udbUitpasApi.getEventCardSystems.and.returnValue($q.resolve([organizerCardSystems[0]]));
    udbUitpasApi.findOrganisationsCardSystems.and.returnValue($q.resolve(organizerCardSystems));
    udbUitpasApi.addEventCardSystemDistributionKey.and.returnValue($q.resolve('OK'));
    EventFormData.id = 'A2EFC5BC-B8FD-4F27-A7B2-EDF46AEA2444';

    var controller = getComponentController();
    var cardSystem = controller.availableCardSystems[1];
    cardSystem.assignedDistributionKey = {
      id: 194,
      name: 'CC qwerty - 3 EUR / dag'
    };

    controller.distributionKeyAssigned(cardSystem);
    expect(udbUitpasApi.addEventCardSystemDistributionKey).toHaveBeenCalledWith('A2EFC5BC-B8FD-4F27-A7B2-EDF46AEA2444', 2, 194);
  });

  it('should notify the user that uitpas is unavailable when an event is not known by uitpas', function () {
    udbUitpasApi.getEventCardSystems.and.returnValue($q.reject());
    udbUitpasApi.findOrganisationsCardSystems.and.returnValue($q.resolve([]));

    var controller = getComponentController();

    expect(controller.uitpasUnavailable).toEqual(true);
  });


  it('should hide the uitpas unavailable notice while refreshing card systems', function () {
    udbUitpasApi.getEventCardSystems.and.returnValue($q.reject());
    udbUitpasApi.findOrganisationsCardSystems.and.returnValue($q.resolve([]));

    var controller = getComponentController();
    expect(controller.uitpasUnavailable).toEqual(true);

    controller.refresh();
    expect(controller.uitpasUnavailable).toEqual(undefined);
  });

  it('should indicate when a card system is activated and send to uitpas', function () {
    var activatedCardSystem = _.cloneDeep(evenCardSystemWithoutDistributionKey);
    activatedCardSystem.active = true;
    var uitpasResponse = $q.defer();

    udbUitpasApi.getEventCardSystems.and.returnValue($q.reject());
    udbUitpasApi.findOrganisationsCardSystems.and.returnValue($q.resolve(organizerCardSystems));
    udbUitpasApi.addEventCardSystem.and.returnValue(uitpasResponse.promise);

    var controller = getComponentController();
    controller.activeCardSystemsChanged(activatedCardSystem);
    expect(controller.persistingCardSystems).toEqual(true);

    uitpasResponse.resolve();
    $scope.$digest();
    expect(controller.persistingCardSystems).toEqual(false);
  });

  it('should indicate when a card system is deactivated and send to uitpas', function () {
    var uitpasResponse = $q.defer();
    var organisationCardSystemPromise = $q.resolve(_.cloneDeep(organizerCardSystems));
    var eventCardSystemPromise = $q.resolve(_.cloneDeep(organizerCardSystems[0]));

    udbUitpasApi.findOrganisationsCardSystems.and.returnValue(organisationCardSystemPromise);
    udbUitpasApi.getEventCardSystems.and.returnValue(eventCardSystemPromise);
    udbUitpasApi.removeEventCardSystem.and.returnValue(uitpasResponse.promise);

    var controller = getComponentController();
    controller.activeCardSystemsChanged(controller.availableCardSystems[1]);
    expect(controller.persistingCardSystems).toEqual(true);

    uitpasResponse.resolve();
    $scope.$digest();
    expect(controller.persistingCardSystems).toEqual(false);
  });

  it('should revert the card system status and notify ther user when uitpas is unavailable on change', function () {
    var organizerCardSystemPromise = $q.resolve(_.cloneDeep(organizerCardSystems));
    var activatedCardSystem = _.cloneDeep(evenCardSystemWithoutDistributionKey);
    activatedCardSystem.active = true;

    udbUitpasApi.getEventCardSystems.and.returnValue($q.reject());
    udbUitpasApi.findOrganisationsCardSystems.and.returnValue(organizerCardSystemPromise);
    udbUitpasApi.addEventCardSystem.and.returnValue($q.reject());

    var controller = getComponentController();
    controller.activeCardSystemsChanged(activatedCardSystem);
    $scope.$digest();

    expect(activatedCardSystem.active).toEqual(false);
    expect(controller.uitpasUnavailable).toEqual(true);
  });

  it('should show event card systems as active', function () {
    udbUitpasApi.getEventCardSystems.and.returnValue($q.resolve([
      {
        id: 1,
        name: 'ACME INC.',
        distributionKeys: [
          {
            id: 25,
            name: '25% meerdaags (regio)'
          }
        ]
      }
    ]));
    udbUitpasApi.findOrganisationsCardSystems.and.returnValue($q.resolve(organizerCardSystems));

    var controller = getComponentController();

    expect(controller.availableCardSystems).toEqual([
      {
        id: 1,
        name: 'ACME INC.',
        distributionKeys: [
          {
            id: 23,
            name: '€1,5 dag (regio)'
          },
          {
            id: 24,
            name: '€3 hele dag (regio)'
          },
          {
            id: 25,
            name: '25% meerdaags (regio)'
          }
        ],
        assignedDistributionKey:{
          id: 25,
          name: '25% meerdaags (regio)'
        },
        active: true
      },
      {
        id: 2,
        name: 'foo bar balie',
        distributionKeys: [],
        assignedDistributionKey: undefined,
        active: false
      }
    ]);
  });

  it('should always save both card-system and distribution-key at the same time when available', function () {
    EventFormData.id = 'b3137053-c05e-4234-b12c-554e6fbbc298';
    var activeCardSystem = _.cloneDeep(evenCardSystemWithoutDistributionKey);
    var organizarCardSystemsPromise = $q.resolve(_.cloneDeep(organizerCardSystems));

    udbUitpasApi.getEventCardSystems.and.returnValue(activeCardSystem);
    udbUitpasApi.findOrganisationsCardSystems.and.returnValue(organizarCardSystemsPromise);
    udbUitpasApi.addEventCardSystemDistributionKey.and.returnValue($q.resolve());

    var controller = getComponentController();

    controller.availableCardSystems[0].active = true;
    controller.activeCardSystemsChanged(controller.availableCardSystems[0]);

    expect(udbUitpasApi.addEventCardSystemDistributionKey)
      .toHaveBeenCalledWith('b3137053-c05e-4234-b12c-554e6fbbc298', 1, 23);
  });
});
