'use strict';

describe('Controller: Moderation List', function() {
  var
    $q,
    $scope,
    $controller,
    moderationService,
    $uibModal,
    searchResultGenerator,
    deferredSearchResult,
    searchResult$;

  var roles = [
    {
      "uuid": "3aad5023-84e2-4ba9-b1ce-201cee64504c",
      "name": "Moderator Leuven",
      "constraints": {
        "v3": "city:leuven"
      },
      "permissions": [
        "AANBOD_MODEREREN"
      ]
    },
    {
      "uuid": "3aad5023-84e2-4ba9-b1ce-201cee64505d",
      "name": "Beheerder Leuven",
      "constraints": {
        "v3": "city:leuven"
      },
      "permissions": [
        "GEBRUIKERS_BEHEREN"
      ]
    }
  ];

  beforeEach(module('udb.management'));
  beforeEach(module('udb.management.moderation', function ($provide) {
      var appConfig = {
          roleConstraintsMode: 'v3'
      };

      $provide.constant('appConfig', appConfig);
  }));

  beforeEach(inject(function($rootScope, _$q_, _$controller_, _SearchResultGenerator_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = $rootScope.$new();
    searchResultGenerator = _SearchResultGenerator_;

    moderationService = jasmine.createSpyObj('ModerationService', ['getMyRoles']);
    $uibModal = jasmine.createSpyObj('$uibModal', ['open']);

    deferredSearchResult = $q.defer();
    searchResult$ = Rx.Observable.fromPromise(deferredSearchResult.promise);
    spyOn(searchResultGenerator.prototype, 'getSearchResult$').and.returnValue(searchResult$);
  }));

  function getController() {
    return $controller(
      'ModerationListController', {
        ModerationService: moderationService,
        $uibModal: $uibModal,
        SearchResultGenerator: searchResultGenerator,
        $scope: $scope
      }
    );
  }

  it('should load the roles of the current user', function() {
    moderationService.getMyRoles.and.returnValue($q.resolve(roles));

    var moderator = getController();

    $scope.$digest();

    expect(moderationService.getMyRoles).toHaveBeenCalled();
    expect(moderator.roles).toEqual([{
      "uuid": "3aad5023-84e2-4ba9-b1ce-201cee64504c",
      "name": "Moderator Leuven",
      "constraints": {
        "v3": "city:leuven"
      },
      "permissions": [
        "AANBOD_MODEREREN"
      ]
    }]);
  });

  it('should set an error with detail on failure to load the roles of a user', function() {
    moderationService.getMyRoles.and.returnValue($q.reject({
      title:'What are you doing?',
      detail:'Detail'
    }));

    var moderator = getController();

    $scope.$digest();

    expect($uibModal.open).toHaveBeenCalled();
    expect(moderator.errorMessage).toEqual(
      'What are you doing? Detail'
    );
  });

  it('should notify the user when no roles with moderator right were found', function() {
    moderationService.getMyRoles.and.returnValue($q.resolve([
    {
      "uuid": "3aad5023-84e2-4ba9-b1ce-201cee64504c",
      "name": "Editor Leuven",
      "constraints": {
        "v3": "city:leuven"
      },
      "permissions": [
        "AANBOD_INVOEREN"
      ]
    },
    {
      "uuid": "3aad5023-84e2-4ba9-b1ce-201cee64505d",
      "name": "Beheerder Leuven",
      "constraints": {
        "v3": "city:leuven"
      },
      "permissions": [
        "GEBRUIKERS_BEHEREN"
      ]
    }
  ]));

    var moderator = getController();

    $scope.$digest();

    expect($uibModal.open).toHaveBeenCalled();
    expect(moderator.errorMessage).toEqual(
      'Er is huidig geen moderator rol gekoppeld aan jouw gebruiker.'
    );
    expect(moderator.selectedRole).toEqual({});
  });

  it('should find the moderation items of a role', function(done) {
    var pagedSearchResult = {
      "itemsPerPage": 30,
      "totalItems": 3562,
      "member": [
        {
          "@id": "http://culudb-silex.dev/event/0823f57e-a6bd-450a-b4f5-8459b4b11043",
          "@type": "Event"
        }
      ]
    };

    moderationService.getMyRoles.and.returnValue($q.resolve(roles));
    deferredSearchResult.resolve(pagedSearchResult);

    var moderator = getController();
    $scope.$digest();

    function assertSeachResults() {
      expect(moderator.loading).toEqual(false);
      expect(moderator.searchResult).toEqual(pagedSearchResult);
      sub.dispose();
      done();
    }
    var sub = searchResult$.subscribe(assertSeachResults);

    moderator
      .findModerationContent({uuid:'3aad5023-84e2-4ba9-b1ce-201cee64504c', constraints: {v3: 'city:leuven'}});

    $scope.$digest();
    expect(moderator.loading).toEqual(true);
  });

  xit('should show an error on faild moderation items search', function(done) {
    moderationService.getMyRoles.and.returnValue($q.resolve(roles));
    deferredSearchResult.reject({title:'Error 404', detail:'not found'});

    var moderator = getController();
    $scope.$digest();

    function assertLoadingEnded() {
      expect(moderator.loading).toEqual(false);
      expect(moderator.errorMessage).toEqual('Error 404 not found');
      sub.dispose();
      done();
    }
    var sub = searchResult$.subscribe(assertLoadingEnded);

    moderator
      .findModerationContent('3aad5023-84e2-4ba9-b1ce-201cee64504c');

    $scope.$digest();
    expect(moderator.loading).toEqual(true);
  });

});
