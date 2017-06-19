'use strict';

describe('Controller: Price Form Modal', function() {
  var
    $scope,
    $controller,
    $uibModalInstance,
    EventFormData,
    price,
    form;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function($rootScope, _$controller_, $injector) {
    $controller = _$controller_;
    $scope = $rootScope.$new();

    $uibModalInstance = jasmine.createSpyObj('$uibModalInstance', ['close', 'dismiss']);
    EventFormData = $injector.get('EventFormData');
  }));

  function getController() {
    return $controller(
      'PriceFormModalController', {
        $scope: $scope,
        $uibModalInstance: $uibModalInstance,
        price: price
      }
    );
  }

  function getPrice() {
    return [
      {
        category: 'base',
        name: 'Basistarief',
        priceCurrency: 'EUR',
        price: 4.00
      },
      {
        category: 'tariff',
        name: 'tarief1',
        priceCurrency: 'EUR',
        price: 0
      },
      {
        category: 'tariff',
        name: 'tarief2',
        priceCurrency: 'EUR',
        price: 2.00
      }
    ];
  }

  it('should initialize the controller', function () {
    price = getPrice();
   var expectedPrice = [
     {
       category: 'base',
       name: 'Basistarief',
       priceCurrency: 'EUR',
       price: '4,00'
     },
     {
       category: 'tariff',
       name: 'tarief1',
       priceCurrency: 'EUR',
       price: '0,00'
     },
     {
       category: 'tariff',
       name: 'tarief2',
       priceCurrency: 'EUR',
       price: '2,00'
     }
   ];
    var controller = getController();

    expect(controller.price).toEqual(expectedPrice);
    expect(controller.priceError).toBeFalsy();
    expect(controller.invalidPrice).toBeFalsy();
    expect(controller.savingPrice).toBeFalsy();
    expect(controller.formPriceSubmitted).toBeFalsy();
  });

  it('should initialize the controller and set a base price when there is no price given', function () {
    price = [];
    var controller = getController();
    var expectedPrice = [{
      category: 'base',
      name: 'Basistarief',
      priceCurrency: 'EUR',
      price: ''
    }];

    expect(controller.price).toEqual(expectedPrice);
    expect(controller.priceError).toBeFalsy();
    expect(controller.invalidPrice).toBeFalsy();
    expect(controller.savingPrice).toBeFalsy();
    expect(controller.formPriceSubmitted).toBeFalsy();
  });

  it('should change a free price item to a paying price item', function () {
    price = getPrice();
    var controller = getController();
    var expectedPrice = [
      {
        category: 'base',
        name: 'Basistarief',
        priceCurrency: 'EUR',
        price: '4,00'
      },
      {
        category: 'tariff',
        name: 'tarief1',
        priceCurrency: 'EUR',
        price: ''
      },
      {
        category: 'tariff',
        name: 'tarief2',
        priceCurrency: 'EUR',
        price: '2,00'
      }
    ];

    controller.unsetPriceItemFree(1);
    expect(controller.price).toEqual(expectedPrice);
  });

  it('should change a paying price item to a free price item', function () {
    price = getPrice();
    var controller = getController();
    controller.priceForm = {
      $dirty: false,
      $setDirty: function() {}
    };
    var expectedPrice = [
      {
        category: 'base',
        name: 'Basistarief',
        priceCurrency: 'EUR',
        price: '0,00'
      },
      {
        category: 'tariff',
        name: 'tarief1',
        priceCurrency: 'EUR',
        price: '0,00'
      },
      {
        category: 'tariff',
        name: 'tarief2',
        priceCurrency: 'EUR',
        price: '2,00'
      }
    ];

    controller.setPriceItemFree(0);
    expect(controller.price).toEqual(expectedPrice);
  });

  it('should delete a price item', function () {
    price = getPrice();
    var controller = getController();
    controller.priceForm = {
      $dirty: false,
      $setDirty: function() {}
    };
    var expectedPrice = [
      {
        category: 'base',
        name: 'Basistarief',
        priceCurrency: 'EUR',
        price: '4,00'
      },
      {
        category: 'tariff',
        name: 'tarief1',
        priceCurrency: 'EUR',
        price: '0,00'
      }
    ];

    controller.deletePriceItem(2);
    expect(controller.price).toEqual(expectedPrice);
  });

  it('should show the price delete button when it\'s not the base price', function () {
    var controller = getController();
    expect(controller.showPriceDelete(1)).toBeTruthy();
  });

  it('shouldn\'t show the price delete button when it\'s the base price', function () {
    var controller = getController();
    expect(controller.showPriceDelete(0)).toBeFalsy();
  });

  it('should add a price item', function () {
    price = getPrice();
    var controller = getController();
    var expectedPrice = [
      {
        category: 'base',
        name: 'Basistarief',
        priceCurrency: 'EUR',
        price: '4,00'
      },
      {
        category: 'tariff',
        name: 'tarief1',
        priceCurrency: 'EUR',
        price: '0,00'
      },
      {
        category: 'tariff',
        name: 'tarief2',
        priceCurrency: 'EUR',
        price: '2,00'
      },
      {
        category: 'tariff',
        name: '',
        priceCurrency: 'EUR',
        price: ''
      }
    ];

    controller.addPriceItem();
    expect(controller.price).toEqual(expectedPrice);
  });

  it('should cancel the price editing and close the modal', function () {
    price = getPrice();
    var controller = getController();

    controller.cancelEditPrice();
    expect(controller.price).toEqual(price);
    expect(controller.invalidPrice).toBeFalsy();
    expect(controller.priceError).toBeFalsy();
    expect(controller.formPriceSubmitted).toBeFalsy();
    expect($uibModalInstance.dismiss).toHaveBeenCalled();
  });

  it('should validate and save the price when the form is valid', function () {
    price = getPrice();
    var controller = getController();
    controller.priceForm = {
      $valid: true
    };

    controller.validatePrice();

    expect(controller.formPriceSubmitted).toBeTruthy();
    expect(controller.priceError).toBeFalsy();
    expect(controller.invalidPrice).toBeFalsy();
    expect(EventFormData.priceInfo).toEqual(price);
    expect($uibModalInstance.close).toHaveBeenCalled();
  });

  it('should validate and don\'t save the price when the form is invalid', function () {
    price = getPrice();
    var controller = getController();
    controller.priceForm = {
      $valid: false
    };

    controller.validatePrice();

    expect(controller.invalidPrice).toBeTruthy();
  });
});
