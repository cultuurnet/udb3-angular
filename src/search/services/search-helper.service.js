'use strict';

/**
 * @ngdoc service
 * @name udb.search.searchHelper
 * @description
 * # searchHelper
 * Service in the udb.search.
 */
angular
  .module('udb.search')
  .service('searchHelper', SearchHelper);

/* @ngInject */
function SearchHelper(LuceneQueryBuilder) {
  var query = {
    queryString: ''
  },
  unavailable = true,
  past = true;

  this.setQueryString = function (queryString) {
    query = LuceneQueryBuilder.createQuery(queryString);
    LuceneQueryBuilder.isValid(query);

    return query;
  };

  this.setQuery = function (searchQuery) {
    query = searchQuery;
  };

  this.getQuery = function () {
    return query;
  };

  /**
   * Include events that have their embargo date set in the future
   * @param {boolean} includeUnavailable
   */
  this.setUnavailable = function (includeUnavailable) {
    unavailable = !!includeUnavailable;
  };

  /**
   * @return {boolean}
   */
  this.getUnavailable = function () {
    return unavailable;
  };

  /**
   * Include past events
   * @param {boolean} includePast
   */
  this.setPast = function (includePast) {
    past = !!includePast;
  };

  /**
   * @return {boolean}
   */
  this.getPast = function () {
    return past;
  };
}
