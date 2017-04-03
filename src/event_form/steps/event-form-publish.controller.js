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
  controller.toBePublishedLater = toBePublishedLater;

  // main storage for event form.
  controller.eventFormData = EventFormData;

  var defaultPublicationDate = _.get(appConfig, 'offerEditor.defaultPublicationDate');
  var publicationDate = '';

  if (angular.isUndefined(controller.eventFormData.availableFrom) || controller.eventFormData.availableFrom === '') {
    if (angular.isUndefined(defaultPublicationDate)) {
      var today = new Date();
      publicationDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    } else {
      publicationDate = defaultPublicationDate;
    }
  }
  controller.eventFormData.availableFrom = publicationDate;

  function publish() {
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
      resolve: {
        eventFormData: function () {
          return controller.eventFormData;
        },
        eventCrud : function () {
          return eventCrud;
        }
      }
    });
  }

  function toBePublishedLater() {
    var today = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    console.log(today);
    console.log(controller.eventFormData.availableFrom);
    return today !== controller.eventFormData.availableFrom;
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
