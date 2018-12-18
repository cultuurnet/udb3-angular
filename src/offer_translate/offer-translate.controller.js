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
    jsonLDLangFilter,
    $q,
    $translate,
    $state
) {

  $scope.apiUrl = '';
  $scope.loaded = false;
  $scope.mainLanguage = '';
  $scope.languages = ['nl', 'fr', 'en', 'de'];
  $scope.activeLanguages = {
    'nl': {'active': false, 'main': false},
    'fr': {'active': false, 'main': false},
    'en': {'active': false, 'main': false},
    'de': {'active': false, 'main': false}
  };

  // Functions
  $scope.openEditPage = openEditPage;
  $scope.goToDashboard = goToDashboard;

  $q.when(offerId)
    .then(fetchOffer, offerNotFound);

  function startTranslating(offer) {
    $scope.language = $translate.use() || 'nl';
    $scope.cachedOffer = offer;
    $scope.apiUrl = offer.apiUrl;
    $scope.mainLanguage = offer.mainLanguage ? offer.mainLanguage : 'nl';
    $scope.translatedOffer = jsonLDLangFilter(offer, $scope.language, true);
    $scope.originalName = $scope.translatedOffer.name;

    if (offer.url !== undefined) {
      $scope.offerType = offer.url.split('/').shift();
    } else {
      $scope.offerType = 'organizer';
    }
    if ($scope.offerType === 'event') {
      $scope.isEvent = true;
      $scope.isPlace = false;
      $scope.isOrganizer = false;
    } else if ($scope.offerType === 'organizer') {
      $scope.isEvent = false;
      $scope.isPlace = false;
      $scope.isOrganizer = true;
    } else {
      $scope.isEvent = false;
      $scope.isPlace = true;
      $scope.isOrganizer = false;
    }

    _.forEach($scope.cachedOffer.name, function(name, language) {
      $scope.activeLanguages[language].active = true;
    });

    $scope.activeLanguages[$scope.mainLanguage].main = true;

    $scope.loaded = true;
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

  function openEditPage(offerType) {
    var offerLocation = $scope.cachedOffer.id.toString();
    var id = offerLocation.split('/').pop();

    if (offerType === 'organizer') {
      $state.go('split.organizerEdit', {id: id});
    } else {
      $state.go('split.eventEdit', {id: id});
    }
  }

  function goToDashboard() {
    $state.go('split.footer.dashboard');
  }
}
