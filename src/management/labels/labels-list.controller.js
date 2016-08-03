'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:LabelsListController
 * @description
 * # LabelsListController
 */
angular
  .module('udb.management.labels')
  .controller('LabelsListController', LabelsListController);

/* @ngInject */
function LabelsListController(SearchResultGenerator, rx, $scope, LabelManager) {
  var llc = this;

  llc.query = '';

  var itemsPerPage = 10;
  var minQueryLength = 3;
  var query$ = rx.createObservableFunction(llc, 'queryChanged');
  var filteredQuery$ = query$.filter(ignoreShortQueries);
  var page$ = rx.createObservableFunction(llc, 'pageChanged');
  var searchResultGenerator = new SearchResultGenerator(LabelManager, filteredQuery$, page$, itemsPerPage);
  var searchResult$ = searchResultGenerator.getSearchResult$();

  /**
   * @param {string} query
   * @return {boolean}
   */
  function ignoreShortQueries(query) {
    if (llc.query === '') {
      return true;
    }
    else {
      return query.length >= minQueryLength;
    }
  }

  /**
   * @param {PagedCollection} searchResult
   */
  function showSearchResult(searchResult) {
    llc.searchResult = searchResult;
    llc.loading = false;
  }

  llc.loading = false;
  llc.page = 0;
  llc.minQueryLength = minQueryLength;

  query$
    .safeApply($scope, function (query) {
      llc.query = query;
    })
    .subscribe();

  searchResult$
    .safeApply($scope, showSearchResult)
    .subscribe();

  filteredQuery$
    .merge(page$)
    .safeApply($scope, function () {
      llc.loading = true;
    })
    .subscribe();

  page$
    .subscribe(llc.updateSearchResultViewer);

  $scope.$on('$viewContentLoaded', function() {
    LabelManager.find('', itemsPerPage, 0)
      .then(function(results) {
        llc.searchResult = results;
      });
  });
}
