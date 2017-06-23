'use strict';

angular
  .module('udb.cultuurkuur')
  .component('udbEventCultuurkuurComponent', {
    bindings: {
      event: '<',
      permission: '<'
    },
    templateUrl: 'templates/event-cultuurkuur.html',
    controller: EventCultuurKuurComponentController
  });

/**
 * @ngInject
 */
function EventCultuurKuurComponentController(appConfig) {
  var cm = this,
      cultuurkuurUrl = _.get(appConfig, 'cultuurkuurUrl');

  if (!cultuurkuurUrl) {
    throw 'cultuurkuur url is not configured';
  }

  cm.previewLink = cultuurkuurUrl + 'agenda/e//' + cm.event.id + '?utm_source=uitdatabank.be&utm_medium=referral&utm_campaign=udb3&utm_content=preview1.0';
  cm.editLink = cultuurkuurUrl + 'event/' + cm.event.id + '/edit' + '?utm_source=uitdatabank.be&utm_medium=referral&utm_campaign=udb3&utm_content=edit1.0';
  cm.isIncomplete = (cm.event.educationFields.length === 0 && cm.event.educationLevels.length === 0);

  cm.cultuurKuurInfo = {
    levels : _.pluck(cm.event.educationLevels, 'label'),
    fields : _.pluck(cm.event.educationFields, 'label'),
    targetAudience : _.pluck(cm.event.educationTargetAudience, 'label')
  };

  cm.forSchools = cm.event.audience.audienceType === 'education';
}
