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
  $uibModalInstance,
  EventFormData,
  price,
  $filter,
  $scope,
  $translate
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
    } else {
      angular.forEach(pfmc.price, function(info) {
        info.price = $filter('currency')(info.price, ',', 0);
      });
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
    pfmc.price[key].price = '0,00';
    pfmc.priceForm.$setDirty();
  }

  function deletePriceItem(key) {
    pfmc.price.splice(key, 1);
    pfmc.priceForm.$setDirty();
  }

  function showPriceDelete(key) {
    return key !== 0;
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
    angular.forEach(pfmc.price, function(info) {
      info.price = parseFloat(info.price.replace(',', '.'));
    });
    EventFormData.priceInfo = pfmc.price;
    $uibModalInstance.close();
  }

  $scope.translatePrice = function (priceLabel) {
    return $translate.instant('prices.' + priceLabel);
  };

}
