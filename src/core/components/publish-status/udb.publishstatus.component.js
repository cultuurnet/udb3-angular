'use strict';

angular
  .module('udb.core')
  .component('udbPublishStatusComponent', {
    bindings: {
      event: '<',
    },
    templateUrl: 'templates/udb.publishstatus.html',
    controller: PublishStatusComponentController,
    controllerAs: 'cm'
  });

/**ik
 * @ngInject
 */
function PublishStatusComponentController($translate) {
  var cm = this;
  cm.status = translateStatus(cm.event.workflowStatus);
  cm.eventIds = eventIds;
  console.log(cm.event);

  function eventIds (event) {
    return _.union([event.id], event.sameAs);
  };

  function translateStatus (status) {
    return $translate.instant('publicationStatus.' + status);
  }

}
