'use strict';

describe('Directive: Search Bar', function () {

  var searchBar, $rootScope, $scope, savedSearchesService, searchHelper;

  beforeEach(module('udb.search'));
  beforeEach(module('udb.templates'));

  beforeEach(inject(function (_$rootScope_, $compile, _savedSearchesService_, $q, _searchHelper_){
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    savedSearchesService = _savedSearchesService_;
    searchHelper = _searchHelper_;

    spyOn(savedSearchesService, 'getSavedSearches').and.returnValue($q.resolve([]));

    $rootScope.queryString = 'city:leuven';
    $compile('<udb-search-bar></udb-search-bar>')($scope);
    $scope.$digest();

    searchBar = $scope.sb;
  }));

  it('should update the search bar when finding results for a given query string', function () {
    spyOn(searchBar, 'queryChanged');
    spyOn(searchHelper, 'setQueryString');

    searchBar.find('foo:bar');

    expect(searchHelper.setQueryString).toHaveBeenCalledWith('foo:bar');
    expect(searchBar.queryString).toEqual('foo:bar');
  });

  it('should use the query active on the search bar when triggering a find without parameters', function () {
    spyOn(searchBar, 'queryChanged');
    spyOn(searchHelper, 'setQueryString');
    searchBar.queryString = 'beep:boop';

    searchBar.find();

    expect(searchHelper.setQueryString).toHaveBeenCalledWith('beep:boop');
    expect(searchBar.queryString).toEqual('beep:boop');
  });

  it('should clear the editor when the search query is changed manually', function () {
    spyOn(searchHelper, 'clearQueryTree');

    searchBar.queryChanged();

    expect(searchHelper.clearQueryTree).toHaveBeenCalled();
  });

  it('should notify other components when a search is submitted', function () {
    spyOn($rootScope, '$emit');

    searchBar.find();

    expect($rootScope.$emit).toHaveBeenCalledWith('searchSubmitted');
  });

  it('should update the query string and errors when a query is changed from another component', function () {
    searchBar.updateQuery({}, {
      queryString: 'beep:boop',
      errors: [
        'beep is not a valid query field',
        'I don\'t like where this is going'
      ]
    });

    expect(searchBar.queryString).toEqual('beep:boop');
    expect(searchBar.hasErrors).toEqual(true);
    expect(searchBar.errors).toEqual(['beep is not a valid query field', 'I don\'t like where this is going']);
  });

  it('should reset query errors when updating with a valid query', function () {
    searchBar.updateQuery({}, {
      queryString: 'beep:boop',
      errors: []
    });

    expect(searchBar.queryString).toEqual('beep:boop');
    expect(searchBar.hasErrors).toEqual(false);
    expect(searchBar.errors).toEqual([]);
  });
});
