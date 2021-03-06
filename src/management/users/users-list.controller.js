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
function UsersListController(UserManager, $location) {
  var ulc = this;
  ulc.status = 'idle';
  ulc.query = '';
  ulc.problem = '';

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    ulc.status = 'problem';
    ulc.problem = problem;
  }

  function resetStatus()
  {
    ulc.status = 'idle';
    ulc.problem = false;
  }

  ulc.handleChange = function () {
    if (ulc.status === 'problem') {
      resetStatus();
    }
  };

  ulc.handleSubmit = function () {
    ulc.status = 'loading';
    UserManager.findUserWithEmail(ulc.query)
      .then(
        function (user) {
          ulc.status = 'idle';
          $location.path('/manage/users/' + user.email);
        },
        function (error) {
          if (error.status === 404) {
            ulc.status = 'notFound';
          } else {
            showProblem(error.title);
          }
        }
      );
  };
}
