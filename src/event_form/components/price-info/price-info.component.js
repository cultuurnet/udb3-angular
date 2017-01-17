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
function PriceInfoComponent($scope, $uibModal, EventFormData, eventCrud, $rootScope) {

  $scope.setPriceFree = setPriceFree;
  $scope.openModal = openModal;
  $scope.savePrice = savePrice;
  $scope.cancelPrice = cancelPrice;

  init();

  function setPriceFree() {

    if ($scope.price.length === 0) {
      $scope.price = [
        {
          category: 'base',
          name: 'Basisprijs',
          priceCurrency: 'EUR',
          price: 0
        }
      ];
    }

    EventFormData.priceInfo = $scope.price;

    var promise = eventCrud.updatePriceInfo(EventFormData);
    promise.then(function() {
      $rootScope.$emit('eventFormSaved', EventFormData);
      if (!_.isEmpty($scope.price)) {
        $scope.priceCssClass = 'state-complete';
      }
    });
  }

  function openModal() {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/price-form-modal.html',
      controller: 'PriceFormModalController',
      resolve: {
        price: function () {
          return $scope.price;
        }
      }
    });

    modalInstance.result.then($scope.savePrice, $scope.cancelPrice);
  }

  function init() {
    $scope.price = EventFormData.priceInfo;

    if ($scope.price.length) {
      $scope.priceCssClass = 'state-complete';
    }
    else {
      $scope.priceCssClass = '';
    }
  }

  function savePrice() {
    $scope.savingPrice = true;
    $scope.price = EventFormData.priceInfo;

    $scope.editPrice = false;

    var promise = eventCrud.updatePriceInfo(EventFormData);
    promise.then(function() {
      $rootScope.$emit('eventFormSaved', EventFormData);
      if (!_.isEmpty($scope.price)) {
        $scope.priceCssClass = 'state-complete';
      }
      $scope.savingPrice = false;
      $scope.formPriceSubmitted = false;
    }, function () {
      $scope.priceError = true;
      $scope.savingPrice = false;
      $scope.formPriceSubmitted = false;
    });
  }

  function cancelPrice() {
    $scope.price = EventFormData.priceInfo;
  }
}
