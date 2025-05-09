'use strict';

/**
 * @ngdoc component
 * @name udb.search.directive:udbSearchBar
 * @description
 * # udbQuerySearchBar
 */
angular
  .module('udb.management')
  .component('udbQuerySearchBar', {
    templateUrl: 'templates/query-search-bar.html',
    controller: QuerySearchBarComponent,
    controllerAs: 'qsb',
    bindings: {
      onChange: '&',
      searchLabel: '@',
      helpLink: '@',
      helpLabel: '@'
    }
  });

/* @ngInject */
function QuerySearchBarComponent($translate) {
  var qsb = this;

  qsb.queryString = '';
  qsb.find = find;

  qsb.$onInit = function() {
    $translate(qsb.searchLabel).then(function(translatedLabel) {
      qsb.searchLabel = translatedLabel;
    });
  };

  /**
   * Search with a given query string and update the search bar or use the one currently displayed in the search bar
   *
   * @param {String} [queryString]
   */
  function find(queryString) {
    var query = typeof queryString !== 'undefined' ? queryString : qsb.queryString;

    qsb.queryString = query;
    qsb.onChange({query: query});
  }
}
