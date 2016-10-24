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
      position: '<'
    }
  });

/* @ngInject */
function TimeComponentController($rootScope, EventFormData) {
  var tcc = this;

  tcc.hoursChanged = hoursChanged;

  /**
  * Change listener on the start- and openinghours
  * Save the date-object and label formatted HH:MM
  */
  function hoursChanged(timestamp) {
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
