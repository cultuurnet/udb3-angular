'use strict';

/**
 * @typedef {Object} TimeSpan
 * @property {Date} start
 * @property {Date} end
 * @property {boolean} allDay
 */

/**
 * @ngdoc function
 * @name udbApp.controller:FormCalendarController
 * @description
 * # Form Calendar Controller
 */
angular
  .module('udb.event-form')
  .controller('FormCalendarController', FormCalendarController);

/* @ngInject */
function FormCalendarController(EventFormData, OpeningHoursCollection, calendarLabels) {
  var calendar = this;

  calendar.formData = {};
  calendar.type = '';
  calendar.types = calendarLabels;
  calendar.setType = setType;
  calendar.reset = reset;
  calendar.createTimeSpan = createTimeSpan;
  calendar.timeSpans = [];
  calendar.removeTimeSpan = removeTimeSpan;
  calendar.weeklyRecurring = false;
  calendar.openingHoursCollection = OpeningHoursCollection;
  calendar.timeSpanChanged = timeSpanChanged;

  init(EventFormData);

  /**
   * @param {EventFormData} formData
   */
  function init(formData) {
    calendar.formData = formData;
    calendar.timeSpans = !_.isEmpty(formData.timestamps) ? timestampsToTimeSpans(formData.timestamps) : [];
    calendar.setType(formData.calendarType);
  }

  function reset() {
    EventFormData.resetCalendar();
    calendar.type = EventFormData.calendarType;
  }

  function isTypeWeeklyRecurring(type) {
    return type === 'permanent' || type === 'periodic';
  }

  /**
   * @param {string} calendarType
   */
  function setType(calendarType) {
    EventFormData.setCalendarType(calendarType);
    calendar.formData = EventFormData;
    calendar.type = EventFormData.activeCalendarType;
    calendar.weeklyRecurring = isTypeWeeklyRecurring(calendarType);

    if (calendarType === 'single' && calendar.timeSpans.length === 0) {
      createTimeSpan();
    }
  }

  function createTimeSpan() {
    var newTimeSpan = {
      allDay: true,
      start: moment().startOf('hour').add(1, 'h').toDate(),
      end: moment().startOf('hour').add(4, 'h').toDate()
    };

    calendar.timeSpans.push(newTimeSpan);
  }

  /**
   * @param {Object} timeSpan
   */
  function removeTimeSpan(timeSpan) {
    if (calendar.timeSpans.length > 1) {
      calendar.timeSpans = _.without(calendar.timeSpans, timeSpan);
    }
  }

  function timeSpanChanged() {
    var timestamps = timeSpansToTimestamps(calendar.timeSpans);

    console.log(timestamps);
    calendar.formData.saveTimestamps(timestamps);
  }

  /**
   * @param {TimeSpan[]} timeSpans
   * @return {Timestamp[]}
   */
  function timeSpansToTimestamps(timeSpans) {
    return _.map(timeSpans, function (timeSpan) {
      var start = timeSpan.allDay ? moment(timeSpan.start).startOf('day') : moment(timeSpan.start);
      var end = timeSpan.allDay ? moment(timeSpan.end).endOf('day') : moment(timeSpan.end);

      return {
        date: start.toDate(),
        startHour: start.format('HH:mm'),
        startHourAsDate: start.toDate(),
        endHour: end.format('HH:mm'),
        endHourAsDate: end.toDate()
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
}
