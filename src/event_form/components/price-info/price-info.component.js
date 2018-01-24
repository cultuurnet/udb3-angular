'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormPriceInfoController
 * @description
 * # EventFormImageUploadController
 * Modal for setting the reservation period.
 */
angular
  .module('udb.event-form')
  .component('priceInfo', {
    templateUrl: 'templates/priceInfo.html',
    controller: PriceInfoComponent,
    bindings: {
      price: '<'
    }
  });

/* @ngInject */
function PriceInfoComponent($uibModal, EventFormData, eventCrud, $rootScope) {

  var controller = this;

  controller.setPriceFree = setPriceFree;
  controller.changePrice = changePrice;
  controller.openModal = openModal;
  controller.$onInit = init;

  function setPriceFree() {

    if (controller.price.length === 0) {
      controller.price = [
        {
          category: 'base',
          name: 'Basisprijs',
          priceCurrency: 'EUR',
          price: 0
        }
      ];
    }

    EventFormData.priceInfo = controller.price;

    var promise = eventCrud.updatePriceInfo(EventFormData);
    promise.then(function() {
      $rootScope.$emit('eventFormSaved', EventFormData);
      if (!_.isEmpty(controller.price)) {
        controller.priceCssClass = 'state-complete';
      }
    });
  }


  function openModal() {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/price-form-modal.html',
      controller: 'PriceFormModalController',
      controllerAs: 'pfmc',
      size: 'lg',
      resolve: {
        price: function () {
          return controller.price;
        }
      }
    });
  }


  function changePrice() {
    if (controller.organizer && controller.price.length > 0) {
      // check ticketsales
      udbUitpasApi.getTicketSales(controller.eventId, controller.organizer).then(function(hasTicketSales) {
        if (hasTicketSales) {
          controller.hasTicketSales = hasTicketSales;
          return;
        } else {
          openModal();
        }
      }, function() {
        controller.hasUitpasError = true;
      });
    }
    else {
      console.log('openmodal called');
      openModal();
    }
  }

  function openModal() {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/price-form-modal.html',
      controller: 'PriceFormModalController',
      controllerAs: 'pfmc',
      size: 'lg',
      resolve: {
        price: function () {
          return controller.price;
        }
      }
    });

    modalInstance.result.then(savePrice, cancelPrice);
  }

  function init() {
    controller.price = EventFormData.priceInfo;

    if (controller.price.length) {
      controller.priceCssClass = 'state-complete';
    }
    else {
      controller.priceCssClass = '';
    }
  }

  function savePrice() {
    controller.savingPrice = true;
    controller.price = EventFormData.priceInfo;

    controller.editPrice = false;

    var promise = eventCrud.updatePriceInfo(EventFormData);
    promise.then(function() {
      $rootScope.$emit('eventFormSaved', EventFormData);
      if (!_.isEmpty(controller.price)) {
        controller.priceCssClass = 'state-complete';
      }
      controller.savingPrice = false;
      controller.formPriceSubmitted = false;
    }, function () {
      controller.priceError = true;
      controller.savingPrice = false;
      controller.formPriceSubmitted = false;
    });
  }

  function cancelPrice() {
    controller.price = EventFormData.priceInfo;
  }
}
