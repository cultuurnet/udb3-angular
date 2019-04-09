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
 * @param {ModerationService} ModerationService
 * @param {Object} $uibModal
 * @param {RolePermission} RolePermission
 */
function ModerationListController(
  ModerationService,
  $uibModal,
  RolePermission,
  SearchResultGenerator,
  rx,
  $scope,
  $q,
  $document,
  appConfig
) {
  var moderator = this;

  var query$, page$, searchResultGenerator, searchResult$;
  var itemsPerPage = 10;
  $scope.apiVersion = appConfig.roleConstraintsMode;

  moderator.roles = [];

  moderator.loading = true;
  moderator.errorMessage = false;
  moderator.selectedRole = {};
  moderator.searchResult = {};

  moderator.findModerationContent = findModerationContent;

  // load the current user's moderation roles
  ModerationService
    .getMyRoles()
    .then(filterModeratorRoles)
    .then(configureObservables)
    .catch(showProblem) // stop loading when there's an error
    .finally(function() {
      moderator.loading = false;
    });

  function configureObservables(currentRole) {
    // configure observables for searching items
    query$ = rx.createObservableFunction(moderator, 'queryChanged');
    page$ = rx.createObservableFunction(moderator, 'pageChanged');
    searchResultGenerator = new SearchResultGenerator(
      ModerationService, query$, page$, itemsPerPage, currentRole.constraints[$scope.apiVersion]
    );
    searchResult$ = searchResultGenerator.getSearchResult$();

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

    page$.subscribe(function () {
      $document.scrollTop(0);
    });

    return $q.resolve();
  }

  function filterModeratorRoles(roles) {
    // only show roles with moderator permission
    var filteredRoles = _.filter(roles, function(role) {
      var canModerate = _.filter(role.permissions, function(permission) {
        return permission === RolePermission.AANBOD_MODEREREN;
      });
      return canModerate.length > 0;
    });

    if (filteredRoles.length) {
      moderator.roles = filteredRoles;
      moderator.selectedRole = moderator.roles[0];

      return $q.resolve(moderator.selectedRole);
    }

    // when no roles were found aka no current role is set
    // don't bother continueing
    return $q.reject({title:'Er is huidig geen moderator rol gekoppeld aan jouw gebruiker.'});
  }

  function findModerationContent(currentRole) {
    moderator.queryChanged(currentRole.constraints[$scope.apiVersion]);
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
