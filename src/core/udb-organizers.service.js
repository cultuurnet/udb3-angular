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
function UdbOrganizers($q, udbApi, udbUitpasApi, UdbOrganizer) {

  /**
   * @param {string} name
   *  The name of the organizer to fuzzy search against.
   *
   * @return {Promise.<UdbOrganizer[]>}
   */
  this.suggestOrganizers = function(name) {
    var deferredOrganizer = $q.defer();

    function returnOrganizerSuggestions(pagedOrganizers) {
      var organizers = _.map(pagedOrganizers.member, function (jsonOrganizer) {
        return new UdbOrganizer(jsonOrganizer);
      });

      deferredOrganizer.resolve(organizers);
    }

    udbApi
      .findOrganisations(0, 10, null, name)
      .then(returnOrganizerSuggestions);

    return deferredOrganizer.promise;
  };

  this.findOrganizersWebsite = function(website) {
    return udbApi
        .findOrganisations(0, 10, website, null);
  };

  this.findOrganizersCardsystem = function(organizerId) {
    return udbUitpasApi
        .findOrganisationsCardSystems(organizerId);
  };

}
