'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormStep1Controller
 * @description
 * # EventFormStep1Controller
 * Step 1 of the event form
 */
angular
  .module('udb.event-form')
  .controller('EventFormStep1Controller', EventFormStep1Controller);

/* @ngInject */
function EventFormStep1Controller($scope, $rootScope, EventFormData, eventCategories, placeCategories) {

  var controller = this;

  // main storage for event form.
  $scope.eventFormData = EventFormData;

  // Categories, event types, places.
  $scope.eventTypeLabels = eventCategories;
  $scope.placeLabels = placeCategories;

  $scope.canRefine = false;
  $scope.showAllEventTypes = false;
  $scope.showAllPlaces = false;
  $scope.eventThemeLabels = [];

  $scope.activeEventType = '';
  $scope.activeEventTypeLabel = '';
  $scope.activeTheme = '';
  $scope.activeThemeLabel = '';

  $scope.splitTypes = true;

  /**
   * Update the event type and theme picker.
   * @param {EventFormData} eventFormData
   */
  controller.updateEventTypeAndThemePicker = function (eventFormData) {
    var eventTypeId = eventFormData.getEventType().id;
    var eventThemeId = eventFormData.getTheme().id;

    var eventTypes = _.union(eventCategories, placeCategories);
    var type = _.findWhere(eventTypes, {id: eventTypeId});
    var theme;

    if (type) {
      $scope.activeEventType = type.id;
      $scope.activeEventTypeLabel = type.label;
      $scope.eventThemeLabels = type.themes;

      theme = _.findWhere(type.themes, {id: eventThemeId});
    } else {
      $scope.activeEventType = '';
      $scope.activeEventTypeLabel = '';
    }

    if (theme) {
      $scope.activeTheme = theme.id;
      $scope.activeThemeLabel = theme.label;
    } else {
      $scope.activeTheme = '';
      $scope.activeThemeLabel = '';
    }

    $scope.canRefine = type && !_.isEmpty(type.themes) && !theme;
  };

  /**
   * Click listener on the event type buttons.
   * Activate the selected event type.
   */
  function setEventType(eventType, isEvent) {
    // Check if previous event type was the same.
    // If so, just show the previous entered data.
    if (EventFormData.id === eventType.id) {
      return;
    }

    $scope.activeEventType = eventType.id;

    // User selected an event.
    if (isEvent) {
      EventFormData.isEvent = true;
      EventFormData.isPlace = false;
    }
    // User selected a place.
    else {

      // Reset calendar if user switched to permanent.
      if (EventFormData.calendarType !== 'permanent') {
        EventFormData.resetCalendar();
      }

      EventFormData.isEvent = false;
      EventFormData.isPlace = true;

      // Places are default permanent. Users should not see a selection.
      EventFormData.calendarType = 'permanent';
      EventFormData.activeCalendarType = 'permanent';
      EventFormData.activeCalendarLabel = 'Permanent';
      if (EventFormData.openingHours.length === 0) {
        EventFormData.addOpeningHour('', '', '');
      }
      EventFormData.showStep(3);

    }

    EventFormData.setEventType(eventType);

    // Keep track of changes.
    if (EventFormData.id) {
      $rootScope.$emit('eventTypeChanged', EventFormData);
    }

    controller.updateEventTypeAndThemePicker(EventFormData);
    EventFormData.showStep(2);
  }

  /**
   * Click listener to reset the event type. User can select a new event type.
   */
  controller.resetEventType = function () {
    EventFormData.removeType();
    controller.updateEventTypeAndThemePicker(EventFormData);
  };

  /**
   * Click listener to set the active theme.
   * @param {EventTheme} theme
   */
  function setTheme(theme) {
    // Check if previous event theme was the same.
    // If so, just show the previous entered data.
    if (EventFormData.getTheme().id === theme.id) {
      return;
    }

    EventFormData.setTheme(theme);
    EventFormData.showStep(2);
    controller.updateEventTypeAndThemePicker(EventFormData);
    controller.eventThemeChanged(EventFormData);
  }

  /**
   * Reset the active theme which in turns updates the data to render the picker and notifies other components.
   */
  controller.resetTheme = function() {
    EventFormData.removeTheme();
    controller.updateEventTypeAndThemePicker(EventFormData);
    controller.eventThemeChanged(EventFormData);
  };

  controller.eventThemeChanged = function(EventFormData) {
    if (EventFormData.id) {
      $rootScope.$emit('eventThemeChanged', EventFormData);
    }
  };

  /**
   * Click listener to toggle the event types list.
   */
  function toggleEventTypes() {
    $scope.showAllEventTypes = !$scope.showAllEventTypes;
  }

  /**
   * Click listener to toggle th places list.
   */
  function togglePlaces() {
    $scope.showAllPlaces = !$scope.showAllPlaces;
  }

  $scope.setEventType = setEventType;
  $scope.resetEventType = controller.resetEventType;
  $scope.toggleEventTypes = toggleEventTypes;
  $scope.togglePlaces = togglePlaces;
  $scope.setTheme = setTheme;
  $scope.resetTheme = controller.resetTheme;

  controller.init = function (EventFormData) {
    if (EventFormData.id) {
      controller.updateEventTypeAndThemePicker(EventFormData);
      $scope.splitTypes = false;
    }
  };

  controller.init(EventFormData);
}
