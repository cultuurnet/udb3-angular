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

  // Scope functions
  $scope.setCalendarType = setCalendarType;
  $scope.resetCalendar = resetCalendar;
  $scope.addTimestamp = addTimestamp;
  $scope.toggleStartHour = controller.toggleStartHour;
  $scope.toggleEndHour = toggleEndHour;
  $scope.saveOpeningHourDaySelection = saveOpeningHourDaySelection;
  $scope.saveOpeningHours = saveOpeningHours;
  $scope.eventTimingChanged = controller.eventTimingChanged;

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
      EventFormData.addOpeningHour('', '', '');
    }

    if (EventFormData.calendarType === 'permanent') {
      EventFormData.addOpeningHour('', '', '');
      controller.eventTimingChanged();
    }

    initCalendar();

    if (EventFormData.id) {
      EventFormData.majorInfoChanged = true;
    }

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
    EventFormData.addTimestamp('', '', '');
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
      timestamp.endHour = '';
      timestamp.showEndHour = false;
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
