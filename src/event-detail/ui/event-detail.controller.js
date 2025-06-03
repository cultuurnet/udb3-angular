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
  $state,
  $uibModal,
  $q,
  $window,
  $location,
  offerLabeller,
  $translate,
  appConfig,
  ModerationService,
  RolePermission,
  authorizationService
) {
  var activeTabId = 'data';
  var controller = this;
  var FILMINVOER_LABEL = 'udb-filminvoer';
  $scope.cultuurkuurEnabled = _.get(appConfig, 'cultuurkuur.enabled');
  $scope.isOmdApp = !!_.get(appConfig, 'omdSpecific', false);

  $q.when(eventId, function(offerLocation) {
    $scope.eventId = offerLocation;

    var offer = udbApi.getOffer(offerLocation);

    var permissions = udbApi.getUserPermissions(offerLocation);

    offer.then(showOffer, failedToLoad);

    $q.all([permissions, offer])
      .then(grantPermissions);
  }, function() {
    $location.path('404');
  });

  /**
   * Grant permissions based on permissions-data.
   * @param {Array} permissionsData
   *  The first array-item is assumed to be true, if the user is not owner the permission check rejects.
   *  The second value holds the offer itself.
   */
  function grantPermissions(permissionsData) {
    var permissions = permissionsData[0];
    var hasPermissions = permissions.length > 0;
    var event = permissionsData[1];

    var hasMovieLabel = !!_.find(event.labels, function (label) {
      return label === FILMINVOER_LABEL;
    });

    authorizationService
        .getPermissions()
        .then(function(userPermissions) {
          var hasEditMoviesPermission = !!_.find(userPermissions, function(permission) {
            return permission === RolePermission.FILMS_AANMAKEN;
          });

          var canSeeHistory = !!_.find($scope.userPermissions, function(permission) {
            return permission === RolePermission.AANBOD_HISTORIEK;
          });

          var canEditMovies = hasEditMoviesPermission && hasMovieLabel;

          $scope.isGodUser = _.filter(userPermissions, function(permission) {
            return permission === RolePermission.GEBRUIKERS_BEHEREN;
          }).length > 0;

          if (hasPermissions) {
            var offerPermissions = {
              editing: _.includes(permissions, 'Aanbod bewerken') && (!event.isExpired() || $scope.isGodUser),
              moderate: _.includes(permissions, 'Aanbod modereren'),
              delete: _.includes(permissions, 'Aanbod verwijderen')
            };
            $scope.permissions = angular.extend({}, offerPermissions, {
              editingMovies: canEditMovies,
              duplication: true,
              history: canSeeHistory,
            });
          } else {
            $scope.permissions = {editing: false, moderate: false, delete: false,
              editingMovies: canEditMovies, duplication: false, history: canSeeHistory};
          }

          setTabs();
        });
  }

  function getModerationItems(roles) {
    var query = '';

    _.forEach(roles, function(role) {
      if (_.contains(role.permissions, 'AANBOD_MODEREREN') && role.constraints && role.constraints.v3) {
        query += (query ? ' OR ' : '') + '(' + role.constraints.v3 + ')';
      }
    });
    query = (query ? '(' + query + ')' : '');
    var idField = 'cdbid';

    query = '(' + query + ' AND ' + idField + ':' + $scope.event.id + ')';

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

  function setTabs() {
    if ($scope.permissions.history || $scope.isGodUser) {
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
    } else {
      $scope.tabs = [
        {
          id: 'data'
        },
        {
          id: 'publication'
        }
      ];
    }
  }

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

    if (event.typicalAgeRange.indexOf('-') === event.typicalAgeRange.length - 1) {
      $scope.ageRange = event.typicalAgeRange.slice(0, -1) + '+';
    }
    else {
      $scope.ageRange = event.typicalAgeRange;
    }

    $scope.eventIdIsInvalid = false;

    var eventTypeId = $scope.event.type.id;
    $scope.isLessonSeries = eventTypeId === '0.3.1.0.0';
    $scope.isHolidayCamp = eventTypeId === '0.57.0.0.0';

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

  $scope.makeTabActive = function (tabId) {
    activeTabId = tabId;

    if (tabId === 'history' && !$scope.eventHistory) {
      var eventId =  $scope.eventId.toString().split('/').pop();
      udbApi.getHistory(eventId).then(showHistory);
    }
  };

  $scope.openEditPage = function() {
    var eventLocation = $scope.eventId.toString();
    var id = eventLocation.split('/').pop();

    $state.go('split.eventEdit', {id: id});
  };

  $scope.openEditPageMovies = function() {
    var eventLocation = $scope.eventId.toString();
    var id = eventLocation.split('/').pop();

    $state.go('split.eventEditMovie', {id: id});
  };

  $scope.duplicateMovie = function() {
    var eventLocation = $scope.eventId.toString();
    var calendar = _.pick($scope.event, ['calendarType', 'subEvent']);

    if (calendar.subEvent.length > 0) {
      calendar.subEvent.forEach(function(event) {
        event.status = {type: 'Available'};
        event.bookingAvailability  = {type: 'Available'};
      });
    }

    udbApi
      .duplicateEvent(eventLocation, calendar)
      .then(function (duplicatedEventInfo) {
        var id = duplicatedEventInfo.eventId;
        var eventUrl = duplicatedEventInfo.url;
        udbApi.labelOffer(eventUrl, FILMINVOER_LABEL)
          .then(function () {
            $state.go('split.eventEditMovie', {id: id});
          })
          .catch(function (err) {
            throw err;
          });
      })
      .catch(function (err) { console.log('error', err); });
  };

  $scope.openTranslatePage = function() {
    var eventLocation = $scope.eventId.toString();
    var id = eventLocation.split('/').pop();
    $state.go('split.eventTranslate', {id: id});
  };

  controller.goToDashboard = function() {
    $state.go('split.footer.dashboard');
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
      .then(controller.goToDashboard);
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

    return $q(function(resolve, reject) {
      offerLabeller
      .unlabel(cachedEvent, label.name)
      .then(resolve)
      .catch(function (err) {
        showUnlabelProblem(err);
        reject(err);
      });
    });
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

  $scope.isEditable = function() {
    return $scope.event.workflowStatus !== 'DELETED' && $scope.event.workflowStatus !== 'REJECTED';
  };

  $scope.isDeletable = function() {
    return $scope.event.workflowStatus !== 'DELETED';
  };

  $scope.translateAudience = function (type) {
    return $translate.instant('audience.' + type);
  };

  $scope.translateWorkflowStatus = function (status) {
    return $translate.instant('workflowStatus.' + status);
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

  $scope.filteredLabels = [];

  $scope.$watch('event.labels', function(newLabels) {
  if (!Array.isArray(newLabels)) {
    $scope.filteredLabels = [];
    return;
  }

  var cultuurkuurLabels = newLabels.filter(function(label) {
    return label.indexOf('cultuurkuur_') === 0;
  });

  var otherLabels = newLabels.filter(function(label) {
    return label.indexOf('cultuurkuur_') !== 0;
  });

  $scope.filteredLabels = $scope.isGodUser ? cultuurkuurLabels.concat(otherLabels)
    : otherLabels;
});
}
