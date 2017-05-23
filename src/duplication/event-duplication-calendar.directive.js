'use strict';

/**
 * @ngdoc directive
 * @name udb.duplication.directive:udbEventDuplicationCalendar
 * @description
 *  Shows the calendar when you try to create a duplicate event.
 */
angular
  .module('udb.duplication')
  .directive('udbEventDuplicationCalendar', udbEventDuplicationCalendar);

/* @ngInject */
function udbEventDuplicationCalendar() {
  return {
    restrict: 'AE',
    controller: EventDuplicationCalendarController,
    controllerAs: 'calendar',
    templateUrl: 'templates/form-event-calendar.component.html'
  };
}

/* @ngInject */
function EventDuplicationCalendarController(EventFormData, OpeningHoursCollection, $rootScope, $controller, $scope) {
  var calendar = this;
  var duplicateFormData = EventFormData.clone();

  function duplicateTimingChanged(formData) {
    $rootScope.$emit('duplicateTimingChanged', formData);
  }

  $controller('BaseCalendarController', {calendar: calendar, $scope: $scope});

  calendar.init(duplicateFormData, _.cloneDeep(OpeningHoursCollection));

  calendar.formData
    .timingChanged$
    .subscribe(duplicateTimingChanged);
}
