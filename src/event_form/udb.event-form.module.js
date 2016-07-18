'use strict';

/**
 * @ngdoc module
 * @name udb.export
 * @description
 * The udb eventform module
 */
angular
  .module('udb.event-form', [
    'ngSanitize',
    'ui.bootstrap',
    'udb.config',
    'udb.entry',
    'udb.search',
    'ngFileUpload',
    'focus-if'
  ]);
