'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormStep3Controller
 * @description
 * # EventFormStep3Controller
 * Step 3 of the event form
 */
angular
  .module('udb.event-form')
  .controller('EventFormPublishController', EventFormPublishController);

/* @ngInject */
function EventFormPublishController(
    $scope,
    EventFormData,
    eventCrud,
    OfferWorkflowStatus,
    $q,
    $location
) {

  var controller = this;

  controller.publish = publish;

  // Scope vars.
  // main storage for event form.
  $scope.eventFormData = EventFormData;

  function publish() {
    if (EventFormData.workflowStatus !== OfferWorkflowStatus.DRAFT) {
      redirectToDetailPage(EventFormData.apiUrl);
      return;
    }

    eventCrud
      .publishOffer(EventFormData, 'publishOffer')
      .then(function(job) {
        job.task.promise
          .then(setEventAsReadyForValidation)
          .then(redirectToDetailPage)
          .catch(function() {
            // TODO error occured, everyone is sad
          });
      });
  }

  function setEventAsReadyForValidation(offerLocation) {
    EventFormData.workflowStatus = OfferWorkflowStatus.READY_FOR_VALIDATION;

    return $q.resolve(offerLocation);
  }

  function redirectToDetailPage(offerLocation) {
    $location.path('/event/' + EventFormData.id);
  }
}
