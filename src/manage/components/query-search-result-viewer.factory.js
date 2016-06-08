'use strict';

/**
 * @ngdoc service
 * @name udb.manage.UserSearchResultViewer
 * @description
 * # QuerySearchResultViewer
 * User search result viewer factory
 */
angular
  .module('udb.manage')
  .factory('QuerySearchResultViewer', QuerySearchResultViewerFactory);

function QuerySearchResultViewerFactory() {

  /**
   * @class SearchResultViewer
   * @constructor
   * @param    {number}     pageSize        The number of items shown per page
   *
   * @property {object[]}   events          A list of json-LD event objects
   * @property {number}     pageSize        The current page size
   * @property {number}     totalItems      The total items found
   * @property {number}     currentPage     The index of the current page without zeroing
   * @property {boolean}    loading         A flag to indicate the period between changing of the query and
   *                                        receiving of the results.
   * @property {SelectionState} selectionState Enum that keeps the state of selected results
   */
  var QuerySearchResultViewer = function (pageSize, activePage) {
    this.pageSize = pageSize || 30;
    this.users = [];
    this.totalItems = 0;
    this.currentPage = activePage || 1;
    this.loading = true;
  };

  QuerySearchResultViewer.prototype = {
    /**
     * @param {PagedCollection} pagedResults
     */
    setResults: function (pagedResults) {
      var viewer = this;

      viewer.pageSize = pagedResults.itemsPerPage || 30;
      viewer.users = pagedResults.users || [];
      viewer.totalItems = pagedResults.totalItems || 0;

      viewer.loading = false;
    }
  };

  return (QuerySearchResultViewer);
}
