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

  var validationRequirements = {
    'dayOfWeek': hasDayOfWeek,
    'openIsBeforeClose': openIsBeforeClose
  };

  /**
   * @param {OpeningHours[]} openingHoursList
   * @returns {boolean}
   */
  function openIsBeforeClose(openingHoursList) {
    return _.all(_.map(openingHoursList, function (openingHours) {
      return moment(openingHours.opensAsDate).isBefore(openingHours.closesAsDate);
    }));
  }

  /**
   * @param {OpeningHours[]} openingHoursList
   * @returns {boolean}
   */
  function hasDayOfWeek(openingHoursList) {
    return _.all(_.map(openingHoursList, function (openingHours) {
      return !_.isEmpty(openingHours.dayOfWeek);
    }));
  }

  /**
   * @param {OpeningHours[]} openingHoursList
   *
   * @returns {OpeningHours[]}
   */
  function prepareOpeningHoursForDisplay(openingHoursList) {
    angular.forEach (openingHoursList, function(openingHour, key) {
      var humanValues = [];
      if (openingHour.dayOfWeek instanceof Array) {
        for (var i in openingHoursList[key].dayOfWeek) {
          humanValues.push(dayNames[openingHour.dayOfWeek[i]]);
        }
      }
      openingHour.opens = moment(openingHour.opensAsDate).format('HH:mm');
      openingHour.closes = moment(openingHour.closesAsDate).format('HH:mm');

      openingHour.label = humanValues.join(', ');
    });

    return openingHoursList;
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
      this.openingHoursErrors = {};
    },

    /**
     * Get the opening hours.
     */
    getOpeningHours: function() {
      return this.openingHours;
    },

    /**
     * Set the opening hours.
     */
    setOpeningHours: function(openingHours) {
      this.openingHours = prepareOpeningHoursForDisplay(openingHours);
    },

    /**
     * @param {OpeningHours} openingHours
     */
    removeOpeningHours: function (openingHours) {
      var openingHoursList = this.openingHours;

      this.setOpeningHours(_.without(openingHoursList, openingHours));
    },

    /**
     * Add an opening hour to the opening hours array.
     */
    addOpeningHour: function(openingHour) {
      this.openingHours.push({
        'dayOfWeek' : openingHour.dayOfWeek,
        'opens' : openingHour.opens,
        'opensAsDate' : openingHour.opensAsDate,
        'closes' : openingHour.closes,
        'closesAsDate' : openingHour.closesAsDate,
        'label' : openingHour.label
      });
    },

    /**
     * Create new opening hours and append them to the list of existing hours.
     */
    createNewOpeningHours: function () {
      var openingHoursList = this.openingHours || [];
      var openingHours = {
        'dayOfWeek': [],
        'opens': '00:00',
        'opensAsDate': new Date(1970, 0, 1),
        'closes': '00:00',
        'closesAsDate': new Date(1970, 0, 1)
      };

      openingHoursList.push(openingHours);

      this.setOpeningHours(openingHoursList);
    },

    /**
     * {object[]} jsonOpeningHoursList
     */
    deserialize: function (jsonOpeningHoursList) {
      this.setOpeningHours(_.map(jsonOpeningHoursList, function (jsonOpeningHours) {
        return {
          'dayOfWeek': jsonOpeningHours.dayOfWeek || [],
          'opens': jsonOpeningHours.opens || '00:00',
          'opensAsDate':
            jsonOpeningHours.opens ? moment(jsonOpeningHours.opens, 'HH:mm').toDate() : new Date(1970, 0, 1),
          'closes': jsonOpeningHours.closes || '00:00',
          'closesAsDate':
            jsonOpeningHours.closes ? moment(jsonOpeningHours.closes, 'HH:mm').toDate() : new Date(1970, 0, 1)
        };
      }));
    },

    /**
     * returns a list of errors
     *
     * @returns {string[]}
     */
    validate: function () {
      var openingHours = this.openingHours;

      return _(validationRequirements)
        .pick(function (requirementCheck) {
          return !requirementCheck(openingHours);
        })
        .keys()
        .value();
    }
  };

  // initialize the data
  openingHoursCollection.init();

  return openingHoursCollection;
}
