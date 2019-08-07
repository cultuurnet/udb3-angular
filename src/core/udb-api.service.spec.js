'use strict';

describe('Service: UDB3 Api', function () {

  var $httpBackend, $scope, service, uitidAuth, offerCache, Upload;
  var baseUrl = 'http://foo.bar/';
  var language = 'nl';

  beforeEach(module('udb.core', function ($provide) {
    var appConfig = {
      baseUrl: baseUrl,
      apiKey: 'secret api key',
      baseApiUrl: baseUrl,
      baseSearchUrl: baseUrl
    };

    uitidAuth = jasmine.createSpyObj('uitidAuth', ['getUser', 'getToken', 'getTokenData']);

    $provide.constant('appConfig', appConfig);

    Upload = {
      upload: jasmine.createSpy()
    };

    $provide.service('Upload', function() {
      this.upload = Upload.upload;
    });

    $provide.provider('uitidAuth', {
      $get: function () {
        return uitidAuth;
      }
    });
  }));

  beforeEach(inject(function (_$httpBackend_, udbApi, $rootScope, _$cacheFactory_) {
    $httpBackend = _$httpBackend_;
    service = udbApi;
    $scope = $rootScope.$new();
    offerCache = _$cacheFactory_.get('offerCache');
  }));

  function setUpAuthorizedHeaders() {
    var jwt = 'bob';
    var headers = {
      'Content-Type': 'application/ld+json;domain-model=RenameRole',
      'Authorization': 'Bearer ' + jwt,
      'Accept': 'application/json, text/plain, */*',
      'X-Api-Key': 'secret api key'
    };

    // in order for the headers to match we also need the getMe()
    // function to be called so it can set the Authorization headers
    uitidAuth.getUser.and.returnValue(null);
    uitidAuth.getToken.and.returnValue(jwt);

    $httpBackend
      .expectGET(baseUrl + 'user')
      .respond(JSON.stringify({}));

    service.getMe();

    return headers;
  }

  it('should only return the essential data when getting the currently logged in user', function (done) {
    var jsonUserResponse = {
      'id': 2,
      'nick': 'foo'
    };
    var userUrl = baseUrl + 'user';
    var expectedUser = {
      id: 2,
      nick: 'foo'
    };

    function assertUser (user) {
      expect(user).toEqual(expectedUser);
      done();
    }

    uitidAuth.getUser.and.returnValue(null);
    uitidAuth.getToken.and.returnValue('bob');

    $httpBackend
      .expectGET(userUrl)
      .respond(JSON.stringify(jsonUserResponse));

    service
      .getMe()
      .then(assertUser);

    $httpBackend.flush();
  });

  it('should first check if the active user info is available on the client when getting info', function (done) {
    uitidAuth.getUser.and.returnValue({some: 'user'});

    function assertClientCall() {
      expect(uitidAuth.getUser).toHaveBeenCalled();
      done();
    }

    service
      .getMe()
      .then(assertClientCall);

    $scope.$apply();
  });

  it('should return user permissions when token is given', function (done) {
    var expectedPermissions = [
      {
        'key': "SWIMMINGPOOL",
        'name': "Blubblub"
      },
      {
        'key': 'BBQ',
        'name': 'Hothothot'
      },
      {
        'key': 'WINE_CELLAR',
        'name': 'glugglug'
      }
    ];

    function assertPermissions (permissionsList) {
      expect(permissionsList).toEqual(expectedPermissions);
      done();
    }

    uitidAuth.getToken.and.returnValue('token1');

    $httpBackend
      .expectGET(baseUrl + 'user/permissions/')
      .respond(JSON.stringify(expectedPermissions));

    service
      .getMyPermissions()
      .then(assertPermissions);

    $httpBackend.flush();
  });

  // removeItemFromCache
  it('should not remove items from the offerCache if non-existent', function () {
    var id = '12345';
    spyOn(offerCache, 'remove');
    service.removeItemFromCache(id);
    expect(offerCache.remove).not.toHaveBeenCalled();
  });
  it('should remove items from the offerCache if existent', function () {
    var id = '12345';
    offerCache.put(id, true);

    spyOn(offerCache, 'remove');
    service.removeItemFromCache(id);
    expect(offerCache.remove).toHaveBeenCalled();
  });

  // createSavedSearch
  it('should post saved searches to the api', function (done) {
    var response = {};
    $httpBackend
      .expectPOST(baseUrl + 'saved-searches/v2', {
        name: 'saved-search-name',
        query: 'saved-search-query'
      })
      .respond(JSON.stringify(response));
    service
      .createSavedSearch('v2', 'saved-search-name', 'saved-search-query')
      .then(done);

    $httpBackend.flush();
  });

  // getSavedSearches
  it('should get saved searches from the api', function (done) {
    var response = {};
    $httpBackend
      .expectGET(baseUrl + 'saved-searches/v2')
      .respond(JSON.stringify(response));
    service
      .getSavedSearches('v2')
      .then(done);

    $httpBackend.flush();
  });

  // deleteSavedSearch
  it('should delete saved searches from the api', function (done) {
    var response = {};
    $httpBackend
      .expectDELETE(baseUrl + 'saved-searches/v2/searchid')
      .respond(JSON.stringify(response));
    service
      .deleteSavedSearch('v2', 'searchid')
      .then(done);

    $httpBackend.flush();
  });

  it('should find offers when provided a query', function (done) {
    var response = {};
    $httpBackend
      .expectGET(baseUrl + 'offers/?q=foo:bar&start=0&disableDefaultFilters=true&embed=true&workflowStatus=READY_FOR_VALIDATION,APPROVED')
      .respond(JSON.stringify(response));
    service
      .findOffers('foo:bar')

      .then(done);
    $httpBackend.flush();
  });

  it('should find offers when provided no query', function (done) {
    var response = {};
    $httpBackend
      .expectGET(baseUrl + 'offers/?disableDefaultFilters=true&embed=true&start=0&workflowStatus=READY_FOR_VALIDATION,APPROVED')
      .respond(JSON.stringify(response));
    service
      .findOffers('')

      .then(done);
    $httpBackend.flush();
  });

  // findEvents
  it('should find events when provided a query', function (done) {
    var response = {};
    $httpBackend
      .expectGET(baseUrl + 'search?query=searchquery&start=0')
      .respond(JSON.stringify(response));
    service
      .findEvents('searchquery')

      .then(done);
    $httpBackend.flush();
  });

  it('should find events when provided no query', function (done) {
    var response = {};
    $httpBackend
      .expectGET(baseUrl + 'search?start=0')
      .respond(JSON.stringify(response));
    service
      .findEvents('')

      .then(done);
    $httpBackend.flush();
  });

  // findToModerate
  it('should find offer to moderate when provided a query', function (done) {
    var response = {};
    $httpBackend
      .expectGET(baseUrl + 'moderation?query=searchquery&start=120&limit=60')
      .respond(JSON.stringify(response));
    service
      .findToModerate('searchquery', 120, 60)
      .then(done);
    $httpBackend.flush();
  });

  // getOffer
  it('should retrieve offers from api when not in cache', function (done) {
    var offerLocation = 'http://foobar/event/0823f57e-a6bd-450a-b4f5-8459b4b11043';
    var response = {
      '@id': offerLocation,
      'name': 'Name',
      'description': 'Blah Blah',
      'creator': 'evenementen@stad.diksmuide.be',
      'created': '2015-05-07T12:02:53+00:00',
      'publisher': 'Invoerders Algemeen',
      'calendarType': 'single'
    };
    var offerSummary = 'http://foo.bar/events/0823f57e-a6bd-450a-b4f5-8459b4b11043';
    var responseSummary = 'test';
    $httpBackend
      .expectGET(offerLocation)
      .respond(JSON.stringify(response));
    service
      .getOffer(offerLocation)
      .then(done);

    $httpBackend
      .expectGET(offerSummary + '/calsum?format=lg&langCode=nl_BE')
      .respond(JSON.stringify(responseSummary));
    service
      .getCalendarSummary('0823f57e-a6bd-450a-b4f5-8459b4b11043', 'lg', 'nl')
      .then(done);
    $httpBackend.flush();
  });
  it('should retrieve offers from cache when in cache', function (done) {
    var offerLocation = 'http://foobar/event/0823f57e-a6bd-450a-b4f5-8459b4b11043';
    var response = {
      '@id': offerLocation,
      'name': 'Name',
      'description': 'Blah Blah',
      'creator': 'evenementen@stad.diksmuide.be',
      'created': '2015-05-07T12:02:53+00:00',
      'publisher': 'Invoerders Algemeen',
      'calendarType': 'single'
    };

    // first time we expect a GET-call being made
    $httpBackend
      .expectGET(offerLocation)
      .respond(JSON.stringify(response));
    spyOn(offerCache, 'put').and.callThrough();

    service
      .getOffer(offerLocation)
      .then(function(res){
        // but the return get's stored in offerCache
        expect(offerCache.put).toHaveBeenCalled();

        // so a second time it should not make the api call
        service
          .getOffer(offerLocation)
          .then(done);
      });

    $httpBackend.flush();
  });

  // getOrganizerById
  it('should retrieve organizers from api when not in cache', function (done) {
    var organizerId = '0823f57e-a6bd-450a-b4f5-8459b4b11043';
    var response = {
      '@id': 'http://foobar/organizer/0823f57e-a6bd-450a-b4f5-8459b4b11043',
      'name': 'STUK'
    };
    $httpBackend
      .expectGET(baseUrl + 'organizers/' + organizerId)
      .respond(JSON.stringify(response));
    service
      .getOrganizerById(organizerId)
      .then(done);
    $httpBackend.flush();
  });
  it('should retrieve organizers from cache when in cache', function (done) {
    var organizerId = '0823f57e-a6bd-450a-b4f5-8459b4b11043';
    var response = {
      '@id': 'http://foobar/organizer/0823f57e-a6bd-450a-b4f5-8459b4b11043',
      'name': 'STUK'
    };

    // first time we expect a GET-call being made
    $httpBackend
      .expectGET(baseUrl + 'organizers/' + organizerId)
      .respond(JSON.stringify(response));
    // check the todo about own cache for organizers
    spyOn(offerCache, 'put').and.callThrough();

    // we're also testing getOrganizerByLDId here, since it's basically
    // almost the same
    service
      .getOrganizerByLDId('http://foobar/organizer/' + organizerId)
      .then(function(res){
        // but the return get's stored in offerCache
        expect(offerCache.put).toHaveBeenCalled();

        // so a second time it should not make the api call
        service
          .getOrganizerById(organizerId)
          .then(done);
      });

    $httpBackend.flush();
  });

  // findOrganisations by name.
  it('should find organizers by a given name', function (done) {
    var organizerName = 'foo-bar';
    var response = {
      "itemsPerPage": 30,
      "totalItems": 3562,
      "member": [
        {
          "name": "foo-bar",
          "address": {
            "addressCountry": "BE",
            "addressLocality": "Leuven",
            "postalCode": 3000,
            "streetAddress": "Sluisstraat 79"
          },
          "contactPoint": {
            "url": [
              "http://google.be"
            ],
            "email": [
              "joske@2dotstwice.be"
            ],
            "phone": [
              "0123456789"
            ]
          },
          "creator": "evenementen@stad.diksmuide.be",
          "created": "2015-05-07T12:02:53+00:00",
          "modified": "2015-05-07T12:02:53+00:00",
          "url": "http://www.stuk.be/",
          "labels": [
            {
              "uuid": "80f63f49-5de2-42ea-9642-59fc0400f2c5",
              "name": "Mijn label"
            }
          ]
        }
      ]
    };

    $httpBackend
      .expectGET(baseUrl + 'organizers/?embed=true&limit=10&name=foo-bar&start=0')
      .respond(JSON.stringify(response));
    service
      .findOrganisations(0, 10, null, organizerName)
      .then(done);
    $httpBackend.flush();
  });

  // findOrganisations by website.
  it('should find organizers by a given name', function (done) {
    var organizerWebsite = 'www.stuk.be';
    var response = {
      "itemsPerPage": 30,
      "totalItems": 3562,
      "member": [
        {
          "name": "foo-bar",
          "address": {
            "addressCountry": "BE",
            "addressLocality": "Leuven",
            "postalCode": 3000,
            "streetAddress": "Sluisstraat 79"
          },
          "contactPoint": {
            "url": [
              "http://google.be"
            ],
            "email": [
              "joske@2dotstwice.be"
            ],
            "phone": [
              "0123456789"
            ]
          },
          "creator": "evenementen@stad.diksmuide.be",
          "created": "2015-05-07T12:02:53+00:00",
          "modified": "2015-05-07T12:02:53+00:00",
          "url": "http://www.stuk.be/",
          "labels": [
            {
              "uuid": "80f63f49-5de2-42ea-9642-59fc0400f2c5",
              "name": "Mijn label"
            }
          ]
        }
      ]
    };

    $httpBackend
      .expectGET(baseUrl + 'organizers/?embed=true&limit=10&start=0&website=www.stuk.be')
      .respond(JSON.stringify(response));
    service
      .findOrganisations(0, 10, organizerWebsite, null)
      .then(done);
    $httpBackend.flush();
  });

  // addLabelToOrganizer
  it('should add a label to an organizer', function(done) {
    var organizerId = '0823f57e-a6bd-450a-b4f5-8459b4b11043';
    var labelId = '80f63f49-5de2-42ea-9642-59fc0400f2c5';
    var response = {
      "commandId": "c75003dd-cc77-4424-a186-66aa4abd917f"
    };

    $httpBackend
      .expectPUT(baseUrl + 'organizers/' + organizerId + '/labels/' + labelId)
      .respond(JSON.stringify(response));
    service
      .addLabelToOrganizer(organizerId, labelId)
      .then(done);
    $httpBackend.flush();
  });

  // deleteLabelToOrganizer
  it('should delete a label to an organizer', function(done) {
    var organizerId = '0823f57e-a6bd-450a-b4f5-8459b4b11043';
    var labelId = '80f63f49-5de2-42ea-9642-59fc0400f2c5';
    var response = {
      "commandId": "c75003dd-cc77-4424-a186-66aa4abd917f"
    };

    $httpBackend
      .expectDELETE(baseUrl + 'organizers/' + organizerId + '/labels/' + labelId)
      .respond(JSON.stringify(response));
    service
      .deleteLabelFromOrganizer(organizerId, labelId)
      .then(done);
    $httpBackend.flush();
  });

  it('should update the organizer\'s website', function(done) {
    var organizerId = '0823f57e-a6bd-450a-b4f5-8459b4b11043';
    var response = {
      "commandId": "c75003dd-cc77-4424-a186-66aa4abd917f"
    };
    var params = {
      url: 'http://google.be'
    };

    $httpBackend
        .expectPUT(baseUrl + 'organizers/' + organizerId + '/url', params)
        .respond(JSON.stringify(response));
    service
        .updateOrganizerWebsite(organizerId, 'http://google.be')
        .then(done);
    $httpBackend.flush();
  });

  it('should update the organizer\'s name', function(done) {
    var organizerId = '0823f57e-a6bd-450a-b4f5-8459b4b11043';
    var response = {
      "commandId": "c75003dd-cc77-4424-a186-66aa4abd917f"
    };
    var params = {
      name: 'blub'
    };

    $httpBackend
        .expectPUT(baseUrl + 'organizers/' + organizerId + '/name/' + language, params)
        .respond(JSON.stringify(response));
    service
        .updateOrganizerName(organizerId, 'blub', 'nl')
        .then(done);
    $httpBackend.flush();
  });

  it('should update the organizer\'s address', function(done) {
    var organizerId = '0823f57e-a6bd-450a-b4f5-8459b4b11043';
    var response = {
      "commandId": "c75003dd-cc77-4424-a186-66aa4abd917f"
    };
    var contact = {
      "url": [
        "http://google.be"
      ],
      "email": [
        "joske@2dotstwice.be"
      ],
      "phone": [
        "0123456789"
      ]
    };

    $httpBackend
        .expectPUT(baseUrl + 'organizers/' + organizerId + '/contactPoint', contact)
        .respond(JSON.stringify(response));
    service
        .updateOrganizerContact(organizerId, contact)
        .then(done);
    $httpBackend.flush();
  });

  it('should update the organizer\'s contact info', function(done) {
    var organizerId = '0823f57e-a6bd-450a-b4f5-8459b4b11043';
    var response = {
      "commandId": "c75003dd-cc77-4424-a186-66aa4abd917f"
    };
    var address = {
      "addressCountry": "BE",
      "addressLocality": "Leuven",
      "postalCode": 3000,
      "streetAddress": "Sluisstraat 79"
    };
    var language = 'nl';

    $httpBackend
        .expectPUT(baseUrl + 'organizers/' + organizerId + '/address/' + language, address)
        .respond(JSON.stringify(response));
    service
        .updateOrganizerAddress(organizerId, address, language)
        .then(done);
    $httpBackend.flush();
  });

  // createRole
  it('should post a new role to the api', function (done) {
    var expectedData = {
      'name': 'role name'
    };
    $httpBackend
      .expectPOST(baseUrl + 'roles/', expectedData)
      .respond(JSON.stringify({}));
    service
      .createRole('role name')
      .then(done);
    $httpBackend.flush();
  });

  // updateRoleName
  it('should update the role name trough the api', function (done) {
    var expectedData = {
      'name': 'newname'
    };
    var expectedHeaders = _.assign(setUpAuthorizedHeaders(), {
      'Content-Type': 'application/ld+json;domain-model=RenameRole'
    });

    // What we actually want to check
    $httpBackend
      .expectPATCH(baseUrl + 'roles/roleid', expectedData, expectedHeaders)
      .respond(JSON.stringify({}));

    service
      .updateRoleName('roleid', 'newname')
      .then(done);
    $httpBackend.flush();
  });

  it('should create the constraint through the api', function (done) {
    var expectedData = {
      'query': 'newconstraint'
    };
    var expectedHeaders = {
      'Content-Type': 'application/ld+json;domain-model=addConstraint',
      'Authorization': 'Bearer bob',
      'X-Api-Key': 'secret api key',
      'Accept': 'application/json, text/plain, */*'
    };

    // in order for the headers to match we also need the getMe()
    // function to be called so it can set the Authorization headers
    uitidAuth.getUser.and.returnValue(null);
    uitidAuth.getToken.and.returnValue('bob');
    $httpBackend
        .expectGET(baseUrl + 'user')
        .respond(JSON.stringify({}));

    service
        .getMe();

    // What we actually want to check
    $httpBackend
        .expectPOST(baseUrl + 'roles/roleid/constraints/v2', expectedData, expectedHeaders)
        .respond(JSON.stringify({}));

    service
        .createRoleConstraint('roleid', 'v2', 'newconstraint')
        .then(done);
    $httpBackend.flush();
  });

  // updateRoleConstraint
  it('should update the constraint trough the api', function (done) {
    var expectedData = {
      'query': 'newconstraint'
    };
    var expectedHeaders = {
      'Content-Type': 'application/ld+json;domain-model=updateConstraint',
      'Authorization': 'Bearer bob',
      'X-Api-Key': 'secret api key',
      'Accept': 'application/json, text/plain, */*'
    };

    // in order for the headers to match we also need the getMe()
    // function to be called so it can set the Authorization headers
    uitidAuth.getUser.and.returnValue(null);
    uitidAuth.getToken.and.returnValue('bob');
    $httpBackend
      .expectGET(baseUrl + 'user')
      .respond(JSON.stringify({}));

    service
      .getMe();

    // What we actually want to check
    $httpBackend
      .expectPUT(baseUrl + 'roles/roleid/constraints/v2', expectedData, expectedHeaders)
      .respond(JSON.stringify({}));

    service
      .updateRoleConstraint('roleid', 'v2', 'newconstraint')
      .then(done);
    $httpBackend.flush();
  });

  it('should remove the constraint trough the api', function (done) {

    var expectedHeaders = {
      'Authorization': 'Bearer bob',
      'X-Api-Key': 'secret api key',
      'Accept': 'application/json, text/plain, */*'
    };

    // in order for the headers to match we also need the getMe()
    // function to be called so it can set the Authorization headers
    uitidAuth.getUser.and.returnValue(null);
    uitidAuth.getToken.and.returnValue('bob');
    $httpBackend
        .expectGET(baseUrl + 'user')
        .respond(JSON.stringify({}));

    service
        .getMe();

    // What we actually want to check
    $httpBackend
        .expectDELETE(baseUrl + 'roles/roleid/constraints/v2', expectedHeaders)
        .respond(JSON.stringify({}));

    service
        .removeRoleConstraint('roleid', 'v2')
        .then(done);
    $httpBackend.flush();
  });

  // getPermissions
  it('should get all permissions trough the api', function (done) {
    $httpBackend
      .expectGET(baseUrl + 'permissions/')
      .respond(JSON.stringify({}));
    service
      .getPermissions()
      .then(done);
    $httpBackend.flush();
  });

  // getRolePermissions
  it('should get permissions for a role trough the api', function (done) {
    $httpBackend
      .expectGET(baseUrl + 'roles/roleid/permissions/')
      .respond(JSON.stringify({}));
    service
      .getRolePermissions('roleid')
      .then(done);
    $httpBackend.flush();
  });

  // addPermissionToRole
  it('should add permissions to role trough the api', function (done) {
    $httpBackend
      .expectPUT(baseUrl + 'roles/roleid/permissions/permissionid')
      .respond(JSON.stringify({}));
    service
      .addPermissionToRole('permissionid', 'roleid')
      .then(done);
    $httpBackend.flush();
  });

  // removePermissionFromRole
  it('should remove permissions from role trough the api', function (done) {
    $httpBackend
      .expectDELETE(baseUrl + 'roles/roleid/permissions/permissionid')
      .respond(JSON.stringify({}));
    service
      .removePermissionFromRole('permissionid', 'roleid')
      .then(done);
    $httpBackend.flush();
  });

  // getHistory
  it('should get history for an event from the api', function (done) {
    // eventid is an url
    var response = {};
    $httpBackend
      .expectGET('eventid/history')
      .respond(JSON.stringify(response));
    service
      .getHistory('eventid')
      .then(done);

    $httpBackend.flush();
  });

  // hasPermission
  it('should respond when the user has permission to the offer location', function (done) {
    var responseWithPermission = {
      hasPermission: true
    };
    $httpBackend
      .expectGET('offerLocation/permission')
      .respond(responseWithPermission);
    service
      .hasPermission('offerLocation')
      .then(done);

    $httpBackend.flush();
  });
  it('should reject when the user has no permission to the offer location', function (done) {
    var responseNoPermission = {
      hasPermission: false
    };
    $httpBackend
      .expectGET('offerLocation/permission')
      .respond(responseNoPermission);
    service
      .hasPermission('offerLocation')
      .catch(done);

    $httpBackend.flush();
  });

  // labelOffers
  it('should label multiple offers using the api', function(done){
    var label = 'Bio';
    var offers = [
      {
        '@id': 'http://culudb-silex.dev:8080/event/0823f57e-a6bd-450a-b4f5-8459b4b11043',
        '@type': 'Event'
      },
      {
        '@id': 'http://culudb-silex.dev:8080/event/1823f57e-e6bd-250a-a4f5-2459b4b11045',
        '@type': 'Place'
      }
    ];
    var expectedBody = {
      'label': label,
      'offers': offers
    };
    $httpBackend
      .expectPOST(baseUrl + 'offers/labels', expectedBody)
      .respond();
    service
      .labelOffers(offers, label)
      .then(done);

    $httpBackend.flush();
  });

  // labelQuery
  it('should label a query using the api', function(done){
    var label = 'Bio';
    var query = '6e169e4a-32c8-4fca-a1ce-5beb2b2ac2cc';
    var expectedBody = {
      'label': label,
      'query': query
    };
    $httpBackend
      .expectPOST(baseUrl + 'query/labels', expectedBody)
      .respond();
    service
      .labelQuery(query, label)
      .then(done);

    $httpBackend.flush();
  });

  // exportEvents
  it('should exports events based on a selection from the api', function(done){
    var query = 'title:bio';
    var customizations = {
      brand: 'uitpas',
      title: 'Organic in Mechelen'
    };
    var selection = [
      'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc1',
      'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc2',
      'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc3'
    ];
    var include = [
      'author', 'name'
    ];
    var email = 'email@example.com';

    var expectedBody = {
      'query': query,
      'selection': selection,
      'order': {},
      'include': include,
      'perDay': true,
      'customizations': customizations,
      'email': email
    };
    $httpBackend
      .expectPOST(baseUrl + 'events/export/pdf', expectedBody)
      .respond();
    service
      .exportEvents(query, email, 'pdf', include, true, selection, customizations)
      .then(done);

    $httpBackend.flush();
  });
  it('should exports events based on a selection without email or customizations', function(done){
    var query = 'title:bio';
    var selection = [
      'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc1',
      'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc2',
      'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc3'
    ];
    var include = [
      'author', 'name'
    ];

    var expectedBody = {
      'query': query,
      'selection': selection,
      'order': {},
      'include': include,
      'perDay': true,
      'customizations': {}
    };
    $httpBackend
      .expectPOST(baseUrl + 'events/export/pdf', expectedBody)
      .respond();
    service
      .exportEvents(query, null, 'pdf', include, true, selection)
      .then(done);

    $httpBackend.flush();
  });

  // translateProperty
  it('should post a translation for a property to the api', function(done){
    var offerLocation = 'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc1';
    var language = 'nl';
    var propertyName = 'title';
    var translation = 'Een event titel';
    var expectedBody = {
      'title': translation
    };

    $httpBackend
      .expectPOST(offerLocation + '/' + language + '/' + propertyName, expectedBody)
      .respond();
    service
      .translateProperty(offerLocation, propertyName, language, translation)
      .then(done);

    $httpBackend.flush();
  });

  //translateAddress
  it('should put a translation for an address to the api', function(done) {
    var offerId = '0823f57e-a6bd-450a-b4f5-8459b4b11043';
    var language = 'fr';
    var translation = {
      addressCountry: "BE",
      addressLocality: "Bruxelles",
      postalCode: "1000",
      streetAddress: "Rue de Saint-Gislein"
    };
    var response = {
      "commandId": "c75003dd-cc77-4424-a186-66aa4abd917f"
    };

    $httpBackend
        .expectPUT(baseUrl + 'places/' + offerId + '/address/' + language)
        .respond(JSON.stringify(response));
    service
        .translateAddress(offerId, language, translation)
        .then(done);
    $httpBackend.flush();
  });

  // updateProperty
  it('should update properties', function(done){
    var offerLocation = 'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc1';
    var propertyName = 'title';
    var value = 'An updated title';
    var expectedBody = {
      'title': value
    };

    $httpBackend
      .expectPOST(offerLocation + '/' + propertyName, expectedBody)
      .respond();
    service
      .updateProperty(offerLocation, propertyName, value)
      .then(done);

    $httpBackend.flush();
  });

  // updatePriceInfo
  it('should update the price info of an event or place', function(done){
    var offerLocation = 'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc1';
    var price = [
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
    ];

    $httpBackend
      .expectPUT(offerLocation + '/priceInfo', price)
      .respond();

    service
      .updatePriceInfo(offerLocation, price)
      .then(done);

    $httpBackend.flush();
  });

  it('should update properties using delimiter-seperated instead of CamelCase', function(done){
    var offerLocation = 'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc1';
    var propertyName = 'typicalAgeRange';
    var value = 'updated';
    var expectedBody = {
      'typicalAgeRange': value
    };

    $httpBackend
      .expectPOST(offerLocation + '/typical-age-range', expectedBody)
      .respond();
    service
      .updateProperty(offerLocation, propertyName, value)
      .then(done);

    $httpBackend.flush();
  });

  // labelOffer
  it('should label an offer', function(done){
    var offerLocation = 'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc1';
    var label = 'Bio';
    var expectedBody = {
      'label': label
    };

    $httpBackend
      .expectPOST(offerLocation + '/labels', expectedBody)
      .respond();
    service
      .labelOffer(offerLocation, label)
      .then(done);

    $httpBackend.flush();
  });

  // unlabelOffer
  it('should unlabel an offer', function(done){
    var offerLocation = 'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc1';
    var label = 'Bio';

    $httpBackend
      .expectDELETE(offerLocation + '/labels/' + label)
      .respond();
    service
      .unlabelOffer(offerLocation, label)
      .then(done);

    $httpBackend.flush();
  });

  // unlabelOffer
  it('should unlabel an offer and encode url', function(done){
    var offerLocation = 'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc1';
    var label = '#hash';
    var url = offerLocation + '/labels/' + encodeURIComponent(label);

    $httpBackend
      .expectDELETE(url)
      .respond();
    service
      .unlabelOffer(offerLocation, label)
      .then(done);

    $httpBackend.flush();
  });

  // deleteOffer
  it('should delete an offer', function(done){
    var offer = {
      '@id': 'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc1'
    };

    $httpBackend
      .expectDELETE(offer['@id'])
      .respond();
    service
      .deleteOffer(offer)
      .then(done);

    $httpBackend.flush();
  });

  // createOffer
  it('should create an offer', function(done){
    var type = 'place';
    var offer = {
      'name': {
        nl: "Super Awesome Party Night"
      },
      'type': {
        id: '0.50.4.0.0',
        label: 'Concert',
        domain: 'eventtype'
      },
      'theme': {
        id: '1.2.1.0.0',
        label: 'Architectuur',
        domain: 'thema'
      },
      'location': {
        id: '6f072ba8-c510-40ac-b387-51f582650e27',
        name: 'Versuz',
        address: {
          addressCountry: 'BE',
          addressLocality: 'Hasselt',
          postalCode: '3500',
          streetAddress: 'Gouverneur Verwilghensingel 70'
        }
      },
      'calendarType': 'single',
      'startDate': '2015-05-07T12:02:53+00:00'
    };
    var response = {
      eventId: 'f8597ef0-9364-4ab5-a3cc-1e344e599fc1',
      url: 'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc1'
    };

    $httpBackend
      .expectPOST(baseUrl + type, offer)
      .respond(JSON.stringify(response));
    service
      .createOffer(type, offer)
      .then(done);

    $httpBackend.flush();
  });

  // createVariation
  it('should create a variation for an offerLocation', function(done){
    var offerLocation = 'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc1';
    var activeUser;
    var description = '<p>William Kentridge keert [...] wie zich door haar laat bekoren.</p>';
    var purpose = 'homepage-tips';
    var activeUser = {
      id: '6f072ba8-c510-40ac-b387-51f582650e27'
    };
    var expectedBody = {
      owner: activeUser.id,
      purpose: purpose,
      same_as: offerLocation,
      description: description
    };
    var response = {
      commandId: '8cdc13e62efaecb9d8c21d59a29b9de4'
    };
    uitidAuth.getUser.and.returnValue(activeUser);

    $httpBackend
      .expectPOST(baseUrl + 'variations/', expectedBody)
      .respond(JSON.stringify(response));
    service
      .createVariation(offerLocation, description, purpose)
      .then(done);

    $httpBackend.flush();
  });

  // editDescription
  it('should edit the description for a variation', function(done){
    var variationId = 'f8597ef0-9364-4ab5-a3cc-1e344e599fc1';
    var description = '<p>William Kentridge keert [...] wie zich door haar laat bekoren.</p>';
    var expectedBody = {
      description: description
    };
    var response = {
      commandId: '8cdc13e62efaecb9d8c21d59a29b9de4'
    };

    $httpBackend
      .expectPATCH(baseUrl + 'variations/' + variationId, expectedBody)
      .respond(JSON.stringify(response));
    service
      .editDescription(variationId, description)
      .then(done);

    $httpBackend.flush();
  });

  // findEventsAtPlace
  it('should find events at a place', function(done){
    // TODO: not sure about this one
    // cannot find any documentation for it in the swagger.json
    var placeLocation = 'http://culudb-silex.dev/place/f8597ef0-9364-4ab5-a3cc-1e344e599fc1';
    var response = {
      "events": [
        "7616a359-b95c-48c0-9981-502732b8d957"
      ]
    };

    $httpBackend
      .expectGET(placeLocation + '/events')
      .respond(JSON.stringify(response));
    service
      .findEventsAtPlace(placeLocation)
      .then(done);

    $httpBackend.flush();
  });

  // createOrganizer
  it('should create an organizer', function(done){
    var organizer = {
      name: 'STUK'
    };
    var response = {
      organizerId: 'f8597ef0-9364-4ab5-a3cc-1e344e599fc7',
      url: 'http://culudb-silex.dev:8080/organizer/f8597ef0-9364-4ab5-a3cc-1e344e599fc7'
    };

    $httpBackend
      .expectPOST(baseUrl + 'organizers/', organizer)
      .respond(JSON.stringify(response));
    service
      .createOrganizer(organizer)
      .then(done);

    $httpBackend.flush();
  });

  // updateMajorInfo
  it('should update major info', function(done){
    var offerLocation = 'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc1';
    var info = {
      name: { nl: 'Test place' },
      type: { id: '0.14.0.0.0', label: 'Monument', domain: 'eventtype' },
      location: {
        address: {
          addressCountry: 'BE',
          addressLocality: 'Leuven',
          postalCode: '3000',
          streetAddress: 'Teststraat 5'
        }
      },
      calendarType: 'permanent',
      openingHours: [
        {
          dayOfWeek: 'tuesday',
          opens: '00:30',
          closes: '12:00',
          label: 'Dinsdag'
        }
      ]
    };
    var response = {
      commandId: '8cdc13e62efaecb9d8c21d59a29b9de4'
    };

    $httpBackend
      .expectPOST(offerLocation + '/major-info', info)
      .respond(JSON.stringify(response));
    service
      .updateMajorInfo(offerLocation, info)
      .then(done);

    $httpBackend.flush();
  });

  // deleteTypicalAgeRange
  it('should delete a typical age range', function(done){
    var offerLocation = 'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc1';
    var response = {
      commandId: '8cdc13e62efaecb9d8c21d59a29b9de4'
    };

    $httpBackend
      .expectDELETE(offerLocation + '/typical-age-range')
      .respond(JSON.stringify(response));
    service
      .deleteTypicalAgeRange(offerLocation)
      .then(done);

    $httpBackend.flush();
  });

  // deleteOfferOrganizer
  it('should delete an organizer for an offer', function(done){
    var offerLocation = 'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc1';
    var organizerId = 'd8597ef0-9364-2ab5-a3cc-1e344e599fc1';
    var response = {
      commandId: '8cdc13e62efaecb9d8c21d59a29b9de4'
    };

    $httpBackend
      .expectDELETE(offerLocation + '/organizer/' + organizerId)
      .respond(JSON.stringify(response));
    service
      .deleteOfferOrganizer(offerLocation, organizerId)
      .then(done);

    $httpBackend.flush();
  });

  // deleteVariation
  it('should delete an organizer for an offer', function(done){
    var variationId = '38597ef0-9364-0ab5-a3cc-2e344e599fc1';
    var response = {
      commandId: '8cdc13e62efaecb9d8c21d59a29b9de4'
    };

    $httpBackend
      .expectDELETE(baseUrl + 'variations/' + variationId)
      .respond(JSON.stringify(response));
    service
      .deleteVariation(variationId)
      .then(done);

    $httpBackend.flush();
  });

  // addImage
  it('should add images to an event or place', function(done){
    var itemLocation = 'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc1';
    var imageId = '73695986-e4cf-4b29-8699-13d7cd77af8c';
    var response = {
      commandId: '8cdc13e62efaecb9d8c21d59a29b9de4'
    };
    var expectedBody = {
      mediaObjectId: '73695986-e4cf-4b29-8699-13d7cd77af8c'
    };

    $httpBackend
      .expectPOST(itemLocation + '/images', expectedBody)
      .respond(JSON.stringify(response));
    service
      .addImage(itemLocation, imageId)
      .then(done);

    $httpBackend.flush();
  });

  // updateImage
  it('should update description and copyrightHolder for an image', function(done){
    var itemLocation = 'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc1';
    var imageId = '73695986-e4cf-4b29-8699-13d7cd77af8c';
    var description = 'Image by Dirk';
    var copyrightHolder = 'Dirk Dirkington';
    var response = {
      commandId: '8cdc13e62efaecb9d8c21d59a29b9de4'
    };
    var expectedBody = {
      description: description,
      copyrightHolder: copyrightHolder
    };

    $httpBackend
      .expectPOST(itemLocation + '/images/' + imageId, expectedBody)
      .respond(JSON.stringify(response));
    service
      .updateImage(itemLocation, imageId, description, copyrightHolder)
      .then(done);

    $httpBackend.flush();
  });

  // removeImage
  it('should remove an image from an event or place', function(done){
    var itemLocation = 'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc1';
    var imageId = '73695986-e4cf-4b29-8699-13d7cd77af8c';
    var response = {
      commandId: '8cdc13e62efaecb9d8c21d59a29b9de4'
    };

    $httpBackend
      .expectDELETE(itemLocation + '/images/' + imageId)
      .respond(JSON.stringify(response));
    service
      .removeImage(itemLocation, imageId)
      .then(done);

    $httpBackend.flush();
  });

  // setMainImage
  it('should select an image as main image for an event or place', function(done){
    var itemLocation = 'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc1';
    var imageId = '73695986-e4cf-4b29-8699-13d7cd77af8c';
    var response = {
      commandId: '8cdc13e62efaecb9d8c21d59a29b9de4'
    };
    var expectedBody = {
      mediaObjectId: imageId
    };

    $httpBackend
      .expectPOST(itemLocation + '/images/main', expectedBody)
      .respond(JSON.stringify(response));
    service
      .selectMainImage(itemLocation, imageId)
      .then(done);

    $httpBackend.flush();
  });

  // getOfferVariations
  it('should get variations for an offer based on parameters', function(done){
    var itemLocation = 'http://culudb-silex.dev/event/f8597ef0-9364-4ab5-a3cc-1e344e599fc1';
    var purpose = 'homepage-tips';
    var response = {
      commandId: '8cdc13e62efaecb9d8c21d59a29b9de4'
    };

    $httpBackend
      .expectGET(baseUrl + 'variations/?purpose=' + purpose)
      .respond(JSON.stringify(response));
    service
      .getOfferVariations(null, purpose)
      .then(done);

    $httpBackend.flush();
  });

  // getVariation
  it('should get a variation', function(done){
    var variationId = '04C47992-B01E-4EE4-96ED-289F22638324';
    var response = {
      '@id': 'http://culudb-silex.dev:8080/variations/04C47992-B01E-4EE4-96ED-289F22638324',
      'name': {
        'nl': 'Nederlands',
        'de': 'Deutch',
        'en': 'English',
        'fr': 'Français'
      },
      'description': {
        'nl': 'Alternatieve beschrijving in het Nederlands',
        'de': 'Deutch',
        'en': 'English',
        'fr': 'Français'
      },
      'available': '2015-05-07T12:02:53+00:00',
      'image': 'http://media.uitdatabank.be/20150416/153cfa0f-0d22-451e-bfd1-490b7c4ef109.jpg',
      'labels': [
        'tagged'
      ],
      'calendarSummary': 'Every first day of the month',
      'location': {
        'description': 'Or not to be.',
        'name': 'This is the place to be',
        'address': {
          'addressCountry': 'BE',
          'addressLocality': 'Leuven',
          'postalCode': 3000,
          'streetAddress': 'Sluisstraat 79'
        },
        'bookingInfo': {
          'priceCurrency': 'EUR',
          'description': 'No need to pay anything',
          'name': 'Free',
          'price': 0
        },
        'terms': [
          {
            'label': 'Cycling',
            'domain': 'activities',
            'id': '10.0.0.1'
          }
        ]
      },
      'organizer': {
        'name': 'STUK',
        'address': {
          'addressCountry': 'BE',
          'addressLocality': 'Leuven',
          'postalCode': 3000,
          'streetAddress': 'Sluisstraat 79'
        },
        'email': 'info@stuk.be',
        'phone': [
          '016 320 300'
        ]
      },
      'bookingInfo': {
        'priceCurrency': 'EUR',
        'description': 'No need to pay anything',
        'name': 'Free',
        'price': 0
      },
      'terms': [
        {
          'label': 'Cycling',
          'domain': 'activities',
          'id': '10.0.0.1'
        }
      ],
      'creator': 'evenementen@stad.diksmuide.be',
      'created': '2015-05-07T12:02:53+00:00',
      'modified': '2015-05-07T12:02:53+00:00',
      'publisher': 'Invoerders Algemeen ',
      'endDate': '2015-05-07T12:02:53+00:00',
      'startDate': '2015-05-07T12:02:53+00:00',
      'calendarType': 'permanent',
      'typicalAgeRange': '+18',
      'performer': [
        {
          'name': 'Sindicato Sonico'
        }
      ],
      'sameAs': [
        'http://culudb-silex.dev:8080/event/0823f57e-a6bd-450a-b4f5-8459b4b11043'
      ]
    };

    $httpBackend
      .expectGET(baseUrl + 'variations/' + variationId)
      .respond(JSON.stringify(response));
    service
      .getVariation(variationId)
      .then(done);

    $httpBackend.flush();
  });

  // getDashboardItems
  it('should get dashboard items', function(done){
    var response = {
      "itemsPerPage": 50,
      "totalItems": 1,
      "member": [
        {
          "id": "http://udb-silex.dev/event/7616a359-b95c-48c0-9981-502732b8d957",
          "type": "Event"
        }
      ]
    };

    uitidAuth.getTokenData.and.returnValue({uid: 1, email: 'test@test.com'});

    $httpBackend
      .expectGET(baseUrl + 'offers/?creator=1&disableDefaultFilters=true&embed=true&limit=50&sort%5Bmodified%5D=desc&start=0&workflowStatus=DRAFT,READY_FOR_VALIDATION,APPROVED,REJECTED')
      .respond(JSON.stringify(response));
    service
      .getDashboardItems(1)
      .then();

    $httpBackend.flush();

    $httpBackend
      .expectGET(baseUrl + 'offers/?creator=1&disableDefaultFilters=true&embed=true&limit=50&sort%5Bmodified%5D=desc&start=50&workflowStatus=DRAFT,READY_FOR_VALIDATION,APPROVED,REJECTED')
      .respond(JSON.stringify(response));
    service
      .getDashboardItems(2)
      .then(done);

    $httpBackend.flush();
  });

  // uploadMedia
  it('should upload Media', function(){
    var imageFile = 'imagefile';
    var description = 'Image by Dirk';
    var copyrightHolder = 'Dirk Dirkington';
    var language = 'nl';

    var expectedConfig = {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer undefined',
        'X-Api-Key': 'secret api key'
      },
      params: {},
      url: baseUrl + 'images/',
      fields: {
        description: description,
        copyrightHolder: copyrightHolder,
        language: language
      },
      file: imageFile
    };

    service
      .uploadMedia(imageFile, description, copyrightHolder, language);

    expect(Upload.upload).toHaveBeenCalledWith(expectedConfig);
  });

  // getMedia
  it('should get media', function(done){
    var imageId = '04C47992-B01E-4EE4-96ED-289F22638324';
    var response = {
      '@id': 'http://culudb-silex.dev:8080/images/04C47992-B01E-4EE4-96ED-289F22638324',
      '@type': 'schema:MediaObject',
      'contentUrl': 'http://culudb-silex.dev:8080/media/de305d54-75b4-431b-adb2-eb6b9e546014.png',
      'thumbnailUrl': 'http://culudb-silex.dev:8080/media/de305d54-75b4-431b-adb2-eb6b9e546014.png',
      'description': 'Allemaal Roze konijnen',
      'copyrightHolder': 'Toto het roze konijn'
    };

    $httpBackend
      .expectGET(baseUrl + 'media/' + imageId)
      .respond();
    service
      .getMedia(imageId)
      .then(done);

    $httpBackend.flush();
  });

  // createLabel
  it('should create a public visible label', function(done){
    var name = 'Bloso';
    var expectedBody = {
      name: name,
      visibility: 'visible',
      privacy: 'public'
    };
    var response = {
      commandId: '8cdc13e62efaecb9d8c21d59a29b9de4'
    };

    $httpBackend
      .expectPOST(baseUrl + 'labels/', expectedBody)
      .respond(JSON.stringify(response));
    service
      .createLabel(name, true, false)
      .then(done);

    $httpBackend.flush();
  });
  it('should create a private visible label', function(done){
    var name = 'Bloso';
    var expectedBody = {
      name: name,
      visibility: 'visible',
      privacy: 'private'
    };
    var response = {
      commandId: '8cdc13e62efaecb9d8c21d59a29b9de4'
    };

    $httpBackend
      .expectPOST(baseUrl + 'labels/', expectedBody)
      .respond(JSON.stringify(response));
    service
      .createLabel(name, true, true)
      .then(done);

    $httpBackend.flush();
  });
  it('should create a private invisible label', function(done){
    var name = 'Bloso';
    var expectedBody = {
      name: name,
      visibility: 'invisible',
      privacy: 'private'
    };
    var response = {
      commandId: '8cdc13e62efaecb9d8c21d59a29b9de4'
    };

    $httpBackend
      .expectPOST(baseUrl + 'labels/', expectedBody)
      .respond(JSON.stringify(response));
    service
      .createLabel(name, false, true)
      .then(done);

    $httpBackend.flush();
  });
  it('should create a private invisible label with parent', function(done){
    var name = 'Bloso';
    var expectedBody = {
      name: name,
      visibility: 'invisible',
      privacy: 'private',
      parentId: '3aad5023-84e2-4ba9-b1ce-201cee64504c'
    };
    var response = {
      commandId: '8cdc13e62efaecb9d8c21d59a29b9de4'
    };

    $httpBackend
      .expectPOST(baseUrl + 'labels/', expectedBody)
      .respond(JSON.stringify(response));
    service
      .createLabel(name, false, true, '3aad5023-84e2-4ba9-b1ce-201cee64504c')
      .then(done);

    $httpBackend.flush();
  });

  // updateLabel
  it('should update a label', function(done){
    var labelId = '3aad5023-84e2-4ba9-b1ce-201cee64504c';
    var command = {
      command: 'MakePublic'
    };
    var response = {
      commandId: '8cdc13e62efaecb9d8c21d59a29b9de4'
    };

    $httpBackend
      .expectPATCH(baseUrl + 'labels/' + labelId, command)
      .respond(JSON.stringify(response));
    service
      .updateLabel(labelId, 'MakePublic')
      .then(done);

    $httpBackend.flush();
  });

  // deleteLabel
  it('should delete a label', function(done){
    var labelId = '3aad5023-84e2-4ba9-b1ce-201cee64504c';
    var response = {
      commandId: '8cdc13e62efaecb9d8c21d59a29b9de4'
    };

    $httpBackend
      .expectDELETE(baseUrl + 'labels/' + labelId)
      .respond(JSON.stringify(response));
    service
      .deleteLabel(labelId)
      .then(done);

    $httpBackend.flush();
  });

  // getLabelById
  it('should get a label', function(done){
    var labelId = '3aad5023-84e2-4ba9-b1ce-201cee64504c';
    var response = {
      uuid: '3aad5023-84e2-4ba9-b1ce-201cee64504c',
      name: 'Bloso',
      privacy: 'public',
      visibility: 'visible'
    };

    $httpBackend
      .expectGET(baseUrl + 'labels/' + labelId)
      .respond(JSON.stringify(response));
    service
      .getLabelById(labelId)
      .then(done);

    $httpBackend.flush();
  });

  // findLabels
  it('should find labels based on a query', function(done){
    var query = 'labelquery';
    var response = {
      itemsPerPage: 30,
      totalItems: 3652,
      member: [
        {
          uuid: '3aad5023-84e2-4ba9-b1ce-201cee64504c',
          name: 'Bloso',
          privacy: 'public',
          visibility: 'visible'
        }
      ]
    };

    $httpBackend
      .expectGET(baseUrl + 'labels/?query=labelquery&limit=30&start=0')
      .respond(JSON.stringify(response));
    service
      .findLabels(query)
      .then(done);

    $httpBackend.flush();
  });
  it('should find labels based on a query with variable start and limit', function(done){
    var query = 'labelquery';
    var response = {
      itemsPerPage: 1,
      totalItems: 3652,
      member: [
        {
          uuid: '3aad5023-84e2-4ba9-b1ce-201cee64504c',
          name: 'Bloso',
          privacy: 'public',
          visibility: 'visible'
        }
      ]
    };

    $httpBackend
      .expectGET(baseUrl + 'labels/?query=labelquery&limit=1&start=2')
      .respond(JSON.stringify(response));
    service
      .findLabels(query, 1, 2)
      .then(done);

    $httpBackend.flush();
  });


  it('should get a list of roles from the api', function (done) {
    var expectedRoles = {
      "itemsPerPage": 10,
      "member": [
        {
          "uuid": "3",
          "name": "test rol 3"
        },
        {
          "uuid": "1",
          "name": "test rol"
        },
        {
          "uuid": "2",
          "name": "test rol 2"
        }
      ],
      "totalItems": "3"
    };

    function assertRoles (rolesList) {
      expect(rolesList).toEqual(expectedRoles);
      done();
    }

    $httpBackend
      .expectGET(baseUrl + 'roles/?limit=30&start=0')
      .respond(JSON.stringify(expectedRoles));

    service
      .findRoles()
      .then(assertRoles);

    $httpBackend.flush();
  });

  it('should get a list of roles from the api', function (done) {
    var expectedRoles = {
      "itemsPerPage": 10,
      "member": [
        {
          "uuid": "3",
          "name": "test rol 3"
        },
        {
          "uuid": "1",
          "name": "test rol"
        },
        {
          "uuid": "2",
          "name": "test rol 2"
        }
      ],
      "totalItems": "3"
    };

    function assertRoles (rolesList) {
      expect(rolesList).toEqual(expectedRoles);
      done();
    }

    $httpBackend
      .expectGET(baseUrl + 'roles/?limit=12&query=joske&start=5')
      .respond(JSON.stringify(expectedRoles));

    service
      .findRoles('joske', 12, 5)
      .then(assertRoles);

    $httpBackend.flush();
  });

  it('should get the details of a role from the api', function (done) {
    var expectedRole = {
      'uuid': 1,
      'name': 'test role',
      'constraint': '',
      'permissions': [],
      'members': []
    };

    function assertRole (role) {
      expect(role).toEqual(expectedRole);
      done();
    }

    $httpBackend
      .expectGET(baseUrl + 'roles/1')
      .respond(JSON.stringify(expectedRole));

    service
      .getRoleById(1)
      .then(assertRole);

    $httpBackend.flush();
  });

  it('should get a list of roles from the api', function (done) {
    var expectedRoles = {
      "itemsPerPage": 10,
      "member": [
        {
          "uuid": "3",
          "name": "test rol 3"
        },
        {
          "uuid": "1",
          "name": "test rol"
        },
        {
          "uuid": "2",
          "name": "test rol 2"
        }
      ],
      "totalItems": "3"
    };

    function assertRoles (rolesList) {
      expect(rolesList).toEqual(expectedRoles);
      done();
    }

    $httpBackend
      .expectGET(baseUrl + 'roles/?limit=12&query=joske&start=5')
      .respond(JSON.stringify(expectedRoles));

    service
      .findRoles('joske', 12, 5)
      .then(assertRoles);

    $httpBackend.flush();
  });

  it('should get the details of a role from the api', function (done) {
    var expectedRole = {
      'uuid': 1,
      'name': 'test role',
      'constraint': '',
      'permissions': [],
      'members': []
    };

    function assertRole (role) {
      expect(role).toEqual(expectedRole);
      done();
    }

    $httpBackend
      .expectGET(baseUrl + 'roles/1')
      .respond(JSON.stringify(expectedRole));

    service
      .getRoleById(1)
      .then(assertRole);

    $httpBackend.flush();
  });

  it('should get the labels of a role', function (done) {
    var expectedLabels = [
      {
        "uuid": "3aad5023-84e2-4ba9-b1ce-201cee64504c",
        "name": "Bloso",
        "visibility": "visible",
        "privacy": "public",
        "parentUuid": "3aad5023-84e2-4ba9-b1ce-201cee64504c"
      }
    ];

    function assertLabels (labels) {
      expect(labels).toEqual(expectedLabels);
      done();
    }

    $httpBackend
      .expectGET(baseUrl + 'roles/1/labels/')
      .respond(JSON.stringify(expectedLabels));

    service
      .getRoleLabels(1)
      .then(assertLabels);

    $httpBackend.flush();
  });

  it('should add a label to a role', function (done) {
    var command = {
      "commandId": "8cdc13e62efaecb9d8c21d59a29b9de4"
    };

    function assertCommand (result) {
      expect(result).toEqual(command);
      done();
    }

    $httpBackend
      .expectPUT(baseUrl + 'roles/1/labels/2')
      .respond(JSON.stringify(command));

    service
      .addLabelToRole(1, 2)
      .then(assertCommand);

    $httpBackend.flush();
  });

  it('should create a role', function(done) {
    var expectedRoleId = {
      "roleId": "0823f57e-a6bd-450a-b4f5-8459b4b11043"
    };

    function assertRole(role) {
      expect(role).toEqual(expectedRoleId);
      done();
    }

    $httpBackend
      .expectPOST(baseUrl + 'roles/')
      .respond(JSON.stringify(expectedRoleId));

    service
      .createRole('nieuw rol')
      .then(assertRole);

    $httpBackend.flush();
  });

  it('should update the name of a given role', function(done) {
    var expectedCommandId = {
      "commandId": "8cdc13e62efaecb9d8c21d59a29b9de4"
    };

    var updateData = {
      'name': 'bazinga!'
    };

    function assertRole(role) {
      expect(role).toEqual(expectedCommandId);
      done();
    }

    $httpBackend
      .expectPATCH(baseUrl + 'roles/1', updateData)
      .respond(JSON.stringify(expectedCommandId));

    service
      .updateRoleName(1, 'bazinga!')
      .then(assertRole);

    $httpBackend.flush();
  });

  it('should add the constraint of a given role', function(done) {
    var expectedCommandId = {
      "commandId": "8cdc13e62efaecb9d8c21d59a29b9de4"
    };

    var updateData = {
      'query': 'bazinga!'
    };

    function assertRole(role) {
      expect(role).toEqual(expectedCommandId);
      done();
    }

    $httpBackend
        .expectPOST(baseUrl + 'roles/1/constraints/v2', updateData)
        .respond(JSON.stringify(expectedCommandId));

    service
        .createRoleConstraint(1, 'v2', 'bazinga!')
        .then(assertRole);

    $httpBackend.flush();
  });

  it('should update the constraint of a given role', function(done) {
    var expectedCommandId = {
      "commandId": "8cdc13e62efaecb9d8c21d59a29b9de4"
    };

    var updateData = {
      'query': 'bazinga!'
    };

    function assertRole(role) {
      expect(role).toEqual(expectedCommandId);
      done();
    }

    $httpBackend
      .expectPUT(baseUrl + 'roles/1/constraints/v2', updateData)
      .respond(JSON.stringify(expectedCommandId));

    service
      .updateRoleConstraint(1, 'v2', 'bazinga!')
      .then(assertRole);

    $httpBackend.flush();
  });

  it('should remove the constraint of a given role', function(done) {
    var expectedCommandId = {
      "commandId": "8cdc13e62efaecb9d8c21d59a29b9de4"
    };

    function assertRole(role) {
      expect(role).toEqual(expectedCommandId);
      done();
    }

    $httpBackend
        .expectDELETE(baseUrl + 'roles/1/constraints/v2')
        .respond(JSON.stringify(expectedCommandId));

    service
        .removeRoleConstraint(1, 'v2')
        .then(assertRole);

    $httpBackend.flush();
  });

  it('should get all the permissions', function(done) {
    var expectedPermissions = [
      {
        "key": "MANAGE_USERS",
        "name": "Gebruikers beheren"
      }
    ];

    function assertPermissions(permissions) {
      expect(permissions).toEqual(expectedPermissions);
      done();
    }

    $httpBackend
      .expectGET(baseUrl + 'permissions/')
      .respond(JSON.stringify(expectedPermissions));

    service
      .getPermissions()
      .then(assertPermissions);

    $httpBackend.flush();
  });

  it('should get the permissions for a given role', function(done) {
    var expectedPermissions = [
      {
        "key": "MANAGE_USERS",
        "name": "Gebruikers beheren"
      }
    ];

    function assertPermissions(permissions) {
      expect(permissions).toEqual(expectedPermissions);
      done();
    }

    $httpBackend
      .expectGET(baseUrl + 'roles/1/permissions/')
      .respond(JSON.stringify(expectedPermissions));

    service
      .getRolePermissions(1)
      .then(assertPermissions);

    $httpBackend.flush();
  });

  it('should get the users which are attached to a given role', function(done) {
    var expectedUsers = [
      {
        "uuid": "6f072ba8-c510-40ac-b387-51f582650e27",
        "email": "alberto@email.es",
        "username": "El Pistolero"
      }
    ];

    function assertUsers(users) {
      expect(users).toEqual(expectedUsers);
      done();
    }

    $httpBackend
      .expectGET(baseUrl + 'roles/1/users/')
      .respond(JSON.stringify(expectedUsers));

    service
      .getRoleUsers(1)
      .then(assertUsers);

    $httpBackend.flush();

  });

  it('should add a permission to a given role', function(done) {
    var expectedCommandId = {
      "commandId": "8cdc13e62efaecb9d8c21d59a29b9de4"
    };

    function assertPermission(permission) {
      expect(permission).toEqual(expectedCommandId);
      done();
    }

    $httpBackend
      .expectPUT(baseUrl + 'roles/1/permissions/AANBOD_INVOEREN')
      .respond(JSON.stringify(expectedCommandId));

    service
      .addPermissionToRole('AANBOD_INVOEREN',1)
      .then(assertPermission);

    $httpBackend.flush();
  });

  it('should remove a permission from a given role', function(done) {
    var expectedCommandId = {
      "commandId": "8cdc13e62efaecb9d8c21d59a29b9de4"
    };

    function assertPermission(permission) {
      expect(permission).toEqual(expectedCommandId);
      done();
    }

    $httpBackend
      .expectDELETE(baseUrl + 'roles/1/permissions/AANBOD_INVOEREN')
      .respond(JSON.stringify(expectedCommandId));

    service
      .removePermissionFromRole('AANBOD_INVOEREN',1)
      .then(assertPermission);

    $httpBackend.flush();
  });

  it('should add a user to a given role', function(done) {
    var expectedCommandId = {
      "commandId": "8cdc13e62efaecb9d8c21d59a29b9de4"
    };

    function assertUser(user) {
      expect(user).toEqual(expectedCommandId);
      done();
    }

    $httpBackend
      .expectPUT(baseUrl + 'roles/1/users/2')
      .respond(JSON.stringify(expectedCommandId));

    service
      .addUserToRole(2,1)
      .then(assertUser);

    $httpBackend.flush();
  });

  it('should find a list of users for a given query', function(done) {
    var expectedUsers = {
      "itemsPerPage": 30,
      "totalItems": 3562,
      "member": [
        {
          "uuid": "6f072ba8-c510-40ac-b387-51f582650e27",
          "email": "alberto@email.es",
          "username": "El Pistolero"
        }
      ]
    };

    function assertUsers(users) {
      expect(users).toEqual(expectedUsers);
      done();
    }

    $httpBackend
      .expectGET(baseUrl + 'users/?limit=30&email=dirk&start=0')
      .respond(JSON.stringify(expectedUsers));

    service
      .findUsersByEmail('dirk',30,0)
      .then(assertUsers);

    $httpBackend.flush();
  });

  it('should retrieve a user through an emailaddress', function(done) {
    var expectedUser = {
      "uuid": "6f072ba8-c510-40ac-b387-51f582650e27",
      "email": "alberto@email.es",
      "username": "El Pistolero"
    };

    function assertUser(user) {
      expect(user).toEqual(expectedUser);
      done();
    }

    $httpBackend
      .expectGET(baseUrl + 'users/emails/alberto@email.es')
      .respond(JSON.stringify(expectedUser));

    service
      .findUserWithEmail('alberto@email.es')
      .then(assertUser);

    $httpBackend.flush();
  });

  it('should remove role', function () {
    $httpBackend
      .expectDELETE(baseUrl + 'roles/blub')
      .respond();

    service
      .removeRole('blub');

    $httpBackend.flush();
  });

  it('should fail when the remove role fails', function (done) {
    var expectedResponse = {
      type: new URL(baseUrl + 'problem'),
      title: 'Something went wrong.',
      detail: 'We failed to perform the requested action!',
      status: 400
    };

    function assertFailure (response) {
      expect(response).toEqual(expectedResponse);
      done();
    }

    $httpBackend
      .expectDELETE(baseUrl + 'roles/blub')
      .respond(400, '');

    service
      .removeRole('blub')
      .then(function(){}, assertFailure);

    $httpBackend.flush();
  });

  it('should return the error data when a call remove role fails', function (done) {
    var expectedResponse = {
      type: new URL(baseUrl + 'problem'),
      title: 'Something went wrong.',
      detail: 'Squash one bug, run the tests and 99 more bugs to fix.',
      status: 400
    };

    function assertFailure (response) {
      expect(response).toEqual(expectedResponse);
      done();
    }

    $httpBackend
      .expectDELETE(baseUrl + 'roles/blub')
      .respond(400, JSON.stringify({
        type: baseUrl + 'problem',
        title: 'Something went wrong.',
        detail: 'Squash one bug, run the tests and 99 more bugs to fix.',
        status: 400
    }));

    service
      .removeRole('blub')
      .then(function(){}, assertFailure);

    $httpBackend.flush();
  });

  it('should remove a label from a given role', function() {
    $httpBackend
      .expectDELETE(baseUrl + 'roles/uuid1-role/labels/uuid2-label')
      .respond();

    service
      .removeLabelFromRole('uuid1-role', 'uuid2-label');

    $httpBackend.flush();
  });

  it('should remove a user from a given role', function(done) {
    var expectedCommandId = {
      "commandId": "8cdc13e62efaecb9d8c21d59a29b9de4"
    };

    function assertCommand(command) {
      expect(command).toEqual(expectedCommandId);
      done();
    }

    $httpBackend
      .expectDELETE(baseUrl + 'roles/uuid1-role/users/uuid2-user')
      .respond(JSON.stringify(expectedCommandId));

    service
      .removeUserFromRole('uuid1-role', 'uuid2-user')
      .then(assertCommand);

    $httpBackend.flush();
  });

  it('should approve an offer', function(done) {
    var offerUrl = 'http//www.example.com/event/blub';
    var expectedCommandId = {
      "commandId": "8cdc13e62efaecb9d8c21d59a29b9de4"
    };
    var headers = {
      'Content-Type': 'application/ld+json;domain-model=Approve',
      "Authorization":"Bearer undefined",
      "X-Api-Key":"secret api key",
      "Accept":"application/json, text/plain, */*"
    };

    function assertCommand(command) {
      expect(command).toEqual(expectedCommandId);
      done();
    }

    $httpBackend
      .expect('PATCH', offerUrl, {}, headers, {})
      .respond(JSON.stringify(expectedCommandId));

    service
      .patchOffer(offerUrl, 'Approve')
      .then(assertCommand);

    $httpBackend.flush();
  });

  it('should reject an offer with reason', function(done) {
    var offerUrl = 'http//www.example.com/event/blub';
    var expectedCommandId = {
      "commandId": "8cdc13e62efaecb9d8c21d59a29b9de4"
    };
    var headers = {
      'Content-Type': 'application/ld+json;domain-model=Reject',
      "Authorization":"Bearer undefined",
      "X-Api-Key":"secret api key",
      "Accept":"application/json, text/plain, */*"
    };

    function assertCommand(command) {
      expect(command).toEqual(expectedCommandId);
      done();
    }

    $httpBackend
      .expect('PATCH', offerUrl, {reason:'aint got no time for this'}, headers, {})
      .respond(JSON.stringify(expectedCommandId));

    service
      .patchOffer(offerUrl, 'Reject', 'aint got no time for this')
      .then(assertCommand);

    $httpBackend.flush();
  });

  it('should fetch the roles of the current user', function(done) {
    var url = 'http://foo.bar/user/roles/';
    var expectedRoles = [
      {
        "uuid": "3aad5023-84e2-4ba9-b1ce-201cee64504c",
        "name": "Beheerder west-vlaanderen",
        "constraint": "city:leuven",
        "permissions": [
          "GEBRUIKERS_BEHEREN"
        ]
      }
    ];

    function assertRoles(roles) {
      expect(roles).toEqual(expectedRoles);
      done();
    }

    $httpBackend
      .expect('GET', url)
      .respond(JSON.stringify(expectedRoles));

    service
      .getMyRoles()
      .then(assertRoles);

    $httpBackend.flush();
  });

  it('should PUT the audience data when the audience type for an event is set', function () {
    var eventLocation = 'http://du.de/event/1da2bb3c-616f-4e89-9b17-f142413046d2';
    var expectedUrl = 'http://du.de/event/1da2bb3c-616f-4e89-9b17-f142413046d2/audience';

    $httpBackend
      .expect('PUT', expectedUrl)
      .respond({ audienceType: 'education'});

    service.setAudienceType(eventLocation, 'education');
    $httpBackend.flush();
  });

  it('should publish an offer by patching with the right content-type', function () {
    var offerLocation = 'http://du.de/event/1da2bb3c-616f-4e89-9b17-f142413046d2',
        expectedData = {},
        expectedHeaders = _.assign(setUpAuthorizedHeaders(), {
          'Content-Type': 'application/ld+json;domain-model=Publish'
        }),
        commandInfo= {
          commandId: '5f19a97e-ea7f-4bbb-9fcf-5eb52b5f2512'
        };

    $httpBackend
      .expect('PATCH', offerLocation, expectedData, expectedHeaders)
      .respond(JSON.stringify(commandInfo));

    service.publishOffer(offerLocation);

    $httpBackend.flush();
  });

  it('should pass along a publication date when publishing on a future date', function () {
    var offerLocation = 'http://du.de/event/1da2bb3c-616f-4e89-9b17-f142413046d2',
        expectedData = {
          publicationDate: '2013-03-01T00:00:00.000Z'
        },
        expectedHeaders = _.assign(setUpAuthorizedHeaders(), {
          'Content-Type': 'application/ld+json;domain-model=Publish'
        }),
        commandInfo= {
          commandId: '5f19a97e-ea7f-4bbb-9fcf-5eb52b5f2512'
        },
        publicationDate = new Date('2013-03-01T00:00:00Z');

    $httpBackend
      .expect('PATCH', offerLocation, expectedData, expectedHeaders)
      .respond(JSON.stringify(commandInfo));

    service.publishOffer(offerLocation, publicationDate);

    $httpBackend.flush();
  });
});
