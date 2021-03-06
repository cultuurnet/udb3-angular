'use strict';

describe('Controller: Roles List', function() {
  var $scope,
    $rootScope,
    $q,
    $controller,
    searchResultGenerator,
    RoleManager,
    $uibModal,
    $state;

  var pagedSearchResult = {
    '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
    '@type': 'PagedCollection',
    'itemsPerPage': 50,
    'totalItems': 19,
    'member': [
      {id: '5B44E8FC-6836-4A18-A442-1FEA4D6B7979', name: 'dirk'},
      {id: '6DC53D5A-B37B-4B7C-9794-07DCAD38B839', name: 'danny'}
    ],
    'firstPage': 'http://culudb-silex.dev:8080/dashboard/items?page=1',
    'lastPage': 'http://culudb-silex.dev:8080/dashboard/items?page=1',
    'nextPage': 'http://culudb-silex.dev:8080/dashboard/items?page=1'
  };


  beforeEach(module('udb.management'));
  beforeEach(module('udb.management.roles'));

  beforeEach(inject(function(_$rootScope_, _$q_, _$controller_, _SearchResultGenerator_) {
    $controller = _$controller_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    searchResultGenerator = _SearchResultGenerator_;
    RoleManager = jasmine.createSpyObj('RoleManager', ['find']);
    $uibModal = jasmine.createSpyObj('$uibModal', ['open']);
    $state = jasmine.createSpyObj('$state', ['reload']);
  }));

  function getRolesListController() {
    return $controller(
      'RolesListController', {
        SearchResultGenerator: searchResultGenerator,
        $scope: $scope,
        RoleManager: RoleManager,
        $uibModal: $uibModal,
        $state: $state
      }
    );
  }

  it('should set the right loading states when looking for items', function(done) {
    var deferredSearchResult = $q.defer();
    var searchResult$ = Rx.Observable.fromPromise(deferredSearchResult.promise);
    spyOn(searchResultGenerator.prototype, 'getSearchResult$').and.returnValue(searchResult$);
    var controller = getRolesListController();

    function assertLoadingEnded() {
      expect(controller.loading).toEqual(false);
      sub.dispose();
      done();
    }

    // The controller should not look for items when it loads
    expect(controller.loading).toEqual(false);

    // When the query changes the controller start looking for items
    controller.queryChanged('dirk');
    expect(controller.loading).toEqual(true);

    // The items should load after the search result arrives
    deferredSearchResult.resolve(pagedSearchResult);
    $scope.$digest();

    var sub = searchResult$.subscribe(assertLoadingEnded);
  });

  it('should not search for items when the query is less then 3 characters', function() {
    var deferredSearchResult = $q.defer();
    var searchResult$ = Rx.Observable.fromPromise(deferredSearchResult.promise);
    spyOn(searchResultGenerator.prototype, 'getSearchResult$').and.returnValue(searchResult$);
    var controller = getRolesListController();

    expect(controller.loading).toEqual(false);

    controller.queryChanged('');
    expect(controller.loading).toEqual(true);
  });

  it('should call update search result viewer after delete modal close', function () {
    var deferredSearchResult = $q.defer();
    var searchResult$ = Rx.Observable.fromPromise(deferredSearchResult.promise);
    spyOn(searchResultGenerator.prototype, 'getSearchResult$').and.returnValue(searchResult$);

    var rlc = getRolesListController();

    RoleManager.find.and.returnValue($q.resolve(pagedSearchResult));
    var job = { task: { promise: $q.resolve() }};
    $uibModal.open.and.returnValue({ result: $q.resolve(job) });

    rlc.openDeleteConfirmModal({id: 'blub', name: 'blub'});
    $scope.$digest();

    expect($state.reload).toHaveBeenCalled();
  });
});
