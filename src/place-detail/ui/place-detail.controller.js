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
  eventCrud,
  $uibModal,
  $q,
  $window,
  offerLabeller,
  appConfig,
  $translate,
  RolePermission,
  authorizationService
) {
  var activeTabId = 'data';
  var controller = this;
  var language = $translate.use() || 'nl';

  $q.when(placeId, function (offerLocation) {
    $scope.placeId = offerLocation;

    var offer = udbApi.getOffer(offerLocation);
    var permission = udbApi.hasPermission(offerLocation);

    offer.then(showOffer, failedToLoad);

    $q.all([permission, offer])
      .then(grantPermissions, denyAllPermissions);

    permission.catch(denyAllPermissions);
  });

  function denyAllPermissions() {
    $scope.permissions = {editing: false, duplication: false};
  }
  /**
   * Grant permissions based on permission-data.
   * @param {Array} permissionsData
   *  The first array-item is assumed to be true, if the user is not owner the permission check rejects.
   *  The second value holds the offer itself.
   */
  function grantPermissions(permissionsData) {

    authorizationService
        .getPermissions()
        .then(function(userPermissions) {
          $scope.canModerate = _.filter(userPermissions, function(permission) {
            return permission === RolePermission.AANBOD_MODEREREN;
          }).length > 0;
        })
        .finally(function() {
          if ($scope.canModerate) {
            $scope.permissions = {editing: true, duplication: true};
          }
          else {
            $scope.permissions = {editing: false, duplication: true};
          }
          setTabs();
        });
  }

  $scope.placeIdIsInvalid = false;

  // labels scope variables and functions
  $scope.labelAdded = labelAdded;
  $scope.labelRemoved = labelRemoved;
  $scope.labelResponse = '';
  $scope.labelsError = '';
  $scope.finishedLoading = false;
  $scope.placeHistory = undefined;
  function setTabs() {
    if ($scope.mayAlwaysDelete) {
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

  $scope.deletePlace = function () {
    openPlaceDeleteConfirmModal($scope.place);
  };

  $scope.language = language;
  var cachedPlace;

  function showOffer(place) {
    cachedPlace = place;

    $scope.place = jsonLDLangFilter(place, language, true);
    $scope.placeIdIsInvalid = false;

    if (typeof $scope.place.description === 'object') {
      $scope.place.description = $scope.place.description[language];
      if ($scope.place.description === undefined) {
        $scope.place.description = '';
      }
    }

    $scope.finishedLoading = true;
    if (place.typicalAgeRange.indexOf('-') === place.typicalAgeRange.length - 1) {
      $scope.ageRange = place.typicalAgeRange.slice(0, -1) + '+';
    }
    else {
      $scope.ageRange = place.typicalAgeRange;
    }
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

    if (tabId === 'history' && !$scope.placeHistory) {
      var placeId =  $scope.placeId.split('/').pop();
      udbApi.getHistory(placeId, 'place').then(showHistory);
    }
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

  controller.goToDashboard = function() {
    $state.go('split.footer.dashboard');
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
        .then(controller.goToDashboard);
    }

    // Check if this place has planned events.
    eventCrud
      .findEventsAtPlace(item.apiUrl)
      .then(function(events) {
        displayModal(item, events);
      });
  }

  function showHistory(placeHistory) {
    $scope.placeHistory = placeHistory;
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
}
