'use strict';

describe('Controller: Search', function() {
  var $scope, $window, $location, $q, udbApi, $controller, eventLabeller = null, searchHelper = null, searchController;

  beforeEach(module('udb.core', function ($translateProvider) {
    $translateProvider.translations('en', {
      'EVENT-EXPORT': {
        'QUERY-IS-MISSING': 'An export is only possible after you have launched a search query'
      }
    });

    $translateProvider.preferredLanguage('en');

  }));

  beforeEach(module('udb.search'));

  beforeEach(inject(function($rootScope, _$controller_, $injector) {
    $controller = _$controller_;
    $scope = $rootScope.$new();
    searchHelper = $injector.get('searchHelper');
    $q = $injector.get('$q');
  }));

  beforeEach(function () {
    $window = {
      alert: jasmine.createSpy('alert')
    };
    $location = {
      search: jasmine.createSpy('search')
    };
    udbApi = jasmine.createSpyObj('udbApi', ['findEvents', 'getEventById']);
    searchController = $controller(
      'Search', {
        $scope: $scope,
        $window: $window,
        $location: $location,
        udbApi: udbApi,
        eventLabeller: eventLabeller,
        searchHelper: searchHelper
      }
    );
  });

  it('alerts if there is no query when trying to export events', function() {
    expect($scope.activeQuery).toEqual(false);
    $location.search.andReturn({'query': 'some: query', 'page': 0});

    $scope.resultViewer.selectedIds = ['foo', 'bar'];
    $scope.exportEvents();

    // Explicitly start the digest cycle in order to let $translate's promises
    // to be resolved.
    $scope.$digest();

    expect($window.alert).toHaveBeenCalledWith('An export is only possible after you have launched a search query');
  });

  describe('Location parameters', function () {

    beforeEach(function () {
      var deferredEvents = $q.defer();
      searchHelper.setQueryString('city: Leuven');
      udbApi.findEvents.andReturn(deferredEvents.promise);
    });

    it('adds additional search parameters to the current location', function () {
      searchHelper.setUnavailable(false);
      searchHelper.setPast(false);
      searchController.findEvents('city: Leuven');
      expect($location.search).toHaveBeenCalledWith(
        {
          query:'city: Leuven',
          page: '1',
          unavailable: 'false',
          past: 'false'
        }
      );
    });

    it('does not add parameters when they have the default value', function () {
      searchController.findEvents('city: Leuven');
      expect($location.search).toHaveBeenCalledWith(
        {
          query:'city: Leuven',
          page: '1'
        }
      );
    });

    it('adds location parameters to the search helper', function () {
      $location.search.andReturn(
        {
          query: 'city: Tienen',
          page: '2',
          unavailable: 'false',
          past: 'false'
        }
      );
      $scope.$digest();

      expect(searchHelper.getQuery().queryString).toBe('city: Tienen');
      expect(searchHelper.getUnavailable()).toBe(false);
      expect(searchHelper.getPast()).toBe(false);
    });
  });
});
