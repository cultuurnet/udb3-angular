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
function FormAudienceController(EventFormData, udbApi) {
  var controller = this;

  controller.enabled = EventFormData.isEvent;
  controller.audienceType = EventFormData.audienceType;
  controller.setAudienceType = setAudienceType;

  function setAudienceType(audienceType) {
    udbApi.setAudienceType(EventFormData.apiUrl, audienceType);
  }
}
