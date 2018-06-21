'use strict';

describe('Component: offer translate title', function () {
  var $rootScope, $scope, $componentController, $q, offerTranslator;

  var offer = {
    name: {
      nl: "translate event",
      fr: "franse titel",
      en: "engelse titel"
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
    offerTranslator = jasmine.createSpyObj('offerTranslator', ['translateProperty']);
  }));

  function getController() {
    var controller = $componentController('offerTranslateTitle',
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

    var expectedNames = {
      nl: "translate event",
      fr: "franse titel",
      en: "engelse titel"
    };

    expect(controller.originalName).toEqual('translate event');
    expect(controller.translatedNames).toEqual(expectedNames);
  });

  it('should save the translated title', function () {
    var controller = getController();

    offerTranslator.translateProperty.and.returnValue($q.resolve());

    controller.saveTranslatedName('fr');
    $scope.$apply();

    expect(offerTranslator.translateProperty).toHaveBeenCalledWith(controller.offer, 'name', 'fr', controller.translatedNames['fr']);
  });
});
