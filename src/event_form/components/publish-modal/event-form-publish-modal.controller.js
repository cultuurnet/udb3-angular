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
  function EventFormPublishModalController($scope, $uibModalInstance, eventFormData, eventCrud) {
    var vm = this;
    vm.date = eventFormData.availableFrom;
    vm.enableDate = false;
    var today = new Date();
    if (typeof eventFormData.availableFrom === 'string' || typeof eventFormData.availableFrom === 'undefined') {
      vm.isToday = true;
    } else {
      vm.isToday = (today.toDateString() === eventFormData.availableFrom.toDateString()) ;
    }
    vm.dismiss = dismiss;
    vm.publish = publish;
    vm.drp = {
      dateFormat: 'dd/MM/yyyy',
      startOpened: false,
      options : {
        minDate : today
      }
    };
    vm.error = false;
    vm.onFocus = onFocus;

    function dismiss() {
      $uibModalInstance.dismiss();

    }

    function onFocus() {
      vm.isToday = false;
      vm.error = false;
      vm.drp.startOpened = !vm.drp.startOpened;
    }

    function publish() {
      if (today < vm.date) {
        eventFormData.availableFrom = vm.date;
        $uibModalInstance.close();
      } else {
        vm.error = true;
      }

    }

  }

})();
