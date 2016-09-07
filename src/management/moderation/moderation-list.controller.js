'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:ModerationListController
 * @description
 * # ModerationListController
 */
angular
  .module('udb.management.moderation')
  .controller('ModerationListController', ModerationListController);

/**
 * @ngInject
 * @constructor
 *
 * @param {ModerationManager} ModerationManager
 * @param {Object} $uibModal
 * @param {RolePermission} RolePermission
 */
function ModerationListController(
  ModerationManager,
  $uibModal,
  RolePermission,
  SearchResultGenerator,
  rx,
  $scope
) {
  var moderator = this;

  var itemsPerPage = 10;

  // configure observables for searching items
  var query$ = rx.createObservableFunction(moderator, 'queryChanged');
  var page$ = rx.createObservableFunction(moderator, 'pageChanged');
  var searchResultGenerator = new SearchResultGenerator(ModerationManager, query$, page$, itemsPerPage);
  var searchResult$ = searchResultGenerator.getSearchResult$();

  moderator.roles = [];

  moderator.loading = true;
  moderator.selectedRole = false;
  moderator.errorMessage = false;

  moderator.searchResult = {};

  moderator.findModerationContent = findModerationContent;

  // load the current user's moderation roles
  ModerationManager
    .getMyRoles()
    .then(filterModeratorRoles)
    .catch(showProblem) // stop loading when there's an error
    .finally(function() {
      moderator.loading = false;
    });

  // show search results
  searchResult$
    .safeApply($scope, showSearchResult)
    .subscribe();

  // show loading screen on query change
  query$
    .safeApply($scope, function () {
      moderator.loading = true;
    })
    .subscribe();

  function filterModeratorRoles(roles) {
    // only show roles with moderator permission
    moderator.roles = _.filter(roles, function(role) {
      var canModerate = _.filter(role.permissions, function(permission) {
        return permission === RolePermission.AANBOD_MODEREREN;
      });
      return canModerate.length > 0 ? true : false;
    });
  }

  function findModerationContent(roleId) {
    var currentRole = _.find(moderator.roles, function(role) {
      return role.uuid === roleId;
    });

    moderator.queryChanged(currentRole.constraint);
  }

  /**
   * @param {(PagedCollection|ApiProblem)} searchResult
   */
  function showSearchResult(searchResult) {
    var problem = searchResult.error;

    if (problem) {
      showProblem(problem);
      moderator.searchResult = {};
    } else {
      moderator.searchResult = searchResult;
    }

    moderator.loading = false;
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    moderator.errorMessage = problem.title + (problem.detail ? ' ' + problem.detail : '');

    var modalInstance = $uibModal.open(
      {
        templateUrl: 'templates/unexpected-error-modal.html',
        controller: 'UnexpectedErrorModalController',
        size: 'sm',
        resolve: {
          errorMessage: function() {
            return moderator.errorMessage;
          }
        }
      }
    );
  }
}
