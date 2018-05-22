'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventTranslateController
 * @description
 * # EventTranslateController
 * Init the event form
 */
angular
  .module('udb.event-translate')
  .controller('EventTranslateController', EventTranslateController);

/* @ngInject */
function EventTranslateController(
    $scope,
    offerId,
    EventTranslateData,
    udbApi,
    moment,
    jsonLDLangFilter,
    $q,
    appConfig,
    $translate,
    offerTranslator,
    eventCrud
) {

  // Other controllers won't load until this boolean is set to true.
  $scope.loaded = false;
  $scope.mainLanguage = '';
  $scope.eventTranslateData = EventTranslateData;
  $scope.translatedNames = {};
  $scope.translatedDescriptions = {};
  $scope.translatedTariffs = [];
  $scope.languages = ['nl', 'fr', 'en', 'de'];

  // Functions
  $scope.saveTranslatedName = saveTranslatedName;
  $scope.saveTranslatedDescription = saveTranslatedDescription;
  $scope.saveTranslatedTariffs = saveTranslatedTariffs;

  $q.when(offerId)
    .then(fetchOffer, offerNotFound);

  function startTranslating(offer) {
    $scope.cachedOffer = offer;
    $scope.mainLanguage = offer['mainLanguage'] ? offer['mainLanguage'] : 'nl';
    $scope.languages = _.reject($scope.languages, function(language){ return language == $scope.mainLanguage; });

    $scope.originalName = _.get($scope.cachedOffer.name, $scope.cachedOffer.mainLanguage, null) ||
       _.get($scope.cachedOffer.name, 'nl', null) ||
       _.get(item, 'name', '');

    $scope.originalDescription = _.get($scope.cachedOffer.description, $scope.cachedOffer.mainLanguage, null) ||
       _.get($scope.cachedOffer.description, 'nl', null) ||
       _.get($scope.cachedOffer, 'description', '');

    $scope.originalTariffs = getOriginalTariffs();

    $scope.translatedNames = _.get($scope.cachedOffer, 'name');
    $scope.translatedDescriptions = _.get($scope.cachedOffer, 'description');
    $scope.translatedTariffs = {};
    $scope.loaded = true;
  }

  function offerNotFound() {
    console.log("offer not found");
  }

  /**
   * @param {string|null} offerId
   */
  function fetchOffer(offerId) {
    if (!offerId) {
      offerNotFound()
    } else {
      udbApi
        .getOffer(offerId)
        .then(startTranslating);
    }
  }

  function saveTranslatedName(language) {
    offerTranslator
      .translateProperty($scope.cachedOffer, 'name', language, $scope.translatedNames[language])
      .then(function(){
        //
      });
  }

  function saveTranslatedDescription(language) {
    offerTranslator
      .translateProperty($scope.cachedOffer, 'description', language, $scope.translatedDescriptions[language])
      .then(function(){
        //
      });
  }

  function saveTranslatedTariffs() {
    var EventFormData = $scope.cachedOffer;
    for (var key in EventFormData.priceInfo) {
      if (key > 0) {
        var originalTariff = {};
        originalTariff[$scope.mainLanguage] = $scope.originalTariffs[key-1];
        EventFormData.priceInfo[key].name = _.merge(originalTariff, $scope.translatedTariffs[key-1]);
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
      if(key > 0) {
        originalTariffs.push(
          $scope.cachedOffer.priceInfo[key].name[$scope.mainLanguage] ?
            $scope.cachedOffer.priceInfo[key].name[$scope.mainLanguage] :
            $scope.cachedOffer.priceInfo[key].name);
      }
    }

    return originalTariffs;
  }


}
