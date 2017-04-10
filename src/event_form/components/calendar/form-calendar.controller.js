'use strict';

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

  calendar.formData = EventFormData;
  calendar.types = calendarLabels;
  calendar.type = EventFormData.activeCalendarType;
  calendar.setType = setType;
  calendar.reset = reset;
  calendar.openingHours = OpeningHoursCollection;
  calendar.createTimeSpan = createTimeSpan;
  calendar.timeSpans = [];
  calendar.removeTimeSpan = removeTimeSpan;
  calendar.weeklyRecurring = false;

  calendar.period = {
    startDate: moment().startOf('day').toDate(),
    endDate: moment().endOf('day').toDate()
  };

  init();

  function init() {
    setType('single');
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
      startDate: moment().startOf('day').toDate(),
      endDate: moment().endOf('day').toDate(),
      wholeDay: true,
      startTime: moment(0).startOf('hour').add(2, 'h').toDate(),
      endTime:  moment(0).startOf('hour').add(5, 'h').toDate()
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
}
