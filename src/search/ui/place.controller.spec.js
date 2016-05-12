'use strict';

describe('Controller: Place', function() {
  var $scope,
      placeController,
      udbApi,
      UdbPlace,
      jsonLDLangFilter,
      EventTranslationState,
      offerTranslator,
      offerLabeller,
      $window,
      $q,
      examplePlaceEventJson = {
        '@id': "http://culudb-silex.dev:8080/place/03458606-eb3f-462d-97f3-548710286702",
        '@context': "/api/1.0/place.jsonld",
        name: "Villa 99, een art deco pareltje",
        creator: "christophe.vanthuyne@ronse.be",
        created: "2015-06-14T15:22:33+02:00",
        modified: "2015-12-15T14:08:06+01:00",
        publisher: "Invoerders Algemeen ",
        available: "2015-08-03T00:00:00+02:00",
        sameAs: [ ],
        address: {
          addressCountry: "BE",
          addressLocality: "Ronse",
          postalCode: "9600",
          streetAddress: "Engelsenlaan 99"
        },
        bookingInfo: {
          description: "",
          name: "standard price",
          price: 0,
          priceCurrency: "EUR"
        },
        terms: [
          {
            label: "Vlaamse Ardennen",
            domain: "flanderstouristregion",
            id: "reg.365"
          },
          {
            label: "Monument",
            domain: "eventtype",
            id: "0.14.0.0.0"
          },
          {
            label: "9600 Ronse",
            domain: "flandersregion",
            id: "reg.1417"
          }
        ],
        "labels": ['some label']
      };

  var deferredEvent, deferredVariation;

  beforeEach(module('udb.search'));
  beforeEach(module('udb.templates'));

  beforeEach(inject(function($injector, $rootScope, $controller, _$q_) {
    $scope = $rootScope.$new();
    udbApi = $injector.get('udbApi');
    UdbPlace = $injector.get('UdbPlace');
    jsonLDLangFilter = $injector.get('jsonLDLangFilter');
    EventTranslationState = $injector.get('EventTranslationState');
    offerTranslator = $injector.get('offerTranslator');
    offerLabeller = jasmine.createSpyObj('offerLabeller', ['recentLabels', 'label']);
    $window = $injector.get('$window');
    $q = _$q_;

    deferredEvent = $q.defer(); deferredVariation = $q.defer();
    spyOn(udbApi, 'getOffer').and.returnValue(deferredEvent.promise);

    $scope.event = {};
    $scope.event['@id'] = examplePlaceEventJson['@id'];

    placeController = $controller(
      'PlaceController', {
        udbApi: udbApi,
        $scope: $scope,
        jsonLDLangFilter: jsonLDLangFilter,
        EventTranslationState: EventTranslationState,
        offerTranslator: offerTranslator,
        offerLabeller: offerLabeller,
        $window: $window
      }
    );
  }));

  it('should fetch the place information if not present', function () {
    deferredEvent.resolve(new UdbPlace(examplePlaceEventJson));
    $scope.$digest();

    expect(udbApi.getOffer).toHaveBeenCalledWith(
        'http://culudb-silex.dev:8080/place/03458606-eb3f-462d-97f3-548710286702'
    );
  });

  it('should trigger an API label action when adding a label', function () {
    var label = 'some other label';
    deferredEvent.resolve(new UdbPlace(examplePlaceEventJson));
    $scope.$digest();

    placeController.labelAdded(label);
    expect(offerLabeller.label).toHaveBeenCalled();
  });

  it('should prevent any duplicate labels and warn the user when trying to add one', function () {
    var label = 'Some Label';
    deferredEvent.resolve(new UdbPlace(examplePlaceEventJson));
    $scope.$digest();

    spyOn($window, 'alert');

    placeController.labelAdded(label);

    var expectedLabels = ['some label'];
    expect($scope.event.labels).toEqual(expectedLabels);
    expect($window.alert).toHaveBeenCalledWith('Het label "Some Label" is reeds toegevoegd als "some label".');
    expect(offerLabeller.label).not.toHaveBeenCalled();
  });
});
