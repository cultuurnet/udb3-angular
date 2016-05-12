'use strict';

/**
 * @ngdoc module
 * @name udb.search
 * @description
 * The udb search module
 */
angular
  .module('udb.search', [
    'ngCookies',
    'ngSanitize',
    'ui.bootstrap',
    'peg',
    'udb.core',
    'udb.config',
    'udb.router',
    'btford.socket-io',
    'pascalprecht.translate',
    'xeditable'
  ]);
