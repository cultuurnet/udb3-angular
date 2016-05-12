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
  $uibModal
) {
  var activeTabId = 'data';
  var controller = this;

  $scope.placeId = placeId;
  $scope.placeIdIsInvalid = false;
  $scope.hasEditPermissions = false;
  $scope.placeHistory = [];
  $scope.tabs = [
    {
      id: 'data',
      header: 'Gegevens'
    },
    /*{
      id: 'history',
      header: 'Historiek'
    },*/
    {
      id: 'publication',
      header: 'Publicatie'
    },
  ];
  $scope.deletePlace = function () {
    openPlaceDeleteConfirmModal($scope.place);
  };

  function allowEditing() {
    $scope.hasEditPermissions = true;
  }

  udbApi
    .hasPermission($scope.placeId)
    .then(allowEditing);

  var placeLoaded = udbApi.getOffer($scope.placeId);
  var language = 'nl';
  var cachedPlace;

  placeLoaded.then(
      function (place) {
        cachedPlace = place;

        /*var placeHistoryLoaded = udbApi.getEventHistoryById($scope.placeId);

        placeHistoryLoaded.then(function(placeHistory) {
          $scope.placeHistory = placeHistory;
        });*/

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
      },
      function (reason) {
        $scope.placeIdIsInvalid = true;
      }
  );

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
    $location.path('/place/' + $scope.placeId + '/edit');
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
}
