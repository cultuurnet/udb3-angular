'use strict';

/**
 * @ngdoc function
 * @name udb.offer-translate:TranslateImagesController
 * @description
 * # TranslateImagesController
 * Controller for the images translation component
 */
angular
    .module('udb.offer-translate')
    .component('offerTranslateImages', {
      templateUrl: 'templates/translate-images.html',
      controller: TranslateImagesController,
      controllerAs: 'tic',
      bindings: {
        offer: '<',
        activeLanguages: '<'
      }
    });

/* @ngInject */
function TranslateImagesController($uibModal, eventCrud, MediaManager, EventFormData) {
  var controller = this;

  controller.mediaObjects = {};

  //ImageFormData.init();
  EventFormData.init();

  /*controller.imageFormData = ImageFormData;
  if (controller.offer.mediaObject) {
    ImageFormData.mediaObjects = controller.offer.mediaObject || [];
  }
  ImageFormData.name = controller.offer.name;
  ImageFormData.apiUrl = controller.offer.apiUrl;
  ImageFormData.mainLanguage = controller.offer.mainLanguage;*/

  controller.eventFormData = EventFormData;
  if (controller.offer.mediaObject) {
    EventFormData.mediaObjects = controller.offer.mediaObject || [];
  }
  EventFormData.name = controller.offer.name;
  EventFormData.apiUrl = controller.offer.apiUrl;
  EventFormData.mainLanguage = controller.offer.mainLanguage;

  controller.openUploadImageModal = openUploadImageModal;
  controller.removeImage = removeImage;
  controller.editImage = editImage;
  controller.translateImage = translateImage;

  /**
   * Open the upload modal.
   */
  function openUploadImageModal(language) {
    EventFormData.mainLanguage = language;
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/event-form-image-upload.html',
      controller: 'EventFormImageUploadController',
      resolve: {
        EventFormData: function () {
          return EventFormData;
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
          return EventFormData;
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
          return EventFormData;
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
      EventFormData.addImage(mediaObject);
    }

    eventCrud
        .addImage(EventFormData, mediaObject)
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

    controller.saving = false;
    controller.error = error;
  }
}
