'use strict';

/**
 * @ngdoc directive
 * @name udb.search.controller:OfferController
 * @description
 * # OfferController
 */
angular
  .module('udb.search')
  .controller('OfferController', OfferController);

/* @ngInject */
function OfferController(
  udbApi,
  $scope,
  jsonLDLangFilter,
  EventTranslationState,
  offerTranslator,
  offerLabeller,
  $window,
  $q,
  appConfig,
  UdbEvent,
  $translate,
  authorizationService
) {
  var controller = this;
  var cachedOffer;
  var defaultLanguage = $translate.use() || 'nl';

  controller.translation = false;
  controller.activeLanguage = defaultLanguage;
  controller.languageSelector = [
    {'lang': 'fr'},
    {'lang': 'en'},
    {'lang': 'de'}
  ];
  controller.uitId = _.get(appConfig, 'uitidUrl');
  controller.labelRemoved = labelRemoved;
  authorizationService.isGodUser()
    .then(function (permission) {
      controller.isGodUser = permission;
    });
  controller.init = function () {
    if (!$scope.event.title) {
      controller.fetching = true;

      if ($scope.event.name) {
        var offer = udbApi.formatJsonLDEntity($scope.event);
        formatOffers(offer);
        return;
      }

      return udbApi
        .getOffer($scope.event['@id'])
        .then(function (offerObject) {
          formatOffers(offerObject);
        });
    } else {
      controller.fetching = false;
    }
  };

  function translateType (type) {
    // Work around for III-3348
    var translatedString = $translate.instant('offerTypes.' + type);
    if (_.includes(translatedString, 'offerTypes.')) {
      return type;
    }
    else {
      return translatedString;
    }
  }

  function formatOffers(offerObject) {

    var sortedFacilities = offerObject.facilities.sort(
      function(a, b) {
        return a.label.localeCompare(b.label);
      });
    offerObject.facilities = sortedFacilities;

    cachedOffer = offerObject;
    cachedOffer.updateTranslationState();

    $scope.event = jsonLDLangFilter(cachedOffer, defaultLanguage, true);
    $scope.offerType = $scope.event.url.split('/').shift();
    $scope.translatedOfferType = translateType($scope.event.type.label);
    controller.offerExpired = $scope.offerType === 'event' ? offerObject.isExpired() : false;
    controller.hasFutureAvailableFrom = offerObject.hasFutureAvailableFrom();
    controller.fetching = false;
    watchLabels();
    return cachedOffer;
  }

  // initialize controller and take optional event actions
  $q.when(controller.init())
    .then(translateLocation)
    .then(ifOfferIsEvent)
    .finally(function () {
      controller.editable = true;
    });

  function ifOfferIsEvent(offer) {
    if (offer && $scope.event.url.split('/').shift() === 'event') {
      return $q.resolve(offer);
    } else {
      return $q.reject();
    }
  }

  function watchLabels() {
    $scope.$watch(function () {
      return cachedOffer.labels;
    }, function (labels) {
      $scope.event.labels = angular.copy(labels);
    });
  }

  controller.hasActiveTranslation = function () {
    var offer = cachedOffer;
    return offer && offer.translationState[controller.activeLanguage] !== EventTranslationState.NONE;
  };

  controller.getLanguageTranslationIcon = function (lang) {
    var icon = EventTranslationState.NONE.icon;

    if (cachedOffer && lang) {
      icon = cachedOffer.translationState[lang].icon;
    }

    return icon;
  };

  controller.translate = function () {
    controller.applyPropertyChanges('name');
    controller.applyPropertyChanges('description');
  };

  /**
   * Sets the provided language as active or toggles it off when already active
   *
   * @param {String} lang
   */
  controller.toggleLanguage = function (lang) {
    if (lang === controller.activeLanguage) {
      controller.stopTranslating();
    } else {
      controller.activeLanguage = lang;
      controller.translation = jsonLDLangFilter(cachedOffer, controller.activeLanguage);
    }
  };

  controller.hasPropertyChanged = function (propertyName) {
    var lang = controller.activeLanguage,
        translation = controller.translation;

    return controller.translation && cachedOffer[propertyName][lang] !== translation[propertyName];
  };

  controller.undoPropertyChanges = function (propertyName) {
    var lang = controller.activeLanguage,
        translation = controller.translation;

    if (translation) {
      translation[propertyName] = cachedOffer[propertyName][lang];
    }
  };

  controller.applyPropertyChanges = function (propertyName) {
    var translation = controller.translation[propertyName];
    translateEventProperty(propertyName, translation, propertyName);
  };

  controller.stopTranslating = function () {
    controller.translation = undefined;
    controller.activeLanguage = defaultLanguage;
  };

  function translateEventProperty(property, translation, apiProperty) {
    var language = controller.activeLanguage,
        udbProperty = apiProperty || property;

    if (translation && translation !== cachedOffer[property][language]) {
      offerTranslator
        .translateProperty(cachedOffer, udbProperty, language, translation)
        .then(cachedOffer.updateTranslationState(cachedOffer));
    }
  }

  // Labelling
  /**
   * @param {Label} newLabel
   */
  controller.labelAdded = function (newLabel) {
    var similarLabel = _.find(cachedOffer.labels, function (label) {
      return newLabel.name.toUpperCase() === label.toUpperCase();
    });
    if (similarLabel) {
      $scope.$apply(function () {
        $scope.event.labels = angular.copy(cachedOffer.labels);
      });
      $window.alert('Het label "' + newLabel.name + '" is reeds toegevoegd als "' + similarLabel + '".');
    } else {
      controller.addedLabel = newLabel.name;
      offerLabeller.label(cachedOffer, newLabel.name)
        .then(function() {
          controller.labelResponse = 'success';
          $scope.event.labels = angular.copy(cachedOffer.labels);
        })
        .catch(function() {
          controller.labelResponse = 'error';
        });
    }
  };

  controller.showConcludedButton = function () {
    var shouldShowConcludeButton = _.get(appConfig, 'concludedButton.toggle', false);

    if (!shouldShowConcludeButton) {
      return false;
    }

    var omdDate = _.get(appConfig, 'calendarHighlight.date');
    var endofOmdDay = moment(omdDate).endOf('day');

    return (
      $scope.offerType === 'event' &&
      (endofOmdDay < new Date())
    );
  };

  controller.concludedButtonLabel = _.get(appConfig, 'concludedButton.label', '');

  controller.handleConcludedButtonClick = function (eventId, eventTitle) {
    window.parent.location.href = _.get(appConfig, 'concludedButton.url', '')
      .replace(/%EVENT_ID%/gi, eventId)
      .replace(/%EVENT_TITLE%/gi, eventTitle);
  };

  function clearLabelsError() {
    controller.labelResponse = '';
    controller.labelsError = '';
  }

  /**
   * @param {ApiProblem} problem
   */
  function showUnlabelProblem(problem) {
    $scope.event.labels = angular.copy(cachedOffer.labels);
    controller.labelResponse = 'unlabelError';
    controller.labelsError = $translate.instant('errors.labelNotAllowed');
  }

  /**
   * @param {Label} label
   */
  function labelRemoved(label) {
    clearLabelsError();

    offerLabeller
      .unlabel(cachedOffer, label.name)
      .catch(showUnlabelProblem);
  }

  /**
   * @param {UdbEvent} event
   * @return {Promise}
   */
  function translateLocation(event) {
    if ($scope.event.location) {
      $scope.event.location = jsonLDLangFilter($scope.event.location, defaultLanguage);
    }
    return $q.resolve(event);
  }

}
