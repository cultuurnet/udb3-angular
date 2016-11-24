'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormStep2Controller
 * @description
 * # EventFormStep2Controller
 * Step 2 of the event form
 */
angular
  .module('udb.event-form')
  .controller('EventFormStep2Controller', EventFormStep2Controller);

/* @ngInject */
function EventFormStep2Controller($scope, $rootScope, EventFormData, appConfig) {
  var controller = this;

  // Scope vars.
  // main storage for event form.
  $scope.eventFormData = EventFormData;
  $scope.calendarHighlight = appConfig.calendarHighlight;

  $scope.calendarLabels = [
    {'label': 'Eén of meerdere dagen', 'id' : 'single', 'eventOnly' : true},
    {'label': 'Van ... tot ... ', 'id' : 'periodic', 'eventOnly' : true},
    {'label' : 'Permanent', 'id' : 'permanent', 'eventOnly' : false}
  ];
  $scope.hasOpeningHours = EventFormData.openingHours.length > 0;
  $scope.lastSelectedDate = '';

  // Scope functions
  $scope.setCalendarType = setCalendarType;
  $scope.resetCalendar = resetCalendar;
  $scope.addTimestamp = addTimestamp;
  $scope.toggleStartHour = controller.toggleStartHour;
  $scope.toggleEndHour = toggleEndHour;
  $scope.hoursChanged = hoursChanged;
  $scope.saveOpeningHourDaySelection = saveOpeningHourDaySelection;
  $scope.saveOpeningHours = saveOpeningHours;
  $scope.openingHoursChanged = openingHoursChanged;
  $scope.eventTimingChanged = controller.eventTimingChanged;
  $scope.dateChosen = dateChosen;

  // Mapping between machine name of days and real output.
  var dayNames = {
    monday : 'Maandag',
    tuesday : 'Dinsdag',
    wednesday : 'Woensdag',
    thursday : 'Donderdag',
    friday : 'Vrijdag',
    saturday : 'Zaterdag',
    sunday : 'Zondag'
  };

  // Set form default correct for the editing calendar type.
  if (EventFormData.calendarType) {
    initCalendar();
  }

  // Load the correct labels.
  if ($scope.hasOpeningHours) {
    initOpeningHours();
  }

  /**
   * Click listener on the calendar type buttons.
   * Activate the selected calendar type.
   */
  function setCalendarType(type) {

    EventFormData.showStep(3);

    // Check if previous calendar type was the same.
    // If so, we don't need to create new opening hours. Just show the previous entered data.
    if (EventFormData.calendarType === type) {
      return;
    }

    // A type is chosen, start a complete new calendar, removing old data
    $scope.hasOpeningHours = false;
    EventFormData.resetCalendar();
    EventFormData.calendarType = type;

    if (EventFormData.calendarType === 'single') {
      addTimestamp();
    }

    if (EventFormData.calendarType === 'periodic') {
      EventFormData.addOpeningHour('', '', '', '', '');
    }

    if (EventFormData.calendarType === 'permanent') {
      EventFormData.addOpeningHour('', '', '', '', '');
      controller.eventTimingChanged();
    }

    initCalendar();

    if (EventFormData.id) {
      EventFormData.majorInfoChanged = true;
    }

  }

  function hoursChanged(timestamp) {
    var startHourAsDate;
    var endHourAsDate;
    if (timestamp.showStartHour) {
      if (timestamp.startHourAsDate !== undefined) {
        startHourAsDate = moment(timestamp.startHourAsDate);
      }
      else {
        startHourAsDate = moment(timestamp.startHourAsDate);
        startHourAsDate.hours(0);
        startHourAsDate.minutes(0);
      }
      timestamp.startHour = startHourAsDate.format('HH:mm');
      controller.eventTimingChanged();
    }

    if (timestamp.showEndHour) {
      // if the endhour is invalid, send starthour to backend.
      if (timestamp.endHourAsDate !== undefined) {
        endHourAsDate = moment(timestamp.endHourAsDate);
      }
      else {
        endHourAsDate = startHourAsDate;
      }
      timestamp.endHour = endHourAsDate.format('HH:mm');
      controller.eventTimingChanged();
    }
  }

  /**
   * Change listener to the datepicker. Last choice is stored.
   */
  function dateChosen(timestamp) {
    $scope.lastSelectedDate = timestamp;
    controller.eventTimingChanged();
  }

  /**
   * Init the calendar for the current selected calendar type.
   */
  function initCalendar() {

    var calendarType = _.findWhere($scope.calendarLabels, {id: EventFormData.calendarType});

    if (calendarType) {
      EventFormData.activeCalendarLabel = calendarType.label;
      EventFormData.activeCalendarType = EventFormData.calendarType;
    }
  }

  /**
   * Init the opening hours.
   */
  function initOpeningHours() {
    for (var i = 0; i < EventFormData.openingHours.length; i++) {
      saveOpeningHourDaySelection(i, EventFormData.openingHours[i].dayOfWeek);
    }
  }

  /**
   * Click listener to reset the calendar. User can select a new calendar type.
   */
  function resetCalendar () {
    EventFormData.activeCalendarType = '';
    EventFormData.calendarType = '';
  }

  /**
   * Add a single date to the item.
   */
  function addTimestamp() {
    EventFormData.addTimestamp('', '', '', '', '');
  }

  /**
   * Toggle the starthour field for given timestamp.
   * @param {Object} timestamp
   *   Timestamp to change
   */
  controller.toggleStartHour = function (timestamp) {

    // If we hide the textfield, empty all other time fields.
    if (!timestamp.showStartHour) {
      timestamp.startHour = '';
      timestamp.startHourAsDate = '';
      timestamp.endHour = '';
      timestamp.endHourAsDate = '';
      timestamp.showEndHour = false;
      timestamp.date.setHours(0);
      timestamp.date.setMinutes(0);
      controller.eventTimingChanged();
    }
  };

  /**
   * Toggle the endhour field for given timestamp
   * @param {Object} timestamp
   *   Timestamp to change
   */
  function toggleEndHour(timestamp) {

    // If we hide the textfield, empty also the input.
    if (!timestamp.showEndHour) {
      timestamp.endHour = '';
      timestamp.endHourAsDate = '';
      controller.eventTimingChanged();
    }

  }

  /**
   * Change listener on the day selection of opening hours.
   * Create human labels for the day selection.
   */
  function saveOpeningHourDaySelection(index, dayOfWeek) {

    var humanValues = [];
    if (dayOfWeek instanceof Array) {
      for (var i in dayOfWeek) {
        humanValues.push(dayNames[dayOfWeek[i]]);
      }
    }

    EventFormData.openingHours[index].opensAsDate = moment(EventFormData.openingHours[index].opens, 'HH:mm').toDate();
    EventFormData.openingHours[index].closesAsDate = moment(EventFormData.openingHours[index].closes, 'HH:mm').toDate();

    EventFormData.openingHours[index].label = humanValues.join(', ');

  }

  /**
   * Save the opening hours.
   */
  function saveOpeningHours() {
    $scope.hasOpeningHours = true;
    controller.eventTimingChanged();
  }

  /**
   * Change listener for opening hours.
   */
  function openingHoursChanged(openingHour) {
    var opensAsDate, closesAsDate;

    if (openingHour.opensAsDate !== undefined) {
      opensAsDate = moment(openingHour.opensAsDate);
      openingHour.opens = opensAsDate.format('HH:mm');
    }
    // default value for when given openHour is invalid.
    else {
      openingHour.opens = '00:00';
    }

    if (openingHour.closesAsDate !== undefined) {
      closesAsDate = moment(openingHour.closesAsDate);
      openingHour.closes = closesAsDate.format('HH:mm');
    }
    // default value for when given closeHour is invalid.
    else {
      openingHour.closes = '00:00';
    }
  }

  /**
   * Mark the major info as changed.
   */
  controller.eventTimingChanged = function() {
    if (EventFormData.id) {
      $rootScope.$emit('eventTimingChanged', EventFormData);
    }
  };

  controller.periodicEventTimingChanged = function () {
    if (EventFormData.id) {
      if (EventFormData.hasValidPeriodicRange()) {
        controller.clearPeriodicRangeError();
        $rootScope.$emit('eventTimingChanged', EventFormData);
      } else {
        controller.displayPeriodicRangeError();
      }
    }
  };

  controller.displayPeriodicRangeError = function () {
    controller.periodicRangeError = true;
  };

  controller.clearPeriodicRangeError = function () {
    controller.periodicRangeError = false;
  };

}
