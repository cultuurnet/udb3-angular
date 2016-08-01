'use strict';

describe('Service: UDB3 Api', function () {

  var $httpBackend, $scope, service, uitidAuth, offerCache;
  var baseUrl = 'http://foo.bar/';

  beforeEach(module('udb.core', function ($provide) {
    var appConfig = {
      baseUrl: baseUrl,
      baseApiUrl: baseUrl
    };

    uitidAuth = jasmine.createSpyObj('uitidAuth', ['getUser', 'getToken']);

    $provide.constant('appConfig', appConfig);
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

  it('should only return the essential data when getting the currently logged in user', function (done) {
    var jsonUserResponse = {
      'id': 2,
      'preferredLanguage': null,
      'nick': 'foo',
      'password': null,
      'givenName': 'Dirk',
      'familyName': null,
      'mbox': 'foo@bar.com',
      'mboxVerified': null,
      'gender': null,
      'hasChildren': null,
      'dob': null,
      'depiction': null,
      'bio': null,
      'street': null,
      'zip': null,
      'city': null,
      'country': null,
      'lifestyleProfile': null,
      'homeLocation': null,
      'currentLocation': null,
      'status': null,
      'points': null,
      'openid': null,
      'calendarId': null,
      'holdsAccount': null,
      'privacyConfig': null,
      'pageMemberships': null,
      'adminPagesCount': 0
    };
    var userUrl = baseUrl + 'user';
    var expectedUser = {
      id: 2,
      nick: 'foo',
      mbox: 'foo@bar.com',
      givenName: 'Dirk'
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
      .expectPOST(baseUrl + 'saved-searches/', {
        name: 'saved-search-name',
        query: 'saved-search-query'
      })
      .respond(JSON.stringify(response));
    service
      .createSavedSearch('saved-search-name', 'saved-search-query')
      .then(done);

    $httpBackend.flush();
  });

  // getSavedSearches
  it('should get saved searches from the api', function (done) {
    var response = {};
    $httpBackend
      .expectGET(baseUrl + 'saved-searches/')
      .respond(JSON.stringify(response));
    service
      .getSavedSearches()
      .then(done);

    $httpBackend.flush();
  });

  // deleteSavedSearch
  it('should delete saved searches from the api', function (done) {
    var response = {};
    $httpBackend
      .expectDELETE(baseUrl + 'saved-searches/searchid')
      .respond(JSON.stringify(response));
    service
      .deleteSavedSearch('searchid')
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
    $httpBackend
      .expectGET(offerLocation)
      .respond(JSON.stringify(response));
    service
      .getOffer(offerLocation)
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
      .expectGET(baseUrl + 'organizer/' + organizerId)
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
      .expectGET(baseUrl + 'organizer/' + organizerId)
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
    var expectedHeaders = {
      'Content-Type': 'application/ld+json;domain-model=RenameRole',
      'Authorization': 'Bearer bob',
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
      .expectPATCH(baseUrl + 'roles/roleid', expectedData, expectedHeaders)
      .respond(JSON.stringify({}));

    service
      .updateRoleName('roleid', 'newname')
      .then(done);
    $httpBackend.flush();
  });

  // updateRoleConstraint
  it('should update the constraint trough the api', function (done) {
    var expectedData = {
      'constraint': 'newconstraint'
    };
    var expectedHeaders = {
      'Content-Type': 'application/ld+json;domain-model=SetConstraint',
      'Authorization': 'Bearer bob',
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
      .expectPATCH(baseUrl + 'roles/roleid', expectedData, expectedHeaders)
      .respond(JSON.stringify({}));

    service
      .updateRoleConstraint('roleid', 'newconstraint')
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

  // getRecentLabels
  it('should get the users recent labels from the api', function (done) {
    var response = {};
    $httpBackend
      .expectGET(baseUrl + 'user/labels')
      .respond(JSON.stringify(response));
    service
      .getRecentLabels()
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

  it('should update the constraint of a given role', function(done) {
    var expectedCommandId = {
      "commandId": "8cdc13e62efaecb9d8c21d59a29b9de4"
    };

    var updateData = {
      'constraint': 'bazinga!'
    };

    function assertRole(role) {
      expect(role).toEqual(expectedCommandId);
      done();
    }

    $httpBackend
      .expectPATCH(baseUrl + 'roles/1', updateData)
      .respond(JSON.stringify(expectedCommandId));

    service
      .updateRoleConstraint(1, 'bazinga!')
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
      .expectGET(baseUrl + 'users/?limit=30&query=test&start=0')
      .respond(JSON.stringify(expectedUsers));

    service
      .findUsers('test',30,0)
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

  it('should return the job data or remove role', function (done) {
    var expectedJob = {
      "commandId": "8cdc13e62efaecb9d8c21d59a29b9de4"
    };

    function assertJob (jobinfo) {
      expect(jobinfo).toEqual(expectedJob);
      done();
    }

    $httpBackend
      .expectDELETE(baseUrl + 'roles/blub')
      .respond(JSON.stringify(expectedJob));

    service
      .removeRole('blub')
      .then(assertJob);

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
});
