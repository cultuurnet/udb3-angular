'use strict';

describe('Service: UDB3 Api', function () {

  var $httpBackend, $scope, service, uitidAuth;
  var baseUrl = 'http://foo.bar/';

  beforeEach(module('udb.core', function ($provide) {
    var appConfig = {
      baseUrl: baseUrl
    };
    uitidAuth = jasmine.createSpyObj('uitidAuth', ['getUser', 'getToken']);

    $provide.constant('appConfig', appConfig);
    $provide.provider('uitidAuth', {
      $get: function () {
        return uitidAuth;
      }
    });
  }));

  beforeEach(inject(function (_$httpBackend_, udbApi, $rootScope) {
    $httpBackend = _$httpBackend_;
    service = udbApi;
    $scope = $rootScope.$new();
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
});