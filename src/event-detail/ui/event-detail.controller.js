'use strict';

/**
 * @ngdoc function
 * @name udb.event-detail.controller:EventDetailController
 * @description
 * # EventDetailController
 * Event Detail controller
 */
angular
    .module('udb.event-detail')
    .controller('EventDetailController', EventDetail);

/* @ngInject */
function EventDetail(
  $scope,
  eventId,
  udbApi,
  jsonLDLangFilter,
  variationRepository,
  offerEditor,
  $location,
  $uibModal
) {
  var activeTabId = 'data';
  var controller = this;

  $scope.eventId = eventId;
  $scope.eventIdIsInvalid = false;
  $scope.hasEditPermissions = false;
  $scope.eventHistory = [];
  $scope.tabs = [
    {
      id: 'data',
      header: 'Gegevens'
    },
    {
      id: 'history',
      header: 'Historiek'
    },
    {
      id: 'publication',
      header: 'Publicatie'
    }
  ];
  $scope.deleteEvent = function () {
    openEventDeleteConfirmModal($scope.event);
  };

  function allowEditing() {
    $scope.hasEditPermissions = true;
  }

  udbApi
    .hasPermission($scope.eventId)
    .then(allowEditing);

  var eventLoaded = udbApi.getOffer($scope.eventId);
  var language = 'nl';
  var cachedEvent;

  function showHistory(eventHistory) {
    $scope.eventHistory = eventHistory;
  }

  eventLoaded.then(
      function (event) {
        cachedEvent = event;

        var personalVariationLoaded = variationRepository.getPersonalVariation(event);

        udbApi
          .getHistory($scope.eventId)
          .then(showHistory);

        $scope.event = jsonLDLangFilter(event, language);

        $scope.eventIdIsInvalid = false;

        personalVariationLoaded
          .then(function (variation) {
            $scope.event.description = variation.description[language];
          })
          .finally(function () {
            $scope.eventIsEditable = true;
          });
      },
      function (reason) {
        $scope.eventIdIsInvalid = true;
      }
  );

  var getActiveTabId = function() {
    return activeTabId;
  };

  $scope.eventLocation = function (event) {
    var location = jsonLDLangFilter(event.location, language);

    var eventLocation = [
      location.name
    ];

    if (event.location.type) {
      eventLocation.push(event.location.type.label);
    }

    if (event.location.address.addressLocality) {
      eventLocation.push(event.location.address.addressLocality);
    }

    return eventLocation.join(', ');
  };

  $scope.eventIds = function (event) {
    return _.union([event.id], event.sameAs);
  };

  $scope.isUrl = function (potentialUrl) {
    return /^(https?)/.test(potentialUrl);
  };

  $scope.isTabActive = function (tabId) {
    return tabId === activeTabId;
  };

  $scope.updateDescription = function(description) {
    if ($scope.event.description !== description) {
      var updatePromise = offerEditor.editDescription(cachedEvent, description);

      updatePromise.finally(function () {
        if (!description) {
          $scope.event.description = cachedEvent.description[language];
        }
      });

      return updatePromise;
    }
  };

  $scope.makeTabActive = function (tabId) {
    activeTabId = tabId;
  };

  $scope.openEditPage = function() {
    $location.path('/event/' + eventId + '/edit');
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

  function openEventDeleteConfirmModal(item) {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/event-delete-confirm-modal.html',
      controller: 'EventDeleteConfirmModalCtrl',
      resolve: {
        item: function () {
          return item;
        }
      }
    });

    modalInstance.result
      .then(controller.goToDashboardOnJobCompletion);
  }
}
