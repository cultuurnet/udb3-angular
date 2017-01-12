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
    controllerAs: 'edc',
    templateUrl: 'templates/event-duplication-calendar.directive.html'
  };
}

/* @ngInject */
function EventDuplicationCalendarController(EventFormData, $rootScope, calendarLabels) {
  var controller = this;

  controller.calendarLabels = calendarLabels;
  controller.duplicateFormData = _.cloneDeep(EventFormData);
  controller.duplicateFormData.initCalendar();

  controller.duplicateTimingChanged = function (formData) {
    $rootScope.$emit('duplicateTimingChanged', formData);
  };

  controller.duplicateFormData
    .timingChanged$
    .subscribe(controller.duplicateTimingChanged);
}
