'use strict';

angular
  .module('udb.core')
  .component('udbPublishStatusComponent', {
    bindings: {
      status: '<',
    },
    template: '<span>{{cm.statusTranslated}}</span',
    controller: PublishStatusComponentController,
    controllerAs: 'cm'
  });

/**
 * @ngInject
 */
function PublishStatusComponentController($translate) {
  var cm = this;
  cm.statusTranslated = translateStatus(cm.status);

  function translateStatus (status){
    return $translate.instant('publicationStatus.' + status);
  }

}
