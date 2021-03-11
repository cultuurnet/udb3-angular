'use strict';

describe('Controller: Offer', function() {
  var $scope,
      offerController,
      udbApi,
      UdbEvent,
      UdbPlace,
      jsonLDLangFilter,
      EventTranslationState,
      offerTranslator,
      offerLabeller,
      $window,
      $q,
      exampleEventJson = {
        "@id": "http://culudb-silex.dev:8080/event/1111be8c-a412-488d-9ecc-8fdf9e52edbc",
        "@context": "/api/1.0/event.jsonld",
        "name": {"nl": "70 mijl in vogelvlucht"},
        "description": {"nl": "Een korte beschrijving voor dit evenement"},
        "available": "2015-06-05T00:00:00+02:00",
        "image": "//media.uitdatabank.be/20150605/0ffd9034-033f-4619-b053-4ef3dd1956e0.png",
        "calendarSummary": "vrij 19/06/15 om 19:00 ",
        "labels": ['some label'],
        "location": {
          "@type": "Place",
          "@id": "http://culudb-silex.dev:8080/place/4D6DD711-CB4F-168D-C8B1DB1D1F8335B4",
          "@context": "/api/1.0/place.jsonld",
          "description": "De werking van het Cultuurcentrum Knokke-Heist is zeer gevarieerd: podiumkunsten, beeldende kunsten, sociaal-cultureel werk met volwassenen, jeugdwerking en jongerencultuur, artistiek-kunstzinnige opleidingen, openluchtanimatie,... Elke bezoeker vindt hier zijn gading!",
          "name": {
            "nl": "Cultuurcentrum Scharpoord - Knokke-Heist",
          },
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

  var deferredEvent;
  
  beforeEach(module('udb.search'));
  beforeEach(module('udb.templates'));

  beforeEach(inject(function($injector, $rootScope, $controller, _$q_) {
    $scope = $rootScope.$new();
    udbApi = $injector.get('udbApi');
    UdbEvent = $injector.get('UdbEvent');
    UdbPlace = $injector.get('UdbPlace');
    jsonLDLangFilter = $injector.get('jsonLDLangFilter');
    EventTranslationState = $injector.get('EventTranslationState');
    offerTranslator = $injector.get('offerTranslator');
    offerLabeller = jasmine.createSpyObj('offerLabeller', ['recentLabels', 'label', 'unlabel']);
    $window = $injector.get('$window');
    $q = _$q_;

    deferredEvent = $q.defer();
    spyOn(udbApi, 'getOffer').and.returnValue(deferredEvent.promise);

    $scope.event = {};
    $scope.event['@id'] = exampleEventJson['@id'];

    offerController = $controller(
      'OfferController', {
        udbApi: udbApi,
        $scope: $scope,
        jsonLDLangFilter: jsonLDLangFilter,
        EventTranslationState: EventTranslationState,
        offerTranslator: offerTranslator,
        offerLabeller: offerLabeller,
        $window: $window,
        $q: $q
      }
    );
  }));

  it('should fetch the place information if not present', function () {
    deferredEvent.resolve(new UdbEvent(exampleEventJson));
    $scope.$digest();

    expect(udbApi.getOffer).toHaveBeenCalledWith(
      'http://culudb-silex.dev:8080/event/1111be8c-a412-488d-9ecc-8fdf9e52edbc'
    );
  });

  it('should trigger an API label action when adding a label', function () {
    var label = {name:'some other label'};
    deferredEvent.resolve(new UdbEvent(exampleEventJson));
    offerLabeller.label.and.returnValue($q.resolve({
      response: {
        success: true,
        name: 'some other label'
      }
    }));

    $scope.$digest();
    offerController.labelAdded(label);

    expect(offerLabeller.label).toHaveBeenCalled();
  });

  it('should prevent any duplicate labels and warn the user when trying to add one', function () {
    var label = {name:'Some Label'};
    deferredEvent.resolve(new UdbEvent(exampleEventJson));
    $scope.$digest();

    spyOn($window, 'alert');

    offerController.labelAdded(label);

    var expectedLabels = ['some label'];
    expect($scope.event.labels).toEqual(expectedLabels);
    expect($window.alert).toHaveBeenCalledWith('Het label "Some Label" is reeds toegevoegd als "some label".');
    expect(offerLabeller.label).not.toHaveBeenCalled();
  });

  it('should trigger an API label action when removing a label', function () {
    var label = {name:'Some Label'};
    deferredEvent.resolve(new UdbEvent(exampleEventJson));
    $scope.$digest();
    offerLabeller.unlabel.and.returnValue($q.resolve());

    offerController.labelRemoved(label);

    expect(offerLabeller.unlabel).toHaveBeenCalled();
    expect(offerController.labelResponse).toEqual('');
  });

  it('should show when an event is expired', function () {
    var baseTime = new Date(2020, 9, 23);
    jasmine.clock().mockDate(baseTime);

    var expiredEventJson = angular.copy(exampleEventJson);
    expiredEventJson.endDate = '2017-06-20T19:00:00+02:00';

    deferredEvent.resolve(new UdbEvent(expiredEventJson));
    $scope.$digest();
    expect(offerController.offerExpired).toBeTruthy();
  });

  it('should never show a place as expired', function () {
    var placeJson = angular.copy(exampleEventJson.location);

    deferredEvent.resolve(new UdbPlace(placeJson));
    $scope.$digest();
    expect(offerController.offerExpired).toBeFalsy();
  });

  it('should hide a publicationdate in the past', function () {
    var eventJson = angular.copy(exampleEventJson);
    eventJson.availableFrom = '1900-06-20T19:00:00+02:00';

    deferredEvent.resolve(new UdbEvent(eventJson));
    $scope.$digest();
    expect(offerController.hasFutureAvailableFrom).toBeFalsy();
  });

  it('should show a publicationdate in the future', function () {
    var eventJson = angular.copy(exampleEventJson);
    eventJson.availableFrom = '3000-06-20T19:00:00+02:00';

    deferredEvent.resolve(new UdbEvent(eventJson));
    $scope.$digest();
    expect(offerController.hasFutureAvailableFrom).toBeTruthy();
  });


  it('should handle an empty publicationdate', function () {

    var eventJson = angular.copy(exampleEventJson);
    eventJson.availableFrom = '';

    deferredEvent.resolve(new UdbEvent(eventJson));
    $scope.$digest();
    expect(offerController.hasFutureAvailableFrom).toBeFalsy();
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

    offerController.labelRemoved(label);
    $scope.$digest();

    expect($scope.event.labels).toEqual(expectedLabels);
    expect(offerController.labelResponse).toEqual('unlabelError');
    expect(offerController.labelsError).toEqual('You do not have the required permission to unlabel this event.');
  });
});
