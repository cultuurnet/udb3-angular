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
function RolesListController(SearchResultGenerator, rx, $scope, RoleManager, $uibModal, $state, $document) {
  var rlc = this;

  var itemsPerPage = 10;
  var minQueryLength = 3;

  var query$ = rx.createObservableFunction(rlc, 'queryChanged');
  var filteredQuery$ = query$.filter(ignoreShortQueries);
  var page$ = rx.createObservableFunction(rlc, 'pageChanged');
  var searchResultGenerator = new SearchResultGenerator(RoleManager, filteredQuery$, page$, itemsPerPage);
  var searchResult$ = searchResultGenerator.getSearchResult$();

  /**
   * Filter applied on query-stream to ignore too short queries
   * @param {string} query
   * @return {boolean}
   */
  function ignoreShortQueries(query) {
    if (rlc.query === '') {
      return true;
    }
    else {
      return query.length >= minQueryLength;
    }
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    rlc.problem = problem;
  }

  function clearProblem()
  {
    rlc.problem = false;
  }

  /**
   * @param {(PagedCollection|ApiProblem)} searchResult
   */
  function showSearchResult(searchResult) {
    var problem = searchResult.error;

    if (problem) {
      showProblem(problem);
      rlc.searchResult = {};
    } else {
      clearProblem();
      rlc.searchResult = searchResult;
    }

    rlc.loading = false;
  }

  function openDeleteConfirmModal(role) {
    var modalInstance = $uibModal.open({
        templateUrl: 'templates/role-delete-confirm-modal.html',
        controller: 'RoleDeleteConfirmModalCtrl',
        resolve: {
          item: function () {
            return role;
          }
        }
      });
    modalInstance.result.then(function() {
      $state.reload();
    });
    // TODO: $state.reload isn't the best way to do it, better have another stream
  }
  rlc.openDeleteConfirmModal = openDeleteConfirmModal;

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

  page$
    .subscribe(function () {
      $document.scrollTop(0);
    });
}
