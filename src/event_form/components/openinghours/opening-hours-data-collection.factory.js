'use strict';

/**
 * @ngdoc service
 * @name udb.core.EventFormData
 * @description
 * Contains data needed for opening hours.
 */
angular
  .module('udb.event-form')
  .factory('OpeningHoursCollection', OpeningHoursCollectionFactory);

/* @ngInject */
function OpeningHoursCollectionFactory($rootScope, moment, dayNames) {

  function prepareOpeningHoursForDisplay(openingHours) {
    angular.forEach (openingHours, function(openingHour, key) {
      var humanValues = [];
      if (openingHour.dayOfWeek instanceof Array) {
        for (var i in openingHours[key].dayOfWeek) {
          humanValues.push(dayNames[openingHour.dayOfWeek[i]]);
        }
      }
      openingHour.opensAsDate = moment(openingHour.opens, 'HH:mm').toDate();
      openingHour.closesAsDate = moment(openingHour.closes, 'HH:mm').toDate();

      openingHour.label = humanValues.join(', ');
    });
    return openingHours;
  }

  /**
   * @class OpeningHoursCollection
   */
  var openingHoursCollection = {
    /**
     * Initialize the properties with default data
     */
    init: function() {
      this.openingHours = [];
      this.temporaryOpeningHours = [];
      this.openingHoursErrors = {};
    },

    /**
     * Get the opening hours.
     */
    getOpeningHours: function() {
      return this.openingHours;
    },

    /**
     * Get the temporary opening hours.
     */
    getTemporaryOpeningHours: function() {
      return this.temporaryOpeningHours;
    },

    /**
     * Set the opening hours.
     */
    setOpeningHours: function(openingHours) {
      this.openingHours = prepareOpeningHoursForDisplay(openingHours);
      this.temporaryOpeningHours = _.cloneDeep(this.openingHours);
    },

    /**
     * Add an opening hour to the opening hours array.
     */
    addOpeningHour: function(openingHour) {
      this.temporaryOpeningHours.push({
        'dayOfWeek' : openingHour.dayOfWeek,
        'opens' : openingHour.opens,
        'opensAsDate' : openingHour.opensAsDate,
        'closes' : openingHour.closes,
        'closesAsDate' : openingHour.closesAsDate,
        'label' : openingHour.label
      });
    },

    /**
     * Remove the openinghour with the given index.
     */
    removeOpeningHour: function(index) {
      this.temporaryOpeningHours.splice(index, 1);
    },

    saveOpeningHours: function () {
      this.openingHours = this.temporaryOpeningHours;
      $rootScope.$emit('openingHoursChanged', this.openingHours);
    }
  };

  // initialize the data
  openingHoursCollection.init();

  return openingHoursCollection;
}
