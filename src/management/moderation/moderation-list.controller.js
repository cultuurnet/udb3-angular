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
function ModerationListController(ModerationManager, $uibModal, RolePermission) {
  var moderator = this;

  moderator.roles = [];

  moderator.loading = true;
  moderator.selectedRole = false;
  moderator.errorMessage = false;

  moderator.showModerationContent = showModerationContent;

  ModerationManager
    .getMyRoles()
    .then(function(roles) {
      // only show roles with moderator permission
      moderator.roles = _.filter(roles, function(role) {
        var canModerate = _.filter(role.permissions, function(permission) {
          return permission === RolePermission.AANBOD_MODEREREN;
        });
        return canModerate.length > 0 ? true : false;
      });
    })
    .catch(showProblem) // stop loading when there's an error
    .finally(function() {
      moderator.loading = false;
    });

  function showModerationContent(role) {
    console.log(role);
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
