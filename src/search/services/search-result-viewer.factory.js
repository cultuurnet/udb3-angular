'use strict';

/**
 * @ngdoc service
 * @name udb.search.SearchResultViewer
 * @description
 * # SearchResultViewer
 * Search result viewer factory
 */
angular
  .module('udb.search')
  .factory('SearchResultViewer', SearchResultViewerFactory);

/* @ngInject */
function SearchResultViewerFactory($translate) {

  var SelectionState = {
    ALL: {'name': 'all', 'icon': 'fas fa-check-square'},
    NONE: {'name': 'none', 'icon': 'far fa-square'},
    SOME: {'name': 'some', 'icon': 'fas fa-minus-square'}
  };

  var identifyItem = function (event) {
    return event['@id'].split('/').pop();
  };

  /**
   * @class SearchResultViewer
   * @constructor
   * @param    {number}     pageSize        The number of items shown per page
   * @param    {number}     activePage
   *
   * @property {object[]}   events          A list of json-LD event objects
   * @property {number}     pageSize        The current page size
   * @property {number}     totalItems      The total items found
   * @property {number}     currentPage     The index of the current page without zeroing
   * @property {boolean}    loading         A flag to indicate the period between changing of the query and
   *                                        receiving of the results.
   * @property {object}     eventProperties A list of event properties that can be shown complementary
   * @property {array}      eventSpecifics  A list of specific event info that can be shown exclusively
   * @property {SelectionState} selectionState Enum that keeps the state of selected results
   */
  var SearchResultViewer = function (pageSize, activePage) {
    this.pageSize = pageSize || 30;
    this.events = [];
    this.totalItems = 0;
    this.currentPage = activePage || 1;
    this.loading = true;
    this.lastQuery = null;
    this.eventProperties = {
      description: {name: $translate.instant('search.description'), visible: false},
      labels: {name: $translate.instant('search.labels'), visible: false},
      image: {name: $translate.instant('search.picture'), visible: false}
    };
    this.eventSpecifics = [
      {id: 'input', name: $translate.instant('search.inputInformation')}
    ];
    this.activeSpecific = this.eventSpecifics[0];
    this.selectedOffers = [];
    this.selectionState = SelectionState.NONE;
    this.querySelected = false;
  };

  SearchResultViewer.prototype = {
    enableSpecifics: function (specifics) {
      this.eventSpecifics = _.uniq(_.union(this.eventSpecifics, specifics), 'id');
    },
    toggleSelection: function () {
      var state = this.selectionState;

      if (state === SelectionState.SOME || state === SelectionState.ALL) {
        this.deselectPageItems();
        if (this.querySelected) {
          this.deselectAll();
          this.querySelected = false;
        }
      } else {
        this.selectPageItems();
      }
    },
    selectQuery: function () {
      this.querySelected = true;
      this.selectPageItems();
    },
    updateSelectionState: function () {
      var selectedOffers = this.selectedOffers,
          selectedPageItems = _.filter(this.events, function (event) {
            return _.contains(selectedOffers, event);
          });

      if (selectedPageItems.length === this.pageSize) {
        this.selectionState = SelectionState.ALL;
      } else if (selectedPageItems.length > 0) {
        this.selectionState = SelectionState.SOME;
      } else {
        this.selectionState = SelectionState.NONE;
      }
    },
    toggleSelect: function (offer) {

      // Prevent toggling individual items when the whole query is selected
      if (this.querySelected) {
        return;
      }

      var foundOffer = _.find(this.selectedOffers, function (selectedOffer) {
        return selectedOffer['@id'] === offer['@id'];
      });
      if (!!foundOffer) {
        // remove offer from selectedOffers
        this.selectedOffers = _.filter(this.selectedOffers, function (selectedOffer) {
          return selectedOffer['@id'] !== offer['@id'];
        });
      } else {
        // add event to selectedOffers
        var foundEvent = _.find(this.events, function (event) {
          return event['@id'] === offer['@id'];
        });
        this.selectedOffers.push(foundEvent);
      }

      this.updateSelectionState();
    },
    deselectAll: function () {
      this.selectedOffers = [];
      this.selectionState = SelectionState.NONE;
    },
    deselectPageItems: function () {
      var selectedOffers = this.selectedOffers;
      _.forEach(this.events, function (event) {
        _.remove(selectedOffers, function (offer) {
          return offer['@id'] === event['@id'];
        });
      });

      this.selectionState = SelectionState.NONE;
    },
    selectPageItems: function () {
      var events = this.events,
          selectedOffers = this.selectedOffers;

      _.each(events, function (event) {
        selectedOffers.push(event);
      });

      this.selectedOffers = _.uniq(selectedOffers);
      this.selectionState = SelectionState.ALL;
    },
    isOfferSelected: function (offer) {
      return !!_.find(this.selectedOffers, function (selectedOffer) {
        return selectedOffer['@id'] === offer['@id'];
      });
    },
    isDifferentDate: function (startDate, endDate) {
      return new Date(startDate).toDateString() !== new Date(endDate).toDateString();
    },
    /**
     * @param {PagedCollection} pagedResults
     */
    setResults: function (pagedResults) {
      var viewer = this;

      viewer.pageSize = pagedResults.itemsPerPage || 30;
      viewer.events = pagedResults.member || [];
      viewer.totalItems = pagedResults.totalItems || 0;

      viewer.loading = false;
      if (this.querySelected) {
        this.selectPageItems();
      }
      this.updateSelectionState();
    },
    queryChanged: function (query) {
      this.loading = true;
      this.selectedOffers = [];
      this.querySelected = false;

      // prevent the initial search from resetting the active page
      if (this.lastQuery && this.lastQuery !== query) {
        this.currentPage = 1;
      }

      this.lastQuery = query;
    },
    activateSpecific: function (specific) {
      this.activeSpecific = specific;
    },
    /**
     * Checks if at least one of the event properties is visible
     * @return {boolean}
     */
    isShowingProperties: function () {
      var property = _.find(this.eventProperties, function (property) {
        return property.visible;
      });

      return !!property;
    }
  };

  return (SearchResultViewer);
}
