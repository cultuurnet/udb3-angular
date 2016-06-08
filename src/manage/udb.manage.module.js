'use strict';

/**
 * @ngdoc module
 * @name udb.manage
 * @description
 * The udb manage module
 */
angular
  .module('udb.manage', [
    'ngSanitize',
    'ui.bootstrap',
    'udb.core',
    'udb.manage.users'
  ])
  .component('manageComponent', {
    controller: 'ManageController',
    controllerAs: 'mc',
    template: '<ng-outlet></ng-outlet>',
    $routeConfig: [
      {
        path: '/users/list',
        name: 'UsersList',
        component: 'usersComponent',
        useAsDefault: true
      }
    ]
  });