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
function EventFormStep2Controller($scope, $rootScope, EventFormData) {
  var controller = this;

  // Scope vars.
  // main storage for event form.
  $scope.eventFormData = EventFormData;

  $scope.calendarLabels = [
    {'label': 'Eén of meerdere dagen', 'id' : 'single', 'eventOnly' : true},
    {'label': 'Van ... tot ... ', 'id' : 'periodic', 'eventOnly' : true},
    {'label' : 'Permanent', 'id' : 'permanent', 'eventOnly' : false}
  ];

  /**
   * Mark the major info as changed.
   */
  controller.eventTimingChanged = function() {
    if (EventFormData.id) {
      $rootScope.$emit('eventTimingChanged', EventFormData);
    }
    console.log('event timing changed');
  };

  EventFormData
    .timingChanged$
    .subscribe(controller.eventTimingChanged);
}
