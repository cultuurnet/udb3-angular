'use strict';

/* jshint sub: true */

/**
 * @ngdoc constant
 * @name udb.event-form.calendarLabels
 * @description
 * # calendarLabels
 * Form calendar labels
 */
angular
  .module('udb.event-form')
  .constant('calendarLabels',
    /**
     * list of calendar labels
     * @readonly
     */
    [
      {'label': 'Eén of meerdere dagen', 'id' : 'single', 'eventOnly' : true},
      {'label': 'Van ... tot ... ', 'id' : 'periodic', 'eventOnly' : true},
      {'label' : 'Permanent', 'id' : 'permanent', 'eventOnly' : false}
    ]);
