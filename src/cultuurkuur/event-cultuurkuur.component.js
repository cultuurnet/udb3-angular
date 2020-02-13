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

function EventCultuurKuurComponentController(appConfig, uitidAuth, cultuurkuurLabels) {
  var cm = this;
  cm.cultuurkuurMaintenance = _.get(appConfig, 'cultuurkuur.maintenance');
  if (!cm.cultuurkuurMaintenance) {
    var cultuurkuurUrl = _.get(appConfig, 'cultuurkuur.cultuurkuurUrl');
    cm.user = uitidAuth.getUser();
    cm.previewLink = cultuurkuurUrl + 'agenda/e/x/' + cm.event.id + getUTMParameters('preview1.0');
    cm.editLink = cultuurkuurUrl + 'event/' + cm.event.id + '/edit' + getUTMParameters('edit1.0');
    cm.continueLink = cultuurkuurUrl + 'event/' + cm.event.id + '/edit' + getUTMParameters('continue1.0');
    cm.educationFieldsViaLabels = getCultuurkuurLabels('educationFields');
    cm.educationLevelsViaLabels = getCultuurkuurLabels('educationLevels');
    cm.targetAudienceViaLabels = getCultuurkuurLabels('targetAudience');

    cm.cultuurKuurInfo = {
      levels:
        cm.educationLevelsViaLabels.length > 0 ?
        cm.educationLevelsViaLabels :
        _.pluck(cm.event.educationLevels, 'label'),
      fields:
        cm.educationFieldsViaLabels.length > 0 ?
        cm.educationFieldsViaLabels :
        _.pluck(cm.event.educationFields, 'label'),
      targetAudience:
        cm.targetAudienceViaLabels.length > 0 ?
        cm.targetAudienceViaLabels :
        _.pluck(cm.event.educationTargetAudience, 'label')
    };

    cm.isIncomplete =  (cm.cultuurKuurInfo.levels.length === 0 && cm.cultuurKuurInfo.fields.length === 0);

    cm.forSchools = cm.event.audience.audienceType === 'education';
  }
  else {
    cm.cultuurkuurMessage = _.get(appConfig, 'cultuurkuur.cultuurkuurMessage');
  }

  function getUTMParameters(type) {
    return '?utm_source=uitdatabank.be' +
    '&utm_medium=referral' +
    '&utm_campaign=udb3' +
    '&utm_content=' + type +
    '&uid=' + cm.user.id;
  }

  function getCultuurkuurLabels(type) {
    var mergedLabels = cm.event.labels.concat(cm.event.hiddenLabels);
    var fieldLabels = mergedLabels
      .filter(function(label) {
        return (cultuurkuurLabels[type].indexOf(label) > -1);
      })
      .map(function(label) {
        return label.replace('cultuurkuur_', '');
      });

    return fieldLabels;
  }
}
