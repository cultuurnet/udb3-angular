'use strict';

/**
 * @ngdoc service
 * @name udb.core.organizers
 * @description
 * Service for organizers.
 */
angular
  .module('udb.core')
  .service('udbOrganizers', UdbOrganizers);

/* @ngInject */
function UdbOrganizers($q, $http, appConfig, UdbOrganizer, udbApi) {

  /**
   * Get the organizers that match the searched value.
   */
  this.suggestOrganizers = function(value) {
    var deferredOrganizer = $q.defer();

    function returnOrganizerSuggestions(pagedOrganizersResponse) {
      var jsonOrganizers = pagedOrganizersResponse.data.member;
      var organizers = _.map(jsonOrganizers, function (jsonOrganizer) {
        return new UdbOrganizer(jsonOrganizer);
      });

      deferredOrganizer.resolve(organizers);
    }

    $http
      .get(appConfig.baseUrl + 'organizers/suggest/' + value)
      .then(returnOrganizerSuggestions);

    return deferredOrganizer.promise;
  };

  /**
   * Search for duplicate organizers.
   */
  this.searchDuplicates = function(website) {
    return udbApi.searchDuplicateOrganizers(website);
  };

}
