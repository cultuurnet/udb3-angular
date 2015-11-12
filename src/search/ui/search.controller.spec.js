'use strict';

describe('Controller: Search', function() {
  var $scope, $window, udbApi, $controller, eventLabeller = null, $location, $q, searchHelper;

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
    udbApi = jasmine.createSpyObj('udbApi', ['findEvents', 'getEventById']);
    udbApi.findEvents.and.returnValue($q.reject('nope'));

    $location = jasmine.createSpyObj('$location', ['search']);
    $location.search.and.returnValue({});
  });

  function getController() {
    return $controller(
      'Search', {
        $scope: $scope,
        $window: $window,
        udbApi: udbApi,
        eventLabeller: eventLabeller,
        $location: $location,
        searchHelper: searchHelper
      }
    );
  }

  it('alerts if there is no query when trying to export events', function() {
    getController();
    $scope.resultViewer.selectedIds = ['foo', 'bar'];
    $scope.exportEvents();

    // Explicitly start the digest cycle in order to let $translate's promises resolve.
    $scope.$digest();

    expect($window.alert).toHaveBeenCalledWith('An export is only possible after you have launched a search query');
  });

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
});
