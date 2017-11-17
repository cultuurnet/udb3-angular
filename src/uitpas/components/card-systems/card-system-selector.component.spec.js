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

    return controller;
  }

  it('should show card systems for an event not known by UiTPAS', function () {
    udbUitpasApi.getEventCardSystems.and.returnValue($q.resolve([]));
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
      }
    ];

    $scope.$digest();
    expect(controller.availableCardSystems).toEqual(expectedCardSystems);
  });

  it('should show the assigned distribution keys retrieved from UiTPAS for each card systems ', function () {
    udbUitpasApi.getEventCardSystems.and.returnValue($q.resolve([organizerCardSystems[0]]));
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
      }
    ];

    $scope.$digest();
    expect(controller.availableCardSystems).toEqual(expectedCardSystems);
  });

  it('should add a card system to an uitpas event when actived', function () {
    udbUitpasApi.getEventCardSystems.and.returnValue($q.resolve([organizerCardSystems[0]]));
    udbUitpasApi.findOrganisationsCardSystems.and.returnValue($q.resolve(organizerCardSystems));
    udbUitpasApi.addEventCardSystem.and.returnValue($q.resolve('OK'));
    EventFormData.id = 'A2EFC5BC-B8FD-4F27-A7B2-EDF46AEA2444';

    var controller = getComponentController();
    $scope.$digest();

    var cardSystem = controller.availableCardSystems[1];
    cardSystem.active = true;

    controller.activeCardSystemsChanged(cardSystem);
    expect(udbUitpasApi.addEventCardSystem).toHaveBeenCalledWith('A2EFC5BC-B8FD-4F27-A7B2-EDF46AEA2444', '2');
  });

  it('should remove a card system from an uitpas event when deactived', function () {
    udbUitpasApi.getEventCardSystems.and.returnValue($q.resolve([organizerCardSystems[0]]));
    udbUitpasApi.findOrganisationsCardSystems.and.returnValue($q.resolve(organizerCardSystems));
    udbUitpasApi.removeEventCardSystem.and.returnValue($q.resolve('OK'));
    EventFormData.id = 'A2EFC5BC-B8FD-4F27-A7B2-EDF46AEA2444';

    var controller = getComponentController();
    $scope.$digest();

    var cardSystem = controller.availableCardSystems[1];
    cardSystem.active = false;

    controller.activeCardSystemsChanged(cardSystem);
    expect(udbUitpasApi.removeEventCardSystem).toHaveBeenCalledWith('A2EFC5BC-B8FD-4F27-A7B2-EDF46AEA2444', '2');
  });

  it('should add a card system to an uitpas event by distribution key when selected', function () {
    udbUitpasApi.getEventCardSystems.and.returnValue($q.resolve([organizerCardSystems[0]]));
    udbUitpasApi.findOrganisationsCardSystems.and.returnValue($q.resolve(organizerCardSystems));
    udbUitpasApi.addEventCardSystemDistributionKey.and.returnValue($q.resolve('OK'));
    EventFormData.id = 'A2EFC5BC-B8FD-4F27-A7B2-EDF46AEA2444';

    var controller = getComponentController();
    $scope.$digest();

    var cardSystem = controller.availableCardSystems[1];
    cardSystem.assignedDistributionKey = {
      id: '194',
      name: 'CC qwerty - 3 EUR / dag'
    };

    controller.distributionKeyAssigned(cardSystem);
    expect(udbUitpasApi.addEventCardSystemDistributionKey).toHaveBeenCalledWith('A2EFC5BC-B8FD-4F27-A7B2-EDF46AEA2444', '2', '194');
  });

  it('should notify the user that uitpas is unavailable when an event is not known by uitpas', function () {
    udbUitpasApi.getEventCardSystems.and.returnValue($q.reject());
    udbUitpasApi.findOrganisationsCardSystems.and.returnValue($q.resolve([]));

    var controller = getComponentController();
    $scope.$digest();

    expect(controller.uitpasUnavailable).toEqual(true);
  });


  it('should hide the uitpas unavailable notice while refreshing card systems', function () {
    udbUitpasApi.getEventCardSystems.and.returnValue($q.reject());
    udbUitpasApi.findOrganisationsCardSystems.and.returnValue($q.resolve([]));

    var controller = getComponentController();
    $scope.$digest();
    expect(controller.uitpasUnavailable).toEqual(true);

    controller.refresh();
    expect(controller.uitpasUnavailable).toEqual(undefined);
  });
});
