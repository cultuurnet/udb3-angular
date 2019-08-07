'use strict';

describe('Service: savedSearchesService', function() {
  var $httpBackend;
  var savedSearchesService;
  var $rootScope;
  var udbApi;
  var $q;

  var baseUrl = 'http://example.com/';

  beforeEach(module('udb.core', function ($provide) {
    var appConfig = {
      baseUrl: baseUrl
    };

    $provide.constant('appConfig', appConfig);

    udbApi = jasmine.createSpyObj('udbApi', ['createSavedSearch', 'getSavedSearches', 'deleteSavedSearch']);

    $provide.provider('udbApi', {
      $get: function () {
        return udbApi;
      }
    });
  }));

  beforeEach(module('udb.saved-searches'));

  beforeEach(inject(function($injector) {
    // Set up the mock http service responses
    $httpBackend = $injector.get('$httpBackend');
    savedSearchesService = $injector.get('savedSearchesService');
    $rootScope = $injector.get('$rootScope');
    $q = $injector.get('$q');

    spyOn($rootScope, '$emit');
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('posts a JSON-encoded title & query to /saved-searches', function() {
    var newSavedSearch = {
      name: 'In Leuven',
      query: 'city:"Leuven"'
    };

    udbApi.createSavedSearch.and.returnValue($q.resolve());
    savedSearchesService.createSavedSearch('In Leuven', 'city:"Leuven"');

    $rootScope.$digest();
    expect($rootScope.$emit).toHaveBeenCalledWith('savedSearchesChanged', [newSavedSearch]);

    expect(udbApi.createSavedSearch).toHaveBeenCalledWith('In Leuven', 'city:"Leuven"');
  });

  it('gets a list of JSON-encoded saved searches', function () {
    var expectedSavedSearches = [
      {"id": "126", "name": "alles in Tienen", "query": "city:Tienen"},
      {"id": "127", "name": "alles in Leuven", "query": "city:leuven"}
    ];

    udbApi.getSavedSearches.and.returnValue($q.resolve(expectedSavedSearches));
    savedSearchesService.getSavedSearches().then(function (savedSearches) {
      expect(savedSearches).toEqual(expectedSavedSearches);
    });
  });

  it('requests to delete a saved search and receives a job', function () {
    var searchId = '1337';

    udbApi.deleteSavedSearch.and.returnValue($q.resolve());
    savedSearchesService.deleteSavedSearch(searchId);

    $rootScope.$digest();
    expect($rootScope.$emit).toHaveBeenCalledWith('savedSearchesChanged', []);
    expect(udbApi.deleteSavedSearch).toHaveBeenCalledWith(searchId);
  });
});
