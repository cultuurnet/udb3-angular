'use strict';

/**
 * @ngdoc module
 * @name udb.management
 * @description
 * # Management Module
 */
angular
  .module('udb.management', [
    'udb.core',
    'udb.management.labels',
    'udb.management.roles',
    'udb.management.users',
    'udb.management.moderation',
    //'udb.management.organizers'
  ]);
