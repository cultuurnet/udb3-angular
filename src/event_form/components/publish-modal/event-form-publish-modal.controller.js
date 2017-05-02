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
  function EventFormPublishModalController($uibModalInstance, eventFormData, publishEvent) {
    var efpmc = this;
    efpmc.error = false;
    efpmc.hasPublicationDate = false;
    efpmc.publicationDate = eventFormData.availableFrom;
    var tomorrow = moment(new Date()).add(1, 'days');
    tomorrow.hours(0);
    tomorrow.minutes(0);
    tomorrow.seconds(0);
    efpmc.dismiss = dismiss;
    efpmc.savePublicationDate = savePublicationDate;
    efpmc.onFocus = onFocus;

    efpmc.drp = {
      dateFormat: 'dd/MM/yyyy',
      startOpened: false,
      options : {
        minDate : tomorrow.toDate()
      }
    };

    function dismiss() {
      $uibModalInstance.dismiss();
    }

    function onFocus() {
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
