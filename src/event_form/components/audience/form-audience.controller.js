'use strict';

/**
 * @ngdoc function
 * @name udb.event-form:FormAudienceController
 * @description
 * # FormAudienceController
 * Controller for the form audience component
 */
angular
  .module('udb.event-form')
  .controller('FormAudienceController', FormAudienceController);

/* @ngInject */
function FormAudienceController(EventFormData, eventCrud, appConfig, $translate) {
  var controller = this;
  var componentDisabled = _.get(appConfig, 'offerEditor.disableAudience');

  controller.enabled = !componentDisabled && EventFormData.isEvent;
  controller.audienceType = EventFormData.audienceType;
  controller.setAudienceType = setAudienceType;
  controller.translateAudience = translateAudience;

  function setAudienceType(audienceType) {
    eventCrud.setAudienceType(EventFormData, audienceType);
  }

  function translateAudience (label) {
    return $translate.instant('audience.' + label);
  }
}
