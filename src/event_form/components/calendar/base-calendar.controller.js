'use strict';

/**
 * @typedef {Object} TimeSpan
 * @property {Date} start
 * @property {Date} end
 * @property {boolean} allDay
 */

/**
 * @ngdoc function
 * @name udbApp.controller:BaseCalendarController
 * @description
 * # Base Calendar Controller
 */
angular
  .module('udb.event-form')
  .controller('BaseCalendarController', BaseCalendarController);

/* @ngInject */
function BaseCalendarController(calendar, $scope) {
  calendar.confirmBootstrap = confirmBootstrap;
  calendar.noFirstDateChosen = false;
  calendar.bootstrapDate = moment().startOf('hour').add(1, 'h').toDate();
  calendar.type = '';
  calendar.setType = setType;
  calendar.createTimeSpan = createTimeSpan;
  calendar.timeSpans = [];
  calendar.timeSpanRequirements = [];
  calendar.removeTimeSpan = removeTimeSpan;
  calendar.weeklyRecurring = false;
  calendar.delayedTimeSpanChanged = _.debounce(digestTimeSpanChanged, 1000);
  calendar.instantTimeSpanChanged = instantTimeSpanChanged;
  calendar.init = init;

  /**
   * @param {EventFormData} formData
   * @param {OpeningHoursCollection} openingHoursCollection
   */
  function init(formData, openingHoursCollection) {
    calendar.formData = formData;
    calendar.timeSpans = !_.isEmpty(formData.timestamps) ? timestampsToTimeSpans(formData.timestamps) : [];
    calendar.showEndDate = calendar.timeSpans;
    calendar.setType(formData.calendarType ? formData.calendarType : 'single');
    calendar.openingHoursCollection = openingHoursCollection;
  }

  function isTypeWeeklyRecurring(type) {
    return type === 'permanent' || type === 'periodic';
  }

  /**
   * @param {string} calendarType
   */
  function setType(calendarType) {
    calendar.formData.setCalendarType(calendarType);
    calendar.type = calendarType;
    calendar.weeklyRecurring = isTypeWeeklyRecurring(calendarType);

    if (calendarType === 'single' && _.isEmpty(calendar.timeSpans)) {
      calendar.noFirstDateChosen = true;
    }
  }

  function createTimeSpan() {
    if (_.isEmpty(calendar.timeSpans)) {
      calendar.noFirstDateChosen = true;
      calendar.instantTimeSpanChanged();
    } else {
      var newTimeSpan = _.cloneDeep(_.last(calendar.timeSpans));
      newTimeSpan.start = moment(newTimeSpan.start).add(1, 'days').toDate();
      newTimeSpan.end = newTimeSpan.start;
      calendar.timeSpans.push(newTimeSpan);
      calendar.instantTimeSpanChanged();
    }
  }

  /**
   * @param {Object} timeSpan
   */
  function removeTimeSpan(timeSpan) {
    if (calendar.timeSpans.length > 1) {
      calendar.timeSpans = _.without(calendar.timeSpans, timeSpan);
      calendar.instantTimeSpanChanged();
    }
  }

  function digestTimeSpanChanged() {
    $scope.$apply(timeSpanChanged);
  }

  function instantTimeSpanChanged() {
    calendar.delayedTimeSpanChanged.cancel();
    timeSpanChanged();
  }

  function timeSpanChanged() {
    var unmetRequirements = _.map(calendar.timeSpans, validateTimeSpan);

    if (!_.isEmpty(_.flatten(unmetRequirements))) {
      showTimeSpanRequirements(unmetRequirements);
    } else {
      if (calendar.timeSpans.length > 1) {
        if (calendar.type !== 'multiple') {
          setType('multiple');
        }
      } else if (calendar.type !== 'single') {
        setType('single');
      }
      clearTimeSpanRequirements();
      calendar.formData.saveTimestamps(timeSpansToTimestamps(calendar.timeSpans));
    }
  }

  function clearTimeSpanRequirements() {
    calendar.timeSpanRequirements = [];
  }

  function showTimeSpanRequirements(unmetRequirements) {
    calendar.timeSpanRequirements = unmetRequirements;
  }

  /**
   * @param {TimeSpan[]} timeSpans
   * @return {Timestamp[]}
   */
  function timeSpansToTimestamps(timeSpans) {
    return _.map(timeSpans, function (timeSpan) {
      var start = timeSpan.allDay ? moment(timeSpan.start).startOf('day') : moment(timeSpan.start);
      var end = timeSpan.allDay ? moment(timeSpan.end).endOf('day').startOf('minute') : moment(timeSpan.end);

      return {
        date: moment(timeSpan.start).startOf('day').toDate(),
        startHour: start.format('HH:mm'),
        startHourAsDate: start.toDate(),
        showStartHour: true,
        endHour: end.format('HH:mm'),
        endHourAsDate: end.toDate(),
        showEndHour: true
      };
    });
  }

  /**
   * @param {Timestamp[]} timestamps
   * @return {TimeSpan[]}
   */
  function timestampsToTimeSpans(timestamps) {
    return _.map(timestamps, function (timestamp) {
      var start = timestamp.startHourAsDate;
      var end = timestamp.endHourAsDate;
      var allDay = moment(start).isSame(end, 'day') &&
        moment(start).startOf('day').isSame(start) &&
        moment(end).endOf('day').startOf('minute').isSame(end);

      return {
        start: start,
        end: end,
        allDay: allDay
      };
    });
  }

  /**
   * Validates a time-span and returns a list of unmet requirements.
   *
   * @param {TimeSpan} timeSpan
   * @return {string[]}
   */
  function validateTimeSpan(timeSpan) {
    var requirements = {
      'timedWhenNotAllDay': function (timeSpan) {
        return !timeSpan.allDay && (!timeSpan.start || !timeSpan.end);
      },
      'startBeforeEndDay': function (timeSpan) {
        return timeSpan.start && timeSpan.end && moment(timeSpan.start).isAfter(timeSpan.end, 'day');
      },
      'startBeforeEnd': function (timeSpan) {
        return !timeSpan.allDay &&
            (timeSpan.start && timeSpan.end) &&
            moment(timeSpan.start).isSame(timeSpan.end, 'day') &&
            moment(timeSpan.start).isAfter(timeSpan.end);
      }
    };

    var unmetRequirements = _.pick(requirements, function (check) {
      return check(timeSpan);
    });

    return _.keys(unmetRequirements);
  }

  function confirmBootstrap() {
    calendar.noFirstDateChosen = false;
    calendar.showEndDate = true;
    calendar.timeSpans = [
      {
        allDay: true,
        start: moment(calendar.bootstrapDate).toDate(),
        end: moment(calendar.bootstrapDate).startOf('hour').add(4, 'h').toDate()
      }
    ];
    timeSpanChanged();
  }
}
