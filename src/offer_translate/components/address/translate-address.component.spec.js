'use strict';

describe('Component: offer translate address', function () {
  var $rootScope, $scope, $componentController, $q, offerTranslator;

  var offer = {
    address: {
      nl: {
        addressCountry: "BE",
        addressLocality: "Brussel",
        postalCode: "1000",
        streetAddress: "Sint Gisleinstraat 115"
      },
      fr: {
        addressCountry: "BE",
        addressLocality: "Bruxelles",
        postalCode: "1000",
        streetAddress: "Rue de Saint-Gislein"
      }
    },
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
    offerTranslator = jasmine.createSpyObj('offerTranslator', ['translateAddress']);
  }));

  function getController() {
    var controller = $componentController('offerTranslateAddress',
        {
          offerTranslator: offerTranslator
        },
        {
          offer: offer,
          activeLanguages: activeLanguages
        });

    return controller;
  }

  it('should initialize the controller', function() {
    var controller = getController();

    var expectedOriginalAddress = {
      addressCountry: "BE",
      addressLocality: "Brussel",
      postalCode: "1000",
      streetAddress: "Sint Gisleinstraat 115"
    };

    var expectedTranslatedAddresses = {
      nl: {
        addressCountry: "BE",
        addressLocality: "Brussel",
        postalCode: "1000",
        streetAddress: "Sint Gisleinstraat 115"
      },
      fr: {
        addressCountry: "BE",
        addressLocality: "Bruxelles",
        postalCode: "1000",
        streetAddress: "Rue de Saint-Gislein"
      },
      en: {
        addressCountry: "BE",
        addressLocality: "Brussel",
        postalCode: "1000"
      },
      de: {
        addressCountry: "BE",
        addressLocality: "Brussel",
        postalCode: "1000"
      }
    };

    expect(controller.originalAddress).toEqual(expectedOriginalAddress);
    expect(controller.translatedAddresses).toEqual(expectedTranslatedAddresses);
  });

  it('should save the translated title', function () {
    var controller = getController();

    offerTranslator.translateAddress.and.returnValue($q.resolve());

    controller.saveTranslatedAddress('fr');
    $scope.$apply();

    expect(offerTranslator.translateAddress).toHaveBeenCalledWith(controller.offer, 'fr', controller.translatedAddresses['fr']);
  });
});
