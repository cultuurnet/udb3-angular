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
    templateUrl: 'templates/time.html',
    controller: TimeComponentController,
    controllerAs: 'tcc',
    bindings: {
      time: '=',
      position: '<',
      method: '<'
    }
  });

/* @ngInject */
function TimeComponentController($rootScope, EventFormData) {
  var tcc = this;

  tcc.hoursChanged = hoursChanged;
  tcc.openingHoursChanged = openingHoursChanged;

  /**
  * Change listener on the start- and openinghours
  * Save the date-object and label formatted HH:MM
  */
  function hoursChanged(timestamp) {
    if (timestamp.showStartHour && tcc.position === 'start') {
      var startHourAsDate = moment(timestamp.startHourAsDate);
      timestamp.startHour = startHourAsDate.format('HH:mm');
    }
    if (timestamp.showEndHour && tcc.position === 'end') {
      var endHourAsDate = moment(timestamp.endHourAsDate);
      timestamp.endHour = endHourAsDate.format('HH:mm');
    }
    eventTimingChanged();
  }

  function openingHoursChanged(openingHour) {
    var opensAsDate = moment(openingHour.opensAsDate);
    openingHour.opens = opensAsDate.format('HH:mm');
    var closesAsDate = moment(openingHour.closesAsDate);
    openingHour.closes = closesAsDate.format('HH:mm');
  }

  function eventTimingChanged() {
    if (EventFormData.id) {
      $rootScope.$emit('eventTimingChanged', EventFormData);
    }
  }
}
