'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:udbSearchBar
 * @description
 * # udbSearchBar
 */
angular
  .module('udb.manage')
  .directive('udbUserSearchBar', udbUserSearchBar);

/* @ngInject */
function udbUserSearchBar($rootScope) {
  return {
    templateUrl: 'templates/user-search-bar.directive.html',
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
        $rootScope.$emit('userSearchSubmitted', {query: query});
      };

      scope.usb = searchBar;

    }
  };
}
