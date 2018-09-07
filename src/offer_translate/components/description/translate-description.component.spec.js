'use strict';

describe('Component: offer translate description', function () {
  var $rootScope, $scope, $componentController, $q, offerTranslator;

  var offer = {
    description: {
      nl: "adsfadsfa",
      fr: "franse beschrijving2",
      en: "engelse beschrijving"
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
    var controller = $componentController('offerTranslateDescription',
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

    var expectedDescriptions = {
      nl: "adsfadsfa",
      fr: "franse beschrijving2",
      en: "engelse beschrijving"
    };

    expect(controller.originalDescription).toEqual('adsfadsfa');
    expect(controller.translatedDescriptions).toEqual(expectedDescriptions);
  });

  it('should save the translated description', function () {
    var controller = getController();

    offerTranslator.translateProperty.and.returnValue($q.resolve());

    controller.saveTranslatedDescription('fr');
    $scope.$apply();

    expect(offerTranslator.translateProperty).toHaveBeenCalledWith(controller.offer, 'description', 'fr', controller.translatedDescriptions['fr']);
  });
});
