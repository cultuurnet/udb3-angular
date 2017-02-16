'use strict';

describe('Controller: Event Form', function() {
  var $controller, $scope, udbApi, EventFormData, UdbEvent, $q;

  var offerId = 'da86358c-d52c-429b-89c6-7adffd64ab55';

  var offerJson = {
    "@id":"http:\/\/udb-silex.dev\/event\/da86358c-d52c-429b-89c6-7adffd64ab55",
    "@context":"\/api\/1.0\/event.jsonld",
    "name":{"nl":"Uitgebreide beschrijving"},
    "location":{
      "@type":"Place",
      "@id":"http:\/\/udb-silex.dev\/place\/661bb247-1fc0-4268-9e6c-3c6df6997cca",
      "@context":"\/api\/1.0\/place.jsonld",
      "name":{"nl":"Test place"},
      "address":{"addressCountry":"BE",
      "addressLocality":"Leuven",
      "postalCode":"3000",
      "streetAddress":"teststraat 44"},
      "calendarType":"permanent",
      "terms":[{"id":"kI7uAyn2uUu9VV6Z3uWZTA","label":"Bibliotheek of documentatiecentrum","domain":"eventtype"}],
      "created":"2016-09-15T11:36:23+00:00","modified":"2016-09-15T11:36:23+00:00",
      "creator":"nick@2dotstwice.be",
      "description":{
        "nl":"Gumbo beet greens corn soko endive gumbo gourd. Parsley shallot courgette tatsoi pea sprouts fava bean collard greens dandelion okra wakame tomato. Dandelion cucumber earthnut pea peanut soko zucchini.\n\nTurnip greens yarrow ricebean rutabaga endive cauliflower sea lettuce kohlrabi amaranth water spinach avocado daikon napa cabbage asparagus winter purslane kale. Celery potato scallion desert raisin horseradish spinach carrot soko. Lotus root water spinach fennel kombu maize bamboo shoot green bean swiss chard seakale pumpkin onion chickpea gram corn pea. Brussels sprout coriander water chestnut gourd swiss chard wakame kohlrabi beetroot carrot watercress. Corn amaranth salsify bunya nuts nori azuki bean chickweed potato bell pepper artichoke."
      }
    },
    "calendarType":"permanent",
    "sameAs":[
      "http:\/\/www.uitinvlaanderen.be\/agenda\/e\/uitgebreide-beschrijving\/da86358c-d52c-429b-89c6-7adffd64ab55"
    ],
    "terms":[{"id":"0.0.0.0.0","label":"Tentoonstelling","domain":"eventtype"}],
    "created":"2016-09-28T13:17:22+00:00",
    "modified":"2016-09-28T13:17:22+00:00",
    "creator":"nick@2dotstwice.be",
    "workflowStatus":"READY_FOR_VALIDATION",
    "bookingInfo":{
      "phone":"",
      "email":"",
      "url":"http:\/\/url",
      "urlLabel":"Reserveer plaatsen",
      "name":"",
      "description":"",
      "availabilityStarts":"",
      "availabilityEnds":""
    }
  };

  beforeEach(module('udb.event-form', function ($provide) {
    var appConfig = {
      'calendarHighlight': {
        'date': '2017-09-10',
        'startTime': '10:00',
        'endTime': '18:00',
        'extraClass': 'omd'
      }
    };

    $provide.constant('appConfig', appConfig);
  }));

  beforeEach(inject(function($rootScope, _$controller_, _EventFormData_, _UdbEvent_, _$q_) {
    $controller = _$controller_;
    $scope = $rootScope.$new();
    EventFormData = _EventFormData_;
    UdbEvent = _UdbEvent_;
    $q = _$q_;

    udbApi = jasmine.createSpyObj('udbApi', ['getOffer']);
    udbApi.getOffer.and.returnValue($q.resolve(new UdbEvent(offerJson)));
  }));

  function getController() {
    return $controller(
      'EventFormController', {
        udbApi: udbApi,
        offerId: offerId,
        EventFormData: EventFormData,
        $scope: $scope
      }
    );
  }

  it('should set the workflowStatus to READY_FOR_VALIDATION', function() {
    var efc = getController();

    $scope.$digest();
    expect(EventFormData.workflowStatus).toEqual('READY_FOR_VALIDATION');
  });

  it('should preselect timing from configured highlight values when creating a new event', function () {
    EventFormData.isEvent = true;

    $controller(
      'EventFormController', {
        udbApi: udbApi,
        offerId: null,
        $scope: $scope,
        EventFormData: EventFormData
      }
    );

    var expectedTimestamps = [
      {
        date: new Date('2017-09-10'),
        startHour: '10:00',
        endHour: '18:00',
        showStartHour: true,
        showEndHour: true
      }
    ];

    $scope.$digest();
    expect(EventFormData.timestamps).toEqual(expectedTimestamps);
    expect(EventFormData.calendarType).toEqual('single');
  })
});
