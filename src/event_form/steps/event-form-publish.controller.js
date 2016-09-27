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
    eventCrud
) {

  var controller = this;

  controller.publish = publish;

  // Scope vars.
  // main storage for event form.
  $scope.eventFormData = EventFormData;

  function publish() {
    eventCrud
      .publishOffer(EventFormData, 'Publish offer')
      .then(function(job) {
        job.task.promise.then(redirectToDetailPage, function() {
          // TODO error occured, everyone is sad
        });
      });
  }

  function redirectToDetailPage(offerLocation) {
    // TODO redirect to edit
    console.log('this was published.');
  }
}
