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
  efpmc.error = '';
  efpmc.hasPublicationDate = false;
  efpmc.publicationDate = eventFormData.availableFrom;
  var tomorrow = moment()
    .add(1, 'days')
    .startOf('day');
  efpmc.dismiss = dismiss;
  efpmc.savePublicationDate = savePublicationDate;
  efpmc.onFocus = onFocus;

  efpmc.drp = {
    dateFormat: 'dd/MM/yyyy',
    startOpened: false,
    options: {
      minDate: tomorrow.toDate(),
      maxDate: moment(eventFormData.startDate).subtract(1, 'd'),
      showWeeks: false
    }
  };

  function dismiss() {
    $uibModalInstance.dismiss();
  }

  function onFocus() {
    efpmc.drp.startOpened = !efpmc.drp.startOpened;
  }

  function savePublicationDate() {
    if (!efpmc.publicationDate) {
      efpmc.error = 'empty';
    } else if (tomorrow <= efpmc.publicationDate) {
      eventFormData.availableFrom = new Date(efpmc.publicationDate.getFullYear(), efpmc.publicationDate.getMonth(),
      efpmc.publicationDate.getDate(), 0, 0, 0);
      publishEvent();
      $uibModalInstance.close();
    } else {
      efpmc.error = 'past';
    }
  }

}
