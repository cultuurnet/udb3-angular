'use strict';

/**
 * @ngdoc function
 * @name udb.place-detail.controller:PlaceDetailController
 * @description
 * # PlaceDetailController
 * Place Detail controller
 */
angular
    .module('udb.place-detail')
    .controller('PlaceDetailController', PlaceDetail);

/* @ngInject */
function PlaceDetail(
  $scope,
  placeId,
  udbApi,
  $state,
  jsonLDLangFilter,
  variationRepository,
  offerEditor,
  eventCrud,
  $uibModal,
  $q,
  $window,
  offerLabeller,
  appConfig,
  $translate
) {
  var activeTabId = 'data';
  var controller = this;
  var disableVariations = _.get(appConfig, 'disableVariations');

  $q.when(placeId, function (offerLocation) {
    $scope.placeId = offerLocation;

    var offer = udbApi.getOffer(offerLocation);
    var permission = udbApi.hasPermission(offerLocation);

    offer.then(showOffer, failedToLoad);

    $q.all([permission, offer])
      .then(grantPermissions, denyAllPermissions);

    permission.catch(denyAllPermissions);
  });

  function grantPermissions() {
    $scope.permissions = {editing: true};
  }

  function denyAllPermissions() {
    $scope.permissions = {editing: false};
  }

  $scope.placeIdIsInvalid = false;

  // labels scope variables and functions
  $scope.labelAdded = labelAdded;
  $scope.labelRemoved = labelRemoved;
  $scope.labelResponse = '';
  $scope.labelsError = '';
  $scope.finishedLoading = false;

  $scope.placeHistory = [];
  $scope.tabs = [
    {
      id: 'data'
    },
    {
      id: 'publication'
    }
  ];
  $scope.deletePlace = function () {
    openPlaceDeleteConfirmModal($scope.place);
  };

  var language = $translate.use() || 'nl';
  $scope.language = language;
  var cachedPlace;

  function showOffer(place) {
    cachedPlace = place;

    $scope.place = jsonLDLangFilter(place, language, true);
    $scope.placeIdIsInvalid = false;

    if (!disableVariations) {
      variationRepository
        .getPersonalVariation(place)
        .then(showVariation);
    }

    $scope.finishedLoading = true;
  }

  function showVariation(variation) {
    $scope.place.description = variation.description[language];
  }

  function failedToLoad(reason) {
    $scope.placeIdIsInvalid = true;
  }

  $scope.placeLocation = function (place) {

    if (place.address.addressLocality) {
      return place.address.addressLocality;
    }

    return '';
  };

  $scope.isTabActive = function (tabId) {
    return tabId === activeTabId;
  };

  $scope.makeTabActive = function (tabId) {
    activeTabId = tabId;
  };

  $scope.openEditPage = function() {
    var placeLocation = $scope.placeId.toString();
    var id = placeLocation.split('/').pop();

    $state.go('split.placeEdit', {id: id});
  };

  $scope.openTranslatePage = function() {
    var placeLocation = $scope.placeId.toString();
    var id = placeLocation.split('/').pop();

    $state.go('split.placeTranslate', {id: id});
  };

  $scope.updateDescription = function(description) {
    if ($scope.place.description !== description) {
      var updatePromise = offerEditor.editDescription(cachedPlace, description);

      updatePromise.finally(function () {
        if (!description) {
          $scope.place.description = cachedPlace.description[language];
        }
      });

      return updatePromise;
    }
  };

  function goToDashboard() {
    $state.go('split.footer.dashboard');
  }

  /**
   * @param {EventCrudJob} job
   */
  controller.goToDashboardOnJobCompletion = function(job) {
    job.task.promise
      .then(goToDashboard);
  };

  function openPlaceDeleteConfirmModal(item) {

    function displayModal(place, events) {
      var modalInstance = $uibModal.open({
        templateUrl: 'templates/place-delete-confirm-modal.html',
        controller: 'PlaceDeleteConfirmModalCtrl',
        resolve: {
          place: function () {
            return place;
          },
          events: function () {
            return events;
          }
        }
      });

      modalInstance.result
        .then(controller.goToDashboardOnJobCompletion);
    }

    // Check if this place has planned events.
    eventCrud
      .findEventsAtPlace(item.apiUrl)
      .then(function(events) {
        displayModal(item, events);
      });
  }

  /**
   * @param {Label} newLabel
   */
  function labelAdded(newLabel) {
    var similarLabel = _.find(cachedPlace.labels, function (label) {
      return newLabel.name.toUpperCase() === label.toUpperCase();
    });

    if (similarLabel) {
      $window.alert('Het label "' + newLabel.name + '" is reeds toegevoegd als "' + similarLabel + '".');
    } else {
      offerLabeller.label(cachedPlace, newLabel.name)
        .then(function(response) {
          if (response.success) {
            $scope.labelResponse = 'success';
            $scope.addedLabel = response.name;
          }
          else {
            $scope.labelResponse = 'error';
            $scope.labelsError = response;
          }
          $scope.place.labels = angular.copy(cachedPlace.labels);
        });
    }
  }

  function clearLabelsError() {
    $scope.labelResponse = '';
    $scope.labelsError = '';
  }

  /**
   * @param {ApiProblem} problem
   */
  function showUnlabelProblem(problem) {
    $scope.place.labels = angular.copy(cachedPlace.labels);
    $scope.labelResponse = 'unlabelError';
    $scope.labelsError = problem.title;
  }

  /**
   * @param {Label} label
   */
  function labelRemoved(label) {
    clearLabelsError();

    offerLabeller
      .unlabel(cachedPlace, label.name)
      .catch(showUnlabelProblem);
  }
}
