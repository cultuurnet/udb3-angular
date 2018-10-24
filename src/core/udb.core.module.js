'use strict';

/**
 * @ngdoc module
 * @name udb.core
 * @description
 * The udb core module
 */
angular
    .module('udb.core', [
        'ngCookies',
        'ngSanitize',
        'ui.bootstrap',
        'ui.select',
        'udb.config',
        'udb.search',
        'udb.entry',
        'udb.event-form',
        'udb.offer-translate',
        'udb.export',
        'udb.event-detail',
        'udb.place-detail',
        'udb.organizers',
        'udb.dashboard',
        'udb.saved-searches',
        'udb.media',
        'udb.management',
        'udb.uitpas',
        'udb.cultuurkuur',
        'btford.socket-io',
        'pascalprecht.translate',
        'angular.filter',
    ])
    .constant('Levenshtein', window.Levenshtein);
