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
  $state,
  $uibModal,
  $q,
  $window,
  offerLabeller,
  $translate,
  appConfig,
  ModerationService,
  RolePermission,
  authorizationService
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

    authorizationService
        .getPermissions()
        .then(function(userPermissions) {
          var mayAlwaysDelete = _.filter(userPermissions, function(permission) {
            return permission === RolePermission.GEBRUIKERS_BEHEREN;
          });

          if (mayAlwaysDelete.length) {
            $scope.mayAlwaysDelete = true;
          }
        })
        .finally(function() {
          if ($scope.mayAlwaysDelete) {
            $scope.permissions = {editing: true, duplication: true};
          }
          else {
            $scope.permissions = {editing: !event.isExpired(), duplication: true};
          }
        });
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
  $scope.calendarSummary = undefined;

  $scope.tabs = [
    {
      id: 'data'
    },
    {
      id: 'history'
    },
    {
      id: 'publication'
    }
  ];
  $scope.deleteEvent = function () {
    openEventDeleteConfirmModal($scope.event);
  };
  $scope.isEmpty = _.isEmpty;

  var language = $translate.use() || 'nl';
  $scope.language = language;
  var cachedEvent;

  function showHistory(eventHistory) {
    $scope.eventHistory = eventHistory;
  }

  function showCalendarSummary(calendarSummary) {
    $scope.calendarSummary = calendarSummary;
  }

  function notifyCalendarSummaryIsUnavailable() {
    $scope.calendarSummary = false;
  }

  function showOffer(event) {
    cachedEvent = event;

    if (cachedEvent.calendarType === 'permanent') {
      showCalendarSummary('Altijd open');
    } else {
      udbApi
        .getCalendarSummary(event.id, 'lg', $scope.language)
        .then(showCalendarSummary, notifyCalendarSummaryIsUnavailable);
    }

    $scope.event = jsonLDLangFilter(event, language, true);
    $scope.allAges =  !(/\d/.test(event.typicalAgeRange));
    $scope.noAgeInfo = event.typicalAgeRange === '';

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
        var filteredRoles = _.filter(roles, function(role) {
          var canModerate = _.filter(role.permissions, function(permission) {
            return permission === RolePermission.AANBOD_MODEREREN;
          });
          return canModerate.length > 0;
        });

        if (filteredRoles.length) {
          getModerationItems(roles).then(function(result) {
            angular.forEach(result.member, function(member) {
              if (member['@id'] === $scope.eventId) {
                $scope.moderationPermission = true;
              }
            });
          });
        }
      });
  }

  function showVariation(variation) {
    $scope.event.description = variation.description[language];
  }

  function failedToLoad() {
    $scope.eventIdIsInvalid = true;
  }

  $scope.eventLocation = function (event) {
    var location = jsonLDLangFilter(event.location, language, true);

    var eventLocation = [
      location.name
    ];

    if (event.location.type) {
      eventLocation.push($scope.translateType(event.location.type.label));
    }

    if (event.location.address.streetAddress) {
      eventLocation.push(event.location.address.streetAddress);
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
    var eventLocation = $scope.eventId.toString();
    var id = eventLocation.split('/').pop();

    $state.go('split.eventEdit', {id: id});
  };

  $scope.openTranslatePage = function() {
    var eventLocation = $scope.eventId.toString();
    var id = eventLocation.split('/').pop();
    $state.go('split.eventTranslate', {id: id});
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

  $scope.translateType = function (type) {
    // Work around for III-2695
    var translatedString = $translate.instant('offerTypes.' + type);
    if (_.includes(translatedString, 'offerTypes.')) {
      return type;
    }
    else {
      return translatedString;
    }
  };

  $scope.finishedLoading = function() {
    return ($scope.event && $scope.permissions);
  };
}
