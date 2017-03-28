'use strict';

describe('Factory: UdbPlace', function () {
  // load the service's module
  beforeEach(module('udb.core'));

  // instantiate the UDB place factory as class constructor
  var UdbPlace;
  var place;
  beforeEach(inject(function (_UdbPlace_) {
    UdbPlace = _UdbPlace_;
    place = new UdbPlace(getPlaceJson());
  }));

  /**
   * Returns a unique copy of place json data. This way you can manipulate the data without influencing other tests.
   *
   * @returns {Object}
   */
  function getPlaceJson() {
    return angular.copy({
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
      priceInfo: [
        {
          category: 'base',
          name: 'Basisprijs',
          priceCurrency: 'EUR',
          price: 2
        },
        {
          category: 'tariff',
          name: 'Bijkomende prijs',
          priceCurrency: 'EUR',
          price: 3
        }
      ],
      terms: [
        {
          label: "Vlaamse Ardennen",
          domain: "flanderstouristregion",
          id: "reg.365"
        },
        {
          label: "Monument",
          domain: "placetype",
          id: "0.14.0.0.0"
        },
        {
          label: "9600 Ronse",
          domain: "flandersregion",
          id: "reg.1417"
        }
      ],
      "labels": ["remove me"],
      "image": "http://culudb-silex.dev:8080/media/cb78ad42-90d6-4b70-a1d9-9bc016bdba73.png",
      "MediaObject":[
        {"@id":"http:\/\/culudb-silex.dev:8080\/media\/4125fbc0-88b9-4008-855e-1cae6bd1f775","@type":"schema:ImageObject","contentUrl":"http:\/\/culudb-silex.dev:8080\/media\/4125fbc0-88b9-4008-855e-1cae6bd1f775.jpeg","thumbnailUrl":"http:\/\/culudb-silex.dev:8080\/media\/4125fbc0-88b9-4008-855e-1cae6bd1f775.jpeg","description":"test1","copyrightHolder":"test"},
        {"@id":"http:\/\/culudb-silex.dev:8080\/media\/cb78ad42-90d6-4b70-a1d9-9bc016bdba73","@type":"schema:ImageObject","contentUrl":"http:\/\/culudb-silex.dev:8080\/media\/cb78ad42-90d6-4b70-a1d9-9bc016bdba73.png","thumbnailUrl":"http:\/\/culudb-silex.dev:8080\/media\/cb78ad42-90d6-4b70-a1d9-9bc016bdba73.png","description":"test256","copyrightHolder":"test"}
      ]
    })
  }

  it('Can be unlabelled',function () {
    place.unlabel('remove me');

    expect(place.labels).not.toContain('remove me');
  });

  it('Can be labelled',function () {
    place.label('new label');

    expect(place.labels).toContain('new label');
  });

  it('Does add any similar labels that only have a different letter casing', function (){
    place.label('Foo Bar');
    place.label('foo bar');

    expect(place.labels).toContain('Foo Bar');
    expect(place.labels).not.toContain('foo bar');
  });

  it('Parses the place type and theme from their matching json-ld terms', function () {
    var expectedType = { label: 'Monument', domain: 'placetype', id: '0.14.0.0.0'};

    expect(place.type).toEqual(expectedType);
  });

  it('Parses the place main image', function () {
    var expectedImage = "http://culudb-silex.dev:8080/media/cb78ad42-90d6-4b70-a1d9-9bc016bdba73.png";

    expect(place.image).toEqual(expectedImage);
  });

  it('should combine regular and hidden labels as a single list', function () {
    var placeJsonWithHiddenLabel = getPlaceJson();
    placeJsonWithHiddenLabel.hiddenLabels = ['list-585000ebd1b2b-58a6a85397ddc'];

    var expectedCombinedLabels = ['remove me', 'list-585000ebd1b2b-58a6a85397ddc'];
    var place = new UdbPlace(placeJsonWithHiddenLabel);

    expect(place.labels).toEqual(expectedCombinedLabels);
  })
});
