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
  offerEditor,
  variationRepository,
  $q,
  appConfig
) {
  var controller = this;
  var cachedOffer;
  var defaultLanguage = 'nl';

  controller.translation = false;
  controller.activeLanguage = defaultLanguage;
  controller.languageSelector = [
    {'lang': 'fr'},
    {'lang': 'en'},
    {'lang': 'de'}
  ];
  controller.labelRemoved = labelRemoved;

  controller.init = function () {
    if (!$scope.event.title) {
      controller.fetching = true;

      return udbApi
        .getOffer($scope.event['@id'])
        .then(function (offerObject) {
          cachedOffer = offerObject;
          cachedOffer.updateTranslationState();

          $scope.event = jsonLDLangFilter(cachedOffer, defaultLanguage);
          $scope.offerType = $scope.event.url.split('/').shift();
          controller.offerExpired = $scope.offerType === 'event' ? offerObject.isExpired() : false;
          controller.fetching = false;

          watchLabels();
          return cachedOffer;
        });
    } else {
      controller.fetching = false;
    }
  };

  // initialize controller and take optional event actions
  $q.when(controller.init())
    // translate location before fetching the maybe non-existant variation
    // a variation does not change the location
    .then(translateLocation)
    .then(fetchPersonalVariation)
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
    var translation = controller.translation[propertyName],
        apiProperty;

    // TODO: this is hacky, should decide on consistent name for this property
    if (propertyName === 'name') {
      apiProperty = 'title';
    }

    translateEventProperty(propertyName, translation, apiProperty);
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
        .then(cachedOffer.updateTranslationState);
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
      offerLabeller.label(cachedOffer, newLabel.name)
        .then(function(response) {
          if (response.success) {
            controller.labelResponse = 'success';
            controller.addedLabel = response.name;
          }
          else {
            controller.labelResponse = 'error';
            controller.labelsError = response;
          }
          $scope.event.labels = angular.copy(cachedOffer.labels);
        });
    }
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
    controller.labelsError = problem.title;
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
   * @param {(UdbPlace|UdbEvent)}offer
   * @return {Promise}
   */
  function fetchPersonalVariation(offer) {
    var disableVariations = _.get(appConfig, 'disableVariations');
    if (!disableVariations) {
      return variationRepository
        .getPersonalVariation(offer)
        .then(function (personalVariation) {
          $scope.event.description = personalVariation.description[defaultLanguage];
          return personalVariation;
        }, function () {
          return $q.reject();
        });
    } else {
      return $q.reject();
    }
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

  // Editing
  controller.updateDescription = function (description) {
    if ($scope.event.description !== description) {
      var updatePromise = offerEditor.editDescription(cachedOffer, description);

      updatePromise.finally(function () {
        if (!description) {
          $scope.event.description = cachedOffer.description[defaultLanguage];
        }
      });

      return updatePromise;
    }
  };
}
