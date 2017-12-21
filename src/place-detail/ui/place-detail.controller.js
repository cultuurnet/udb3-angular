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
  $location,
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
      id: 'data',
      header: 'Gegevens'
    },
    {
      id: 'publication',
      header: 'Publicatie'
    }
  ];
  $scope.deletePlace = function () {
    openPlaceDeleteConfirmModal($scope.place);
  };

  $scope.translatePlaceDetail = function (label) {
    return $translate.instant('preview.' + label);
  };

  var language = 'nl';
  var cachedPlace;

  function showOffer(place) {
    cachedPlace = place;

    $scope.place = jsonLDLangFilter(place, language);
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
    var placeId;
    // When a place is published $scope.placeId is empty,
    // so get the placeId straight from the current url.
    if (_.isEmpty($scope.placeId)) {
      placeId = $location.url().split('/')[2];
    }
    else {
      placeId = $scope.placeId.split('/').pop();
    }
    $location.path('/place/' + placeId + '/edit');
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
    $location.path('/dashboard');
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
