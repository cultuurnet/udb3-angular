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
    $uibModal,
    appConfig,
    $translate,
    offerTranslator,
    eventCrud,
    $state,
    MediaManager,
    ImageFormData
) {

  $scope.apiUrl = '';
  $scope.loaded = false;
  $scope.mainLanguage = '';
  $scope.translatedNames = {};
  $scope.translatedDescriptions = {};
  $scope.translatedTariffs = [];
  $scope.translatedStreets = {};
  $scope.mediaObjects = {};
  $scope.languages = ['nl', 'fr', 'en', 'de'];
  $scope.activeLanguages = {
    'nl': {'active': false, 'main': false},
    'fr': {'active': false, 'main': false},
    'en': {'active': false, 'main': false},
    'de': {'active': false, 'main': false}
  };

  ImageFormData.init();

  // Functions
  $scope.saveTranslatedDescription = saveTranslatedDescription;
  $scope.saveTranslatedTariffs = saveTranslatedTariffs;
  $scope.saveTranslatedStreet = saveTranslatedStreet;
  $scope.openEditPage = openEditPage;
  $scope.goToDashboard = goToDashboard;
  $scope.openUploadImageModal = openUploadImageModal;
  $scope.removeImage = removeImage;
  $scope.editImage = editImage;
  $scope.translateImage = translateImage;

  $q.when(offerId)
    .then(fetchOffer, offerNotFound);

  function startTranslating(offer) {
    $scope.cachedOffer = offer;
    $scope.apiUrl = offer.apiUrl;
    $scope.imageFormData = ImageFormData;
    $scope.mainLanguage = offer.mainLanguage ? offer.mainLanguage : 'nl';
    $scope.offerType = offer.url.split('/').shift();
    if ($scope.offerType === 'event') {
      $scope.isEvent = true;
      $scope.isPlace = false;
    } else {
      $scope.isEvent = false;
      $scope.isPlace = true;
    }

    $scope.originalDescription = _.get($scope.cachedOffer.description, $scope.cachedOffer.mainLanguage, '') ||
       _.get($scope.cachedOffer.description, 'nl', '') ||
       _.get($scope.cachedOffer, 'description', '');

    $scope.originalDescription = _.isEmpty($scope.originalDescription) ? '' : $scope.originalDescription;

    $scope.originalTariffs = getOriginalTariffs();

    $scope.translatedDescriptions = _.get($scope.cachedOffer, 'description');
    $scope.translatedTariffs = getTranslatedTariffs();

    if ($scope.cachedOffer.mediaObject) {
      ImageFormData.mediaObjects = $scope.cachedOffer.mediaObject || [];
    }
    ImageFormData.name = $scope.originalName;
    ImageFormData.apiUrl = offer.apiUrl;
    ImageFormData.mainLanguage = offer.mainLanguage;

    if ($scope.isPlace) {
      $scope.originalAddress = _.get($scope.cachedOffer.address, $scope.cachedOffer.mainLanguage, '') ||
        _.get($scope.cachedOffer.address, 'nl', '') ||
        _.get($scope.cachedOffer, 'address', '');
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

  function saveTranslatedDescription(language) {
    offerTranslator
      .translateProperty($scope.cachedOffer, 'description', language, $scope.translatedDescriptions[language])
      .then(function() {
        //
      });
  }

  function saveTranslatedStreet(language) {
    var translatedAddress = $scope.originalAddress;
    translatedAddress.streetAddress = $scope.translatedStreets[language];
    offerTranslator
      .translateProperty($scope.cachedOffer, 'address', language, $scope.translatedAddresses)
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

  /**
  * Open the upload modal.
  */
  function openUploadImageModal(language) {
    ImageFormData.mainLanguage = language;
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/event-form-image-upload.html',
      controller: 'EventFormImageUploadController',
      resolve: {
        EventFormData: function () {
          return ImageFormData;
        }
      }
    });
  }

  function translateImage(image, language) {
    var blob = null;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', image.contentUrl);
    xhr.responseType = 'blob';
    xhr.onload = function() {
      blob = xhr.response;
      MediaManager
        .createImage(blob, image.description, image.copyrightHolder, language)
        .then(
          $scope.mediaObject.addImage
        );
    };
    xhr.send();
  }

  /**
  * Open the modal to edit an image of the item.
  *
  * @param {MediaObject} image
  *    The media object of the image to edit.
  */
  function editImage(image) {
    $uibModal.open({
      templateUrl: 'templates/event-form-image-edit.html',
      controller: 'EventFormImageEditController',
      resolve: {
        EventFormData: function () {
          return ImageFormData;
        },
        mediaObject: function () {
          return image;
        }
      }
    });
  }

  /**
  * Open the modal to remove an image.
  *
  * @param {MediaObject} image
  * The media object of the image to remove from the item.
  */
  function removeImage(image) {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/event-form-image-remove.html',
      controller: 'EventFormImageRemoveController',
      resolve: {
        EventFormData: function () {
          return ImageFormData;
        },
        image: function () {
          return image;
        }
      }
    });
  }
}
