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
function EventCultuurKuurComponentController(appConfig, uitidAuth) {
  var cm = this,
      cultuurkuurUrl = _.get(appConfig, 'cultuurkuurUrl');

  cm.user = uitidAuth.getUser();
  cm.previewLink = cultuurkuurUrl + 'agenda/e//' + cm.event.id + getUTMParameters('preview1.0');
  cm.editLink = cultuurkuurUrl + 'event/' + cm.event.id + '/edit' + getUTMParameters('edit1.0');
  cm.continueLink = cultuurkuurUrl + 'event/' + cm.event.id + '/edit' + getUTMParameters('continue1.0');
  cm.isIncomplete = (cm.event.educationFields.length === 0 && cm.event.educationLevels.length === 0);

  cm.cultuurKuurInfo = {
    levels : _.pluck(cm.event.educationLevels, 'label'),
    fields : _.pluck(cm.event.educationFields, 'label'),
    targetAudience : _.pluck(cm.event.educationTargetAudience, 'label')
  };

  cm.forSchools = cm.event.audience.audienceType === 'education';

  function getUTMParameters(type) {
    return '?utm_source=uitdatabank.be' +
    '&utm_medium=referral' +
    '&utm_campaign=udb3' +
    '&utm_content=' + type +
    '&uid=' + cm.user.id;
  }
}
