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
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    if (typeof eventFormData.availableFrom === 'string' || typeof eventFormData.availableFrom === 'undefined') {
      efpmc.isToday = true;
    } else {
      efpmc.isToday = (today.toDateString() === eventFormData.availableFrom.toDateString()) ;
    }
    efpmc.dismiss = dismiss;
    efpmc.savePublicationDate = savePublicationDate;
    efpmc.onFocus = onFocus;
    efpmc.disablePublicationDate = disablePublicationDate;

    efpmc.drp = {
      dateFormat: 'dd/MM/yyyy',
      startOpened: false,
      options : {
        minDate : today
      }
    };

    function dismiss() {
      $uibModalInstance.dismiss();
    }

    function disablePublicationDate() {
      efpmc.error = false;
      efpmc.hasPublicationDate = false;
      efpmc.publicationDate = today;
    }

    function onFocus() {
      efpmc.hasPublicationDate = true;
      efpmc.isToday = false;
      efpmc.error = false;
      efpmc.drp.startOpened = !efpmc.drp.startOpened;
    }

    function savePublicationDate() {
      if (today <= efpmc.publicationDate) {
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
