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
  $uibModal,
  $q,
  $window,
  offerLabeller
) {
  var activeTabId = 'data';
  var controller = this;

  $q.when(eventId, function(offerLocation) {
    $scope.eventId = offerLocation;

    udbApi
      .hasPermission(offerLocation)
      .then(allowEditing);

    udbApi
      .getOffer(offerLocation)
      .then(showOffer, failedToLoad);
  });

  $scope.eventIdIsInvalid = false;
  $scope.hasEditPermissions = false;
  $scope.labelAdded = labelAdded;
  $scope.labelRemoved = labelRemoved;
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

  var language = 'nl';
  var cachedEvent;

  function showHistory(eventHistory) {
    $scope.eventHistory = eventHistory;
  }

  function showOffer(event) {
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
    hasContactPoint();
    hasBookingInfo();
  }

  function failedToLoad(reason) {
    $scope.eventIdIsInvalid = true;
  }

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
    var eventId;
    // When an event is published $scope.eventId is empty,
    // so get the eventId straight from the current url.
    if (_.isEmpty($scope.eventId)) {
      eventId = $location.url().split('/')[2];
    }
    else {
      eventId = $scope.eventId.split('/').pop();
    }
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

  /**
   * @param {Label} newLabel
   */
  function labelAdded(newLabel) {
    var similarLabel = _.find(cachedEvent.labels, function (label) {
      return newLabel.name.toUpperCase() === label.toUpperCase();
    });

    if (similarLabel) {
      $window.alert('Het label "' + newLabel.name + '" is reeds toegevoegd als "' + similarLabel + '".');
    }
    else {
      offerLabeller.label(cachedEvent, newLabel.name).then(
        function(response) {
          if (response.success) {
            $scope.event.labels = angular.copy(cachedEvent.labels);
          }
        },
        function(error) {}
        );
    }

    $scope.event.labels = angular.copy(cachedEvent.labels);
  }

  /**
   * @param {Label} label
   */
  function labelRemoved(label) {
    offerLabeller.unlabel(cachedEvent, label.name);
    $scope.event.labels = angular.copy(cachedEvent.labels);
  }

  function hasContactPoint() {
    var nonEmptyContactTypes = _.filter(
      $scope.event.contactPoint,
      function(value) {
        return value.length > 0;
      }
    );

    $scope.hasContactPointResults = (nonEmptyContactTypes.length > 0);
  }

  function hasBookingInfo() {
    var bookingInfo = $scope.event.bookingInfo;
    $scope.hasBookingInfoResults = !(bookingInfo.phone === '' && bookingInfo.email === '' && bookingInfo.url === '');
  }
}
