'use strict';

/**
 * @typedef {Object} UiTIDUser
 * @property {string} id        The UiTID of the user.
 * @property {string} nick      A user nickname.
 * @property {string} mbox      The email address of the user.
 * @property {string} givenName The user's given name.
 */

/**
 * @typedef {Object} PagedCollection
 * @property {string} @context
 * @property {string} @type
 * @property {int} itemsPerPage
 * @property {int} totalItems
 * @property {Object[]} member
 */

/**
 * @typedef {Object} OfferIdentifier
 * @property {string} @id
 * @property {string} @type
 */

/**
 * @readonly
 * @enum {string}
 */
var OfferTypes = {
  EVENT: 'event',
  PLACE: 'place'
};

/**
 * @ngdoc service
 * @name udb.core.udbApi
 * @description
 * # udbApi
 * udb api service
 */
angular
  .module('udb.core')
  .service('udbApi', UdbApi);

/* @ngInject */
function UdbApi(
  $q,
  $http,
  appConfig,
  $cookieStore,
  uitidAuth,
  $cacheFactory,
  UdbEvent,
  UdbPlace,
  UdbOrganizer
) {
  var apiUrl = appConfig.baseApiUrl;
  var defaultApiConfig = {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + uitidAuth.getToken()
    },
    params: {}
  };
  var offerCache = $cacheFactory('offerCache');

  this.mainLanguage = 'nl';

  /**
   * Removes an item from the offerCache.
   * @param {string} id - The uuid of the offer.
   */
  this.removeItemFromCache = function (id) {
    var offer = offerCache.get(id);

    if (offer) {
      offerCache.remove(id);
    }
  };

  /**
   * @param {string} queryString - The query used to find events.
   * @param {number} [start] - From which event offset the result set should start.
   * @returns {Promise.<PagedCollection>} A promise that signals a successful retrieval of
   *  search results or a failure.
   */
  this.findEvents = function (queryString, start) {
    var offset = start || 0,
        searchParams = {
          start: offset
        },
        requestOptions = {
          params: searchParams,
          withCredentials: true,
          headers: {
            'Accept': 'application/ld+json'
          }
        };

    if (queryString.length) {
      searchParams.query = queryString;
    }

    return $http
      .get(apiUrl + 'search', requestOptions)
      .then(returnUnwrappedData);
  };

  /**
   * @param {URL} offerLocation
   * @return {UdbPlace|UdbEvent}
   */
  this.getOffer = function(offerLocation) {
    var deferredOffer = $q.defer();
    var jsonLdRequestOptions = {
      headers: {
        'Accept': 'application/ld+json'
      }
    };
    var offer = offerCache.get(offerLocation);

    function cacheAndResolveOffer(jsonOffer) {
      var offer = new UdbPlace();
      offer.parseJson(jsonOffer);
      offerCache.put(offerLocation, offer);
      deferredOffer.resolve(offer);
    }

    if (offer) {
      deferredOffer.resolve(offer);
    } else {
      $http
        .get(offerLocation.toString(), jsonLdRequestOptions)
        .success(cacheAndResolveOffer)
        .error(deferredOffer.reject);
    }

    return deferredOffer.promise;
  };

  this.getOrganizerByLDId = function(organizerLDId) {
    var organizerId = organizerLDId.split('/').pop();
    return this.getOrganizerById(organizerId);
  };

  // TODO: Give organizers their own cache instead of using offer?
  this.getOrganizerById = function(organizerId) {
      var deferredOrganizer = $q.defer();

      var organizer = offerCache.get(organizerId);

      if (organizer) {
        deferredOrganizer.resolve(organizer);
      } else {
        var organizerRequest  = $http.get(
          appConfig.baseApiUrl + 'organizer/' + organizerId,
          {
            headers: {
              'Accept': 'application/ld+json'
            }
          });

        organizerRequest.success(function(jsonOrganizer) {
          var organizer = new UdbOrganizer();
          organizer.parseJson(jsonOrganizer);
          offerCache.put(organizerId, organizer);
          deferredOrganizer.resolve(organizer);
        });
      }

      return deferredOrganizer.promise;
    };

  /**
   * @param {URL} eventId
   * @return {*}
   */
  this.getHistory = function (eventId) {
    var requestOptions = {
      headers: {
        'Accept': 'application/json'
      }
    };

    return $http
      .get(eventId + '/history', requestOptions)
      .then(returnUnwrappedData);
  };

  /**
   * @returns {Promise} A list of labels wrapped as a promise.
   */
  this.getRecentLabels = function () {
    var deferredLabels = $q.defer();

    var request = $http.get(apiUrl + 'user/labels', {
      withCredentials: true,
      headers: {
        'Accept': 'application/json'
      }
    });

    request
      .success(function (data) {
        deferredLabels.resolve(data);
      })
      .error(function () {
        deferredLabels.reject();
      });

    return deferredLabels.promise;
  };

  /**
   * @returns {Promise.<UiTIDUser>}
   *   A promise with the credentials of the currently logged in user.
   */
  this.getMe = function () {
    var deferredUser = $q.defer();
    var activeUser = uitidAuth.getUser();

    function storeAndResolveUser (userData) {
      var user = {
        id: userData.id,
        nick: userData.nick,
        mbox: userData.mbox,
        givenName: userData.givenName
      };

      $cookieStore.put('user', user);
      deferredUser.resolve(user);
    }

    if (activeUser) {
      deferredUser.resolve(activeUser);
    } else {
      $http
        .get(appConfig.baseUrl + 'uitid/user', defaultApiConfig)
        .success(storeAndResolveUser)
        .error(deferredUser.reject);
    }

    return deferredUser.promise;
  };

  /**
   * Get the editing permission for an offer.

   * @param {URL} offerLocation
   */
  this.hasPermission = function(offerLocation) {
    return $http.get(
      offerLocation + '/permission',
      defaultApiConfig
    ).then(function (response) {
      if (response.data.hasPermission) {
        return $q.resolve();
      } else {
        $q.reject();
      }
    });
  };

  /**
   * @param {OfferIdentifier[]} offers
   * @param {string} label
   * @return {Promise}
   */
  this.labelOffers = function (offers, label) {
    return $http.post(appConfig.baseUrl + 'offers/labels',
      {
        'label': label,
        'offers': offers
      },
      defaultApiConfig
    );
  };

  /**
   * @param {string} query
   * @param {string} label
   * @return {Promise}
   */
  this.labelQuery = function (query, label) {
    return $http.post(appConfig.baseUrl + 'query/labels',
      {
        'label': label,
        'query': query
      },
      defaultApiConfig
    );
  };

  /**
   *
   * @param {string} query
   * @param {string} [email]
   * @param {string} format
   * @param {string[]} properties
   * @param {boolean} perDay
   * @param {URL[]} selection
   * @param {Object} [customizations]
   * @return {*}
   */
  this.exportEvents = function (query, email, format, properties, perDay, selection, customizations) {

    var exportData = {
      query: query,
      selection: _.map(selection, Object.prototype.toString) || [],
      order: {},
      include: properties,
      perDay: perDay,
      customizations: customizations || {}
    };

    if (email) {
      exportData.email = email;
    }

    return $http.post(appConfig.baseUrl + 'events/export/' + format, exportData, defaultApiConfig);
  };

  /**
   * @param {URL} offerLocation
   * @param {string} propertyName
   *  'title' or 'description'
   * @param {string} language
   *  ISO 639-1 language code: https://en.wikipedia.org/wiki/ISO_639-1
   *  Languages known to be supported: nl, en, fr, de.
   * @param {string} translation
   *
   * @return {Promise}
   */
  this.translateProperty = function (offerLocation, propertyName, language, translation) {
    var translationData = {};
    translationData[propertyName] = translation;

    return $http.post(
      offerLocation + '/' + language + '/' + propertyName,
      translationData,
      defaultApiConfig
    );
  };

  /**
   * Update the property for a given id.
   *
   * @param {URL} offerLocation
   *   The location of the offer to update
   * @param {string} property
   *   Property to update
   * @param {string} value
   *   Value to save
   */
  this.updateProperty = function(offerLocation, property, value) {
    var updateData = {};
    updateData[property] = value;

    return $http.post(
      offerLocation +  '/' + property,
      updateData,
      defaultApiConfig
    );
  };

  /**
   * @param {URL} offerLocation
   * @param {string} label
   *
   * @return {Promise}
   */
  this.labelOffer = function (offerLocation, label) {
    return $http.post(
      offerLocation + '/labels',
      {'label': label},
      defaultApiConfig
    );
  };

  /**
   * @param {URL} offerLocation
   * @param {string} label
   *
   * @return {Promise}
   */
  this.unlabelOffer = function (offerLocation, label) {
    return $http.delete(
      offerLocation + '/labels/' + label,
      defaultApiConfig
    );
  };

  this.createEvent = function (event) {
    return $http.post(
      appConfig.baseApiUrl + 'event',
      event,
      defaultApiConfig
    );
  };

  this.deleteOffer = function (offer) {
    return $http['delete'](
      offer.apiUrl,
      defaultApiConfig
    );
  };

  this.createPlace = function (event) {
    return $http.post(
      appConfig.baseApiUrl + 'place',
      event,
      defaultApiConfig
    );
  };

  /**
   * @param {URL} offerLocation
   * @param {string} description
   * @param {string} purpose
   */
  this.createVariation = function (offerLocation, description, purpose) {
    var activeUser = uitidAuth.getUser(),
        requestData = {
          'owner': activeUser.id,
          'purpose': purpose,
          'same_as': offerLocation,
          'description': description
        };

    return $http.post(
      appConfig.baseUrl + 'variations/',
      requestData,
      defaultApiConfig
    );
  };

  /**
   * @param {string} variationId
   * @param {string} description
   */
  this.editDescription = function (variationId, description) {
    return $http.patch(
      appConfig.baseUrl + 'variations/' + variationId,
      {'description': description},
      defaultApiConfig
    );
  };

  /**
   * @param {URL} placeLocation
   * @returns {OfferIdentifier[]}
   */
  this.findEventsAtPlace = function(placeLocation) {
    function unwrapEvents(wrappedEvents) {
      return $q.resolve(wrappedEvents.events);
    }

    return $http
      .get(placeLocation + '/events', defaultApiConfig)
      .then(function (response) {
        return returnUnwrappedData(response)
          .then(unwrapEvents);
      });
  };

  /**
   * Create a new organizer.
   */
  this.createOrganizer = function(organizer) {
    return $http.post(
      appConfig.baseApiUrl + 'organizer',
      organizer,
      defaultApiConfig
    );
  };

  /**
   * Update the major info of an offer.
   * @param {URL} offerLocation
   * @param {EventFormData} info
   */
  this.updateMajorInfo = function(offerLocation, info) {
    return $http.post(
      offerLocation + '/major-info',
      info,
      defaultApiConfig
    );
  };

  /**
   * Delete the typical age range for an offer.
   * @param {URL} offerLocation
   */
  this.deleteTypicalAgeRange = function(offerLocation) {

    return $http.delete(
      offerLocation + '/typicalAgeRange',
      defaultApiConfig
    );
  };

  /**
   * Delete the organizer for an offer.
   * @param {URL} offerLocation
   * @param {string} organizerId
   */
  this.deleteOfferOrganizer = function(offerLocation, organizerId) {

    return $http.delete(
      offerLocation + '/organizer/' + organizerId,
      defaultApiConfig
    );
  };

  /**
   * @param {string} variationId
   */
  this.deleteVariation = function (variationId) {
    return $http.delete(
      appConfig.baseUrl + 'variations/' + variationId,
      defaultApiConfig
    );
  };

  /**
   * Add a new image.
   * @param {URL} itemLocation
   * @param {string} imageId
   * @return {Promise}
   */
  this.addImage = function(itemLocation, imageId) {
    var postData = {
      mediaObjectId: imageId
    };

    return $http
      .post(
        itemLocation + '/images',
        postData,
        defaultApiConfig
      )
      .then(returnJobData);
  };

  /**
   * Update the image info of an item.
   * @param {URL} itemLocation
   * @param {string} imageId
   * @param {string} description
   * @param {string} copyrightHolder
   * @return {Promise}
   *
   */
  this.updateImage = function(itemLocation, imageId, description, copyrightHolder) {
    var postData = {
      description: description,
      copyrightHolder: copyrightHolder
    };

    return $http
      .post(
        itemLocation + '/images/' + imageId,
        postData,
        defaultApiConfig
      )
      .then(returnJobData);
  };

  /**
   * Remove an image from an item.
   *
   * @param {URL} itemLocation
   * @param {string} imageId
   *
   * @return {Promise}
   */
  this.removeImage = function(itemLocation, imageId) {
    return $http.delete(
      itemLocation + '/images/' + imageId,
      defaultApiConfig
    ).then(returnJobData);
  };

  /**
   * Select the main image for an item.
   *
   * @param {URL} itemLocation
   * @param {string} imageId
   *
   * @return {Promise.<Object>}
   */
  this.selectMainImage = function(itemLocation, imageId) {
    var postData = {
      mediaObjectId: imageId
    };

    return $http
      .post(
        itemLocation + '/images/main',
        postData,
        defaultApiConfig
      )
      .then(returnJobData);
  };

  /**
   * @param {object} response
   *  The response that is returned when creating a job.
   *
   * @return {Promise.<Object>}
   *  The object containing the job data
   */
  function returnJobData(response) {
    return $q.resolve(response.data);
  }

  this.getOfferVariations = function (ownerId, purpose, offerUrl) {
    var parameters = {
      'owner': ownerId,
      'purpose': purpose,
      'same_as': offerUrl
    };

    var config = {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      },
      params: _.pick(parameters, _.isString)
    };

    return $http.get(
      appConfig.baseUrl + 'variations/',
      config
    );
  };

  this.getVariation = function (variationId) {
    var deferredVariation = $q.defer();

    var variationRequest = $http.get(
      appConfig.baseUrl + 'variations/' + variationId,
      {
        headers: {
          'Accept': 'application/ld+json'
        }
      });

    variationRequest.success(function (jsonEvent) {
      var event = new UdbEvent(jsonEvent);
      deferredVariation.resolve(event);
    });

    variationRequest.error(function () {
      deferredVariation.reject();
    });

    return deferredVariation.promise;
  };

  function returnUnwrappedData(response) {
    return $q.resolve(response.data);
  }

  /**
   * @param {int} page
   * @return {Promise.<PagedCollection>}
   */
  this.getDashboardItems = function(page) {
    var requestConfig = _.cloneDeep(defaultApiConfig);
    if (page > 1) {
      requestConfig.params.page = page;
    }

    return $http
      .get(appConfig.baseUrl + 'dashboard/items', requestConfig)
      .then(returnUnwrappedData);
  };
}
