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

  // main storage for event form.
  controller.eventFormData = EventFormData;

  function publish() {
    controller.error = '';
    if (EventFormData.workflowStatus !== OfferWorkflowStatus.DRAFT) {
      redirectToDetailPage();
      return;
    }

    eventCrud
      .publishOffer(EventFormData, 'publishOffer')
      .then(function(job) {
        job.task.promise
          .then(setEventAsReadyForValidation)
          .then(redirectToDetailPage)
          .catch(function() {
            controller.error = 'Dit event kon niet gepubliceerd worden, gelieve later opnieuw te proberen.';
          });
      });
  }

  function setEventAsReadyForValidation() {
    EventFormData.workflowStatus = OfferWorkflowStatus.READY_FOR_VALIDATION;

    return $q.resolve();
  }

  function redirectToDetailPage() {
    $location.path('/event/' + EventFormData.id);
  }
}
