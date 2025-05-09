'use strict';

/**
 * @ngdoc controller
 * @name udb.dashboard.controller:OrganizerController
 * @description
 * # OrganizerController
 */
angular
    .module('udb.dashboard')
    .controller('OrganizerController', OrganizerController);

/* @ngInject */
function OrganizerController(
    udbApi,
    $scope,
    jsonLDLangFilter,
    EventTranslationState,
    offerTranslator,
    offerLabeller,
    $window,
    $q,
    $translate
) {
  var controller = this;
  var cachedOrganizer;
  var defaultLanguage = $translate.use() || 'nl';

  controller.translation = false;
  controller.activeLanguage = defaultLanguage;
  controller.languageSelector = [
    {'lang': 'fr'},
    {'lang': 'en'},
    {'lang': 'de'}
  ];
  controller.labelRemoved = labelRemoved;

  controller.init = function () {
    if (!$scope.event.name) {
      controller.fetching = true;
      return udbApi
          .getOffer($scope.event['@id'])
          .then(function (offerObject) {

            cachedOrganizer = offerObject;
            cachedOrganizer.updateTranslationState();

            $scope.event = jsonLDLangFilter(cachedOrganizer, defaultLanguage, true);
            $scope.offerType = 'organizer';

            controller.fetching = false;
            watchLabels();
            return cachedOrganizer;
          });
    } else {
      $scope.event = jsonLDLangFilter($scope.event, defaultLanguage, true);
      $scope.event.id = $scope.event['@id'].split('/').pop();
      $scope.offerType = 'organizer';
      controller.fetching = false;
    }
  };

  // initialize controller and take optional event actions
  $q.when(controller.init())
      .finally(function () {
        controller.editable = true;
      });

  function watchLabels() {
    $scope.$watch(function () {
      return cachedOrganizer.labels;
    }, function (labels) {
      $scope.event.labels = angular.copy(labels);
    });
  }

  controller.hasActiveTranslation = function () {
    var organizer = cachedOrganizer;
    return organizer && organizer.translationState[controller.activeLanguage] !== EventTranslationState.NONE;
  };

  controller.getLanguageTranslationIcon = function (lang) {
    var icon = EventTranslationState.NONE.icon;

    if (cachedOrganizer && lang) {
      icon = cachedOrganizer.translationState[lang].icon;
    }

    return icon;
  };

  controller.translate = function () {
    controller.applyPropertyChanges('name');
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
      controller.translation = jsonLDLangFilter(cachedOrganizer, controller.activeLanguage);
    }
  };

  controller.hasPropertyChanged = function (propertyName) {
    var lang = controller.activeLanguage,
        translation = controller.translation;

    return controller.translation && cachedOrganizer[propertyName][lang] !== translation[propertyName];
  };

  controller.undoPropertyChanges = function (propertyName) {
    var lang = controller.activeLanguage,
        translation = controller.translation;

    if (translation) {
      translation[propertyName] = cachedOrganizer[propertyName][lang];
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

    if (translation && translation !== cachedOrganizer[property][language]) {
      offerTranslator
          .translateProperty(cachedOrganizer, udbProperty, language, translation)
          .then(cachedOrganizer.updateTranslationState(cachedOrganizer));
    }
  }

  // Labelling
  /**
   * @param {Label} newLabel
   */
  controller.labelAdded = function (newLabel) {
    var similarLabel = _.find(cachedOrganizer.labels, function (label) {
      return newLabel.name.toUpperCase() === label.toUpperCase();
    });
    if (similarLabel) {
      $scope.$apply(function () {
        $scope.event.labels = angular.copy(cachedOrganizer.labels);
      });
      $window.alert('Het label "' + newLabel.name + '" is reeds toegevoegd als "' + similarLabel + '".');
    } else {
      offerLabeller.label(cachedOrganizer, newLabel.name)
          .then(function(response) {
            if (response.success) {
              controller.labelResponse = 'success';
              controller.addedLabel = response.name;
            }
            else {
              controller.labelResponse = 'error';
              controller.labelsError = response;
            }
            $scope.event.labels = angular.copy(cachedOrganizer.labels);
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
    $scope.event.labels = angular.copy(cachedOrganizer.labels);
    controller.labelResponse = 'unlabelError';
    controller.labelsError = problem.title;
  }

  /**
   * @param {Label} label
   */
  function labelRemoved(label) {
    clearLabelsError();

    return $q(function(resolve, reject) {
      offerLabeller
      .unlabel(cachedOrganizer, label.name)
      .then(resolve)
      .catch(function (err) {
        showUnlabelProblem(err);
        reject(err);
      });
    });
  }
}
