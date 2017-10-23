'use strict';

describe('Event Cultuurkuur Component', function () {
  var $componentController;
  var UdbEvent;
  var exampleEventJson = {
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

  beforeEach(module('udb.cultuurkuur', function ($provide) {
    var appConfig = {
      cultuurkuurUrl: 'http://dev.cultuurkuur.be/'
    };

    $provide.constant('appConfig', appConfig);
  }));

  beforeEach(inject(function ($injector) {
    $componentController = $injector.get('$componentController');
    UdbEvent = $injector.get('UdbEvent');

  }));

  function getComponentController(event,permission) {
    var bindings = {
      event : event,
     permission: permission
    };

    return $componentController('udbEventCultuurkuurComponent', {}, bindings);
  }

  it('should have a previewLink and editLink', function () {
    var event = new UdbEvent(exampleEventJson);
    var permission = false;
    var controller = getComponentController(event,permission);

    expect(controller.previewLink).toContain('preview');
    expect(controller.editLink).toContain('edit');
    expect(controller.continueLink).toContain('continue');
  });

  it('should show CultuurKuur as incomplete if no educationfields/levels', function () {
      var event = new UdbEvent(exampleEventJson);
      var permission = true;
      var controller = getComponentController(event,permission);

      expect(controller.isIncomplete).toEqual(true);
  });

  it('should show CultuurKuur as complete if it has an educationfield', function () {
    var event = new UdbEvent(exampleEventJson);
    event.educationFields.push({
        label: "Cultuur en Kunst",
        domain: "educationfield",
        id: "yodawashere"
    });
    var permission = true;
    var controller = getComponentController(event,permission);

    expect(controller.isIncomplete).toEqual(false);
  });

  it('should show CultuurKuur as complete if it has an educationlevel', function () {
    var event = new UdbEvent(exampleEventJson);
    event.educationLevels.push({
        label: "Cultuur en Kunst",
        domain: "educationlevel",
        id: "tothestarsandbeyond"
    });
    var permission = true;
    var controller = getComponentController(event,permission);

    expect(controller.isIncomplete).toEqual(false);
  });

  it('should have a cultuurKuurInfo object containing educationlevels/fields/targetaudiences', function (){
    var event = new UdbEvent(exampleEventJson);
    event.educationLevels.push({
        label: "CVO/CDO/Basiseducatie",
      domain: "educationlevel",
      id: "lukeimyourfather"
    });
    event.educationFields.push({
        label:"Kunst en cultuur",
        domain: "educationfield",
        id:"bricksandstuds"
    });
    event.educationTargetAudience.push({
        label: "Leerlingen",
        domain:"targetaudience",
        id: "2.1.14.0.0"
    });
    var permission = true;
    var controller = getComponentController(event,permission);

    expect(controller.cultuurKuurInfo.levels).toContain("CVO/CDO/Basiseducatie");
    expect(controller.cultuurKuurInfo.fields).toContain("Kunst en cultuur");
    expect(controller.cultuurKuurInfo.targetAudience).toContain("Leerlingen");
  })
});
