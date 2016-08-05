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
function UsersListController(SearchResultGenerator, rx, $scope, UserManager, $uibModal, $state) {
  var rlc = this;

  var itemsPerPage = 10;
  var minQueryLength = 3;

  var query$ = rx.createObservableFunction(rlc, 'queryChanged');
  var filteredQuery$ = query$.filter(ignoreShortQueries);
  var page$ = rx.createObservableFunction(rlc, 'pageChanged');
  var searchResultGenerator = new SearchResultGenerator(UserManager, filteredQuery$, page$, itemsPerPage);
  var searchResult$ = searchResultGenerator.getSearchResult$();

  /**
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
   * @param {PagedCollection} searchResult
   */
  function showSearchResult(searchResult) {
    rlc.searchResult = searchResult;
    rlc.loading = false;
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
}
