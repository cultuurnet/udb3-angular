'use strict';

describe('Component: offer translate tariffs', function () {
  var $rootScope, $scope, $componentController, $q, eventCrud;

  var offer = {
    priceInfo: [
      {
        category: "base",
        name: {
          nl: "Basistarief",
          fr: "Tarif de base",
          en: "Base tariff",
          de: "Basisrate"
        },
        price: 1,
        priceCurrency: "EUR"
      },
      {
        category: "tariff",
        name: {
          nl: "Reinout",
          fr: "Rénard",
          en: "Ray"
        },
        price: 10,
        priceCurrency: "EUR"
      }
    ],
    languages: [
      "nl",
      "fr",
      "en",
      "de"
    ],
    completedLanguages: [
      "nl",
      "fr"
    ],
    mainLanguage: "nl",
  };

  var activeLanguages = {
    'nl': {'active': true, 'main': true},
    'fr': {'active': true, 'main': false},
    'en': {'active': true, 'main': false},
    'de': {'active': false, 'main': false}
  };

  beforeEach(module('udb.offer-translate'));

  beforeEach(inject(function (_$componentController_, $injector){
    $rootScope = $injector.get('$rootScope');
    $scope = $rootScope.$new();
    $componentController = _$componentController_;
    $q = $injector.get('$q');
    eventCrud = jasmine.createSpyObj('eventCrud', ['updatePriceInfo']);
  }));

  function getController() {
    var controller = $componentController('offerTranslateTariffs',
        {
          eventCrud: eventCrud
        },
        {
          offer: offer,
          activeLanguages: activeLanguages
        });

    return controller;
  }

  it('should initialize the controller', function() {
    var controller = getController();

    var expectedPriceInfo = [{
      nl: "Reinout",
      fr: "Rénard",
      en: "Ray"
    }];

    expect(controller.originalTariffs).toEqual(['Reinout']);
    expect(controller.translatedTariffs).toEqual(expectedPriceInfo);
  });

  it('should save the translated title', function () {
    var controller = getController();

    eventCrud.updatePriceInfo.and.returnValue($q.resolve());

    controller.saveTranslatedTariffs();
    $scope.$apply();

    expect(eventCrud.updatePriceInfo).toHaveBeenCalledWith(controller.offer);
  });
});
