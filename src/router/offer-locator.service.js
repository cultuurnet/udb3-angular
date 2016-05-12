'use strict';

/**
 * @ngdoc service
 * @name udbApp.OfferLocator
 * @description
 * Index and locate offers by UUID.
 */
angular.module('udb.router')
  .service('offerLocator', OfferLocator);

/* @ngInject */
function OfferLocator($q, udbApi) {
  // An associative array with UUIDs pointing to locations.
  // eg: 0586DF1-89D7-42F6-9804-DAE8878C2617 -> http://du.de/event/0586DF1-89D7-42F6-9804-DAE8878C2617
  var locations = {};

  // public methods
  this.get = get;
  this.add = add;
  this.addPagedCollection = addPagedCollection;

  /**
   * @param {string} uuid
   * @param {URL} location
   */
  function add(uuid, location) {
    locations[uuid] = location;
  }

  /**
   * @param {PagedCollection} offerCollection
   */
  function addPagedCollection(offerCollection) {
    _.each(offerCollection.member, function (item) {
      var offerLocation = item['@id'];
      var offerUuid = offerLocation.split('/').pop();
      add(offerUuid, offerLocation);
    });
  }

  /**
   * @param {string} uuid
   * @return {Promise.<URL>}
   */
  function get(uuid) {
    var knownLocation = locations[uuid];

    if (knownLocation) {
      return $q.resolve(knownLocation);
    } else {
      return findLocation(uuid);
    }
  }

  /**
   * @param {string} uuid
   * @return {Promise.<URL>}
   */
  function findLocation(uuid) {
    var deferredLocation = $q.defer();

    function cacheAndResolveLocation(pagedSearchResults) {
      if (pagedSearchResults.totalItems === 1) {
        var location = pagedSearchResults.member[0]['@id'];
        add(uuid, location);
        deferredLocation.resolve(location);
      } else {
        deferredLocation.reject('Unable to determine the exact offer for this uuid.');
      }
    }

    udbApi
      .findEvents('cdbid:"' + uuid + '"')
      .then(cacheAndResolveLocation)
      .catch(deferredLocation.reject);

    return deferredLocation.promise;
  }
}
