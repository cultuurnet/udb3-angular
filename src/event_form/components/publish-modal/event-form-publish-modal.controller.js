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
  efpmc.maxDate = null;
  var tomorrow = moment()
    .add(1, 'days')
    .startOf('day');
  efpmc.dismiss = dismiss;
  efpmc.savePublicationDate = savePublicationDate;
  efpmc.onFocus = onFocus;

  if (eventFormData.calendarType === 'single' || eventFormData.calendarType === 'multiple') {
    var allStartHoursAsDate = _.pluck(eventFormData.timestamps, 'startHourAsDate');
    var earliestStartDate = Math.min.apply(null, allStartHoursAsDate);
    efpmc.maxDate = moment(earliestStartDate).subtract(1, 'days');
  }

  if (eventFormData.calendarType === 'periodic') {
    efpmc.maxDate = eventFormData.getStartDate();
  }

  efpmc.drp = {
    dateFormat: 'dd/MM/yyyy',
    startOpened: false,
    options: {
      minDate: tomorrow.toDate(),
      maxDate: efpmc.maxDate.toDate(),
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
