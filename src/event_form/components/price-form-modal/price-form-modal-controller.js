'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:PriceFormModalController
 * @description
 * # PriceFormModalController
 * Modal for adding and editing prices.
 */
angular
  .module('udb.event-form')
  .controller('PriceFormModalController', PriceFormModalController);

/* @ngInject */
function PriceFormModalController(
  $scope,
  $uibModalInstance,
  EventFormData,
  price
) {
  var pfmc = this;
  var originalPrice = [];

  pfmc.unsetPriceItemFree = unsetPriceItemFree;
  pfmc.setPriceItemFree = setPriceItemFree;
  pfmc.deletePriceItem = deletePriceItem;
  pfmc.showPriceDelete = showPriceDelete;
  pfmc.addPriceItem = addPriceItem;
  pfmc.cancelEditPrice = cancelEditPrice;
  pfmc.validatePrice = validatePrice;

  function init() {
    pfmc.price = angular.copy(price);
    originalPrice = angular.copy(price);

    if (pfmc.price.length === 0) {
      var priceItem = {
        category: 'base',
        name: 'Basistarief',
        priceCurrency: 'EUR',
        price: ''
      };
      pfmc.price.push(priceItem);
    }

    pfmc.priceError = false;
    pfmc.invalidPrice = false;
    pfmc.savingPrice = false;
    pfmc.formPriceSubmitted = false;
  }

  init();

  function unsetPriceItemFree(key) {
    pfmc.price[key].price = '';
  }

  function setPriceItemFree(key) {
    pfmc.price[key].price = 0;
  }

  function deletePriceItem(key) {
    pfmc.price.splice(key, 1);
  }

  function showPriceDelete(key) {
    return key !== 0;

    // TODO when BE can accept empty price array
    /*if (key === 0 && pfmc.price.length === 1) {
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
    pfmc.price.push(priceItem);
  }

  function cancelEditPrice() {
    pfmc.price = angular.copy(originalPrice);
    originalPrice = [];

    pfmc.invalidPrice = false;
    pfmc.priceError = false;
    pfmc.formPriceSubmitted = false;

    $uibModalInstance.dismiss('cancel');
  }

  function validatePrice() {
    pfmc.formPriceSubmitted = true;
    if (pfmc.priceForm.$valid) {
      pfmc.priceError = false;
      pfmc.invalidPrice = false;
      save();
    }
    else {
      pfmc.invalidPrice = true;
    }
  }

  function save() {
    EventFormData.priceInfo = pfmc.price;
    $uibModalInstance.close();
  }

}
