'use strict';

/* jshint sub: true */

/**
 * @ngdoc service
 * @name udb.entry.uitpasLabels
 * @description
 * # UiTPAS Labels
 *
 * All the known UiTPAS labels that link an organizer to card-systems on 2017-03-01.
 * This file used to be updated each time labels changed but now acts as a placeholder.
 *
 * The actual labels should be fetched when building your app and overwrite this UitpasLabels constant.
 * The UiTPAS service should have an endpoint with all the labels for your environment.
 * e.g.: https://uitpas.uitdatabank.be/labels for production
 */
angular
  .module('udb.uitpas')
  .constant('UitpasLabels',
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
    'UITPAS_SYX': 'UiTPAS Syx'
  });
