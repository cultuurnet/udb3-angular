'use strict';

/**
 * @ngdoc function
 * @name udb.search.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Search controller
 */
angular
  .module('udb.search')
  .controller('SearchController', SearchController);

/* @ngInject */
function SearchController(
  $scope,
  udbApi,
  $window,
  $location,
  $uibModal,
  SearchResultViewer,
  offerLabeller,
  offerLocator,
  searchHelper,
  $rootScope,
  eventExporter,
  $translate,
  LuceneQueryBuilder,
  authorization,
  authorizationService
) {
  function getSearchQuery() {
    return searchHelper.getQuery();
  }

  function getCurrentPage() {
    var currentPage = 1;
    var searchParams = $location.search();

    if (searchParams.page) {
      currentPage = parseInt(searchParams.page);
    }

    return currentPage;
  }

  $scope.resultViewer = new SearchResultViewer(30, getCurrentPage());
  $scope.realQuery = false;
  $scope.activeQuery = false;
  $scope.queryEditorShown = false;
  $scope.currentPage = getCurrentPage();

  var additionalSpecifics = [
    {id: 'accessibility', name: 'Toegankelijkheidsinformatie', permission: authorization.editFacilities}
  ];
  authorizationService
    .getPermissions()
    .then(function (userPermissions) {
      var specifics = _.filter(
        additionalSpecifics,
        function (specific) {
          return !_.has(specific, 'permission') || _.contains(userPermissions, specific.permission);
        }
      );

      $scope.resultViewer.enableSpecifics(specifics);
    })
  ;

  /**
   * Fires off a search for offers using a plain query string or a query object.
   * @param {String|Query} query A query string or object to search with.
   */
  var findOffers = function (query) {
    var offset = ($scope.resultViewer.currentPage - 1) * $scope.resultViewer.pageSize;
    var queryString = typeof query === 'string' ? query : query.queryString;
    var pageSearchParameter = $scope.resultViewer.currentPage > 1 ? String($scope.resultViewer.currentPage) : null;

    $location.search({
      'query': getSearchQuery().queryString || null,
      'page': pageSearchParameter
    });

    $scope.resultViewer.loading = true;

    udbApi
      .findOffers(queryString, offset)
      .then(function (pagedEvents) {
        if (pagedEvents.member) {
          pagedEvents = udbApi.reformatJsonLDData(pagedEvents);
        }
        offerLocator.addPagedCollection(pagedEvents);
        $scope.resultViewer.setResults(pagedEvents);
      });
  };

  /**
   * @param {Query} query A query object used to update the interface and result viewer.
   */
  var updateQuery = function (query) {
    $scope.activeQuery = query;

    if (LuceneQueryBuilder.isValid(query)) {
      var realQuery = LuceneQueryBuilder.unparse(query);
      $scope.resultViewer.queryChanged(realQuery);
      findOffers(realQuery);

      if (realQuery !== query.originalQueryString) {
        $scope.realQuery = realQuery;
      } else {
        $scope.realQuery = false;
      }
    }
  };

  var labelSelection = function () {

    var selectedOffers = $scope.resultViewer.selectedOffers;

    if (!selectedOffers.length) {
      $window.alert('First select the events you want to label.');
      return;
    }

    var modal = $uibModal.open({
      templateUrl: 'templates/offer-label-modal.html',
      controller: 'OfferLabelModalCtrl',
      controllerAs: 'lmc'
    });

    modal.result.then(function (labels) {

      _.each(selectedOffers, function (offer) {
        var eventPromise;
        eventPromise = udbApi.getOffer(new URL(offer['@id']));

        eventPromise.then(function (event) {
          event.label(labels);
        });
      });

      _.each(labels, function (label) {
        offerLabeller.labelOffersById(selectedOffers, label);
      });
    });
  };

  function labelActiveQuery() {
    var query = $scope.activeQuery,
      eventCount = $scope.resultViewer.totalItems;

    if (LuceneQueryBuilder.isValid(query)) {
      var modal = $uibModal.open({
        templateUrl: 'templates/offer-label-modal.html',
        controller: 'OfferLabelModalCtrl',
        controllerAs: 'lmc'
      });

      modal.result.then(function (labels) {
        // eagerly label all cached events on the first page
        var selectedIds = $scope.resultViewer.selectedIds;
        _.each(selectedIds, function (eventId) {
          var eventPromise = udbApi.getEventById(eventId);

          eventPromise.then(function (event) {
            event.label(labels);
          });
        });

        _.each(labels, function (label) {
          offerLabeller.labelQuery(query.queryString, label, eventCount);
        });
      });
    } else {
      $window.alert('provide a valid query to label');
    }
  }

  var label = function () {
    var labellingQuery = $scope.resultViewer.querySelected;

    if (labellingQuery) {
      labelActiveQuery();
    } else {
      labelSelection();
    }
  };

  function exportEvents() {
    var exportingQuery = $scope.resultViewer.querySelected,
        query = $scope.activeQuery,
        eventCount,
        selectedIds = [];

    if (exportingQuery) {
      eventCount = $scope.resultViewer.totalItems;
    } else {
      selectedIds = _.chain($scope.resultViewer.selectedOffers)
        .filter({'@type': 'Event'})
        .map(function(offer) {
          return new URL(offer['@id']);
        })
        .value();

      if (!selectedIds.length) {
        $window.alert(
            $translate.instant('search.modal')
        );
        return;
      } else {
        eventCount = selectedIds.length;
      }
    }

    eventExporter.activeExport.query = query;
    eventExporter.activeExport.eventCount = eventCount;
    eventExporter.activeExport.selection = selectedIds;

    var exportLimit = 5000;

    var tooManyItems = eventCount >= exportLimit;

    if (tooManyItems) {
      $translate('EVENT-EXPORT.TOO-MANY-ITEMS', {limit: exportLimit}).then(function(message) {
        $window.alert(message);
      });
    }
    else {
      if (query && query.queryString.length && LuceneQueryBuilder.isValid(query)) {
        var modal = $uibModal.open({
          templateUrl: 'templates/event-export-modal.html',
          controller: 'EventExportController',
          controllerAs: 'exporter',
          size: 'lg'
        });
      } else {
        $translate('EVENT-EXPORT.QUERY-IS-MISSING').then(function(message) {
          $window.alert(message);
        });
      }
    }
  }

  $scope.exportEvents = exportEvents;
  $scope.label = label;

  $scope.startEditing = function () {
    $scope.queryEditorShown = true;
  };

  $scope.stopEditing = function () {
    $scope.queryEditorShown = false;
  };

  function queryChanged(event, newQuery) {
    updateQuery(newQuery);
  }

  // Because the uib pagination directive is messed up and overrides the initial page to 1,
  // you have to silence and revert it.
  var initialChangeSilenced = $scope.currentPage === 1;
  $scope.pageChanged = function () {
    var newPageNumber = $scope.currentPage;

    if (!initialChangeSilenced) {
      $scope.currentPage = $scope.resultViewer.currentPage;
      initialChangeSilenced = true;
    } else {
      $scope.resultViewer.currentPage = newPageNumber;

      findOffers($scope.activeQuery);
      $window.scroll(0, 0);
    }
  };

  /**
   * Get the query string from the URI params
   *
   * @return {null|string}
   */
  function getQueryStringFromParams() {
    var queryString = null;
    var searchParams = $location.search();

    if (searchParams.query) {
      queryString = searchParams.query;
    }

    return queryString;
  }

  var initListeners = _.once(function () {
    var searchQueryChangedListener = $rootScope.$on('searchQueryChanged', queryChanged);
    var startEditingQueryListener = $rootScope.$on('startEditingQuery', $scope.startEditing);
    var stopEditingQueryListener = $rootScope.$on('stopEditingQuery', $scope.stopEditing);

    $scope.$on('$destroy', startEditingQueryListener);
    $scope.$on('$destroy', searchQueryChangedListener);
    $scope.$on('$destroy', stopEditingQueryListener);
  });

  initListeners();
}
