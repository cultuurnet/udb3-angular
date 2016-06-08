'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:UserListController
 * @description
 * # UserListController
 */
angular
  .module('udb.manage')
  .controller('UsersListController', UsersListController);

/* @ngInject */
function UsersListController($scope, $rootScope, UserService, QuerySearchResultViewer) {
  var ulc = this;
  ulc.loading = false;
  ulc.pagedItemViewer = new QuerySearchResultViewer(10, 1);

  /**
   * @param {PagedCollection} data
   */
  function setUsersResults(data) {
    ulc.pagedItemViewer.loading = true;
    ulc.pagedItemViewer.setResults(data);
    ulc.users = data.users;
  }

  ulc.findUsers = function(query) {
    // Reset the pager when search query is changed.
    if (query !== ulc.query) {
      ulc.pagedItemViewer.currentPage = 1;
    }
    ulc.query = query;
    UserService
      .find(ulc.query, ulc.pagedItemViewer.currentPage)
      .then(setUsersResults);
  };

  ulc.findUsers();

  var userSearchSubmittedListener = $rootScope.$on('userSearchSubmitted', function(event, args) {
    ulc.findUsers(args.query);
  });

  ulc.pageChanged = function() {
    ulc.findUsers(ulc.query);
  };

  $scope.$on('$destroy', userSearchSubmittedListener);
}
