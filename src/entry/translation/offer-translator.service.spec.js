'use strict';

describe('Service: Offer translator', function () {
  
  var offerTranslator, logger, udbApi, $q, scope;
  var examplePlaceJson = {
    '@id': "http://culudb-silex.dev:8080/place/03458606-eb3f-462d-97f3-548710286702",
    '@context': "/api/1.0/place.jsonld",
    name: {
      "nl": "Villa 99, een art deco pareltje"
    },
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
  
  beforeEach(module('udb.entry', function($provide){
    logger = jasmine.createSpyObj('jobLogger', ['addJob']);
    udbApi = jasmine.createSpyObj('udbApi', ['translateProperty']);

    $provide.provider('jobLogger', {
      $get: function () {
        return logger;
      }
    });

    $provide.provider('udbApi', {
      $get: function () {
        return udbApi;
      }
    });
  }));
  
  beforeEach(inject(function (_offerTranslator_, _$q_, $rootScope) {
    offerTranslator = _offerTranslator_;
    $q = _$q_;
    scope = $rootScope.$new();
  }));
  
  it('should translate offer properties', inject(function (UdbPlace) {
    udbApi.translateProperty.and.returnValue($q.resolve({
      data: {
        commandId: '5C53FFC0-EBED-4B53-989C-02A4DEB4E7F3'
      }
    }));

    var place = new UdbPlace(examplePlaceJson);

    offerTranslator.translateProperty(place, 'title', 'en', 'My title');
    scope.$apply();

    expect(logger.addJob).toHaveBeenCalled();
    expect(udbApi.translateProperty).toHaveBeenCalledWith(
      new URL('http://culudb-silex.dev:8080/place/03458606-eb3f-462d-97f3-548710286702'),
      'name',
      'en',
      'My title'
    );
    expect(place.name.en).toEqual('My title');
  }));
  
});