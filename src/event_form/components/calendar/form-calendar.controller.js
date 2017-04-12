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
  calendar.createTimeSpan = createTimeSpan;
  calendar.timeSpans = [];
  calendar.removeTimeSpan = removeTimeSpan;
  calendar.weeklyRecurring = false;
  calendar.openingHoursCollection = OpeningHoursCollection;

  calendar.openingHoursErrors = [];
  calendar.validateOpeningHours = validateOpeningHours;
  calendar.removeOpeningHours = removeOpeningHours;
  calendar.createNewOpeningHours = createNewOpeningHours;

  init();

  function init() {
    calendar.setType('single');
    calendar.openingHoursCollection.setOpeningHours([]);
    calendar.createNewOpeningHours();
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

    if (calendarType === 'periodic') {
      calendar.formData.startDate = moment().startOf('day').toDate();
      calendar.formData.endDate = moment().add(1, 'y').startOf('day').toDate();
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

  function validateOpeningHours() {
    calendar.openingHoursErrors = calendar.openingHoursCollection.validate();
  }

  /**
   * @param {OpeningHours} openingHours
   */
  function removeOpeningHours(openingHours) {
    calendar.openingHoursCollection.removeOpeningHours(openingHours);
    calendar.validateOpeningHours();
  }

  function createNewOpeningHours() {
    calendar.openingHoursCollection.createNewOpeningHours();
    calendar.validateOpeningHours();
  }
}
