'use strict';

describe('Factory: UdbEvent', function () {
  // load the service's module
  beforeEach(module('udb.core'));

  // instantiate the UDB event factory as class constructor
  var UdbEvent,
      event;

  beforeEach(inject(function (_UdbEvent_) {
    UdbEvent = _UdbEvent_;
    event = new UdbEvent(getEventJson());
  }));

  /**
   * Returns a unique copy of event json data. This way you can manipulate the data without influencing other tests.
   *
   * @returns {Object}
   */
  function getEventJson() {
    return angular.copy({
      "@id": "http:\/\/culudb-silex.dev:8080\/event\/54b7e822-78f7-449e-a741-5eba15e5be1c",
      "@context": "\/api\/1.0\/event.jsonld",
      "name": {"nl": "Amour"},
      "description": {"nl": "<p>Film: \"Amour\" (Oostenrijk \/ Frankrijk, 2012), 127 min. Regie:\nMichael Haneke, met: Jean-Louis Trintignant, Emmanuelle Riva,\nIsabelle Huppert<\/p>"},
      "available": "2014-10-13T00:00:00+02:00",
      "calendarSummary": "vrij 15\/05\/15 van 14:00 tot 16:30 ",
      "location": {
        "@type": "Place",
        "@id": "http:\/\/culudb-silex.dev:8080\/place\/50d35a7d-e070-4dfe-ba6e-072e1e48a3bd",
        "@context": "\/api\/1.0\/place.jsonld",
        "description": "Seniorama vzw",
        "name": "Seniorama vzw",
        "address": {
        "addressCountry": "BE",
          "addressLocality": "Leuven",
          "postalCode": "3000",
          "streetAddress": "Vanden Tymplestraat 35"
      },
      "bookingInfo": {"description": "", "name": "standard price", "price": 0, "priceCurrency": "EUR"},
      "terms": [{"label": "Locatie", "domain": "actortype", "id": "8.15.0.0.0"}, {
        "label": "Organisator(en)",
        "domain": "actortype",
        "id": "8.11.0.0.0"
      }, {
        "label": "Wijk of buurt",
        "domain": "publicscope",
        "id": "6.0.0.0.0"
      }, {"label": "Polyvalente zaal of expohal", "domain": "actortype", "id": "8.52.0.0.0"}]
    },
      "organizer": {
        "@id": "http:\/\/culudb-silex.dev:8080\/organizer\/50d35a7d-e070-4dfe-ba6e-072e1e48a3bd",
        "@context": "\/api\/1.0\/organizer.jsonld",
        "name": "Seniorama vzw",
        "addresses": [{
        "addressCountry": "BE",
        "addressLocality": "Leuven",
        "postalCode": "3000",
        "streetAddress": "Vanden Tymplestraat 35"
      }],
        "email": ["seniorama@seniorama.be"],
        "phone": ["016\/22.20.14"],
        "@type": "Organizer"
    },
      "priceInfo": [
      {
        "category": 'base',
        "name": 'Basisprijs',
        "priceCurrency": 'EUR',
        "price": 2
      },
      {
        "category": 'tariff',
        "name": 'Bijkomende prijs',
        "priceCurrency": 'EUR',
        "price": 3
      }
    ],
      "bookingInfo": [{"description": "Leden: \u20ac 4,00, niet-leden \u20ac 5,00", "currency": "EUR", "price": 5}],
      "terms": [
      {"label": "Drama", "domain": "theme", "id": "1.7.4.0.0"},
      {
        "label": "Wijk of buurt",
        "domain": "publicscope",
        "id": "6.0.0.0.0"
      },
      {"label": "Kunststad Leuven", "domain": "flanderstouristregion", "id": "reg.367"}, {
        "label": "Film",
        "domain": "eventtype",
        "id": "0.50.6.0.0"
      },
      {"label": "3000 Leuven", "domain": "flandersregion", "id": "reg.638"}
    ],
      "creator": "seniorama",
      "created": "2014-10-13T15:31:47+02:00",
      "publisher": "Invoerders Algemeen ",
      "endDate": "2015-05-15T16:30:00+02:00",
      "startDate": "2015-05-15T14:00:00+02:00",
      "calendarType": "single",
      "sameAs": ["http:\/\/www.uitinvlaanderen.be\/agenda\/e\/amour\/54b7e822-78f7-449e-a741-5eba15e5be1c"],
      "seeAlso": ["http:\/\/www.seniorama.be"],
      "labels": ["remove me"]
    });
  }

  it('Can be unlabelled',function () {
    event.unlabel('remove me');

    expect(event.labels).not.toContain('remove me');
  });

  it('Can be labelled',function () {
    event.label('new label');

    expect(event.labels).toContain('new label');
  });

  it('Does add any similar labels that only have a different letter casing', function (){
    event.label('Foo Bar');
    event.label('foo bar');

    expect(event.labels).toContain('Foo Bar');
    expect(event.labels).not.toContain('foo bar');
  });

  it('Parses the event type and theme from their matching json-ld terms', function () {
    var expectedType = { label: 'Film', domain: 'eventtype', id: '0.50.6.0.0'},
        expectedTheme = { label: 'Drama', domain: 'theme', id: '1.7.4.0.0' };

    expect(event.type).toEqual(expectedType);
    expect(event.theme).toEqual(expectedTheme);
  });

  it('has a default audience/audienceType of everyone', function () {
    expect(event.audience).toEqual({ audienceType: "everyone" });
  });

  it('should combine regular and hidden labels as a single list', function () {
    var eventJsonWithHiddenLabel = getEventJson();
    eventJsonWithHiddenLabel.hiddenLabels = ['UiTPAS Leuven'];

    var expectedCombinedLabels = ['remove me', 'UiTPAS Leuven'];

    event = new UdbEvent(eventJsonWithHiddenLabel);
    expect(event.labels).toEqual(expectedCombinedLabels);
  })
});
