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
  eventCrud,
  $rootScope,
  price
) {

  var controller = this;
  $scope.price = price;

  $scope.editPrice = false;
  $scope.priceError = false;
  $scope.invalidPrice = false;
  $scope.savingPrice = false;
  $scope.formPriceSubmitted = false;
  var originalPrice = [];

  $scope.unsetPriceItemFree = unsetPriceItemFree;
  $scope.setPriceItemFree = setPriceItemFree;
  $scope.deletePriceItem = deletePriceItem;
  $scope.showPriceDelete = showPriceDelete;
  $scope.addPriceItem = addPriceItem;
  $scope.cancelEditPrice = cancelEditPrice;
  $scope.validatePrice = validatePrice;
  $scope.savePrice = savePrice;

  /**
   * Cancel the modal.
   */
  function cancel() {
    $uibModalInstance.dismiss('cancel');
  }

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

    $scope.editPrice = false;
    $scope.invalidPrice = false;
    $scope.priceError = false;
    $scope.formPriceSubmitted = false;
  }

  function validatePrice() {
    $scope.formPriceSubmitted = true;
    if ($scope.priceForm.$valid) {
      $scope.priceError = false;
      $scope.invalidPrice = false;
      savePrice();
    }
    else {
      $scope.invalidPrice = true;
    }
  }

  function savePrice() {
    $scope.savingPrice = true;

    EventFormData.priceInfo = $scope.price;
    $scope.editPrice = false;

    var promise = eventCrud.updatePriceInfo(EventFormData);
    promise.then(function() {
      $rootScope.$emit('eventFormSaved', EventFormData);
      if (!_.isEmpty($scope.price)) {
        $scope.priceCssClass = 'state-complete';
      }
      $scope.savingPrice = false;
      $scope.formPriceSubmitted = false;
      $uibModalInstance.close();
    }, function () {
      $scope.priceError = true;
      $scope.savingPrice = false;
      $scope.formPriceSubmitted = false;
    });
  }

}
