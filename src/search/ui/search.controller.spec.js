'use strict';

describe('Controller: Search', function() {
  var $scope,
    $window,
    udbApi,
    $controller,
    offerLabeller = null,
    $location,
    $q,
    $uibModal,
    searchHelper;

  beforeEach(module('udb.core', function ($translateProvider) {
    $translateProvider.translations('en', {
      'EVENT-EXPORT': {
        'QUERY-IS-MISSING': 'An export is only possible after you have launched a search query'
      }
    });

    $translateProvider.preferredLanguage('en');

  }));

  beforeEach(module('udb.search'));

  beforeEach(inject(function($rootScope, _$controller_, _$q_, _searchHelper_) {
    $controller = _$controller_;
    $scope = $rootScope.$new();
    $q = _$q_;
    searchHelper = _searchHelper_;
  }));

  beforeEach(function () {
    $window = {
      alert: jasmine.createSpy('alert')
    };
    udbApi = jasmine.createSpyObj('udbApi', ['findEvents', 'getEventById', 'exportEvents']);
    udbApi.findEvents.and.returnValue($q.reject('nope'));

    $location = jasmine.createSpyObj('$location', ['search']);
    $location.search.and.returnValue({});

    $uibModal = jasmine.createSpyObj('$uibModal', ['open']);
  });

  function getController() {
    return $controller(
      'Search', {
        $scope: $scope,
        $window: $window,
        udbApi: udbApi,
        offerLabeller: offerLabeller,
        $location: $location,
        searchHelper: searchHelper,
        $uibModal: $uibModal
      }
    );
  }

  it('alerts if there is no query when trying to export events', function() {
    getController();

    var place = {
      '@id':'http://culudb-silex.dev:8080/place/3aad5023-84e2-4ba9-b1ce-201cee64504c',
      '@type':'Place'
    };
    var event = {
      '@id':'http://culudb-silex.dev:8080/event/35560d45-984c-47f2-b392-f40c2b8f9b45',
      '@type':'Event'
    };


    $scope.resultViewer.selectedOffers = [event, place];
    $scope.exportEvents();

    // Explicitly start the digest cycle in order to let $translate's promises resolve.
    $scope.$digest();

    expect($window.alert).toHaveBeenCalledWith('An export is only possible after you have launched a search query');
  });

  it('should provide the exporter with a list of event URLs when exporting a selection', inject(function (eventExporter) {
    getController();

    var place = {
      '@id':'http://culudb-silex.dev:8080/place/3aad5023-84e2-4ba9-b1ce-201cee64504c',
      '@type':'Place'
    };
    var event = {
      '@id':'http://culudb-silex.dev:8080/event/35560d45-984c-47f2-b392-f40c2b8f9b45',
      '@type':'Event'
    };
    
    searchHelper.setQueryString('city:"Brussel"');
    $scope.resultViewer.selectedOffers = [event, place];

    $scope.exportEvents();

    // Explicitly start the digest cycle in order to let $translate's promises resolve.
    $scope.$digest();
    expect(eventExporter.activeExport.selection).toEqual([
      '35560d45-984c-47f2-b392-f40c2b8f9b45'
    ]);
  }));

  it('should silence the initial pageChanged call because ui bootstrap pagination is f*cked', function () {
    $location.search.and.returnValue({page: 5});
    var controller = getController();

    $scope.currentPage = 1;
    $scope.pageChanged();

    expect($scope.currentPage).toEqual(5);
  });

  it('should load initial query parameters from the URI params', function () {
    $location.search.and.returnValue({query: 'city:"Brussel"', page: 5});
    spyOn(searchHelper, 'setQueryString').and.callThrough();

    var controller = getController();

    expect(searchHelper.setQueryString).toHaveBeenCalledWith('city:"Brussel"');
    expect($scope.activeQuery.queryString).toEqual('city:"Brussel"');
  });

  it('should initialize with an existing query set on the search helper', function () {
    searchHelper.setQueryString('city:"Brussel"');

    var controller = getController();

    expect($scope.activeQuery.queryString).toEqual('city:"Brussel"');
  });

  it('should use the params in the URI even when there is an existing query set on the search helper', function () {
    searchHelper.setQueryString('city:"Brussel"');
    $location.search.and.returnValue({query: 'city:"Leuven"', page: 5});

    var controller = getController();

    expect($scope.activeQuery.queryString).toEqual('city:"Leuven"');
  });


  it('should initialize with an empty search when there is no existing query or query params', function () {
    var controller = getController();

    expect($scope.activeQuery.queryString).toEqual('');
  });
});
