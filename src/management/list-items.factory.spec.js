'use strict';

describe('Factory: List Items', function () {
  var authorizationService, ModerationService, $q, $scope, managementListItems;

  var permissions = [
    'AANBOD_BEWERKEN',
    'AANBOD_MODEREREN',
    'AANBOD_VERWIJDEREN',
    'ORGANISATIES_BEHEREN'
  ];

  var roles = [
    {
      "uuid": "89cd17af-d72a-42ec-8897-6159a7a62a21",
      "name": "Bugsquashers Leuven",
      "permissions": [
        "AANBOD_BEWERKEN",
        "AANBOD_MODEREREN",
        "AANBOD_VERWIJDEREN"
      ],
      "constraint": "city:leuven"
    }
  ];

  var resultset = {
    "@context": "http://www.w3.org/ns/hydra/context.jsonld",
    "@type": "PagedCollection",
    "itemsPerPage": 10,
    "totalItems": 387380,
    "member": [
      {
        "@id": "https://udb-silex-test.uitdatabank.be/place/878453da-aa40-4cf6-bda5-cc59ca6bb215",
        "@type": "Place"
      },
      {
        "@id": "https://udb-silex-test.uitdatabank.be/event/6fbb8091-f353-4ac2-8813-fd55bdf5519b",
        "@type": "Event"
      },
      {
        "@id": "https://udb-silex-test.uitdatabank.be/place/53cd5d3f-82d4-49c2-96a9-57aefbf68153",
        "@type": "Place"
      },
      {
        "@id": "https://udb-silex-test.uitdatabank.be/place/3256ce1f-b8dd-4291-9cfe-037ebacb3184",
        "@type": "Place"
      },
      {
        "@id": "https://udb-silex-test.uitdatabank.be/event/e8fb3966-dd0c-4144-847c-9705f5a2debb",
        "@type": "Event"
      },
      {
        "@id": "https://udb-silex-test.uitdatabank.be/event/b0ff0ed0-0301-4c3e-98dc-2034d6035883",
        "@type": "Event"
      },
      {
        "@id": "https://udb-silex-test.uitdatabank.be/place/7ea6e13d-ca5d-4511-9756-8f5b596470ca",
        "@type": "Place"
      },
      {
        "@id": "https://udb-silex-test.uitdatabank.be/event/5355d81e-0ef7-4e5e-a8a5-59feedd22cd6",
        "@type": "Event"
      },
      {
        "@id": "https://udb-silex-test.uitdatabank.be/event/fb2cc53b-097f-41d2-a4c3-27e2bd58b57a",
        "@type": "Event"
      },
      {
        "@id": "https://udb-silex-test.uitdatabank.be/event/cfe6dc1b-db21-4e2d-b363-e385f019c5f4",
        "@type": "Event"
      }
    ]
  };

  beforeEach(module('udb.management'));

  beforeEach(function () {
    authorizationService = jasmine.createSpyObj('authorizationService', ['getPermissions']);
    ModerationService = jasmine.createSpyObj('ModerationService', ['getMyRoles', 'find']);

    module(function($provide) {
      $provide.value('authorizationService', authorizationService);
      $provide.value('ModerationService', ModerationService);
    });
  });

  it('should only show moderation with moderation count', function(done) {
    inject(function($injector, $rootScope, _$q_) {
      $q = _$q_;
      $scope = $rootScope.$new();

      authorizationService.getPermissions.and.returnValue($q.resolve(permissions));
      ModerationService.getMyRoles.and.returnValue($q.resolve(roles));
      ModerationService.find.and.returnValue($q.resolve(resultset));

      managementListItems = $injector.get('managementListItems');
    });

    function testServicesCalled(listItems) {
      expect(authorizationService.getPermissions).toHaveBeenCalled();
      expect(ModerationService.getMyRoles).toHaveBeenCalled();
      expect(ModerationService.find).toHaveBeenCalledWith('(city:leuven)', 10, 0);
      expect(listItems).toEqual([
        {
          name: 'Organisaties',
          permission: 'ORGANISATIES_BEHEREN',
          notificationCount: 0,
          index: 5,
          sref: 'split.manageOrganisations',
          icon: 'fa-slideshare'
        },
        {
          name: 'Valideren',
          permission: 'AANBOD_MODEREREN',
          notificationCount: 387380,
          index: 1,
          sref: 'management.moderation.list',
          icon: 'fa-flag'
        }
      ]);
      done();
    }

    managementListItems
      .then(testServicesCalled);
    $scope.$digest();
  });

  it('should not query for empty braces', function(done) {
    inject(function($injector, $rootScope, _$q_) {
      $q = _$q_;
      $scope = $rootScope.$new();

      authorizationService.getPermissions.and.returnValue($q.resolve(permissions));
      ModerationService.getMyRoles.and.returnValue($q.resolve([
        {
          "uuid": "89cd17af-d72a-42ec-8897-6159a7a62a21",
          "name": "Bugsquashers Leuven",
          "permissions": [
            "AANBOD_BEWERKEN",
            "AANBOD_MODEREREN",
            "AANBOD_VERWIJDEREN"
          ],
        }
      ]));
      ModerationService.find.and.returnValue($q.resolve(resultset));

      managementListItems = $injector.get('managementListItems');
    });

    function testServicesCalled(listItems) {
      expect(ModerationService.find).toHaveBeenCalledWith('', 10, 0);
      done();
    }

    managementListItems
      .then(testServicesCalled);
    $scope.$digest();
  });

  it('should handle an empty constraint amongst others', function(done) {
    inject(function($injector, $rootScope, _$q_) {
      $q = _$q_;
      $scope = $rootScope.$new();

      authorizationService.getPermissions.and.returnValue($q.resolve(permissions));
      ModerationService.getMyRoles.and.returnValue($q.resolve([
        {
          "uuid": "89cd17af-d72a-42ec-8897-6159a7a62a21",
          "name": "Bugsquashers Leuven",
          "permissions": [
            "AANBOD_BEWERKEN",
            "AANBOD_MODEREREN",
            "AANBOD_VERWIJDEREN"
          ],
          "constraint": "city:leuven"
        },
        {
          "uuid": "89cd17af-d72a-42ec-8897-6159a7a62a22",
          "name": "Testers",
          "permissions": [
            "AANBOD_BEWERKEN",
            "AANBOD_MODEREREN",
            "AANBOD_VERWIJDEREN"
          ]
        }
      ]));
      ModerationService.find.and.returnValue($q.resolve(resultset));

      managementListItems = $injector.get('managementListItems');
    });

    function testServicesCalled(listItems) {
      expect(ModerationService.find).toHaveBeenCalledWith('(city:leuven)', 10, 0);
      done();
    }

    managementListItems
      .then(testServicesCalled);
    $scope.$digest();
  });

  it('should show results even without a role attachted to my user', function(done) {
    inject(function($injector, $rootScope, _$q_) {
      $q = _$q_;
      $scope = $rootScope.$new();

      authorizationService.getPermissions.and.returnValue($q.resolve(permissions));
      ModerationService.getMyRoles.and.returnValue($q.resolve([]));

      managementListItems = $injector.get('managementListItems');
    });

    function testServicesCalled(listItems) {
      expect(listItems).toEqual([
        {
          name: 'Organisaties',
          permission: 'ORGANISATIES_BEHEREN',
          notificationCount: 0,
          index: 5,
          sref: 'split.manageOrganisations',
          icon: 'fa-slideshare'
        }
      ]);
      done();
    }

    managementListItems
      .then(testServicesCalled);
    $scope.$digest();
  });

});