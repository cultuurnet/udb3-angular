'use strict';

/**
 * @ngdoc component
 * @name udb.search.directive:udbSearchBar
 * @description
 * # udbQuerySearchBar
 */
angular
  .module('udb.core')
  .component('udbTime', {
    template: '<input type="time" class="form-control uur">',
    controller: TimeComponent,
    bindings: {
      onChange: '&'
    }
  });

/* @ngInject */
function TimeComponent($rootScope, EventFormData) {
  var tc = this;

  tc.hoursChanged = hoursChanged;

  /**
  * Change listener on the start- and openinghours
  * Save the date-object and label formatted HH:MM
  */
  function hoursChanged(timestamp) {
    console.log(timestamp);
    if (timestamp.showStartHour && angular.isDate(timestamp.startHourAsDate)) {
      var startHourAsDate = moment(timestamp.startHourAsDate);
      timestamp.startHour = startHourAsDate.format('HH:mm');
      eventTimingChanged();
    }
    if (timestamp.showEndHour && angular.isDate(timestamp.endHourAsDate)) {
      var endHourAsDate = moment(timestamp.endHourAsDate);
      timestamp.endHour = endHourAsDate.format('HH:mm');
      eventTimingChanged();
    }
  }

  function eventTimingChanged() {
    if (EventFormData.id) {
      $rootScope.$emit('eventTimingChanged', EventFormData);
    }
  }
}
