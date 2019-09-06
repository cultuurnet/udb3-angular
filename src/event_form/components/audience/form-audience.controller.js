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
function FormAudienceController(EventFormData, eventCrud, appConfig) {
  var controller = this;
  var componentDisabled = _.get(appConfig, 'offerEditor.disableAudience');

  controller.enabled = !componentDisabled && EventFormData.isEvent;
  controller.audienceType = isBookableEvent() ? 'education' : EventFormData.audienceType;
  controller.setAudienceType = setAudienceType;
  controller.isBookableEvent = isBookableEvent;

  function setAudienceType(audienceType) {
    eventCrud.setAudienceType(EventFormData, audienceType);
  }

  function isBookableEvent() {
    return EventFormData.getLocation().isDummyPlaceForEducationEvents;
  }

}
