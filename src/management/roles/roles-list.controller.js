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
function RolesListController(SearchResultGenerator, rx, $scope, RoleManager, $uibModal) {
  var rlc = this;

  rlc.query = '';

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
    //modalInstance.result.then(updateItemViewerOnJobFeedback);
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

  $scope.$on('$viewContentLoaded', function() {
    RoleManager.find('', itemsPerPage, 0)
      .then(function(results) {
        rlc.searchResult = results;
      });
  });
}
