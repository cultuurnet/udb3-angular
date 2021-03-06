'use strict';

/**
 * @typedef {Object} ContactInfoItem
 * @property {ContactInfoTypeEnum} type
 * @property {boolean} booking
 * @property {string} value
 */

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormStep5Controller
 * @description
 * # EventFormStep5Controller
 * Step 5 of the event form
 */
angular
  .module('udb.event-form')
  .controller('EventFormStep5Controller', EventFormStep5Controller);

/* @ngInject */
function EventFormStep5Controller(
    $scope,
    EventFormData,
    eventCrud,
    udbOrganizers,
    $uibModal,
    $rootScope,
    appConfig,
    udbUitpasApi
  ) {

  var controller = this;
  var URL_REGEXP = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
  /**
   * Enum for contact info types.
   * @readonly
   * @enum {string}
   */
  var ContactInfoTypeEnum = Object.freeze({
    EMAIL: 'email',
    PHONE: 'phone',
    URL: 'url'
  });

  // Scope vars.
  $scope.eventFormData = EventFormData; // main storage for event form.
  $scope.mainLanguage = EventFormData.getMainLanguage();

  // Description vars.
  $scope.description = EventFormData.getDescription($scope.mainLanguage);
  $scope.descriptionCssClass = $scope.description ? 'state-complete' : 'state-incomplete';
  $scope.savingDescription = false;
  $scope.descriptionError = false;
  $scope.originalDescription = '';

  // Organizer vars.
  $scope.organizerCssClass = EventFormData.organizer.name ? 'state-complete' : 'state-incomplete';
  $scope.organizer = '';
  $scope.emptyOrganizerAutocomplete = false;
  $scope.loadingOrganizers = false;
  $scope.organizerError = false;
  $scope.savingOrganizer = false;

  // Price info
  $scope.disablePriceInfo = _.get(appConfig.offerEditor, 'disablePriceInfo');

  // Translatable languages
  $scope.translatableLanguages = appConfig.translatableLanguages;

  // Booking & tickets vars.
  $scope.editBookingPhone = !EventFormData.bookingInfo.phone;
  $scope.editBookingEmail = !EventFormData.bookingInfo.email;
  $scope.editBookingUrl = !EventFormData.bookingInfo.url;
  $scope.bookingModel = {
    urlRequired : false,
    emailRequired : false,
    phoneRequired : false,
    url : EventFormData.bookingInfo.urlLabel ? EventFormData.bookingInfo.url : '',
    urlLabel : {},
    urlLabelCustom : '',
    phone : EventFormData.bookingInfo.phone ? EventFormData.bookingInfo.phone : '',
    email : EventFormData.bookingInfo.email ? EventFormData.bookingInfo.email : ''
  };
  $scope.newBookingModel = {};

  $scope.bookingOptions = [];
  _.each($scope.translatableLanguages, function (language) {
    $scope.bookingOptions[language] = [
      {value: 'buy_tickets', label: translateBookingInfoUrlLabels('buy_tickets', language)},
      {value: 'reserve_places', label: translateBookingInfoUrlLabels('reserve_places', language)},
      {value: 'check_availability', label: translateBookingInfoUrlLabels('check_availability', language)},
      {value: 'subscribe', label: translateBookingInfoUrlLabels('subscribe', language)}
    ];
  });

  if (EventFormData.bookingInfo.urlLabel) {
    $scope.bookingModel.urlLabel = [];
    $scope.usedBookingOption = _.findWhere($scope.bookingOptions[$scope.mainLanguage],
        {label: EventFormData.bookingInfo.urlLabel}
    );

    // Quick fix for III-2791
    if ($scope.usedBookingOption === undefined) {
      $scope.usedBookingOption = _.findWhere($scope.bookingOptions[$scope.mainLanguage],
          {value: 'reserve_places'}
      );
    }

    if (typeof EventFormData.bookingInfo.urlLabel === 'string') {
      _.each($scope.translatableLanguages, function (language) {
        $scope.bookingModel.urlLabel[language] = _.findWhere($scope.bookingOptions[language],
            {value: $scope.usedBookingOption.value}
        );
      });
    }
    else {
      _.each($scope.translatableLanguages, function (language) {
        $scope.bookingModel.urlLabel[language] = _.findWhere($scope.bookingOptions[language],
            {value: $scope.usedBookingOption.value}
        );
      });
    }
  }
  else {
    _.each($scope.translatableLanguages, function (language) {
      $scope.bookingModel.urlLabel[language] = $scope.bookingOptions[language][1];
    });
  }

  // Add urlLabel to the option list when it is not in the options list.
  // This is mostly the case when the user is editing in another language as the offer's mainLanguage.
  if ($scope.usedBookingOption && !_.find($scope.bookingOptions[$scope.mainLanguage], $scope.usedBookingOption)) {
    $scope.bookingOptions[$scope.mainLanguage].unshift($scope.usedBookingOption);
  }

  $scope.viaWebsite =  !EventFormData.bookingInfo.url;
  $scope.viaEmail = !EventFormData.bookingInfo.email;
  $scope.viaPhone = !EventFormData.bookingInfo.phone;
  $scope.websitePreviewEnabled = false;
  $scope.bookingPeriodPreviewEnabled = false;
  $scope.bookingPeriodShowValidation = false;
  $scope.bookingInfoCssClass = 'state-incomplete';

  // Booking info vars.
  $scope.toggleBookingType = toggleBookingType;
  $scope.saveBookingInfo = saveBookingInfo;
  $scope.removeDuplicateContactBooking = removeDuplicateContactBooking;
  $scope.saveWebsitePreview = saveWebsitePreview;
  $scope.enableWebsitePreview = enableWebsitePreview;
  $scope.showBookingOption = showBookingOption;
  $scope.deleteBookingInfo = deleteBookingInfo;
  $scope.removeBookingInfo = removeBookingInfo;
  $scope.hasBookingInfo = hasBookingInfo;
  $scope.translateBookingInfoUrlLabels = translateBookingInfoUrlLabels;

  // Contactinfo vars.
  $scope.contactInfoCssClass = 'state-incomplete';
  $scope.savingContactInfo = false;
  $scope.contactInfoError = false;
  $scope.contactInfo = [];

  // Description functions.
  $scope.alterDescription = alterDescription;
  $scope.focusDescription = focusDescription;
  $scope.saveDescription = saveDescription;
  $scope.countCharacters = countCharacters;

  // Organizer functions.
  $scope.getOrganizers = getOrganizers;
  $scope.selectOrganizer = selectOrganizer;
  $scope.deleteOrganizerHandler = deleteOrganizerHandler;
  $scope.openOrganizerModal = openOrganizerModal;

  // Contact info functions.
  $scope.deleteContactInfo = deleteContactInfo;
  $scope.saveContactInfo = saveContactInfo;
  $scope.addContactInfo = addContactInfo;

  // Uitpas info
  $scope.hasTicketSales = false;
  $scope.hasUitpasError = false;

  // Image upload functions.
  $scope.openUploadImageModal = openUploadImageModal;
  $scope.removeImage = removeImage;
  $scope.editImage = editImage;
  $scope.selectMainImage = selectMainImage;
  // Init the controller for editing.
  initEditForm();

  /**
   * Alter description: used for adding and editing the description.
   */
  function alterDescription() {
    $scope.descriptionCssClass = 'state-filling';
  }

  function focusDescription () {
    $scope.descriptionInfoVisible = true;
    $scope.originalDescription = $scope.description;
  }

  /**
   * Save the description.
   */
  function saveDescription(allowEmpty) {

    if (allowEmpty) {
      $scope.description = '';
    }

    // only update description when there is one, it's not empty and it's not already saved; or when we allow empty
    var emptyAllowed = ($scope.description && $scope.description !== '') || allowEmpty;
    var notTheSame = ($scope.description !== $scope.originalDescription) || allowEmpty;
    if (emptyAllowed && notTheSame) {

      $scope.descriptionInfoVisible = false;
      $scope.savingDescription = true;
      $scope.descriptionError = false;

      EventFormData.setDescription(
        $scope.description.replace(new RegExp(String.fromCharCode(31), 'g'), ''),
        $scope.mainLanguage
      );

      var promise = eventCrud.updateDescription(EventFormData, $scope.description);
      promise.then(function() {

        $scope.savingDescription = false;
        controller.eventFormSaved();

        // Toggle correct class.
        if ($scope.description) {
          $scope.descriptionCssClass = 'state-complete';
        }
        else {
          $scope.descriptionCssClass = 'state-incomplete';
        }

      },
       // Error occured, show message.
      function() {
        $scope.savingDescription = false;
        $scope.descriptionError = true;
      });
    }
  }
  /**
   * Count characters in the description.
   */
  function countCharacters() {
    if ($scope.description) {
      return $scope.description.length;
    }
  }

  controller.eventFormSaved = function () {
    $rootScope.$emit('eventFormSaved', EventFormData);
  };

  /**
   * Auto-complete callback for organizers.
   * @param {String} value
   *  Suggest organizers based off of this value.
   *
   * @return {UdbOrganizer[]}
   */
  function getOrganizers(value) {
    function suggestExistingOrNewOrganiser (organizers) {
      var suitableOrganizers = organizers;
      if (appConfig.offerEditor.excludeOrganizerLabel && appConfig.offerEditor.excludeOrganizerLabel !== '') {
        suitableOrganizers = _.filter(suitableOrganizers, function(organizer) {
          if (organizer.labels && organizer.labels.length > 0) {
            return organizer.labels.indexOf(appConfig.offerEditor.excludeOrganizerLabel) < 0;
          } else {
            return true;
          }
        });
      }
      if (appConfig.offerEditor.includeOrganizerLabel && appConfig.offerEditor.includeOrganizerLabel !== '') {
        suitableOrganizers = _.filter(suitableOrganizers, function(organizer) {
          if (organizer.labels && organizer.labels.length > 0) {
            return organizer.labels.indexOf(appConfig.offerEditor.includeOrganizerLabel) >= 0;
          } else {
            return false;
          }
        });
      }
      $scope.emptyOrganizerAutocomplete = suitableOrganizers.length <= 0;
      $scope.loadingOrganizers = false;

      return suitableOrganizers;
    }

    $scope.loadingOrganizers = true;
    return udbOrganizers
      .suggestOrganizers(value)
      .then(suggestExistingOrNewOrganiser);
  }

  /**
   * Select listener on the typeahead.
   * @param {Organizer} organizer
   */
  function selectOrganizer(organizer) {
    controller.saveOrganizer(organizer);
  }

  controller.showAsyncOrganizerError = function() {
    $scope.organizerError = true;
    $scope.savingOrganizer = false;
  };

  function deleteOrganizerHandler() {
    if (EventFormData.priceInfo.length > 0) {
      udbUitpasApi.getTicketSales($scope.eventFormData.id, $scope.eventFormData.organizer)
        .then(
          function(hasTicketSales) {
            if (hasTicketSales) {
              $scope.hasTicketSales = hasTicketSales;
            }
            else {
              deleteOrganizer();
            }
          }, function() {
            $scope.hasUitpasError = true;
          });
    }
    else {
      deleteOrganizer();
    }
  }

  /**
   * Delete the selected organiser.
   */
  function deleteOrganizer() {
    function resetOrganizer() {
      controller.eventFormSaved();
      EventFormData.resetOrganizer();
      $rootScope.$emit('eventOrganizerDeleted', {});
      $scope.organizerCssClass = 'state-incomplete';
      $scope.savingOrganizer = false;
    }

    $scope.organizerError = false;
    eventCrud
      .deleteOfferOrganizer(EventFormData)
      .then(resetOrganizer, controller.showAsyncOrganizerError);
  }

  /**
   * Open the organizer modal.
   */
  function openOrganizerModal() {
    var modalInstance = $uibModal.open({
      backdrop: 'static',
      templateUrl: 'templates/event-form-organizer-modal.html',
      controller: 'EventFormOrganizerModalController',
      resolve: {
        organizerName: function () {
          return $scope.organizer;
        }
      }
    });

    function updateOrganizerInfo () {
      $scope.organizer = '';
      $scope.emptyOrganizerAutocomplete = false;
      if (EventFormData.organizer.id) {
        $scope.organizerCssClass = 'state-complete';
      }
      else {
        $scope.organizerCssClass = 'state-incomplete';
      }
    }

    modalInstance.result.then(controller.saveOrganizer, updateOrganizerInfo);
  }

  /**
   * Persist the organizer for the active event.
   * @param {Organizer} organizer
   */
  controller.saveOrganizer = function (organizer) {
    function resetOrganizerFeedback() {
      $scope.emptyOrganizerAutocomplete = false;
      $scope.organizerError = false;
      $scope.savingOrganizer = true;
      $scope.organizer = '';
    }

    function markOrganizerAsCompleted() {
      controller.eventFormSaved();
      $rootScope.$emit('eventOrganizerSelected', organizer);
      $scope.organizerCssClass = 'state-complete';
      $scope.savingOrganizer = false;
    }

    EventFormData.organizer = organizer;
    resetOrganizerFeedback();
    eventCrud
      .updateOrganizer(EventFormData)
      .then(markOrganizerAsCompleted, controller.showAsyncOrganizerError);
  };

  /**
   * Add an additional field to fill out contact info. Show the fields when none were shown before.
   */
  function addContactInfo() {
    if (_.isEmpty($scope.contactInfo)) {
      $scope.contactInfoCssClass = 'state-filling';
    }

    $scope.contactInfo.push({type: ContactInfoTypeEnum.PHONE, value: '', booking: false});
  }

  /**
   * Delete a given contact info item.
   */
  function deleteContactInfo(index) {
    $scope.contactInfo.splice(index, 1);

    if (_.isEmpty($scope.contactInfo)) {
      $scope.contactInfoCssClass = 'state-incomplete';
    }

    saveContactInfo();
  }

  /**
   * Save the contact info.
   */
  function saveContactInfo() {

    $scope.savingContactInfo = true;
    $scope.contactInfoError = false;

    // Only save with valid input.
    if ($scope.contactInfoForm.$valid) {

      EventFormData.resetContactPoint();

      _.forEach($scope.contactInfo, function (contactInfoItem) {
        if (contactInfoItem.booking) {
          toggleBookingType(contactInfoItem);
        } else {
          if (!_.isEmpty(contactInfoItem.value) && _.includes(ContactInfoTypeEnum, contactInfoItem.type)) {
            EventFormData
              .contactPoint[contactInfoItem.type]
              .push(contactInfoItem.value);
          }
        }
      });

      var promise = eventCrud.updateContactPoint(EventFormData);
      promise.then(function() {
        controller.eventFormSaved();
        if (!_.isEmpty($scope.contactInfo)) {
          $scope.contactInfoCssClass = 'state-complete';
        }
        $scope.savingContactInfo = false;
      }, function() {
        $scope.contactInfoError = true;
        $scope.savingContactInfo = false;
      });

    }
  }

  /**
   * @param {ContactInfoItem} contactInfoItem
   * @return {boolean}
   */
  function showBookingOption(contactInfoItem) {
    var bookingInfoOfSameType = _.find($scope.contactInfo, {type: contactInfoItem.type, booking: true});

    return contactInfoItem.booking || !bookingInfoOfSameType;
  }

  /**
   * @return {boolean}
   */
  function hasBookingInfo()
  {
    var bookingInfo = _.find($scope.contactInfo, {booking: true});
    return !!bookingInfo;
  }

  /**
   * Toggle the booking type and check if info should be deleted.
   *
   * @param {ContactInfoItem} contactInfoItem
   */
  function toggleBookingType(contactInfoItem) {
    var type = contactInfoItem.type,
        newValue = contactInfoItem.booking ? contactInfoItem.value : '';

    if ($scope.bookingModel[type] !== newValue) {
      $scope.bookingModel[type] = newValue;
      saveBookingInfo();
    }
  }

  /**
   * @param {string} type
   */
  function removeBookingInfo(type) {
    if (!_.includes(ContactInfoTypeEnum, type)) {
      return;
    }

    $scope.bookingModel[type] = '';
    saveBookingInfo();
  }

  /**
   * Save the website preview settings.
   */
  function saveWebsitePreview() {
    $scope.websitePreviewEnabled = false;
    EventFormData.bookingInfo.urlLabel = $scope.bookingModel.urlLabel;
    if ($scope.bookingModel.urlLabelCustom !== '') {
      EventFormData.bookingInfo.urlLabel = $scope.bookingModel.urlLabelCustom;
    }
    saveBookingInfo();
  }

  /**
   * Enable the website preview modal.
   */
  function enableWebsitePreview() {
    $scope.websitePreviewEnabled = true;
  }

  /**
   * Delete a given contact info item.
   */
  function deleteBookingInfo(element, index) {
    $scope.contactInfo[index].booking = false;
    toggleBookingType(element);

    $scope.contactInfo.splice(index, 1);

    if (_.isEmpty($scope.contactInfo)) {
      $scope.contactInfoCssClass = 'state-incomplete';
    }
  }

  function formatBookingInfoUrlLabel(urlLabel) {
    var returnValue = {};
    var newLabelValue = urlLabel[$scope.mainLanguage].value;
    _.each($scope.translatableLanguages, function(language) {
      returnValue[language] = _.findWhere($scope.bookingOptions[language], {value: newLabelValue}).label;
    });
    return returnValue;
  }

  /**
   * Saves the booking info
   */
  function saveBookingInfo() {
    var urlLabel = {};
    _.each($scope.translatableLanguages, function(language) {
      urlLabel[language] = translateBookingInfoUrlLabels('reserve_places', language);
    });

    // Make sure all default values are set.
    EventFormData.bookingInfo = angular.extend({}, {
      url : '',
      urlLabel : urlLabel,
      email : '',
      phone : '',
      availabilityStarts :
        EventFormData.bookingInfo.availabilityStarts ?
          moment(EventFormData.bookingInfo.availabilityStarts).format() :
          '',
      availabilityEnds :
        EventFormData.bookingInfo.availabilityEnds ?
          moment(EventFormData.bookingInfo.availabilityEnds).format() :
          ''
    }, $scope.bookingModel);

    if (typeof EventFormData.bookingInfo.urlLabel !== 'string') {
      EventFormData.bookingInfo.urlLabel = formatBookingInfoUrlLabel(EventFormData.bookingInfo.urlLabel);
    } else {
      EventFormData.bookingInfo.urlLabel = formatBookingInfoUrlLabel(EventFormData.bookingInfo.urlLabel);
    }

    $scope.savingBookingInfo = true;
    $scope.bookingInfoError = false;

    var promise = eventCrud.updateBookingInfo(EventFormData);
    promise.then(function() {
      controller.eventFormSaved();
      $scope.bookingInfoCssClass = 'state-complete';
      $scope.savingBookingInfo = false;
      $scope.bookingInfoError = false;
      removeDuplicateContactBooking();
    }, function() {
      $scope.savingBookingInfo = false;
      $scope.bookingInfoError = true;
    });
  }

  function removeDuplicateContactBooking() {
    var url = $scope.bookingModel.url;
    var phone = $scope.bookingModel.phone;
    var email = $scope.bookingModel.email;

    $scope.contactInfo.some(function (element) {
      return element.value === url;
    });

    $scope.contactInfo.some(function (element) {
      return element.value === phone;
    });

    $scope.contactInfo.some(function (element) {
      return element.value === email;
    });

    saveContactInfo();
  }

  /**
   * Open the upload modal.
   */
  function openUploadImageModal() {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/event-form-image-upload.html',
      controller: 'EventFormImageUploadController'
    });
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
   *    The media object of the image to remove from the item.
   */
  function removeImage(image) {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/event-form-image-remove.html',
      controller: 'EventFormImageRemoveController',
      resolve: {
        image: function () {
          return image;
        }
      }
    });
  }

  /**
   * Select the main image for an item.
   *
   * @param {MediaObject} image
   *    The media object of the image to select as the main image.
   */
  function selectMainImage(image) {
    function updateImageOrder() {
      EventFormData.selectMainImage(image);
    }

    eventCrud
      .selectMainImage(EventFormData, image)
      .then(updateImageOrder);
  }

  /**
   * Init this step for editing.
   */
  function initEditForm() {
    $scope.contactInfo = _.flatten(
      _.map(EventFormData.contactPoint, function (contactInfo, type) {
        return _.contains(ContactInfoTypeEnum, type) ? _.map(contactInfo, function (contactInfoItem) {
          return {type: type, value: contactInfoItem, booking: false};
        }) : [];
      })
    );

    // III-963 put booking items into the contactInfo array
    if (EventFormData.bookingInfo.url) {
      $scope.contactInfo.push({type: 'url', value: EventFormData.bookingInfo.url, booking: true});
    }

    if (EventFormData.bookingInfo.phone) {
      $scope.contactInfo.push({type: 'phone', value: EventFormData.bookingInfo.phone, booking: true});
    }

    if (EventFormData.bookingInfo.email) {
      $scope.contactInfo.push({type: 'email', value: EventFormData.bookingInfo.email, booking: true});
    }

    // Set correct css class for contact info.
    if ($scope.contactInfo.length > 0) {
      $scope.contactInfoCssClass = 'state-complete';
    }

    if (EventFormData.priceInfo) {
      $scope.price = EventFormData.priceInfo;
      $scope.priceCssClass = 'state-complete';
    }

  }

  function translateBookingInfoUrlLabels(label, language) {
    var labels = [];
    switch (language) {
      case 'nl':
        labels = [
          {value: 'buy_tickets', label:'Koop tickets'},
          {value: 'reserve_places', label:'Reserveer plaatsen'},
          {value: 'check_availability', label:'Controleer beschikbaarheid'},
          {value: 'subscribe', label:'Schrijf je in'}
        ];
        break;

      case 'fr':
        labels = [
          {value: 'buy_tickets', label:'Achetez des tickets'},
          {value: 'reserve_places', label:'Réservez des places'},
          {value: 'check_availability', label:'Controlez la disponibilité'},
          {value: 'subscribe', label:'Inscrivez-vous'}
        ];
        break;

      case 'en':
        labels = [
          {value: 'buy_tickets', label:'Buy tickets'},
          {value: 'reserve_places', label:'Reserve places'},
          {value: 'check_availability', label:'Check availability'},
          {value: 'subscribe', label:'Subscribe'}
        ];
        break;

      case 'de':
        labels = [
          {value: 'buy_tickets', label:'Tickets kaufen'},
          {value: 'reserve_places', label:'Platzieren Sie eine Reservierung'},
          {value: 'check_availability', label:'Verfügbarkeit prüfen'},
          {value: 'subscribe', label:'Melde dich an'}
        ];
        break;
    }

    return _.findWhere(labels, {value: label}).label;
  }

}
