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
function BaseCalendarController(calendar, $scope, appConfig) {
  calendar.type = '';
  calendar.setType = setType;
  calendar.createTimeSpan = createTimeSpan;
  calendar.timeSpans = [];
  calendar.timeSpanRequirements = [];
  calendar.removeTimeSpan = removeTimeSpan;
  calendar.weeklyRecurring = false;
  calendar.delayedTimeSpanChanged = _.debounce(digestTimeSpanChanged, 1000);
  calendar.instantTimeSpanChanged = instantTimeSpanChanged;
  calendar.toggleAllDay = toggleAllDay;
  calendar.init = init;
  calendar.maxYearTimeSpan = _.get(appConfig, 'offerEditor.calendar.maxYearTimeSpan', 10);

  /**
   * @param {EventFormData} formData
   * @param {OpeningHoursCollection} openingHoursCollection
   */
  function init(formData, openingHoursCollection) {
    calendar.formData = formData;
    calendar.isEvent = formData.isEvent;
    calendar.isPlace = formData.isPlace;
    calendar.offerStatus = formData.status;
    calendar.subEvent = formData.subEvent;
    calendar.timeSpans = !_.isEmpty(formData.calendar.timeSpans) ? formData.calendar.timeSpans : [];
    calendar.setType(formData.calendar.calendarType ? formData.calendar.calendarType : 'single');
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
      initTimeSpans();
    }
  }

  function initTimeSpans() {
    calendar.timeSpans = [
      {
        allDay: true,
        start: moment().startOf('day').toDate(),
        end: moment().endOf('day').toDate(),
        endTouched: false,
        status: {
          type: 'Available'
        }
      }
    ];
  }

  function createTimeSpan() {
    if (_.isEmpty(calendar.timeSpans)) {
      initTimeSpans();
      calendar.instantTimeSpanChanged();
    } else {
      calendar.timeSpans.push(_.cloneDeep(_.last(calendar.timeSpans)));
      // Do not trigger timeSpanChanged to prevent saving duplicates.
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

  function digestTimeSpanChanged(whichDate) {
    $scope.$apply(timeSpanChanged(whichDate));
  }

  function instantTimeSpanChanged() {
    calendar.delayedTimeSpanChanged.cancel();
    timeSpanChanged();
  }

  function toggleAllDay(timeSpan) {
    if (timeSpan.allDay) {
      timeSpan.start = moment(timeSpan.start).set({'hour': 0, 'minute': 0, 'millisecond': 0}).toDate();
      timeSpan.end = moment(timeSpan.end).endOf('day').toDate();
    }
    else {
      timeSpan.start = moment(timeSpan.start).set({'hour': moment().startOf('hour').format('H'), 'minute': 0}).toDate();
      timeSpan.end = moment(timeSpan.end).set(
          {'hour': moment().startOf('hour').add(4, 'h').format('H') , 'minute': 0, 'second': 0}
      ).toDate();
    }
    instantTimeSpanChanged();
  }

  function timeSpanChanged(whichDate) {

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
      _.each(calendar.timeSpans, function(timeSpan) {
        if (whichDate === 'end' && !timeSpan.endTouched) {
          timeSpan.endTouched = true;
        }
        if (timeSpan.allDay) {
          timeSpan.start = moment(timeSpan.start).startOf('day').toDate();
          timeSpan.end = moment(timeSpan.end).endOf('day').toDate();
        }
        if (whichDate === 'start' && !timeSpan.endTouched) {
          if (timeSpan.start > timeSpan.end) {
            timeSpan.end = moment(timeSpan.start).endOf('day').toDate();
          }
        }
      });
      calendar.formData.saveTimeSpans(calendar.timeSpans);
    }
  }

  function clearTimeSpanRequirements() {
    calendar.timeSpanRequirements = [];
  }

  function showTimeSpanRequirements(unmetRequirements) {
    calendar.timeSpanRequirements = unmetRequirements;
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
        return timeSpan.endTouched &&
            timeSpan.start &&
            timeSpan.end &&
            moment(timeSpan.start).isAfter(timeSpan.end, 'day');
      },
      'startBeforeEnd': function (timeSpan) {
        return !timeSpan.allDay &&
            (timeSpan.start && timeSpan.end) &&
            moment(timeSpan.start).isSame(timeSpan.end, 'day') &&
            moment(timeSpan.start).isAfter(timeSpan.end);
      },
      'tooFarInFuture': function (timespan) {
        var maxDate = moment().add(calendar.maxYearTimeSpan, 'y');
        return moment(timeSpan.end).isAfter(maxDate);
      }
    };

    var unmetRequirements = _.pick(requirements, function (check) {
      return check(timeSpan);
    });

    return _.keys(unmetRequirements);
  }
}
