'use strict';

/* jshint sub: true */

/**
 * @ngdoc service
 * @name udb.uitpas.DefaultUitpasLabels
 * @description
 * # Default UiTPAS Labels
 *
 * All the known UiTPAS labels that link an organizer to card-systems on 2017-03-30.
 * This file used to be updated each time labels changed but now acts as a placeholder.
 *
 * The actual labels should be fetched when building or bootstrapping your app and written to the UitpasLabels constant.
 * The UiTPAS service should have an endpoint with all the labels for your environment.
 * e.g.: https://uitpas.uitdatabank.be/labels for production
 */
angular
  .module('udb.uitpas')
  .constant('DefaultUitpasLabels',
  /**
   * Enum for UiTPAS labels
   * @readonly
   * @enum {string}
   */
  {
    'PASPARTOE': 'Paspartoe',
    'UITPAS': 'UiTPAS',
    'UITPAS_GENT': 'UiTPAS Gent',
    'UITPAS_OOSTENDE': 'UiTPAS Oostende',
    'UITPAS_REGIO_AALST': 'UiTPAS Regio Aalst',
    'UITPAS_DENDER': 'UiTPAS Dender',
    'UITPAS_ZUIDWEST': 'UiTPAS Zuidwest',
    'UITPAS_MECHELEN': 'UiTPAS Mechelen',
    'UITPAS_KEMPEN': 'UiTPAS Kempen',
    'UITPAS_MAASMECHELEN': 'UiTPAS Maasmechelen',
    'UITPAS_LEUVEN': 'UiTPAS Leuven',
    'UITPAS_LIER': 'UiTPAS Lier',
    'UITPAS_HEIST-OP-DEN-BERG': 'UiTPAS Heist-op-den-Berg',
    'UITPAS_MEETJESLAND': 'UiTPAS Meetjesland',
    'UITPAS_WESTHOEK': 'UiTPAS Westhoek'
  });
