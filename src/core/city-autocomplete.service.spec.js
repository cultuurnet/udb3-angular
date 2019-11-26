'use strict';

describe('Service: City autocomplete', function () {

  var baseUrl = 'http://example.com/';

  beforeEach(module('udb.core', function ($provide) {
    var appConfig = {
      baseUrl: baseUrl,
    };

    $provide.constant('appConfig', appConfig);
  }));

  var service, $httpBackend, UdbPlace, jsonLDLangFilter;

  var pagedPlaceCollection = {
    '@context': 'http:\/\/www.w3.org\/ns\/hydra\/context.jsonld',
    '@type': 'PagedCollection',
    'itemsPerPage': 1000,
    'totalItems': 4,
    'member': [{
      '@id': 'http:\/\/culudb-silex.dev:8080\/place\/7540A176-F9DE-A04E-D0592C7E3006528C',
      '@context': '\/api\/1.0\/place.jsonld',
      'description': 'Voedselteams vzw ijvert voor een duurzame en eerlijke landbouwpolitiek door het bevorderen van kleinschalige, duurzame land-en tuinbouw en het stimuleren van een streekgebonden economie. Daartoe begeleidt en ondersteunt Voedselteams sociale netwerken van solidaire consumenten en producenten. Voedselteams doet aan sensibilisering over het thema met als doel mensen aan te zetten tot actie.',
      'name': {
        'nl': 'Voedselteams'
      },
      'address': {
        'addressCountry': 'BE',
        'addressLocality': 'Leuven',
        'postalCode': '3000',
        'streetAddress': 'Blijde Inkomststraat 50'
      },
      'bookingInfo': {
        'description': '',
        'name': 'standard price',
        'price': 0,
        'priceCurrency': 'EUR'
      },
      'terms': [{
        'label': 'Locatie',
        'domain': 'actortype',
        'id': '8.15.0.0.0'
      }, {
        'label': 'Organisator(en)',
        'domain': 'actortype',
        'id': '8.11.0.0.0'
      }, {
        'label': 'Uitvoerder(s)',
        'domain': 'actortype',
        'id': '8.0.0.0.0'
      }, {
        'label': 'Educatieve dienstverlening',
        'domain': 'facility',
        'id': '3.14.0.0.0'
      }, {'label': 'Wijk of buurt', 'domain': 'publicscope', 'id': '6.0.0.0.0'}]
    }, {
      '@id': 'http:\/\/culudb-silex.dev:8080\/place\/56AF6D44-0DDA-76D4-2F5EE4184024FD78',
      '@context': '\/api\/1.0\/place.jsonld',
      'description': 'curieus is de nieuwe naam voor CSC-vormingswerk.\ncurieus kom je tegen op meer dan 300 plaatsen in Vlaanderen en Brussel. cultuur in de breedste zin van het woord is ons handelsmerk. curieus wil je nieuwsgierig maken naar elke vorm van cultuur. Want cultuur is meer dan schone kunsten alleen. Cultuur kan meer dan mensen vermaken. Van Arbeidscultuur tot Zapcultuur.',
      'name': {
        'nl': 'curieus Vlaams-Brabant'
      },
      'address': {
        'addressCountry': 'BE',
        'addressLocality': 'Leuven',
        'postalCode': '3000',
        'streetAddress': 'Mechelsestraat 70'
      },
      'bookingInfo': {
        'description': '',
        'name': 'standard price',
        'price': 0,
        'priceCurrency': 'EUR'
      },
      'terms': [{
        'label': 'Locatie',
        'domain': 'actortype',
        'id': '8.15.0.0.0'
      }, {
        'label': 'Organisator(en)',
        'domain': 'actortype',
        'id': '8.11.0.0.0'
      }, {
        'label': 'Uitvoerder(s)',
        'domain': 'actortype',
        'id': '8.0.0.0.0'
      }, {'label': 'Wijk of buurt', 'domain': 'publicscope', 'id': '6.0.0.0.0'}]
    }, {
      '@id': 'http:\/\/culudb-silex.dev:8080\/place\/429A87B3-E3B7-697C-5C94A5159389EF25',
      '@context': '\/api\/1.0\/place.jsonld',
      'description': 'Bibliotheek De Bib Leuven is een bruisende plek waar heel wat te beleven valt. Evenementen, lezingen, tentoonstellingen en workshops bewijzen dat de bibliotheek leeft.  De bib heeft een aparte exporuimte en aan de onthaalbalie kan je ook tickets kopen voor voorstellingen van 30CC. Daarnaast werd in hetzelfde gebouw ook het stadsarchief ondergebracht. Documenten kan je raadplegen in de leeszaal.',
      'name': {
        'nl': 'De Bib Leuven'
      },
      'address': {
        'addressCountry': 'BE',
        'addressLocality': 'Leuven',
        'postalCode': '3000',
        'streetAddress': 'Rijschoolstraat 4'
      },
      'bookingInfo': {
        'description': '',
        'name': 'standard price',
        'price': 0,
        'priceCurrency': 'EUR'
      },
      'terms': [{
        'label': 'Locatie',
        'domain': 'actortype',
        'id': '8.15.0.0.0'
      }, {
        'label': 'Organisator(en)',
        'domain': 'actortype',
        'id': '8.11.0.0.0'
      }, {
        'label': 'Lokaal',
        'domain': 'publicscope',
        'id': '6.1.0.0.0'
      }, {'label': 'Bibliotheek', 'domain': 'actortype', 'id': '8.1.0.0.0'}]
    }, {
      '@id': 'http:\/\/culudb-silex.dev:8080\/place\/5023e3af-3fe1-45be-8a72-86ebe9ffa2fe',
      '@context': '\/api\/1.0\/place.jsonld',
      'description': 'NB',
      'name': {
        'nl': 'Cinema ZED'
      },
      'address': {
        'addressCountry': 'BE',
        'addressLocality': 'Leuven',
        'postalCode': '3000',
        'streetAddress': 'Naamsestraat 96'
      },
      'bookingInfo': {
        'description': '',
        'name': 'standard price',
        'price': 0,
        'priceCurrency': 'EUR'
      },
      'terms': [{
        'label': 'Locatie',
        'domain': 'actortype',
        'id': '8.15.0.0.0'
      }, {
        'label': 'Organisator(en)',
        'domain': 'actortype',
        'id': '8.11.0.0.0'
      }, {
        'label': 'Wijk of buurt',
        'domain': 'publicscope',
        'id': '6.0.0.0.0'
      }, {'label': 'Bioscoop', 'domain': 'actortype', 'id': '8.9.1.0.0'}]
    }]
  };

  beforeEach(inject(function ($injector) {
    jsonLDLangFilter = $injector.get('jsonLDLangFilter');
    service = $injector.get('cityAutocomplete');
    $httpBackend = $injector.get('$httpBackend');
    UdbPlace = $injector.get('UdbPlace');
  }));

  it('should return a list of places for a given zipcode', function (done) {
    var zipcode = '3000';

    $httpBackend
      .expectGET(baseUrl + 'places/?disableDefaultFilters=true&embed=true&isDuplicate=false&limit=1000&postalCode=' + zipcode + '&sort%5Bcreated%5D=asc&workflowStatus=DRAFT,READY_FOR_VALIDATION,APPROVED')
      .respond(200, JSON.stringify(pagedPlaceCollection));

    var assertPlaces = function (places) {
      var expectedPlaces = _.map(pagedPlaceCollection.member, function (placeJson) {
        var place = new UdbPlace(placeJson);
        return jsonLDLangFilter(place, 'nl');
      });

      expect(places).toEqual(expectedPlaces);
      done();
    };

    service.getPlacesByZipcode(zipcode)
      .then(assertPlaces);

    $httpBackend.flush();
  });
});
