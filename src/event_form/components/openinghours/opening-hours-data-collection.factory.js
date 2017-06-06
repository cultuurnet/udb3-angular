'use strict';

/**
 * @ngdoc service
 * @name udb.event-form.service:OpeningHoursCollection
 * @description
 * Contains data needed for opening hours.
 */
angular
  .module('udb.event-form')
  .factory('OpeningHoursCollection', OpeningHoursCollectionFactory);

/* @ngInject */
function OpeningHoursCollectionFactory(moment) {

  var validationRequirements = {
    'openAndClose': opensAndCloses,
    'dayOfWeek': hasDayOfWeek,
    'openIsBeforeClose': openIsBeforeClose
  };

  var weekdays = {
    'monday': {label: 'Ma', name: 'Maandag', open: false},
    'tuesday': {label: 'Di', name: 'Dinsdag', open: false},
    'wednesday': {label: 'Wo', name: 'Woensdag', open: false},
    'thursday': {label: 'Do', name: 'Donderdag', open: false},
    'friday': {label: 'Vr', name: 'Vrijdag', open: false},
    'saturday': {label: 'Za', name: 'Zaterdag', open: false},
    'sunday': {label: 'Zo', name: 'Zondag', open: false}
  };

  /**
   * @param {OpeningHours[]} openingHoursList
   * @returns {boolean}
   */
  function opensAndCloses(openingHoursList) {
    return _.all(_.map(openingHoursList, function (openingHours) {
      return openingHours.opensAsDate instanceof Date && openingHours.closesAsDate instanceof Date;
    }));
  }

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
      return !_.isUndefined(_.find(openingHours.dayOfWeek, 'open'));
    }));
  }

  /**
   * @param {OpeningHours[]} openingHoursList
   *
   * @returns {OpeningHours[]}
   */
  function prepareOpeningHoursForDisplay(openingHoursList) {
    angular.forEach (openingHoursList, function(openingHour, key) {
      openingHour.opens = moment(openingHour.opensAsDate).format('HH:mm');
      openingHour.closes = moment(openingHour.closesAsDate).format('HH:mm');
      openingHour.label = _.pluck(_.filter(openingHour.dayOfWeek, 'open'), 'name').join(', ');
    });

    return openingHoursList;
  }

  /**
   * @class OpeningHoursCollection
   */
  var openingHoursCollection = {
    openingHours: [],

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
     * Create new opening hours and append them to the list of existing hours.
     */
    createNewOpeningHours: function () {
      var openingHoursList = this.openingHours || [];
      var openingHours = {
        'dayOfWeek': _.cloneDeep(weekdays),
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
          'dayOfWeek': _.mapValues(weekdays, function (weekday, day) {
            var dayOfWeek = _.cloneDeep(weekday);
            dayOfWeek.open = _.includes(jsonOpeningHours.dayOfWeek, day);

            return dayOfWeek;
          }),
          'opens': jsonOpeningHours.opens || '00:00',
          'opensAsDate':
            jsonOpeningHours.opens ?
              resetDay(moment(jsonOpeningHours.opens, 'HH:mm')).toDate() :
              new Date(1970, 0, 1),
          'closes': jsonOpeningHours.closes || '00:00',
          'closesAsDate':
            jsonOpeningHours.closes ?
              resetDay(moment(jsonOpeningHours.closes, 'HH:mm')).toDate() :
              new Date(1970, 0, 1)
        };
      }));

      return this;
    },

    serialize: function () {
      return _.map(this.openingHours, function (openingHours) {
        return {
          dayOfWeek: _.keys(omitClosedDays(openingHours.dayOfWeek)),
          opens: moment(openingHours.opensAsDate).format('HH:mm'),
          closes: moment(openingHours.closesAsDate).format('HH:mm')
        };
      });
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

  /**
   * Takes a moment object and returns a new one with the day reset to the beginning of unix time.
   *
   * @param {object} moment
   *  a moment object
   * @returns {object}
   */
  function resetDay(moment) {
    return moment.clone().year(1970).dayOfYear(1);
  }

  function omitClosedDays(dayOfWeek) {
    return _.pick(dayOfWeek, function(weekday) {
      return weekday.open;
    });
  }

  return openingHoursCollection;
}
