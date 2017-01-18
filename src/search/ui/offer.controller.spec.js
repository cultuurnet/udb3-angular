'use strict';

describe('Controller: Offer', function() {
  var $scope,
      offerController,
      udbApi,
      UdbEvent,
      jsonLDLangFilter,
      EventTranslationState,
      offerTranslator,
      offerLabeller,
      offerEditor,
      variationRepository,
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

  var deferredEvent, deferredVariation;

  beforeEach(module('udb.search'));
  beforeEach(module('udb.templates'));

  beforeEach(inject(function($injector, $rootScope, $controller, _$q_) {
    $scope = $rootScope.$new();
    udbApi = $injector.get('udbApi');
    UdbEvent = $injector.get('UdbEvent');
    jsonLDLangFilter = $injector.get('jsonLDLangFilter');
    EventTranslationState = $injector.get('EventTranslationState');
    offerTranslator = $injector.get('offerTranslator');
    offerEditor = $injector.get('offerEditor');
    offerLabeller = jasmine.createSpyObj('offerLabeller', ['recentLabels', 'label']);
    variationRepository = $injector.get('variationRepository');
    $window = $injector.get('$window');
    $q = _$q_;

    deferredEvent = $q.defer(); deferredVariation = $q.defer();
    spyOn(udbApi, 'getOffer').and.returnValue(deferredEvent.promise);
    spyOn(variationRepository, 'getPersonalVariation').and.returnValue(deferredVariation.promise);

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
        offerEditor: offerEditor,
        variationRepository: variationRepository
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

  it('should return true when an event is expired', function () {
    var endDate = '2015-06-20T19:00:00+02:00';
    expect($scope.offerIsExpired(endDate)).toBeTruthy();
  });

  it('should return false when an event is not expired', function () {
    var endDate = '2017-06-20T19:00:00+02:00';
    expect($scope.offerIsExpired(endDate)).toBeFalsy();
  });

  describe('variations: ', function () {
    beforeEach(function () {
      deferredEvent.resolve(new UdbEvent(exampleEventJson));
    });

    it('displays the original event description when no personal variation is found', function () {
      deferredVariation.reject();
      $scope.$digest();
      expect($scope.event.description).toEqual('Een korte beschrijving voor dit evenement');
      expect($scope.event.location.name).toEqual('Cultuurcentrum Scharpoord - Knokke-Heist');
    });

    it('displays a custom description when a personal variation of an event is available', function () {
      var variation = new UdbEvent(exampleEventJson);
      variation.description.nl = 'Een variatie van de originele beschrijving';
      deferredVariation.resolve(variation);
      $scope.$digest();
      expect($scope.event.description).toEqual('Een variatie van de originele beschrijving');
      expect($scope.event.location.name).toEqual('Cultuurcentrum Scharpoord - Knokke-Heist');
    });

    it('reverts back to the original event description when deleting the personal description', function() {
      var variation = new UdbEvent(exampleEventJson);
      variation.description.nl = 'Een variatie van de originele beschrijving';
      deferredVariation.resolve(variation);
      $scope.$digest();
      var deferredDeletion = $q.defer();
      spyOn(offerEditor, 'deleteVariation').and.returnValue(deferredDeletion.promise);
      offerController.updateDescription('');

      deferredDeletion.resolve();
      $scope.$digest();
      expect($scope.event.description).toEqual('Een korte beschrijving voor dit evenement');
      expect($scope.event.location.name).toEqual('Cultuurcentrum Scharpoord - Knokke-Heist');
    });
  });
});
