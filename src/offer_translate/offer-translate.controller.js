'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:OfferTranslateController
 * @description
 * # OffertranslateController
 * Init the event form
 */
angular
  .module('udb.offer-translate')
  .controller('OfferTranslateController', OfferTranslateController);

/* @ngInject */
function OfferTranslateController(
    $scope,
    offerId,
    udbApi,
    moment,
    jsonLDLangFilter,
    $q,
    appConfig,
    $translate,
    offerTranslator,
    eventCrud,
    $state
) {

  $scope.loaded = false;
  $scope.mainLanguage = '';
  $scope.translatedNames = {};
  $scope.translatedDescriptions = {};
  $scope.translatedTariffs = [];
  $scope.languages = ['nl', 'fr', 'en', 'de'];
  $scope.activeLanguages = {
    'nl': {'active': false, 'main': false},
    'fr': {'active': false, 'main': false},
    'en': {'active': false, 'main': false},
    'de': {'active': false, 'main': false}
  };


  // Functions
  $scope.saveTranslatedName = saveTranslatedName;
  $scope.saveTranslatedDescription = saveTranslatedDescription;
  $scope.saveTranslatedTariffs = saveTranslatedTariffs;
  $scope.openEditPage = openEditPage;
  $scope.goToDashboard = goToDashboard;

  $q.when(offerId)
    .then(fetchOffer, offerNotFound);

  function startTranslating(offer) {
    $scope.cachedOffer = offer;
    $scope.mainLanguage = offer.mainLanguage ? offer.mainLanguage : 'nl';
    $scope.offerType = offer.url.split('/').shift();
    if ($scope.offerType === 'event') {
      $scope.isEvent = true;
      $scope.isPlace = false;
    } else {
      $scope.isEvent = false;
      $scope.isPlace = true;
    }

    $scope.originalName = _.get($scope.cachedOffer.name, $scope.cachedOffer.mainLanguage, null) ||
       _.get($scope.cachedOffer.name, 'nl', null) ||
       _.get($scope.cachedOffer, 'name', '');

    console.log($scope.cachedOffer);

    $scope.originalDescription = _.get($scope.cachedOffer.description, $scope.cachedOffer.mainLanguage, '') ||
       _.get($scope.cachedOffer.description, 'nl', '') ||
       _.get($scope.cachedOffer, 'description', '');

    $scope.originalDescription = _.isEmpty($scope.originalDescription) ? '' : $scope.originalDescription;

    $scope.originalTariffs = getOriginalTariffs();

    $scope.translatedNames = _.get($scope.cachedOffer, 'name');
    $scope.translatedDescriptions = _.get($scope.cachedOffer, 'description');
    $scope.translatedTariffs = getTranslatedTariffs();
    $scope.loaded = true;

    _.forEach($scope.cachedOffer.name, function(name, language) {
      $scope.activeLanguages[language].active = true;
    });

    $scope.activeLanguages[$scope.mainLanguage].main = true;
  }

  function offerNotFound() {
    console.log('offer not found');
  }

  /**
   * @param {string|null} offerId
   */
  function fetchOffer(offerId) {
    if (!offerId) {
      offerNotFound();
    } else {
      udbApi
        .getOffer(offerId)
        .then(startTranslating);
    }
  }

  function saveTranslatedName(language) {
    offerTranslator
      .translateProperty($scope.cachedOffer, 'name', language, $scope.translatedNames[language])
      .then(function() {
        //
      });
  }

  function saveTranslatedDescription(language) {
    offerTranslator
      .translateProperty($scope.cachedOffer, 'description', language, $scope.translatedDescriptions[language])
      .then(function() {
        //
      });
  }

  function saveTranslatedTariffs() {
    var EventFormData = $scope.cachedOffer;
    for (var key in EventFormData.priceInfo) {
      if (key > 0) {
        var originalTariff = {};
        originalTariff[$scope.mainLanguage] = $scope.originalTariffs[key - 1];
        EventFormData.priceInfo[key].name =
          _.merge(originalTariff, $scope.translatedTariffs[key - 1]);
      }
    }

    var promise = eventCrud.updatePriceInfo(EventFormData);
    promise.then(function() {
      //
    });
  }

  function getOriginalTariffs() {
    var originalTariffs = [];

    for (var key in $scope.cachedOffer.priceInfo) {
      if (key > 0) {
        originalTariffs.push(
          $scope.cachedOffer.priceInfo[key].name[$scope.mainLanguage] ?
            $scope.cachedOffer.priceInfo[key].name[$scope.mainLanguage] :
            $scope.cachedOffer.priceInfo[key].name);
      }
    }

    return originalTariffs;
  }

  function getTranslatedTariffs() {
    var translatedTariffs = [];

    for (var key in $scope.cachedOffer.priceInfo) {
      if (key > 0) {
        translatedTariffs.push($scope.cachedOffer.priceInfo[key].name);
      }
    }

    return translatedTariffs;
  }

  function openEditPage() {
    var offerLocation = $scope.cachedOffer.id.toString();
    var id = offerLocation.split('/').pop();
    $state.go('split.eventEdit', {id: id});
  }

  function goToDashboard() {
    $state.go('split.footer.dashboard');
  }

}
