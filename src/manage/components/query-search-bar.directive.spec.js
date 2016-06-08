'use strict';

describe('Directive: Query Search Bar', function () {

  var searchBar, $rootScope, $scope;

  beforeEach(module('udb.manage'));
  beforeEach(module('udb.templates'));

  beforeEach(inject(function (_$rootScope_, $compile){
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();

    $rootScope.queryString = 'info';
    $compile('<udb-query-search-bar></udb-query-search-bar>')($scope);
    $scope.$digest();

    searchBar = $scope.qsb;
  }));

  it('should fire an emit when finding results for a given query string', function () {
    spyOn($rootScope, '$emit');

    searchBar.find('foo:bar');

    expect(searchBar.queryString).toEqual('foo:bar');
    expect($rootScope.$emit).toHaveBeenCalledWith('querySearchSubmitted', {query: 'foo:bar'});
  });
});