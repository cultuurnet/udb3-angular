'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:RolesListController
 * @description
 * # RolesListController
 */
angular
  .module('udb.management.roles')
  .controller('RolesListController', RolesListController);

/* @ngInject */
function RolesListController(SearchResultGenerator, rx, $scope, RoleManager) {
  var rlc = this;
  var itemsPerPage = 10;
  var minQueryLength = 3;
  var query$ = rx.createObservableFunction(rlc, 'queryChanged');
  var filteredQuery$ = query$.filter(ignoreShortQueries);
  var page$ = rx.createObservableFunction(rlc, 'pageChanged');
  var searchResultGenerator = new SearchResultGenerator(RoleManager, filteredQuery$, page$, itemsPerPage);
  var searchResult$ = searchResultGenerator.getSearchResult$();

  /**
   * @param {string} query
   * @return {boolean}
   */
  function ignoreShortQueries(query) {
    return query.length >= minQueryLength;
  }

  /**
   * @param {PagedCollection} searchResult
   */
  function showSearchResult(searchResult) {
    rlc.searchResult = searchResult;
    rlc.loading = false;
  }

  rlc.loading = false;
  rlc.query = '';
  rlc.page = 0;
  rlc.minQueryLength = minQueryLength;

  query$
    .safeApply($scope, function (query) {
      rlc.query = query;
    })
    .subscribe();

  searchResult$
    .safeApply($scope, showSearchResult)
    .subscribe();

  filteredQuery$
    .merge(page$)
    .safeApply($scope, function () {
      rlc.loading = true;
    })
    .subscribe();
}
