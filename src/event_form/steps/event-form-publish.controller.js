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
    appConfig,
    EventFormData,
    eventCrud,
    OfferWorkflowStatus,
    $q,
    $location,
    $uibModal
) {

  var controller = this;

  controller.publish = publish;
  controller.publishLater = publishLater;
  controller.preview = preview;
  controller.isDraft = isDraft;
  controller.saving = false;

  // main storage for event form.
  controller.eventFormData = EventFormData;

  var defaultPublicationDate = _.get(appConfig, 'offerEditor.defaultPublicationDate');
  controller.hasNoDefault = isNaN(Date.parse(defaultPublicationDate));
  if (!controller.hasNoDefault && isDraft) {
    controller.eventFormData.availableFrom = defaultPublicationDate;
  }

  function publish() {
    controller.saving = true;
    controller.error = '';
    eventCrud
      .publishOffer(EventFormData, controller.eventFormData.availableFrom)
      .then(function(job) {
        job.task.promise
          .then(setEventAsReadyForValidation)
          .then(redirectToDetailPage)
          .catch(function() {
            controller.error = 'Dit event kon niet gepubliceerd worden, gelieve later opnieuw te proberen.';
          });
      });
  }

  function publishLater() {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/event-form-publish-modal.html',
      controller: 'EventFormPublishModalController',
      controllerAs: 'efpmc',
      resolve: {
        eventFormData: function () {
          return controller.eventFormData;
        },
        publishEvent : function() {
          return controller.publish;
        }
      }
    });
  }

  function setEventAsReadyForValidation() {
    EventFormData.workflowStatus = OfferWorkflowStatus.READY_FOR_VALIDATION;
    return $q.resolve();
  }

  function redirectToDetailPage() {
    $location.path('/' + EventFormData.getType() + '/' + EventFormData.id + '/published');
  }

  function preview() {
    $location.path('/' + EventFormData.getType() + '/' + EventFormData.id + '/saved');
  }

  function isDraft(status) {
    return (status === OfferWorkflowStatus.DRAFT);
  }
}
