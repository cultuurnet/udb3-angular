'use strict';

/**
 * @ngdoc function
 * @name udb.saved-searches-list.controller:SavedSearchesListController
 * @description
 * # SavedSearchesListController
 * Saved searches list controller
 */
angular
  .module('udb.saved-searches')
  .controller('SavedSearchesListController', SavedSearchesList);

/* @ngInject */
function SavedSearchesList($scope, savedSearchesService, $uibModal, $rootScope) {

  $scope.savedSearches = [];

  $scope.editorOptions = {
    mode: 'solr',
    lineWrapping: true,
    readOnly: true
  };

  $scope.codemirrorLoaded = function(editorInstance) {
    editorInstance.on('focus', function () {
      editorInstance.execCommand('selectAll');
    });

    editorInstance.on('blur', function() {
      editorInstance.setCursor(0, 0, true);
    });
  };

  // get the current saved searches and watch for changes
  var savedSearchesPromise = savedSearchesService.getSavedSearches();
  savedSearchesPromise.then(function (savedSearches) {
    $scope.savedSearches = savedSearches;
  });
  $rootScope.$on('savedSearchesChanged', function (event, savedSearches) {
    $scope.savedSearches = savedSearches;
  });

  this.encodeURI = function (uri) {
    return encodeURIComponent(uri);
  };
  $scope.encodeURI = this.encodeURI;

  this.deleteSavedSearch = function(searchId) {
    var modal = $uibModal.open({
      templateUrl: 'templates/delete-search-modal.html',
      controller: 'DeleteSearchModalController'
    });

    modal.result.then(function () {
      var savedSearchPromise = savedSearchesService.deleteSavedSearch(searchId);

      savedSearchPromise
        .catch(function() {
          var modalInstance = $uibModal.open({
            templateUrl: 'templates/unexpected-error-modal.html',
            controller: 'UnexpectedErrorModalController',
            size: 'lg',
            resolve: {
              errorMessage: function() {
                return 'Het verwijderen van de zoekopdracht is mislukt. Controleer de verbinding en probeer opnieuw.';
              }
            }
          });
        });
    });
  };

  $scope.deleteSavedSearch = this.deleteSavedSearch;
}
