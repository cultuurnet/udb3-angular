'use strict';

describe('Service: User Manager', function () {
  var udbApi, service, $scope, $q;

  var baseUrl = 'http://example.com/';

  beforeEach(module('udb.core', function ($provide) {
    var appConfig = {
      baseUrl: baseUrl
    };

    $provide.constant('appConfig', appConfig);

    udbApi = jasmine.createSpyObj('udbApi', [
      'findUsers',
      'findUserWithEmail'
    ]);

    $provide.provider('udbApi', {
      $get: function () {
        return udbApi;
      }
    });

  }));

  beforeEach(inject(function (UserManager, $rootScope, _$q_) {
    service = UserManager;
    $scope = $rootScope.$new();
    $q = _$q_;
  }));

  it('should return a list of users for a given query', function (done) {
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
    udbApi.findUsers.and.returnValue($q.resolve(expectedUsers));

    function assertUsers (users) {
      expect(users).toEqual(expectedUsers);
      done();
    }

    service
      .find('test', 30, 0)
      .then(assertUsers);

    $scope.$apply();
  });

  it('should return a user for a given e-mail address', function(done) {
    var expectedUser = {
      "uuid": "6f072ba8-c510-40ac-b387-51f582650e27",
      "email": "alberto@email.es",
      "username": "El Pistolero"
    };
    udbApi.findUserWithEmail.and.returnValue($q.resolve(expectedUser));

    function assertUser(user) {
      expect(user).toEqual(expectedUser);
      done();
    }

    service
      .findUserWithEmail('alberto@email.es')
      .then(assertUser);

    $scope.$apply();
  });

});