'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:udbSearchBar
 * @description
 * # udbQuerySearchBar
 */
angular
  .module('udb.manage')
  .directive('udbQuerySearchBar', udbQuerySearchBar);

/* @ngInject */
function udbQuerySearchBar($rootScope) {
  return {
    templateUrl: 'templates/query-search-bar.directive.html',
    restrict: 'E',
    link: function postLink(scope) {

      var searchBar = {
        queryString: ''
      };

      /**
       * Search with a given query string and update the search bar or use the one currently displayed in the search bar
       *
       * @param {String} [queryString]
       */
      searchBar.find = function (queryString) {
        var query = typeof queryString !== 'undefined' ? queryString : searchBar.queryString;

        searchBar.queryString = query;
        $rootScope.$emit('querySearchSubmitted', {query: query});
      };

      scope.qsb = searchBar;

    }
  };
}
