'use strict';

angular
  .module('udb.event-form')
  .component('udbEventFormOpeningHours', {
    bindings: {
      formData: '='
    },
    templateUrl: 'templates/event-form-openinghours.html',
    controller: OpeningHourComponentController,
    controllerAs: 'cm'
  });

/**
 * @ngInject
 */
function OpeningHourComponentController(moment) {
  var cm = this;

  cm.protoTypeOpeningHour = {
    opens : getPreviewHour(1),
    closes : getPreviewHour(4)
  };

  function getPreviewHour(x) {
    var now = moment();
    var open = angular.copy(now).add(x, 'hours').startOf('hour');
    return open.format('HH:mm');
  }
}
