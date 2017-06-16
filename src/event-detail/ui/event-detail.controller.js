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
  offerLabeller,
  $translate,
  appConfig,
  ModerationService
) {
  var activeTabId = 'data';
  var controller = this;
  var disableVariations = _.get(appConfig, 'disableVariations');

  $q.when(eventId, function(offerLocation) {
    $scope.eventId = offerLocation;

    var offer = udbApi.getOffer(offerLocation);
    var permission = udbApi.hasPermission(offerLocation);

    offer.then(showOffer, failedToLoad);

    $q.all([permission, offer])
      .then(grantPermissions, denyAllPermissions);

    permission.catch(denyAllPermissions);
  });

  /**
   * Grant permissions based on permission-data.
   * @param {Array} permissionsData
   *  The first array-item is assumed to be true, if the user is not owner the permission check rejects.
   *  The second value holds the offer itself.
   */
  function grantPermissions(permissionsData) {
    var event = permissionsData[1];
    $scope.permissions = {editing: !event.isExpired(), duplication: true};
  }

  function denyAllPermissions() {
    $scope.permissions = {editing: false, duplication: false};
  }

  function getModerationItems(roles) {
    var query = '';

    _.forEach(roles, function(role) {
      if (role.constraint) {
        query += (query ? ' OR ' : '') + '(' + role.constraint + ')';
      }
    });
    query = (query ? '(' + query + ')' : '');
    query = '(' + query + ' AND cdbid:' + $scope.event.id + ')';
    return ModerationService
      .find(query, 10, 0)
      .then(function(searchResult) {
        return searchResult;
      });
  }

  $scope.eventIdIsInvalid = false;
  $scope.labelAdded = labelAdded;
  $scope.labelRemoved = labelRemoved;
  $scope.eventHistory = undefined;
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
  $scope.isEmpty = _.isEmpty;

  var language = 'nl';
  var cachedEvent;

  function showHistory(eventHistory) {
    $scope.eventHistory = eventHistory;
  }

  function showOffer(event) {
    cachedEvent = event;

    $scope.event = jsonLDLangFilter(event, language);

    $scope.eventIdIsInvalid = false;

    if (!disableVariations) {
      variationRepository
        .getPersonalVariation(event)
        .then(showVariation);
    }

    hasContactPoint();
    hasBookingInfo();

    ModerationService
      .getMyRoles()
      .then(function(roles) {
        getModerationItems(roles).then(function(result) {
          angular.forEach(result.member, function(member) {
            if (member['@id'] === $scope.eventId) {
              $scope.moderationPermission = true;
            }
          });
        });
      });
  }

  function showVariation(variation) {
    $scope.event.description = variation.description[language];
  }

  function failedToLoad() {
    $scope.eventIdIsInvalid = true;
  }

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

    if (tabId === 'history' && !$scope.eventHistory) {
      udbApi.getHistory($scope.eventId).then(showHistory);
    }
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
      offerLabeller.label(cachedEvent, newLabel.name)
        .then(function(response) {
          if (response.success) {
            $scope.labelResponse = 'success';
            $scope.addedLabel = response.name;
          }
          else {
            $scope.labelResponse = 'error';
            $scope.labelsError = response;
          }
          $scope.event.labels = angular.copy(cachedEvent.labels);
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
    $scope.event.labels = angular.copy(cachedEvent.labels);
    $scope.labelResponse = 'unlabelError';
    $scope.labelsError = problem.title;
  }

  /**
   * @param {Label} label
   */
  function labelRemoved(label) {
    clearLabelsError();

    offerLabeller
      .unlabel(cachedEvent, label.name)
      .catch(showUnlabelProblem);
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

  $scope.translateAudience = function (type) {
    return $translate.instant('audience.' + type);
  };

  $scope.finishedLoading = function() {
    return ($scope.event && $scope.permissions);
  };
}
