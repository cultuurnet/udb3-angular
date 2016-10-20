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
  offerLabeller
) {
  var activeTabId = 'data';
  var controller = this;

  $q.when(placeId, function(offerLocation) {
    $scope.placeId = offerLocation;

    udbApi
      .hasPermission(offerLocation)
      .then(allowEditing);

    udbApi
      .getOffer(offerLocation)
      .then(showOffer, failedToLoad);
  });

  $scope.placeIdIsInvalid = false;
  $scope.hasEditPermissions = false;
  $scope.labelAdded = labelAdded;
  $scope.labelRemoved = labelRemoved;
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

  function allowEditing() {
    $scope.hasEditPermissions = true;
  }

  var language = 'nl';
  var cachedPlace;

  function showOffer(place) {
      cachedPlace = place;

      var personalVariationLoaded = variationRepository.getPersonalVariation(place);

      $scope.place = jsonLDLangFilter(place, language);
      $scope.placeIdIsInvalid = false;

      personalVariationLoaded
        .then(function (variation) {
          $scope.place.description = variation.description[language];
        })
        .finally(function () {
          $scope.placeIsEditable = true;
        });
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

  $scope.placeIds = function (place) {
    return _.union([place.id], place.sameAs);
  };

  $scope.isUrl = function (potentialUrl) {
    return /^(https?)/.test(potentialUrl);
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
      offerLabeller.label(cachedPlace, newLabel.name);
    }

    $scope.place.labels = angular.copy(cachedPlace.labels);
  }

  /**
   * @param {Label} label
   */
  function labelRemoved(label) {
    offerLabeller.unlabel(cachedPlace, label.name);
    $scope.place.labels = angular.copy(cachedPlace.labels);
  }
}
