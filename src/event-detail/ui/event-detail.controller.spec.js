'use strict';

describe('Controller: Event Detail', function() {
  var $scope,
      eventController,
      eventId,
      udbApi,
      $location,
      jsonLDLangFilter,
      variationRepository,
      offerEditor,
      UdbEvent,
      $q,
      $uibModal,
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
          "name": ",",
          "@type": "Organizer"
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
        "calendarType": "single",
        "performer": [{"name": "maaike beuten "}],
        "sameAs": ["http://www.uitinvlaanderen.be/agenda/e/70-mijl-in-vogelvlucht/1111be8c-a412-488d-9ecc-8fdf9e52edbc"],
        "seeAlso": ["http://www.facebook.com/events/1590439757875265"]
      };

  var deferredEvent, deferredVariation, deferredPermission, deferredUpdate,
      deferredHistory;

  beforeEach(module('udb.search'));
  beforeEach(module('udb.templates'));

  beforeEach(inject(function($injector, $rootScope, $controller, _$q_) {
    $scope = $rootScope.$new();
    eventId = 'http://culudb-silex.dev:8080/event/1111be8c-a412-488d-9ecc-8fdf9e52edbc';
    udbApi = $injector.get('udbApi');
    $location = jasmine.createSpyObj('$location', ['path']);
    jsonLDLangFilter = $injector.get('jsonLDLangFilter');
    variationRepository = $injector.get('variationRepository');
    offerEditor = $injector.get('offerEditor');
    UdbEvent = $injector.get('UdbEvent');
    $q = _$q_;
    $uibModal = jasmine.createSpyObj('$uibModal', ['open']);

    deferredEvent = $q.defer(); deferredVariation = $q.defer();
    deferredPermission = $q.defer();

    spyOn(udbApi, 'hasPermission').and.returnValue($q.resolve());

    spyOn(udbApi, 'getOffer').and.returnValue(deferredEvent.promise);
    deferredEvent.resolve(new UdbEvent(exampleEventJson));

    spyOn(variationRepository, 'getPersonalVariation').and.returnValue(deferredVariation.promise);

    deferredUpdate = $q.defer();
    spyOn(offerEditor, 'editDescription').and.returnValue(deferredUpdate.promise);

    spyOn(udbApi, 'getHistory').and.returnValue($q.reject());

    eventController = $controller(
      'EventDetailController', {
        $scope: $scope,
        eventId: eventId,
        udbApi: udbApi,
        $location: $location,
        jsonLDLangFilter: jsonLDLangFilter,
        variationRepository: variationRepository,
        offerEditor: offerEditor,
        $uibModal: $uibModal
      }
    );
  }));

  it('should fetch the event information', function () {
    deferredVariation.reject('there is no personal variation for offer');
    $scope.$digest();

    expect($scope.eventId).toEqual(eventId);
    expect(udbApi.hasPermission).toHaveBeenCalledWith(
        'http://culudb-silex.dev:8080/event/1111be8c-a412-488d-9ecc-8fdf9e52edbc'
    );
    expect(udbApi.getOffer).toHaveBeenCalledWith(
        'http://culudb-silex.dev:8080/event/1111be8c-a412-488d-9ecc-8fdf9e52edbc'
    );
    expect(udbApi.getHistory).toHaveBeenCalledWith(
      'http://culudb-silex.dev:8080/event/1111be8c-a412-488d-9ecc-8fdf9e52edbc'
    );
    expect($scope.eventIsEditable).toEqual(true);
  });

  it('should loads the event description from the variation', function () {
    var variation = new UdbEvent(exampleEventJson);
    variation.description['nl'] = 'haak is een zeekoe';
    deferredVariation.resolve(variation);
    $scope.$digest();

    expect($scope.event.description).toEqual('haak is een zeekoe');
  });

  it('should update the description', function () {
    deferredVariation.reject('there is no personal variation for offer');

    $scope.$digest();

    $scope.updateDescription('updated description');
    deferredUpdate.resolve();

    expect(offerEditor.editDescription).toHaveBeenCalledWith(
      new UdbEvent(exampleEventJson),
      'updated description'
    );
  });

  it('should replace the description with the cached one when the variation is deleted', function () {
    var variation = new UdbEvent(exampleEventJson);
    variation.description['nl'] = 'haak is een zeekoe';
    deferredVariation.resolve(variation);
    $scope.$digest();

    expect($scope.event.description).toEqual('haak is een zeekoe');

    $scope.updateDescription('');
    deferredUpdate.resolve(false);
    $scope.$digest();

    expect(offerEditor.editDescription).toHaveBeenCalledWith(
      new UdbEvent(exampleEventJson),
      ''
    );
    expect($scope.event.description).toEqual('Toto is geen zeekoe');
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
    var job = {
      task: {
        promise: $q.resolve()
      }
    };

    eventController.goToDashboardOnJobCompletion(job);
    $scope.$digest();

    expect($location.path).toHaveBeenCalledWith('/dashboard');
  });
});
