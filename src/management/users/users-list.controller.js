'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:UsersListController
 * @description
 * # UsersListController
 */
angular
  .module('udb.management.users')
  .controller('UsersListController', UsersListController);

/* @ngInject */
function UsersListController(SearchResultGenerator, rx, $scope, UserManager, $uibModal, $state, $document) {
  var ulc = this;

  var itemsPerPage = 20;
  var minQueryLength = 3;

  ulc.query = '';
  ulc.problem = false;
  ulc.loading = true;
  ulc.query = '';
  ulc.page = 0;
  ulc.minQueryLength = minQueryLength;

  var query$ = rx.createObservableFunction(ulc, 'queryChanged');
  var filteredQuery$ = query$.filter(ignoreShortQueries);
  var page$ = rx.createObservableFunction(ulc, 'pageChanged');
  var searchResultGenerator = new SearchResultGenerator(UserManager, filteredQuery$, page$, itemsPerPage);
  var searchResult$ = searchResultGenerator.getSearchResult$();

  /**
   * @param {string} query
   * @return {boolean}
   */
  function ignoreShortQueries(query) {
    if (ulc.query === '') {
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
    ulc.problem = problem;
  }

  function clearProblem()
  {
    ulc.problem = false;
  }

  /**
   * @param {(PagedCollection|ApiProblem)} searchResult
   */
  function showSearchResult(searchResult) {
    var problem = searchResult.error;

    if (problem) {
      showProblem(problem);
      ulc.searchResult = {};
    } else {
      clearProblem();
      ulc.searchResult = searchResult;
    }

    ulc.loading = false;
  }

  function openDeleteConfirmModal(user) {
    var modalInstance = $uibModal.open({
        templateUrl: 'templates/user-delete-confirm-modal.html',
        controller: 'UserDeleteConfirmModalCtrl',
        resolve: {
          item: function () {
            return user;
          }
        }
      });
    modalInstance.result.then($state.reload);
  }
  ulc.openDeleteConfirmModal = openDeleteConfirmModal;

  query$
    .safeApply($scope, function (query) {
      ulc.query = query;
    })
    .subscribe();

  searchResult$
    .safeApply($scope, showSearchResult)
    .subscribe();

  filteredQuery$
    .merge(page$)
    .safeApply($scope, function () {
      ulc.loading = true;
    })
    .subscribe();

  page$.subscribe(function () {
    $document.scrollTop(0);
  });
}
