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
function UsersListController(SearchResultGenerator, rx, $scope, UserManager, $uibModal) {
  var ulc = this;

  ulc.query = '';

  var itemsPerPage = 10;
  var minQueryLength = 3;
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
   * @param {PagedCollection} searchResult
   */
  function showSearchResult(searchResult) {
    ulc.searchResult = searchResult;
    ulc.loading = false;
  }

  function updateSearchResultViewer() {
    ulc.loading = true;
    UserManager.find(ulc.query, itemsPerPage, ulc.page)
      .then(function(results) {
        ulc.searchResult = results;
        ulc.loading = false;
      });
  }
  ulc.updateSearchResultViewer = updateSearchResultViewer;

  function updateSearchResultViewerOnJobFeedback(job) {
    job.task.promise.then(updateSearchResultViewer);
  }
  ulc.updateSearchResultViewerOnJobFeedback = updateSearchResultViewerOnJobFeedback;

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
    modalInstance.result.then(updateSearchResultViewerOnJobFeedback);
  }
  ulc.openDeleteConfirmModal = openDeleteConfirmModal;

  ulc.loading = false;
  ulc.query = '';
  ulc.page = 0;
  ulc.minQueryLength = minQueryLength;

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

  $scope.$on('$viewContentLoaded', function() {
    ulc.updateSearchResultViewer();
  });
}
