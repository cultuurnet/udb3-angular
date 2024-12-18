'use strict';

/**
 * @ngdoc function
 * @name udb.management.organizers.controller:OrganizationSearchControllerNew
 * @description
 * # Organization Search Controller
 */
angular
  .module('udb.management.organizers')
  .controller('OrganizationSearchControllerNew', OrganizationSearchControllerNew);

/* @ngInject */
function OrganizationSearchControllerNew(SearchResultGenerator, rx, $scope, OrganizerManager, $rootScope, $timeout) {
  var controller = this;

  var itemsPerPage = 10;
  var minQueryLength = 3;
  var query$ = rx.createObservableFunction(controller, 'queryChanged');
  var filteredQuery$ = query$.filter(ignoreShortQueries(minQueryLength));
  var page$ = rx.createObservableFunction(controller, 'pageChanged');
  var searchResultGenerator = new SearchResultGenerator(OrganizerManager, filteredQuery$, page$, itemsPerPage);
  var searchResult$ = searchResultGenerator.getSearchResult$();

  /**
   * @param {number} minQueryLength
   * @return {Function}
   */
  function ignoreShortQueries(minQueryLength) {
    /**
     * @param {string} query
     */
    return function (query) {
      return query === '' || query.length >= minQueryLength;
    };
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    controller.problem = problem;
  }

  function clearProblem()
  {
    controller.problem = false;
  }

  /**
   * @param {(PagedCollection|ApiProblem)} searchResult
   */
  function showSearchResult(searchResult) {
    var problem = searchResult.error;

    if (problem) {
      showProblem(problem);
      controller.searchResult = {};
    } else {
      clearProblem();
      controller.searchResult = searchResult;
      $timeout(function() {
        $rootScope.$emit('searchComponentReady');
      });
    }

    controller.loading = false;
  }

  controller.loading = false;
  controller.query = '';
  controller.page = 0;
  controller.minQueryLength = minQueryLength;

  query$
    .safeApply($scope, function (query) {
      controller.query = query;
    })
    .subscribe();

  searchResult$
    .safeApply($scope, showSearchResult)
    .subscribe();

  filteredQuery$
    .merge(page$)
    .safeApply($scope, function () {
      controller.loading = true;
    })
    .subscribe();
}
