'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:DuplicationCalendarController
 * @description
 * # Duplication Calendar Controller
 */
angular
  .module('udb.duplication')
  .controller('DuplicationCalendarController', DuplicationCalendarController);

/* @ngInject */
function DuplicationCalendarController(EventFormData, OpeningHoursCollection, $rootScope, $controller, $scope) {
  var calendar = this;
  var duplicateFormData = EventFormData.clone();

  function duplicateTimingChanged(formData) {
    $rootScope.$emit('duplicateTimingChanged', formData);
  }

  $controller('BaseCalendarController', {calendar: calendar, $scope: $scope});

  calendar.init(duplicateFormData, _.cloneDeep(OpeningHoursCollection));

  calendar.timeSpans.forEach(function(timeSpan) {timeSpan.status = {type: 'Available'};});

  calendar.formData
    .timingChanged$
    .subscribe(duplicateTimingChanged);
}
