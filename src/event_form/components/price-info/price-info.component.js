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
function PriceInfoComponent($scope, EventFormData, eventCrud, appConfig, $rootScope) {

  var controller = this;

  // Price info vars.
  controller.editPrice = false;
  controller.priceError = false;
  controller.invalidPrice = false;
  controller.savingPrice = false;
  controller.formPriceSubmitted = false;
  var originalPrice = [];
  controller.editingPrice = editingPrice;
  controller.unsetPriceItemFree = unsetPriceItemFree;
  controller.setPriceItemFree = setPriceItemFree;
  controller.deletePriceItem = deletePriceItem;
  controller.showPriceDelete = showPriceDelete;
  controller.addPriceItem = addPriceItem;
  controller.cancelEditPrice = cancelEditPrice;
  controller.validatePrice = validatePrice;
  controller.savePrice = savePrice;

  init();

  function editingPrice(firstItem) {
    if (firstItem === undefined) {
      firstItem = false;
    }

    controller.editPrice = true;
    originalPrice = angular.copy(controller.price);

    if (firstItem && controller.price.length === 0) {
      controller.price = [
        {
          category: 'base',
          name: 'Basisprijs',
          priceCurrency: 'EUR',
          price: 0
        }
      ];
    }

    else if (controller.price.length === 0) {
      controller.price = [
        {
          category: 'base',
          name: 'Basisprijs',
          priceCurrency: 'EUR',
          price: ''
        }
      ];
    }
  }

  function unsetPriceItemFree(key) {
    controller.price[key].price = '';
  }

  function setPriceItemFree(key) {
    controller.price[key].price = 0;
  }

  function deletePriceItem(key) {
    controller.price.splice(key, 1);
  }

  function showPriceDelete(key) {
    return key !== 0;

    // TODO when BE can accept empty price array
    /*if (key === 0 && controller.price.length === 1) {
      return true;
    }
    else {
      return false
    }*/
  }

  function addPriceItem() {
    var priceItem = {
      category: 'tariff',
      name: '',
      priceCurrency: 'EUR',
      price: ''
    };
    controller.price.push(priceItem);
  }

  function cancelEditPrice() {
    controller.price = angular.copy(originalPrice);
    originalPrice = [];

    controller.editPrice = false;
    controller.invalidPrice = false;
    controller.priceError = false;
    controller.formPriceSubmitted = false;
  }

  function validatePrice() {
    controller.formPriceSubmitted = true;
    if ($scope.priceForm.$valid) {
      controller.priceError = false;
      controller.invalidPrice = false;
      savePrice();
    }
    else {
      controller.invalidPrice = true;
    }
  }

  function savePrice() {
    controller.savingPrice = true;

    EventFormData.price = controller.price;
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

  function init() {
    if (controller.price.length) {
      controller.priceCssClass = 'state-complete';
    }
    else {
      controller.priceCssClass = '';
    }
  }
}
