'use strict';

/**
 * @ngdoc service
 * @name udb.core.UdbTimestamps
 * @description
 * # UdbOpeningHours
 * Contains the opening hours for 1 period / date of an offer.
 */
angular
  .module('udb.core')
  .factory('UdbOpeningHours', UdbOpeningHoursFactory);

/* @ngInject */
function UdbOpeningHoursFactory() {

  /**
   * @class UdbOpeningHours
   * @constructor
   */
  var UdbOpeningHours = function () {
    this.validFrom = '';
    this.validThrough = '';
    this.dayOfWeek = '';
    this.opens = '';
    this.opensAsDate = '';
    this.closes = '';
    this.closesAsDate = '';
  };

  UdbOpeningHours.prototype = {

    parseJson: function (json) {

    },

    /**
     * Set the valid from date.
     */
    setValidFrom: function(date) {
      this.validFrom = date;
    },

    /**
     * Set the valid till date.
     */
    setValidTrough: function(date) {
      this.validThrough = date;
    },

    /**
     * Set the opening hour.
     */
    setOpens: function(hour) {
      this.opens = hour;
    },

    /**
     * Set the opening hour.
     */
    setDayOfWeek: function(dayOfWeek) {
      this.dayOfWeek = dayOfWeek;
    }

  };

  return (UdbOpeningHours);
}
