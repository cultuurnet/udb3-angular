'use strict';

angular
  .module('udb.uitpas')
  .directive('uitpasOrganisationSuggestion', uitpasOrganisationSuggestion);

/* @ngInject */
function uitpasOrganisationSuggestion() {
  return {
    templateUrl: 'templates/organisation-suggestion.directive.html',
    controller: 'OrganisationSuggestionController',
    controllerAs: 'os',
    scope: {
      organisation: '<',
      query: '<'
    },
    restrict: 'A'
  };
}
