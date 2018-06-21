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

    if ($scope.cachedOffer.mediaObject) {
      ImageFormData.mediaObjects = $scope.cachedOffer.mediaObject || [];
    }
    ImageFormData.name = $scope.originalName;
    ImageFormData.apiUrl = offer.apiUrl;
    ImageFormData.mainLanguage = offer.mainLanguage;

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
      console.log(blob);
      MediaManager
        .createImage(blob, image.description, image.copyrightHolder, language)
        .then(
          addImageToEvent, displayError
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

  /**
   * @param {MediaObject} mediaObject
   */
  function addImageToEvent(mediaObject) {
    function updateImageForm() {
      ImageFormData.addImage(mediaObject);
    }

    eventCrud
      .addImage(ImageFormData, mediaObject)
      .then(updateImageForm, displayError);
  }

  function displayError(errorResponse) {
    var errorMessage = errorResponse.data.title;
    var error = 'Er ging iets mis bij het opslaan van de afbeelding.';

    switch (errorMessage) {
      case 'The uploaded file is not an image.':
        error = 'Het geüpload bestand is geen geldige afbeelding. ' +
          'Enkel bestanden met de extenties .jpeg, .gif of .png zijn toegelaten.';
        break;
      case 'The file size of the uploaded image is too big.':
        error = 'Het geüpload bestand is te groot.';
        break;
    }

    $scope.saving = false;
    $scope.error = error;
  }
}
