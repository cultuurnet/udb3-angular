'use strict';

describe('Controller: Event Detail', function() {
  var $scope,
      eventController,
      eventId,
      udbApi,
      $state,
      jsonLDLangFilter,
      UdbEvent,
      $q,
      offerLabeller,
      $window,
      $uibModal,
      ModerationService,
      RolePermission,
      authorizationService,
      roles = [
    {
      "uuid": "3aad5023-84e2-4ba9-b1ce-201cee64504c",
      "name": "Moderator Leuven",
      "constraints": {
        "v3": "city:leuven"
      },
      "permissions": [
        "AANBOD_MODEREREN"
      ]
    },
    {
      "uuid": "3aad5023-84e2-4ba9-b1ce-201cee64505d",
      "name": "Beheerder Leuven",
      "constraints": {
        "v3": "city:leuven"
      },
      "permissions": [
        "GEBRUIKERS_BEHEREN"
      ]
    }
  ],
      events = {
    "itemsPerPage": 30,
    "totalItems": 3562,
    "member": [
      {
        "@id": "http://culudb-silex.dev:8080/event/1111be8c-a412-488d-9ecc-8fdf9e52edbc",
        "@type": "Event"
      }
    ]
  },
      exampleEventJson = {
        "@id": "http://culudb-silex.dev:8080/event/1111be8c-a412-488d-9ecc-8fdf9e52edbc",
        "@context": "/api/1.0/event.jsonld",
        "name": {"nl": "70 mijl in vogelvlucht"},
        "description": {"nl": "Toto is geen zeekoe"},
        "available": "2015-06-05T00:00:00+02:00",
        "image": "//media.uitdatabank.be/20150605/0ffd9034-033f-4619-b053-4ef3dd1956e0.png",
        "calendarSummary": "vrij 19/06/15 om 19:00 ",
        "labels": ['some label'],
        "location": {
          "@type": "Place",
          "@id": "http://culudb-silex.dev:8080/place/4D6DD711-CB4F-168D-C8B1DB1D1F8335B4",
          "@context": "/api/1.0/place.jsonld",
          "description": "De werking van het Cultuurcentrum Knokke-Heist is zeer gevarieerd: podiumkunsten, beeldende kunsten, sociaal-cultureel werk met volwassenen, jeugdwerking en jongerencultuur, artistiek-kunstzinnige opleidingen, openluchtanimatie,... Elke bezoeker vindt hier zijn gading!",
          "name": "Cultuurcentrum Scharpoord - Knokke-Heist",
          "address": {
            "addressCountry": "BE",
            "addressLocality": "Knokke-Heist",
            "postalCode": "8300",
            "streetAddress": "Meerlaan 32"
          },
          "bookingInfo": {
            "description": "",
            "name": "standard price",
            "price": 0,
            "priceCurrency": "EUR"
          },
          "terms": [
            {
              "label": "Locatie",
              "domain": "actortype",
              "id": "8.15.0.0.0"
            },
            {
              "label": "Organisator(en)",
              "domain": "actortype",
              "id": "8.11.0.0.0"
            },
            {
              "label": "Voorzieningen voor rolstoelgebruikers",
              "domain": "facility",
              "id": "3.23.1.0.0"
            },
            {
              "label": "Assistentie",
              "domain": "facility",
              "id": "3.23.2.0.0"
            },
            {
              "label": "Rolstoel ter beschikking",
              "domain": "facility",
              "id": "3.23.3.0.0"
            },
            {
              "label": "Ringleiding",
              "domain": "facility",
              "id": "3.17.1.0.0"
            },
            {
              "label": "Regionaal",
              "domain": "publicscope",
              "id": "6.2.0.0.0"
            },
            {
              "label": "Cultuur, gemeenschaps of ontmoetingscentrum",
              "domain": "actortype",
              "id": "8.6.0.0.0"
            }
          ]
        },
        "organizer": {
          "@type":"Organizer",
          "@id":"http:\/\/culudb-silex.dev\/organizer\/8ee68d6d-c118-4b34-8be7-dd8a7321b6d2",
          "@context":"\/api\/1.0\/organizer.jsonld",
          "name":"mijn organisator bis",
          "addresses":[
            {
              "addressCountry":"BE",
              "addressLocality":"Leuven",
              "postalCode":"3000",
              "streetAddress":"Teststraat 5"
            }
          ],
          "phone":[],
          "email":[],
          "url":[],
          "created":"2016-05-19T14:34:05+00:00",
          "creator":"948cf2a5-65c5-470e-ab55-97ee4b05f576 (nickbacc)"
        },
        "contactPoint": {
          "phone":[],
          "email":[],
          "url":[]
        },
        "bookingInfo": [
          {
            "priceCurrency": "EUR",
            "price": 0
          }
        ],
        "terms": [
          {
            "label": "Documentaires en reportages",
            "domain": "theme",
            "id": "1.7.1.0.0"
          },
          {
            "label": "Regionaal",
            "domain": "publicscope",
            "id": "6.2.0.0.0"
          },
          {
            "label": "Kust",
            "domain": "flanderstouristregion",
            "id": "reg.356"
          },
          {
            "label": "Film",
            "domain": "eventtype",
            "id": "0.50.6.0.0"
          },
          {
            "label": "8300 Knokke-Heist",
            "domain": "flandersregion",
            "id": "reg.1017"
          }
        ],
        "creator": "office@garage64.be",
        "created": "2015-06-05T10:42:15+02:00",
        "modified": "2015-06-05T10:50:17+02:00",
        "publisher": "Invoerders Algemeen ",
        "startDate": "2015-06-19T19:00:00+02:00",
        "endDate": "2015-06-20T19:00:00+02:00",
        "calendarType": "single",
        "performer": [{"name": "maaike beuten "}],
        "sameAs": ["http://www.uitinvlaanderen.be/agenda/e/70-mijl-in-vogelvlucht/1111be8c-a412-488d-9ecc-8fdf9e52edbc"],
        "seeAlso": ["http://www.facebook.com/events/1590439757875265"],
        "workflowStatus": "DRAFT"
      };

  var deferredEvent, deferredPermission, deferredUpdate;

  var appConfig = {};

  beforeEach(
    module('udb.core', function ($translateProvider) {
      $translateProvider.translations('en', {
        errors: { labelNotAllowed: 'You do not have the required permission to unlabel this event.' },
      });
    })
  );

  beforeEach(module('udb.search'));
  beforeEach(module('udb.templates'));
  beforeEach(module('udb.event-detail', function ($provide) {
    $provide.constant('appConfig', appConfig);
  }));

  beforeEach(inject(function($injector, $rootScope, $controller, _$q_, _RolePermission_) {
    $scope = $rootScope.$new();
    eventId = 'http://culudb-silex.dev:8080/event/1111be8c-a412-488d-9ecc-8fdf9e52edbc';
    udbApi = $injector.get('udbApi');
    $state = jasmine.createSpyObj('$state', ['go']);
    jsonLDLangFilter = $injector.get('jsonLDLangFilter');
    UdbEvent = $injector.get('UdbEvent');
    $q = _$q_;
    $uibModal = jasmine.createSpyObj('$uibModal', ['open']);
    offerLabeller = jasmine.createSpyObj('offerLabeller', ['recentLabels', 'label', 'unlabel']);
    $window = $injector.get('$window');
    ModerationService = jasmine.createSpyObj('ModerationService', ['getMyRoles', 'find']);
    ModerationService.getMyRoles.and.returnValue($q.resolve(roles));
    ModerationService.find.and.returnValue($q.resolve(events));
    RolePermission = _RolePermission_;
    authorizationService = jasmine.createSpyObj('authorizationService', ['getPermissions']);
    deferredEvent = $q.defer();
    deferredPermission = $q.defer();

    spyOn(udbApi, 'hasPermission').and.returnValue(deferredPermission.promise);
    spyOn(udbApi, 'getOffer').and.returnValue(deferredEvent.promise);

    deferredUpdate = $q.defer();

    spyOn(udbApi, 'getCalendarSummary').and.returnValue($q.reject());

    eventController = $controller(
      'EventDetailController', {
        $scope: $scope,
        eventId: eventId,
        udbApi: udbApi,
        $state: $state,
        jsonLDLangFilter: jsonLDLangFilter,
        $uibModal: $uibModal,
        $window: $window,
        offerLabeller: offerLabeller,
        ModerationService : ModerationService,
        RolePermission: RolePermission,
        authorizationService: authorizationService
      }
    );
  }));

  it('should fetch the event information', function () {
    deferredEvent.resolve(new UdbEvent(exampleEventJson));
    $scope.$digest();

    expect(udbApi.getOffer).toHaveBeenCalledWith(
        'http://culudb-silex.dev:8080/event/1111be8c-a412-488d-9ecc-8fdf9e52edbc'
    );

    expect(udbApi.hasPermission).toHaveBeenCalledWith(
        'http://culudb-silex.dev:8080/event/1111be8c-a412-488d-9ecc-8fdf9e52edbc'
    );

    expect(udbApi.getCalendarSummary).toHaveBeenCalledWith(
        '1111be8c-a412-488d-9ecc-8fdf9e52edbc',
        'lg',
        'nl'
    );

    expect(ModerationService.find).toHaveBeenCalledWith('(((city:leuven)) AND cdbid:1111be8c-a412-488d-9ecc-8fdf9e52edbc)', 10, 0);

    expect($scope.eventId).toEqual(eventId);
  });

  it('should notify the user when a calendar summary is unavailable', function () {
    expect($scope.calendarSummary).toEqual(undefined);

    deferredEvent.resolve(new UdbEvent(exampleEventJson));
    $scope.$digest();

    expect($scope.calendarSummary).toEqual(false);
  });

  it('should show the calendar summary when available', function () {
    expect($scope.calendarSummary).toEqual(undefined);
    udbApi.getCalendarSummary.and.returnValue($q.resolve('Morregen, zeker voor de noen!'));

    deferredEvent.resolve(new UdbEvent(exampleEventJson));
    $scope.$digest();

    expect($scope.calendarSummary).toEqual('Morregen, zeker voor de noen!');
  });

  it('should open a confirmation modal before deleting an event', function () {
    // run a digest so the scope updates with the current event
    $scope.$digest();
    var actualOptions;
    var modalOptions = {
      templateUrl: 'templates/event-delete-confirm-modal.html',
      controller: 'EventDeleteConfirmModalCtrl',
      resolve: {
        item: jasmine.any(Function),
      }
    };
    $uibModal.open.and.callFake(function(options){
      actualOptions = options;

      return {
        result: $q.defer().promise
      };
    });

    $scope.deleteEvent();
    $scope.$digest();

    expect($uibModal.open).toHaveBeenCalledWith(modalOptions);
    expect(actualOptions.resolve.item()).toEqual($scope.event);
  });

  it('should redirect to the dashboard after successfully deleting an Event', function () {
    eventController.goToDashboard();
    $scope.$digest();

    expect($state.go).toHaveBeenCalledWith('split.footer.dashboard');
  });

  it('should redirect to the edit page with an eventId resolved to a URL string', function () {
    $scope.eventId = 'http://foo.bar/events/1111be8c-a412-488d-9ecc-8fdf9e52edbc';

    $scope.openEditPage();
    $scope.$digest();

    expect($state.go).toHaveBeenCalledWith('split.eventEdit', {id: '1111be8c-a412-488d-9ecc-8fdf9e52edbc'});
  });

  it('should redirect to the edit page with an eventId resolved to an URL object', function () {
    $scope.eventId = {
      toString: function () {
        return 'http://foo.bar/events/1111be8c-a412-488d-9ecc-8fdf9e52edbc'
      }
    };

    $scope.openEditPage();
    $scope.$digest();

    expect($state.go).toHaveBeenCalledWith('split.eventEdit', {id: '1111be8c-a412-488d-9ecc-8fdf9e52edbc'});
  });

  it('should update the event when adding a label', function () {
    var label = {name:'some other label'};
    deferredEvent.resolve(new UdbEvent(exampleEventJson));
    offerLabeller.label.and.returnValue($q.resolve({
      response: {
        success: true
      }
    }));
    $scope.$digest();

    $scope.labelAdded(label);
    expect(offerLabeller.label).toHaveBeenCalledWith(jasmine.any(Object), 'some other label');
  });

  it('should update the event when removing a label', function () {
    var label = {name:'some label'};
    deferredEvent.resolve(new UdbEvent(exampleEventJson));
    offerLabeller.unlabel.and.returnValue($q.resolve());
    $scope.$digest();

    $scope.labelRemoved(label);
    expect(offerLabeller.unlabel).toHaveBeenCalledWith(jasmine.any(Object), 'some label');
  });

  it('should prevent any duplicate labels and warn the user when trying to add one', function () {
    var label = {name:'Some Label'};
    deferredEvent.resolve(new UdbEvent(exampleEventJson));
    $scope.$digest();

    spyOn($window, 'alert');

    $scope.labelAdded(label);

    var expectedLabels = ['some label'];
    expect($scope.event.labels).toEqual(expectedLabels);
    expect($window.alert).toHaveBeenCalledWith('Het label "Some Label" is reeds toegevoegd als "some label".');
    expect(offerLabeller.label).not.toHaveBeenCalled();
  });

  it('should not show an event as editable when the user does not have the required permissions', function () {
    var event = new UdbEvent(exampleEventJson);

    authorizationService.getPermissions.and.returnValue($q.resolve([]));
    deferredPermission.resolve(false);
    deferredEvent.resolve(event);

    $scope.$digest();
    expect($scope.permissions.editing).toEqual(false);
  });

  it('should show an event as editable when the user has the required permissions and the offer is not expired', function () {
    var baseTime = new Date(2020, 9, 23);
    jasmine.clock().mockDate(baseTime);

    var event = new UdbEvent(exampleEventJson);
    event.endDate = '2021-06-20T19:00:00+02:00';

    authorizationService.getPermissions.and.returnValue($q.resolve([]));
    deferredPermission.resolve(true);
    deferredEvent.resolve(event);

    var expectedPermissions = {
      editing: true,
      editingMovies: false,
      duplication: true,
      history: false
    };

    $scope.$digest();
    expect($scope.permissions).toEqual(expectedPermissions);
  });

  it('should not show an event as editable when the user has the required permissions but the offer is expired', function () {
    var baseTime = new Date(2020, 9, 23);
    jasmine.clock().mockDate(baseTime);

    var event = new UdbEvent(exampleEventJson);
    event.endDate = '2016-06-20T19:00:00+02:00';

    authorizationService.getPermissions.and.returnValue($q.resolve([]));
    deferredPermission.resolve(true);
    deferredEvent.resolve(event);

    var expectedPermissions = {
      editing: false,
      editingMovies: false,
      duplication: true,
      history: false
    };

    $scope.$digest();
    expect($scope.permissions).toEqual(expectedPermissions);
  });

  it('should not show an event as editable when the user does not have the required permissions', function () {
    var baseTime = new Date(2020, 9, 23);
    jasmine.clock().mockDate(baseTime);

    var event = new UdbEvent(exampleEventJson);
    event.endDate = '2016-06-20T19:00:00+02:00';

    authorizationService.getPermissions.and.returnValue($q.resolve([]));
    deferredPermission.resolve(false);
    deferredEvent.resolve(event);

    var expectedPermissions = {
      editing: false,
      duplication: false,
      history: false
    };

    $scope.$digest();
    expect($scope.permissions).toEqual(expectedPermissions);
  });

  it('should show an event as editable when the user does not have the required permissions but is a god user', function () {
    var baseTime = new Date(2020, 9, 23);
    jasmine.clock().mockDate(baseTime);

    var event = new UdbEvent(exampleEventJson);
    event.endDate = '2016-06-20T19:00:00+02:00';

    authorizationService.getPermissions.and.returnValue($q.resolve(['GEBRUIKERS_BEHEREN']));
    deferredPermission.resolve(false);
    deferredEvent.resolve(event);

    var expectedPermissions = {
      editing: true,
      editingMovies: false,
      duplication: true,
      history: true
    };

    $scope.$digest();
    expect($scope.permissions).toEqual(expectedPermissions);
  });

  it('should show regular and hidden labels as a single list for all users', function () {
    var eventJsonWithHiddenLabel = angular.copy(exampleEventJson);
    eventJsonWithHiddenLabel.hiddenLabels = ["UiTPAS Leuven"];

    deferredEvent.resolve(new UdbEvent(eventJsonWithHiddenLabel));
    $scope.$digest();

    expect($scope.event.labels).toEqual(['some label', 'UiTPAS Leuven']);
  });

  it('should display an error message when removing a label fails', function () {
    /** @type {ApiProblem} */
    var problem = {
      type: new URL('http://udb.be/problems/event-unlabel-permission'),
      title: 'You do not have the required permission to unlabel this event.',
      detail: 'User with id: 2aab63ca-adef-4b6d-badb-0f8a17367c53 has no permission: "Aanbod bewerken" on item: ecee32f5-94bb-4129-b7b9-fac341d55219 when executing command: RemoveLabel.',
      instance: new URL('http://udb.be/jobs/6ed2eb90-0163-4d15-ba6d-5d66223795e1'),
      status: 403
    };
    var expectedLabels = ['some label'];
    var label = {name:'some label'};
    offerLabeller.unlabel.and.returnValue($q.reject(problem));

    deferredEvent.resolve(new UdbEvent(exampleEventJson));
    $scope.$digest();

    $scope.labelRemoved(label);
    $scope.$digest();

    expect($scope.event.labels).toEqual(expectedLabels);
    expect($scope.labelResponse).toEqual('unlabelError');
    expect($scope.labelsError).toEqual('You do not have the required permission to unlabel this event.');
  });

  it('should show validation buttons when the user has permission to validate', function () {
    var event = new UdbEvent(exampleEventJson);
    deferredEvent.resolve(event);
    deferredPermission.reject();

    $scope.$digest();
    expect($scope.moderationPermission).toEqual(true);
  });

  it('should not show validation buttons when the user does not have permission to validate', function () {
    var event = new UdbEvent(exampleEventJson);
    deferredEvent.resolve(event);
    deferredPermission.reject();
    ModerationService.find.and.returnValue($q.resolve({}));
    $scope.$digest();
    expect($scope.moderationPermission).toEqual(undefined);
  });

  it('should fetch the history when activating the tab', function () {
    deferredEvent.resolve(new UdbEvent(exampleEventJson));
    var expectedHistory = [
      {
        "date":"2017-06-13T08:48:25+00:00",
        "description":"Aangemaakt in UiTdatabank",
        "author":"bramcordie_1"
      }
    ];
    spyOn(udbApi, 'getHistory').and.returnValue($q.resolve(expectedHistory));
    $scope.$digest();

    expect($scope.eventHistory).toEqual(undefined);

    $scope.makeTabActive('history');
    $scope.$digest();

    expect(udbApi.getHistory).toHaveBeenCalledWith(
      '1111be8c-a412-488d-9ecc-8fdf9e52edbc'
    );
    expect($scope.eventHistory).toEqual(expectedHistory);
  });
});
