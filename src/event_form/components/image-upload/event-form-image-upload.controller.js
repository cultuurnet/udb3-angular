'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormImageUploadController
 * @description
 * # EventFormImageUploadController
 * Modal for uploading images.
 */
angular
  .module('udb.event-form')
  .controller('EventFormImageUploadController', EventFormImageUploadController);

/* @ngInject */
function EventFormImageUploadController(
  $scope,
  $uibModalInstance,
  EventFormData,
  eventCrud,
  appConfig,
  MediaManager,
  $q,
  copyrightNegotiator,
  $translate,
  $filter
) {

  // Scope vars.
  $scope.userAgreementUrl = $filter('translate')('images.conditions_url');
  $scope.copyrightUrl = '/' + $translate.use() + _.get(appConfig, 'media.copyrightUrl', '/copyright');
  $scope.saving = false;
  $scope.error = false;
  $scope.showAgreements = !copyrightNegotiator.confirmed();
  $scope.modalTitle = $translate.instant('eventForm.imageUpload.modalTitle');
  $scope.description = '';
  $scope.copyright = '';
  $scope.maxFileSize = _.get(appConfig, 'media.fileSizeLimit', '1MB');

  // Scope functions.
  $scope.acceptAgreements = acceptAgreements;
  $scope.cancel = cancel;
  $scope.addImage = uploadAndAddImage;
  $scope.clearError = clearError;
  $scope.selectFile = selectFile;
  $scope.allFieldsValid = allFieldsValid;

  var invalidFileErrors = {
    'default': 'Het geselecteerde bestand voldoet niet aan onze voorwaarden.',
    'maxSize': $translate.instant('eventForm.imageUpload.maxSize') + $scope.maxFileSize + '.'
  };

  /**
   * Accept the agreements.
   */
  function acceptAgreements() {
    $scope.modalTitle = 'Nieuwe afbeelding toevoegen';
    $scope.showAgreements = false;
    copyrightNegotiator.confirm();
  }

  /**
   * Cancel the modal.
   */
  function cancel() {
    $uibModalInstance.dismiss('cancel');
  }

  function clearError() {
    $scope.error = false;
  }

  function selectFile(file, invalidFiles) {
    $scope.selectedFile = file ? file : null;

    // Check if the selected file is invalid and show an error else clear any existing error messages.
    if (invalidFiles.length) {
      var knownError = invalidFileErrors[invalidFiles[0].$error];
      $scope.error = knownError ? knownError : invalidFileErrors.default;
    } else {
      clearError();
    }
  }

  function uploadAndAddImage() {
    // Abort if no valid file is selected.
    if (!$scope.selectedFile) {
      $scope.error = 'Er is geen bestand geselecteerd';
      return;
    }

    $scope.saving = true;

    var description = $scope.description,
        copyrightHolder = $scope.copyright,
        deferredAddition = $q.defer(),
        language = EventFormData.mainLanguage ? EventFormData.mainLanguage : 'nl';

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

    /**
     * @param {MediaObject} mediaObject
     */
    function addImageToEvent(mediaObject) {
      function updateEventFormAndResolve() {
        $scope.saving = false;
        EventFormData.addImage(mediaObject);
        deferredAddition.resolve(mediaObject);
        $uibModalInstance.close(mediaObject);
      }

      eventCrud
        .addImage(EventFormData, mediaObject)
        .then(updateEventFormAndResolve, displayError);
    }

    MediaManager
      .createImage($scope.selectedFile, description, copyrightHolder, language)
      .then(addImageToEvent, displayError);

    return deferredAddition.promise;
  }

  function allFieldsValid() {
    return $scope.description && $scope.copyright && $scope.selectedFile &&
        $scope.description.length <= 250 && $scope.copyright.length >= 3;
  }
}
