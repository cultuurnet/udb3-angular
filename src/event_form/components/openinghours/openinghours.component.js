'use strict';

angular
  .module('udb.event-form')
  .component('udbEventFormOpeningHours', {
    bindings: {
      openingHours: '='
    },
    templateUrl: 'templates/event-form-openinghours.html',
    controller: OpeningHourComponentController,
    controllerAs: 'cm'
  });

/**
 * @ngInject
 */
function OpeningHourComponentController(moment, dayNames) {
  var cm = this;

  initPrototype();

  cm.addPrototypeOpeningHour = addPrototypeOpeningHour;
  cm.validatePrototypeOpeningHour = validatePrototypeOpeningHour;

  function initPrototype() {
    cm.prototype = {
      opensAsDate: getPreviewHour(1),
      closesAsDate: getPreviewHour(4),
      dayOfWeek: [],
      opens: '',
      closes: '',
      hasErrors: false,
      errors: {}
    };
  }

  function getPreviewHour(x) {
    var now = moment();
    var open = angular.copy(now).add(x, 'hours').startOf('hour');
    return open.toDate();
  }

  function addLabelToPrototypeOpeningHour() {
    var humanValues = [];
    if (cm.prototype.dayOfWeek instanceof Array) {
      for (var i in cm.prototype.dayOfWeek) {
        humanValues.push(dayNames[cm.prototype.dayOfWeek[i]]);
      }
    }

    cm.prototype.label = humanValues.join(', ');
  }

  function validatePrototypeOpeningHour() {
    var openMoment = moment(cm.prototype.opensAsDate);
    var closeMoment = moment(cm.prototype.closesAsDate);

    cm.prototype.errors.openIsClose = (openMoment === closeMoment);
    cm.prototype.errors.openIsBeforeClose = !openMoment.isBefore(closeMoment);
    cm.prototype.errors.closingHourError = (cm.prototype.closesAsDate === undefined);
    cm.prototype.errors.openingHourError = (cm.prototype.opensAsDate === undefined);
    cm.prototype.errors.weekdayError = (cm.prototype.dayOfWeek.length > 0);


    angular.forEach(cm.prototype.errors, function(error) {
      if (error) {
        cm.prototype.hasError = true;
      }
      else {
        cm.addPrototypeOpeningHour();
      }
    });
  }

  function addPrototypeOpeningHour() {

    var openMoment = moment(cm.prototype.opensAsDate);
    var closeMoment = moment(cm.prototype.closesAsDate);

    var openExists = (cm.prototype.opensAsDate !== null);
    var closesAsDateExists = (cm.prototype.closesAsDate !== null);
    if (!openExists) {
      cm.opensAsDate = moment();
      cm.opensAsDate.hours(0).minutes(0).seconds(0);
      cm.opensAsDate = cm.opensAsDate.toDate();
    }
    if (!closesAsDateExists) {
      cm.closesAsDate = moment();
      cm.closesAsDate.hours(23).minutes(59).seconds(59);
      cm.closesAsDate = cm.closesAsDate.toDate();
    }

    cm.prototype.opens = openMoment.format('HH:mm');
    cm.prototype.closes = closeMoment.format('HH:mm');
    addLabelToPrototypeOpeningHour();

    if (!cm.prototype.hasError) {
      cm.openingHours.addOpeningHour(angular.copy(cm.prototype));
      initPrototype();
    }

  }

}
