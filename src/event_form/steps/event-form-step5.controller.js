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
function EventFormStep5Controller($scope, EventFormData, eventCrud, udbOrganizers, $uibModal, $rootScope) {

  var controller = this;
  var URL_REGEXP = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
  /**
   * Enum for age ranges.
   * @readonly
   * @enum {Object}
   */
  var AgeRangeEnum = Object.freeze({
    'ALL': {'value': 0, 'label': 'Alle leeftijden'},
    'KIDS': {'value': 12, 'label': 'Kinderen tot 12 jaar', min: 0, max: 12},
    'TEENS': {'value': 18, 'label': 'Jongeren tussen 12 en 18 jaar', min: 13, max: 18},
    'ADULTS': {'value': 99, 'label': 'Volwassenen (+18 jaar)', min: 19, max: 99}
  });
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

  // Description vars.
  $scope.description = EventFormData.getDescription('nl');
  $scope.focusDescription = false;
  $scope.descriptionCssClass = $scope.description ? 'state-complete' : 'state-incomplete';
  $scope.savingDescription = false;
  $scope.descriptionError = false;

  // Age range vars
  $scope.savingAgeRange = false;
  $scope.ageRangeError = false;
  $scope.invalidAgeRange = false;
  /**
   * @type {AgeRangeEnum|null}
   */
  $scope.ageRange = null;
  $scope.ageCssClass = EventFormData.typicalAgeRange ? 'state-complete' : 'state-incomplete';
  /**
   * * @type {number|null}
   */
  $scope.minAge = null;

  // Organizer vars.
  $scope.organizerCssClass = EventFormData.organizer.name ? 'state-complete' : 'state-incomplete';
  $scope.organizer = '';
  $scope.emptyOrganizerAutocomplete = false;
  $scope.loadingOrganizers = false;
  $scope.organizerError = false;
  $scope.savingOrganizer = false;

  // Booking & tickets vars.
  $scope.editBookingPhone = !EventFormData.bookingInfo.phone;
  $scope.editBookingEmail = !EventFormData.bookingInfo.email;
  $scope.editBookingUrl = !EventFormData.bookingInfo.url;
  $scope.bookingModel = {
    urlRequired : false,
    emailRequired : false,
    phoneRequired : false,
    url : EventFormData.bookingInfo.urlLabel ? EventFormData.bookingInfo.url : '',
    urlLabel : EventFormData.bookingInfo.urlLabel ? EventFormData.bookingInfo.urlLabel : 'Reserveer plaatsen',
    urlLabelCustom : '',
    phone : EventFormData.bookingInfo.phone ? EventFormData.bookingInfo.phone : '',
    email : EventFormData.bookingInfo.email ? EventFormData.bookingInfo.email : ''
  };

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

  // Contactinfo vars.
  $scope.contactInfoCssClass = 'state-incomplete';
  $scope.savingContactInfo = false;
  $scope.contactInfoError = false;
  $scope.contactInfo = [];

  // Facilities vars.
  $scope.facilitiesCssClass = 'state-incomplete';
  $scope.facilitiesInapplicable = false;
  $scope.selectedFacilities = [];

  // Description functions.
  $scope.alterDescription = alterDescription;
  $scope.saveDescription = saveDescription;

  // Age range functions.
  $scope.saveAgeRange = saveAgeRange;
  $scope.ageRangeChanged = ageRangeChanged;
  $scope.setAllAges = setAllAges;
  $scope.resetAgeRange = resetAgeRange;

  // Organizer functions.
  $scope.getOrganizers = getOrganizers;
  $scope.selectOrganizer = selectOrganizer;
  $scope.deleteOrganizer = deleteOrganizer;
  $scope.openOrganizerModal = openOrganizerModal;

  // Contact info functions.
  $scope.deleteContactInfo = deleteContactInfo;
  $scope.saveContactInfo = saveContactInfo;
  $scope.addContactInfo = addContactInfo;

  // Facilities functions.
  $scope.openFacilitiesModal = openFacilitiesModal;
  $scope.setFacilitiesInapplicable = setFacilitiesInapplicable;

  // Image upload functions.
  $scope.openUploadImageModal = openUploadImageModal;
  $scope.removeImage = removeImage;
  $scope.editImage = editImage;
  $scope.selectMainImage = selectMainImage;

  $scope.ageRanges = _.map(AgeRangeEnum, function (range) {
    return range;
  });

  $scope.AgeRange = AgeRangeEnum;

  // Init the controller for editing.
  initEditForm();

  /**
   * Alter description: used for adding and editing the description.
   */
  function alterDescription() {
    $scope.descriptionCssClass = 'state-filling';
    $scope.focusDescription = true;
  }

  /**
   * Save the description.
   */
  function saveDescription() {

    $scope.savingDescription = true;
    $scope.descriptionError = false;
    $scope.focusDescription = false;

    EventFormData.setDescription($scope.description, 'nl');

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

  /**
   * Listener on the age range selection.
   * @param {AgeRangeEnum} ageRange
   */
  function ageRangeChanged(ageRange) {
    $scope.minAge = null;
    $scope.ageCssClass = 'state-complete';

    $scope.saveAgeRange();
  }

  /**
   * @param {number} minAge
   * @param {number} [maxAge]
   *
   * @return {string}
   */
  function formatTypicalAgeRange(minAge, maxAge) {
    var formattedAgeRange = '';

    if (maxAge) {
      formattedAgeRange = minAge === maxAge ? minAge.toString() : minAge + '-' + maxAge;
    } else {
      formattedAgeRange = minAge + '-';
    }

    return formattedAgeRange;
  }

  /**
   * @param {number} minAge
   * @param {AgeRangeEnum} ageRange
   *
   * @return {boolean}
   */
  function isMinimumAgeInRange(minAge, ageRange) {
    var inRange = true;

    if (ageRange.max && minAge > ageRange.max) {
      inRange = false;
    }

    if (ageRange.min && minAge < ageRange.min) {
      inRange = false;
    }

    return inRange;
  }

  /**
   * Save the age range.
   */
  function saveAgeRange() {

    $scope.invalidAgeRange = false;

    if ($scope.ageRange === AgeRangeEnum.ALL) {
      EventFormData.typicalAgeRange = null;
    }
    else {
      if ($scope.minAge) {
        $scope.invalidAgeRange = !isMinimumAgeInRange($scope.minAge, $scope.ageRange);
      }

      EventFormData.typicalAgeRange = formatTypicalAgeRange(
        $scope.minAge || $scope.ageRange.min,
        $scope.ageRange.max
      );
    }

    // Save to db if valid age entered.
    if (!$scope.invalidAgeRange) {
      var ageRangePersisted = null;

      var showAgeRangeError = function() {
        $scope.savingAgeRange = false;
        $scope.ageRangeError = true;
      };

      var markAgeRangeAsUpdated = function () {
        $scope.savingAgeRange = false;
        controller.eventFormSaved();
        $scope.ageCssClass = 'state-complete';
      };

      if ($scope.ageRange === AgeRangeEnum.ALL) {
        ageRangePersisted = eventCrud.deleteTypicalAgeRange(EventFormData);
      }
      else {
        ageRangePersisted = eventCrud.updateTypicalAgeRange(EventFormData);
      }

      ageRangePersisted.then(markAgeRangeAsUpdated, showAgeRangeError);
    }

  }

  /**
   * Set to all ages.
   */
  function setAllAges() {
    $scope.ageRange = AgeRangeEnum.ALL;
  }

  /**
   * Reset the age selection.
   */
  function resetAgeRange() {
    $scope.ageRange = null;
    $scope.minAge = null;
    $scope.ageCssClass = 'state-incomplete';
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
      $scope.emptyOrganizerAutocomplete = organizers.length <= 0;
      $scope.loadingOrganizers = false;

      return organizers;
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
   * Open the facilities modal.
   */
  function openFacilitiesModal() {

    var modalInstance = $uibModal.open({
      templateUrl: 'templates/event-form-facilities-modal.html',
      controller: 'EventFormFacilitiesModalController'
    });

    modalInstance.result.then(function () {

      $scope.facilitiesCssClass = 'state-complete';
      $scope.selectedFacilities = EventFormData.facilities;

      $scope.facilitiesInapplicable = EventFormData.facilities.length <= 0;
    }, function () {
      // modal dismissed.
      if (EventFormData.facilities.length > 0 || $scope.facilitiesInapplicable) {
        $scope.facilitiesCssClass = 'state-complete';
      }
      else {
        $scope.facilitiesCssClass = 'state-incomplete';
      }
    });

  }

  /**
   * Remove all facilities and set it to inapplicable.
   */
  function setFacilitiesInapplicable() {

    // Delete facilities.
    if (EventFormData.facilities.length > 0) {

      $scope.facilitiesError = false;
      EventFormData.facilities = [];

      var promise = eventCrud.updateFacilities(EventFormData);
      promise.then(function() {
        $scope.savingFacilities = false;
        $scope.facilitiesInapplicable = true;
        $scope.facilitiesCssClass = 'state-complete';
      }, function() {
        $scope.savingFacilities = false;
        $scope.facilitiesError = true;
      });

    }
    else {
      $scope.facilitiesInapplicable = true;
      $scope.facilitiesCssClass = 'state-complete';
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

  /**
   * Saves the booking info
   */
  function saveBookingInfo() {

    // Make sure all default values are set.
    EventFormData.bookingInfo = angular.extend({}, {
      url : '',
      urlLabel : 'Reserveer plaatsen',
      email : '',
      phone : '',
      availabilityStarts : EventFormData.bookingInfo.availabilityStarts,
      availabilityEnds : EventFormData.bookingInfo.availabilityEnds
    }, $scope.bookingModel);

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

    // On edit set state default to complete.
    if (EventFormData.id) {
      $scope.ageCssClass = 'state-complete';
      var minAge, maxAge;

      if (EventFormData.typicalAgeRange) {
        if (typeof EventFormData.typicalAgeRange === 'string') {
          var rangeArray = EventFormData.typicalAgeRange.split('-');
          minAge = rangeArray[0] ? parseInt(rangeArray[0]) : null;
          maxAge = rangeArray[1] ? parseInt(rangeArray[1]) : null;
        }
        else {
          minAge = EventFormData.typicalAgeRange;
        }

        if (typeof minAge === 'number') {
          $scope.minAge = minAge;
          if (maxAge) {
            $scope.ageRange = _.findWhere(AgeRangeEnum, {max: maxAge});
          }
          else {
            $scope.ageRange = _.find(AgeRangeEnum, function (ageRange) {
              // ignore AgeRangeEnum.ALL which has value zero because it will match anything
              return ageRange.value && isMinimumAgeInRange(minAge, ageRange);
            });
          }
        }
      }
      else {
        $scope.minAge = 0;
        $scope.ageRange = AgeRangeEnum.ALL;
      }
    }

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

    // Set default facilities.
    if (EventFormData.id) {
      $scope.facilitiesCssClass = 'state-complete';
      if (!EventFormData.facilities || EventFormData.facilities.length === 0) {
        $scope.facilitiesInapplicable = true;
      }
      else {
        $scope.selectedFacilities = EventFormData.facilities;
        $scope.facilitiesInapplicable = false;
      }
    }

    if (EventFormData.priceInfo) {
      $scope.price = EventFormData.priceInfo;
      $scope.priceCssClass = 'state-complete';
    }

  }

}
