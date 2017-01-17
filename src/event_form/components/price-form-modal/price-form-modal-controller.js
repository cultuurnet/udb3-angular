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

  var originalPrice = [];

  $scope.init = init;
  $scope.unsetPriceItemFree = unsetPriceItemFree;
  $scope.setPriceItemFree = setPriceItemFree;
  $scope.deletePriceItem = deletePriceItem;
  $scope.showPriceDelete = showPriceDelete;
  $scope.addPriceItem = addPriceItem;
  $scope.cancelEditPrice = cancelEditPrice;
  $scope.validatePrice = validatePrice;
  $scope.save = save;

  function init() {
    $scope.price = angular.copy(price);
    originalPrice = angular.copy(price);

    if ($scope.price.length === 0) {
      var priceItem = {
        category: 'base',
        name: 'Basistarief',
        priceCurrency: 'EUR',
        price: ''
      };
      $scope.price.push(priceItem);
    }

    $scope.priceError = false;
    $scope.invalidPrice = false;
    $scope.savingPrice = false;
    $scope.formPriceSubmitted = false;
  }

  init();

  function unsetPriceItemFree(key) {
    $scope.price[key].price = '';
  }

  function setPriceItemFree(key) {
    $scope.price[key].price = 0;
  }

  function deletePriceItem(key) {
    $scope.price.splice(key, 1);
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
    $scope.price.push(priceItem);
  }

  function cancelEditPrice() {
    $scope.price = angular.copy(originalPrice);
    originalPrice = [];

    $scope.invalidPrice = false;
    $scope.priceError = false;
    $scope.formPriceSubmitted = false;

    $uibModalInstance.dismiss('cancel');
  }

  function validatePrice() {
    $scope.formPriceSubmitted = true;
    if ($scope.priceForm.$valid) {
      $scope.priceError = false;
      $scope.invalidPrice = false;
      save();
    }
    else {
      $scope.invalidPrice = true;
    }
  }

  function save() {
    EventFormData.priceInfo = $scope.price;
    $uibModalInstance.close();
  }

}
