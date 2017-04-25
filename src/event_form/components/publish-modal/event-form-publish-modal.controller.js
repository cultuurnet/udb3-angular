(function () {
  'use strict';

  /**
   * @ngdoc function
   * @name udbApp.controller:EventFormPublishModalController
   * @description
   * # EventFormPublishModalController
   * Modal for postponing a publish.
   */
  angular
    .module('udb.event-form')
    .controller('EventFormPublishModalController', EventFormPublishModalController);

  /* @ngInject */
  function EventFormPublishModalController($scope, $uibModalInstance, eventFormData, eventCrud, publishEvent) {
    var efpmc = this;
    efpmc.error = false;
    efpmc.hasPublicationDate = false;
    efpmc.publicationDate = eventFormData.availableFrom;
    var tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
    efpmc.dismiss = dismiss;
    efpmc.savePublicationDate = savePublicationDate;
    efpmc.onFocus = onFocus;

    efpmc.drp = {
      dateFormat: 'dd/MM/yyyy',
      startOpened: false,
      options : {
        minDate : tomorrow
      }
    };

    function dismiss() {
      $uibModalInstance.dismiss();
    }

    function onFocus() {
      efpmc.hasPublicationDate = true;
      efpmc.error = false;
      efpmc.drp.startOpened = !efpmc.drp.startOpened;
    }

    function savePublicationDate() {
      if (tomorrow <= efpmc.publicationDate) {
        var availableFrom = new Date(efpmc.publicationDate.getFullYear(), efpmc.publicationDate.getMonth(),
        efpmc.publicationDate.getDate(), 0, 0, 0);
        eventFormData.availableFrom = availableFrom;
        publishEvent();
        $uibModalInstance.close();
      } else {
        efpmc.error = true;
      }
    }

  }

})();
