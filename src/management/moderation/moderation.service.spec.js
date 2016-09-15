'use strict';

describe('Service: Moderation Service', function () {
  var udbApi, $q, service, $scope, jobLogger;

  var baseUrl = 'http://example.com/';

  var roles = [
    {
      "uuid": "3aad5023-84e2-4ba9-b1ce-201cee64504c",
      "name": "Moderators Leuven",
      "constraint": "city:leuven",
      "permissions": [
        "AANBOD_MODEREREN"
      ]
    }
  ];

  var me = {
    "id": "6f072ba8-c510-40ac-b387-51f582650e27"
  };

  var events = {
    "itemsPerPage": 30,
    "totalItems": 3562,
    "member": [
      {
        "@id": "http://culudb-silex.dev:8080/event/0823f57e-a6bd-450a-b4f5-8459b4b11043",
        "@type": "Event"
      }
    ]
  };

  var offer = {
    "@id": "http://culudb-silex.dev:8080/event/0823f57e-a6bd-450a-b4f5-8459b4b11043",
    "name": {
      "nl": "Nederlands",
      "de": "Deutch",
      "en": "English",
      "fr": "Français"
    },
    "description": {
      "nl": "Nederlands",
      "de": "Deutch",
      "en": "English",
      "fr": "Français"
    },
    "available": "2015-05-07T12:02:53+00:00",
    "image": "http://media.uitdatabank.be/20150416/153cfa0f-0d22-451e-bfd1-490b7c4ef109.jpg",
    "labels": [
      "tagged"
    ],
    "calendarSummary": "Every first day of the month",
    "location": {
      "description": {
        "nl": "Nederlands",
        "de": "Deutch",
        "en": "English",
        "fr": "Français"
      },
      "name": {
        "nl": "Nederlands",
        "de": "Deutch",
        "en": "English",
        "fr": "Français"
      },
      "address": {
        "addressCountry": "BE",
        "addressLocality": "Leuven",
        "postalCode": 3000,
        "streetAddress": "Sluisstraat 79"
      },
      "bookingInfo": {
        "priceCurrency": "EUR",
        "description": "No need to pay anything",
        "name": "Free",
        "price": 0
      },
      "terms": [
        {
          "label": "Cycling",
          "domain": "activities",
          "id": "10.0.0.1"
        }
      ],
      "workflowStatus": "DRAFT"
    },
    "organizer": {
      "name": "STUK",
      "address": {
        "addressCountry": "BE",
        "addressLocality": "Leuven",
        "postalCode": 3000,
        "streetAddress": "Sluisstraat 79"
      },
      "email": "info@stuk.be",
      "phone": [
        "016 320 300"
      ]
    },
    "bookingInfo": {
      "priceCurrency": "EUR",
      "description": "No need to pay anything",
      "name": "Free",
      "price": 0
    },
    "terms": [
      {
        "label": "Cycling",
        "domain": "activities",
        "id": "10.0.0.1"
      }
    ],
    "creator": "evenementen@stad.diksmuide.be",
    "created": "2015-05-07T12:02:53+00:00",
    "modified": "2015-05-07T12:02:53+00:00",
    "publisher": "Invoerders Algemeen ",
    "endDate": "2015-05-07T12:02:53+00:00",
    "startDate": "2015-05-07T12:02:53+00:00",
    "calendarType": "permanent",
    "typicalAgeRange": "+18",
    "performer": [
      {
        "name": "Sindicato Sonico"
      }
    ],
    "sameAs": [
      "http://www.uitinvlaanderen.be/agenda/e/zomerse-vrijdagen-den-engel/0823f57e-a6bd-450a-b4f5-8459b4b11043"
    ],
    "seeAlso": [
      "www.leuven.be"
    ],
    "workflowStatus": "READY_FOR_VALIDATION"
  };

  beforeEach(module('udb.core', function ($provide) {
    var appConfig = {
      baseUrl: baseUrl
    };

    $provide.constant('appConfig', appConfig);

    udbApi = jasmine.createSpyObj('udbApi', [
      'getMe',
      'getUserRoles',
      'findEventsWithLimit',
      'getOffer',
      'patchOffer'
    ]);

    jobLogger = jasmine.createSpyObj('jobLogger', [
      'addJob'
    ]);

    $provide.provider('udbApi', {
      $get: function () {
        return udbApi;
      }
    });

    $provide.provider('jobLogger', {
      $get: function () {
        return jobLogger;
      }
    });
  }));

  beforeEach(inject(function (ModerationService, $rootScope, _$q_) {
    service = ModerationService;
    $scope = $rootScope.$new();
    $q = _$q_;
  }));

  it('should return my roles', function (done) {
    udbApi.getUserRoles.and.returnValue($q.resolve(roles));
    udbApi.getMe.and.returnValue($q.resolve(me));

    function assertResultset (result) {
      expect(udbApi.getMe).toHaveBeenCalled();
      expect(udbApi.getUserRoles).toHaveBeenCalledWith(me.id);
      expect(result).toEqual(roles);
      done();
    }

    service
      .getMyRoles()
      .then(assertResultset);

    $scope.$apply();
  });

  it('should fetch the moderation items for a given role', function (done) {
    udbApi.findEventsWithLimit.and.returnValue($q.resolve(events));

    function assertResultset (result) {
      expect(udbApi.findEventsWithLimit).toHaveBeenCalledWith('city:leuven AND wfstatus="readyforvalidation"', 0, 10);
      expect(result).toEqual(events);
      done();
    }

    service
      .find('city:leuven', 10, 0)
      .then(assertResultset);

    $scope.$apply();
  });

  it('should fetch all readyforvalidation offers when an empty constraint is given', function (done) {
    udbApi.findEventsWithLimit.and.returnValue($q.resolve(events));

    function assertResultset (result) {
      expect(udbApi.findEventsWithLimit).toHaveBeenCalledWith('wfstatus="readyforvalidation"', 0, 10);
      expect(result).toEqual(events);
      done();
    }

    service
      .find('', 10, 0)
      .then(assertResultset);

    $scope.$apply();
  });

  it('should get the info of all individual offers', function (done) {
    udbApi.getOffer.and.returnValue($q.resolve(offer));

    function assertResultset (result) {
      expect(udbApi.getOffer).toHaveBeenCalledWith(new URL('http://culudb-silex.dev:8080/event/0823f57e-a6bd-450a-b4f5-8459b4b11043'));
      expect(result).toEqual(offer);
      done();
    }

    service
      .getModerationOffer('http://culudb-silex.dev:8080/event/0823f57e-a6bd-450a-b4f5-8459b4b11043')
      .then(assertResultset);

    $scope.$apply();
  });

  it('should dispatch an "Approve" command when approving an offer', function(done) {
    var commandId = {commandId: 'aedb6c4a447ac78b6a6b78369590a27a'};
    var offer = {
      '@id': 'http://udb-silex.dev/event/3096cec9-3be8-449e-9b9a-161688d4da62'
    };

    udbApi.patchOffer.and.returnValue($q.resolve(commandId));

    function assertCommand(baseJob) {
      expect(udbApi.patchOffer).toHaveBeenCalledWith(
        'http://udb-silex.dev/event/3096cec9-3be8-449e-9b9a-161688d4da62',
        'Approve'
      );
      expect(baseJob.id).toEqual('aedb6c4a447ac78b6a6b78369590a27a');
      expect(jobLogger.addJob).toHaveBeenCalled();
      done();
    }

    service
      .approve(offer)
      .then(assertCommand);

    $scope.$apply();
  });

  it('should dispatch a "Reject" command with a reason when rejecting an offer', function(done) {
    var commandId = {commandId: 'aedb6c4a447ac78b6a6b78369590a27a'};
    var offer = {
      '@id': 'http://udb-silex.dev/event/3096cec9-3be8-449e-9b9a-161688d4da62'
    };

    udbApi.patchOffer.and.returnValue($q.resolve(commandId));

    function assertCommand(baseJob) {
      expect(udbApi.patchOffer).toHaveBeenCalledWith(
        'http://udb-silex.dev/event/3096cec9-3be8-449e-9b9a-161688d4da62',
        'Reject',
        'Mijn reden.'
      );
      expect(baseJob.id).toEqual('aedb6c4a447ac78b6a6b78369590a27a');
      expect(jobLogger.addJob).toHaveBeenCalled();
      done();
    }

    service
      .reject(offer, 'Mijn reden.')
      .then(assertCommand);

    $scope.$apply();
  });

  it('should dispatch a "FlagAsDuplicate" command when flagging an offer as duplicate', function(done) {
    var commandId = {commandId: 'aedb6c4a447ac78b6a6b78369590a27a'};
    var offer = {
      '@id': 'http://udb-silex.dev/event/3096cec9-3be8-449e-9b9a-161688d4da62'
    };

    udbApi.patchOffer.and.returnValue($q.resolve(commandId));

    function assertCommand(baseJob) {
      expect(udbApi.patchOffer).toHaveBeenCalledWith(
        'http://udb-silex.dev/event/3096cec9-3be8-449e-9b9a-161688d4da62',
        'FlagAsDuplicate'
      );
      expect(baseJob.id).toEqual('aedb6c4a447ac78b6a6b78369590a27a');
      expect(jobLogger.addJob).toHaveBeenCalled();
      done();
    }

    service
      .flagAsDuplicate(offer)
      .then(assertCommand);

    $scope.$apply();
  });

  it('should should dispatch a "FlagAsInappropriate" command when flagging and offer as inappropriate', function(done) {
    var commandId = {commandId: 'aedb6c4a447ac78b6a6b78369590a27a'};
    var offer = {
      '@id': 'http://udb-silex.dev/event/3096cec9-3be8-449e-9b9a-161688d4da62'
    };

    udbApi.patchOffer.and.returnValue($q.resolve(commandId));

    function assertCommand(baseJob) {
      expect(udbApi.patchOffer).toHaveBeenCalledWith(
        'http://udb-silex.dev/event/3096cec9-3be8-449e-9b9a-161688d4da62',
        'FlagAsInappropriate'
      );
      expect(baseJob.id).toEqual('aedb6c4a447ac78b6a6b78369590a27a');
      expect(jobLogger.addJob).toHaveBeenCalled();
      done();
    }

    service
      .flagAsInappropriate(offer)
      .then(assertCommand);

    $scope.$apply();
  });

  it('should notify patch offer errors', function(done) {
    var offer = {
      '@id': 'http://udb-silex.dev/event/3096cec9-3be8-449e-9b9a-161688d4da62'
    };

    udbApi.patchOffer.and.returnValue($q.reject({title:'Big problem!'}));

    function assertProblem(problem) {
      expect(problem).toEqual({title:'Big problem!'});
      done();
    }

    service
      .flagAsInappropriate(offer)
      .catch(assertProblem);

    $scope.$apply();
  });
});
