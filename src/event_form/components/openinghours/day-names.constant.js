'use strict';

/* jshint sub: true */

/**
 * @ngdoc constant
 * @name udb.event-form.dayNames
 * @description
 * # dayNames
 * Opening hours day names
 */
angular
  .module('udb.event-form')
  .constant('dayNames',
    /**
     * list of day names
     * @readonly
     */
    {
      monday : 'Maandag',
      tuesday : 'Dinsdag',
      wednesday : 'Woensdag',
      thursday : 'Donderdag',
      friday : 'Vrijdag',
      saturday : 'Zaterdag',
      sunday : 'Zondag'
    });
