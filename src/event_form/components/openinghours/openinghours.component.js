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
  cm.validatePrototypeWeekDays = validatePrototypeWeekDays;
  cm.validatePrototypeOpeningHour = validatePrototypeOpeningHour;
  cm.validatePrototypeClosingHour = validatePrototypeClosingHour;

  function initPrototype() {
    cm.prototype = {
      opensAsDate: getPreviewHour(1),
      closesAsDate: getPreviewHour(4),
      dayOfWeek: [],
      opens: '',
      closes: '',
      hasErrors: true, // on init always true because there is no week day selected!
      errors: {}
    };
  }

  function getPreviewHour(x) {
    var now = moment();
    var open = angular.copy(now).add(x, 'hours').startOf('hour');
    return open.toDate();
  }

  function validatePrototypeWeekDays() {
    cm.prototype.errors.weekdayError = (cm.prototype.dayOfWeek === undefined || cm.prototype.dayOfWeek.length <= 0);
    validatePrototype();
  }

  function validatePrototypeOpeningHour() {
    var openMoment = moment(cm.prototype.opensAsDate);
    var closeMoment = moment(cm.prototype.closesAsDate);
    var openExists = (cm.prototype.opensAsDate !== null);

    if (!openExists) {
      cm.opensAsDate = moment();
      cm.opensAsDate.hours(0).minutes(0).seconds(0);
      cm.opensAsDate = cm.opensAsDate.toDate();
      cm.prototype.opensAsDate = cm.opensAsDate;
    }

    cm.prototype.errors.openIsClose = (openMoment === closeMoment);
    validatePrototype();
  }

  function validatePrototypeClosingHour() {
    var closesAsDateExists = (cm.prototype.closesAsDate !== null);

    if (!closesAsDateExists) {
      cm.closesAsDate = moment();
      cm.closesAsDate.hours(23).minutes(59).seconds(59);
      cm.closesAsDate = cm.closesAsDate.toDate();
      cm.prototype.closesAsDate = cm.closesAsDate;
    }

    validatePrototype();
  }

  function validatePrototype() {
    var openMoment = moment(cm.prototype.opensAsDate);
    var closeMoment = moment(cm.prototype.closesAsDate);
    cm.prototype.errors.openIsBeforeClose = !openMoment.isBefore(closeMoment);

    var hasErrors = false;
    angular.forEach(cm.prototype.errors, function(error) {
      if (error) {
        hasErrors = true;
      }
    });

    cm.prototype.hasErrors = hasErrors;
  }

  function addPrototypeOpeningHour() {

    var openMoment = moment(cm.prototype.opensAsDate);
    var closeMoment = moment(cm.prototype.closesAsDate);

    cm.prototype.opens = openMoment.format('HH:mm');
    cm.prototype.closes = closeMoment.format('HH:mm');
    addLabelToPrototypeOpeningHour();

    if (!cm.prototype.hasErrors) {
      cm.openingHours.addOpeningHour(angular.copy(cm.prototype));
      initPrototype();
    }
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

}
