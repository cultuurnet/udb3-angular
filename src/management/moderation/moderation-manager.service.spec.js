'use strict';

describe('Service: Moderation Manager', function () {
  var udbApi, $q, service, $scope;

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

  beforeEach(module('udb.core', function ($provide) {
    var appConfig = {
      baseUrl: baseUrl
    };

    $provide.constant('appConfig', appConfig);

    udbApi = jasmine.createSpyObj('udbApi', [
      'getMe',
      'getUserRoles',
      'findEvents'
    ]);
    $provide.provider('udbApi', {
      $get: function () {
        return udbApi;
      }
    });
  }));

  beforeEach(inject(function (ModerationManager, $rootScope, _$q_) {
    service = ModerationManager;
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
    udbApi.findEvents.and.returnValue($q.resolve(events));

    function assertResultset (result) {
      expect(udbApi.findEvents).toHaveBeenCalledWith('city:leuven AND wfstatus="readyforvalidation"', 0);
      expect(result).toEqual(events);
      done();
    }

    service
      .findModerationItems('city:leuven', 0)
      .then(assertResultset);

    $scope.$apply();
  });

  it('should fetch all readyforvalidation offers when an empty constraint is given', function (done) {
    udbApi.findEvents.and.returnValue($q.resolve(events));

    function assertResultset (result) {
      expect(udbApi.findEvents).toHaveBeenCalledWith('wfstatus="readyforvalidation"', 0);
      expect(result).toEqual(events);
      done();
    }

    service
      .findModerationItems('', 0)
      .then(assertResultset);

    $scope.$apply();
  });
});
