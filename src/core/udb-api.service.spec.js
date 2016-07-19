'use strict';

describe('Service: UDB3 Api', function () {

  var $httpBackend, $scope, service, uitidAuth;
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


});
