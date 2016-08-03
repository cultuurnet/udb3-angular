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

  it('should remove a label from a given role', function(done) {
    var expectedCommandId = {
      "commandId": "8cdc13e62efaecb9d8c21d59a29b9de4"
    };

    function assertCommand(command) {
      expect(command).toEqual(expectedCommandId);
      done();
    }

    $httpBackend
      .expectDELETE(baseUrl + 'roles/uuid1-role/labels/uuid2-label')
      .respond(JSON.stringify(expectedCommandId));

    service
      .removeLabelFromRole('uuid1-role', 'uuid2-label')
      .then(assertCommand);

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
});