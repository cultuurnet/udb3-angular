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
  $scope.openingHoursHasErrors = false;
  $scope.openingHoursErrors = {};
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
  $scope.validateOpeningHour = validateOpeningHour;
  $scope.validateOpeningHours = validateOpeningHours;
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
    angular.forEach(EventFormData.openingHours, function(openingHour) {
      openingHoursChanged(openingHour);
    });
    controller.eventTimingChanged();
  }

  /**
   * Change listener for opening hours.
   */
  function openingHoursChanged(openingHour) {
    var opensAsDate, closesAsDate;

    opensAsDate = moment(openingHour.opensAsDate);
    openingHour.opens = opensAsDate.format('HH:mm');

    closesAsDate = moment(openingHour.closesAsDate);
    openingHour.closes = closesAsDate.format('HH:mm');
  }

  function validateOpeningHour(openingHour) {

    openingHour.hasError = false;
    openingHour.errors = {};

    if (openingHour.dayOfWeek.length === 0) {
      openingHour.errors.weekdayError = true;
    }
    else {
      openingHour.errors.weekdayError = false;
    }

    if (openingHour.opens === 'Invalid date' || openingHour.opensAsDate === undefined) {
      openingHour.errors.openingHourError = true;
    }
    else {
      openingHour.errors.openingHourError = false;
    }

    if (openingHour.closes === 'Invalid date' || openingHour.closesAsDate === undefined) {
      openingHour.errors.closingHourError = true;
    }
    else {
      openingHour.errors.closingHourError = false;
    }

    if (moment(openingHour.opensAsDate) > moment(moment(openingHour.closesAsDate))) {
      openingHour.errors.closingHourGreaterError = true;
    }
    else {
      openingHour.errors.closingHourGreaterError = false;
    }

    angular.forEach(openingHour.errors, function(error, key) {
      if (error) {
        openingHour.hasError = true;
      }
    });

    validateOpeningHours();
  }

  // Validate all openinghours to set error messages.
  function validateOpeningHours() {
    $scope.openingHoursHasErrors = false;
    $scope.openingHoursErrors.weekdayError = false;
    $scope.openingHoursErrors.openingHourError = false;
    $scope.openingHoursErrors.closingHourError = false;
    $scope.openingHoursErrors.closingHourGreaterError = false;

    var errors = _.pluck(_.where(EventFormData.openingHours, {hasError: true}), 'errors');
    if (errors.length > 0) {
      $scope.openingHoursHasErrors = true;
    }
    else {
      $scope.openingHoursHasErrors = false;
    }

    $scope.openingHoursErrors.weekdayError = _.contains(_.pluck(errors, 'weekdayError'), true);
    $scope.openingHoursErrors.openingHourError = _.contains(_.pluck(errors, 'openingHourError'), true);
    $scope.openingHoursErrors.closingHourError = _.contains(_.pluck(errors, 'closingHourError'), true);
    $scope.openingHoursErrors.closingHourGreaterError = _.contains(_.pluck(errors, 'closingHourGreaterError'), true);

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
