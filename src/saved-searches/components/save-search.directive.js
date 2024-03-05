'use strict';

/**
 * @ngdoc directive
 * @name udb.savedSearches.directive:udbSaveSearch
 * @description
 * # udbSaveSearch
 */
angular
  .module('udb.saved-searches')
  .directive('udbSaveSearch', udbSaveSearch);

/* @ngInject */
function udbSaveSearch(savedSearchesService, $uibModal) {
  var directive = {
    link: link,
    templateUrl: 'templates/save-search.directive.html',
    restrict: 'AE',
    scope: {
      queryString: '=udbQueryString'
    }
  };
  return directive;

  function link(scope, element, attrs, controllers) {
    scope.saveSearch = function () {
      var modal = $uibModal.open({
        templateUrl: 'templates/save-search-modal.html',
        controller: 'SaveSearchModalController'
      });

      modal.result.then(function (params) {
        if (params.type === 'new') {
          savedSearchesService
          .createSavedSearch(params.name, scope.queryString)
          .catch(displayErrorModal);
        }

        if (params.type === 'existing') {
          console.log('should edit the existing query');
        }

      });
    };
  }

  function displayErrorModal() {
    $uibModal.open(
      {
        templateUrl: 'templates/unexpected-error-modal.html',
        controller: 'UnexpectedErrorModalController',
        size: 'lg',
        resolve: {
          errorMessage: function() {
            return 'Het opslaan van de zoekopdracht is mislukt. Controleer de verbinding en probeer opnieuw.';
          }
        }
      }
    );
  }
}
