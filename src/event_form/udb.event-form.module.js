'use strict';

/**
 * @ngdoc module
 * @name udb.event-form
 * @description
 * The udb form module
 */
angular
  .module('udb.event-form', [
    'ngSanitize',
    'ui.bootstrap',
    'udb.config',
    'udb.entry',
    'udb.search',
    'ngFileUpload',
    'duScroll',
    'focus-if'
  ]);
