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
  $scope.lastSelectedDate = '';

  // Scope functions
  $scope.setCalendarType = setCalendarType;
  $scope.resetCalendar = resetCalendar;
  $scope.addTimestamp = addTimestamp;
  $scope.toggleStartHour = controller.toggleStartHour;
  $scope.toggleEndHour = toggleEndHour;
  $scope.saveOpeningHourDaySelection = saveOpeningHourDaySelection;
  $scope.saveOpeningHours = saveOpeningHours;
  $scope.eventTimingChanged = controller.eventTimingChanged;
  $scope.dateChosen = dateChosen;

  function setCalendarType(type) {
    EventFormData.setCalendarType(type);

    if (EventFormData.calendarType === 'permanent') {
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

  function resetCalendar() {
    EventFormData.resetCalendar();
  }

  function saveOpeningHourDaySelection(index, dayOfWeek) {
    EventFormData.saveOpeningHourDaySelection(index, dayOfWeek);
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
   * Save the opening hours.
   */
  function saveOpeningHours() {
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
