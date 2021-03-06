'use strict';

/**
 * @ngdoc service
 * @name udb.search.searchHelper
 * @description
 * # searchHelper
 * Service in the udb.search.
 */
angular
  .module('udb.search')
  .service('searchHelper', SearchHelper);

/* @ngInject */
function SearchHelper(LuceneQueryBuilder, $rootScope) {
  var query = null;
  var queryTree = null;

  this.clearQueryTree = function () {
    queryTree = null;
  };

  /**
   *
   * @param {string} queryString
   * @param {boolean} forceUpdate
   *  Set to true to emit a "searchQueryChanged" even if the query has not changed.
   *  A possible use-case is navigating back to the search page and reloading the same query.
   */
  this.setQueryString = function (queryString, forceUpdate) {
    var newQuery = false;

    if (!query || query.queryString !== queryString) {
      newQuery = LuceneQueryBuilder.createQuery(queryString);
      LuceneQueryBuilder.isValid(newQuery);
      this.setQuery(newQuery);
      queryTree = null;
    }

    if (query && !newQuery && forceUpdate) {
      this.setQuery(query);
    }
  };

  this.setQueryTree = function (groupedQueryTree) {
    var queryString = LuceneQueryBuilder.unparseGroupedTree(groupedQueryTree);
    var newQuery = LuceneQueryBuilder.createQuery(queryString);
    LuceneQueryBuilder.isValid(newQuery);
    this.setQuery(newQuery);

    queryTree = groupedQueryTree;
  };

  this.setQuery = function (searchQuery) {
    query = searchQuery;
    $rootScope.$emit('searchQueryChanged', searchQuery);
  };

  this.getQuery = function () {
    return query;
  };

  this.getQueryTree = function () {
    return angular.copy(queryTree);
  };
}
