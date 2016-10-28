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
 * @typedef {Object} Permission
 * @property {string} @key
 * @property {string} @name
 */

/**
 * @typedef {Object} ApiProblem
 * @property {URL} type
 * @property {string} title
 * @property {string} detail
 * @property {URL} instance
 * @property {Number} status
 */

/**
 * @typedef {Object} CommandInfo
 * @property {string} commandId
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
  UdbOrganizer,
  Upload
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

  this.createSavedSearch = function (name, queryString) {
    var post = {
      name: name,
      query: queryString
    };
    return $http
      .post(appConfig.baseUrl + 'saved-searches/', post, defaultApiConfig)
      .then(returnUnwrappedData);
  };

  this.getSavedSearches = function () {
    return $http
      .get(appConfig.baseUrl + 'saved-searches/', defaultApiConfig)
      .then(returnUnwrappedData);
  };

  this.deleteSavedSearch = function (searchId) {
    return $http
      .delete(appConfig.baseUrl + 'saved-searches/' + searchId, defaultApiConfig)
      .then(returnUnwrappedData);
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
        };
    var requestOptions = _.cloneDeep(defaultApiConfig);
    requestOptions.params = searchParams;

    if (queryString.length) {
      searchParams.query = queryString;
    }

    return $http
      .get(apiUrl + 'search', requestOptions)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} queryString - The query used to find events.
   * @param {number} [start] - From which event offset the result set should start.
   * @param {number} [itemsPerPage] - How many items should be in the result set.
   * @returns {Promise.<PagedCollection>} A promise that signals a successful retrieval of
   *  search results or a failure.
   */
  this.findEventsWithLimit = function (queryString, start, itemsPerPage) {
    var offset = start || 0,
        limit = itemsPerPage || 30,
        searchParams = {
          start: offset,
          limit: limit
        };
    var requestOptions = _.cloneDeep(defaultApiConfig);
    requestOptions.params = searchParams;

    if (queryString.length) {
      searchParams.query = queryString;
    }

    return $http
      .get(apiUrl + 'search', requestOptions)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {URL} offerLocation
   * @return {UdbPlace|UdbEvent}
   */
  this.getOffer = function(offerLocation) {
    var deferredOffer = $q.defer();
    var offer = offerCache.get(offerLocation);

    function cacheAndResolveOffer(jsonOffer) {
      var type = jsonOffer['@id'].split('/').reverse()[1];

      var offer = (type === 'event') ? new UdbEvent() : new UdbPlace();
      offer.parseJson(jsonOffer);
      offerCache.put(offerLocation, offer);
      deferredOffer.resolve(offer);
    }

    if (offer) {
      deferredOffer.resolve(offer);
    } else {
      $http
        .get(offerLocation.toString(), defaultApiConfig)
        .success(cacheAndResolveOffer)
        .error(deferredOffer.reject);
    }

    return deferredOffer.promise;
  };
  /**
   * @param {string} cdbid of the event
   *
   * @return {Promise}
   */
  this.getEventUitpasData = function(cdbid) {
    /*return $http
        .get(appConfig.baseUrl + 'uitpas/event/' + cdbid + '/cardsystem', defaultApiConfig)
        .then(returnUnwrappedData);*/

    var deferred = $q.defer();
    deferred.resolve({
      cardsystemId: '4',
      distributionKeyId: '1'
    });
    return deferred.promise;
  };

  /**
   * Update UiTPAS info for an event.
   * @param {Object} uitpasData
   * @param {string} cdbid
   *
   * @return {Promise}
   */
  this.updateEventUitpasData = function(uitpasData, cdbid) {
    /*return $http
        .put(appConfig.baseUrl + 'uitpas/event/' + cdbid + '/cardsystem', uitpasData, defaultApiConfig)
        .then(returnUnwrappedData);*/

    var deferred = $q.defer();
    deferred.resolve({
      commandId: 'c75003dd-cc77-4424-a186-66aa4abd917f'
    });
    return deferred.promise;
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
        appConfig.baseUrl + 'organizers/' + organizerId, defaultApiConfig
      );

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
   * @param {number} start
   * @param {number} limit
   * @param {string|null} website
   * @param {string|null} name
   *
   * @return {Promise.<PagedCollection>}
   */
  this.findOrganisations = function(start, limit, website, name) {
    var params = {
      limit: limit ? limit : 10,
      start: start ? start : 0
    };
    if (website) { params.website = website; }
    if (name) { params.name = name; }

    var configWithQueryParams = _.set(_.cloneDeep(defaultApiConfig), 'params', params);

    return $http
      .get(appConfig.baseUrl + 'organizers/', configWithQueryParams)
      .then(returnUnwrappedData);
  };

  /**
   * @param {string} organizerId of the organizer
   *
   * @return {Promise}
   */
  this.findOrganisationsCardSystems = function(organizerId) {
    /*return $http
        .get(appConfig.baseUrl + 'uitpas/organizers/' + organizerId + '/cardsystems/', defaultApiConfig)
        .then(returnUnwrappedData);*/
    var deferred = $q.defer();
    deferred.resolve([
      {
        id: '1',
        name: 'UiTPAS Regio Aalst',
        distributionKeys: [
          {
            id: '1',
            name: 'CC De Werf - 1,5 EUR / dag'
          },
          {
            id: '2',
            name: 'CC De Werf - 3 EUR / dag'
          }
        ]
      },
      {
        id: '2',
        name: 'UiTPAS Dender',
        distributionKeys: [
          {
            id: '3',
            name: 'Dender - 1,5 EUR / dag'
          }
        ]
      }]);
    return deferred.promise;
  };

  /**
   * @param {URL} eventId
   * @return {*}
   */
  this.getHistory = function (eventId) {
    return $http
      .get(eventId + '/history', defaultApiConfig)
      .then(returnUnwrappedData);
  };

  /**
   * @returns {Promise} A list of labels wrapped as a promise.
   */
  this.getRecentLabels = function () {
    var deferredLabels = $q.defer();
    var request = $http.get(apiUrl + 'user/labels', defaultApiConfig);

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
    } else if (uitidAuth.getToken()) {
      // set the freshest, newest token
      defaultApiConfig.headers.Authorization = 'Bearer ' + uitidAuth.getToken();

      $http
        .get(appConfig.baseUrl + 'user', defaultApiConfig)
        .success(storeAndResolveUser)
        .error(deferredUser.reject);
    } else {
      deferredUser.reject();
    }

    return deferredUser.promise;
  };

  /**
   * Get my user permissions
   */
  this.getMyPermissions = function () {
    var deferredPermissions = $q.defer();
    var token = uitidAuth.getToken();

    // cache the permissions with user token
    // == will need to fetch permissions for each login
    function storeAndResolvePermissions (permissionsList) {
      offerCache.put(token, permissionsList);
      deferredPermissions.resolve(permissionsList);
    }

    if (token) {
      var permissions = offerCache.get(token);
      if (!permissions) {
        $http
          .get(appConfig.baseUrl + 'user/permissions/', defaultApiConfig)
          .success(storeAndResolvePermissions)
          .error(deferredPermissions.reject);
      } else {
        deferredPermissions.resolve(permissions);
      }
    } else {
      deferredPermissions.reject();
    }

    return deferredPermissions.promise;
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
      return response.data.hasPermission ? $q.resolve() : $q.reject();
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
      selection: _.map(selection, function (url) {
        return url.toString();
      }),
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

  var offerPropertyPaths = {
    typicalAgeRange: 'typical-age-range'
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
    // TODO: having both in path and updateData is duplicate
    var updateData = {};
    updateData[property] = value;
    var path = offerPropertyPaths[property] ? offerPropertyPaths[property] : property;

    return $http.post(
      offerLocation +  '/' + path,
      updateData,
      defaultApiConfig
    );
  };

  this.updatePriceInfo = function(offerLocation, price) {
    return $http.put(
      offerLocation + '/priceInfo',
      price,
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

  /**
   * @param {EventFormData} offer
   *
   * @return {Promise.<URL>}
   */
  this.deleteOffer = function (offer) {
    return $http['delete'](
      offer['@id'],
      defaultApiConfig
    );
  };

  /**
   * @param {string} type   either 'place' or 'event'
   * @param {EventFormData} offer
   *
   * @return {Promise.<URL>}
   */
  this.createOffer = function (type, offer) {
    return $http.post(
      appConfig.baseUrl + type,
      offer,
      defaultApiConfig
    ).then(function(response) {
      return new URL(response.data.url);
    });
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
          'same_as': offerLocation.toString(),
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
      var eventIdentifiers = _.map(wrappedEvents.events, function(event) {
        return {'@id': appConfig.baseUrl + 'event/' + event['@id']};
      });
      return $q.resolve(eventIdentifiers);
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
      appConfig.baseUrl + 'organizers/',
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
      offerLocation + '/typical-age-range',
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

    var config = _.cloneDeep(defaultApiConfig);
    config.params = _.pick(parameters, _.isString);

    return $http.get(
      appConfig.baseUrl + 'variations/',
      config
    );
  };

  this.getVariation = function (variationId) {
    var deferredVariation = $q.defer();

    var variationRequest = $http.get(
      appConfig.baseUrl + 'variations/' + variationId, defaultApiConfig);

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

  this.uploadMedia = function (imageFile, description, copyrightHolder) {
    var uploadOptions = {
      url: appConfig.baseUrl + 'images',
      fields: {
        description: description,
        copyrightHolder: copyrightHolder
      },
      file: imageFile
    };
    var config = _.assign(defaultApiConfig, uploadOptions);

    return Upload.upload(config);
  };

  this.getMedia = function (imageId) {
    return $http
      .get(
        appConfig.baseUrl + 'media/' + imageId,
        defaultApiConfig
      )
      .then(returnUnwrappedData);
  };

  /**
   * @param {string}  name
   * @param {boolean} isVisible
   * @param {boolean} isPrivate
   * @param {string}  [parentId]
   * @return {Promise.<Object|ApiProblem>}
   */
  this.createLabel = function (name, isVisible, isPrivate, parentId) {
    var labelData = {
      name: name,
      visibility: isVisible ? 'visible' : 'invisible',
      privacy: isPrivate ? 'private' : 'public'
    };

    if (parentId) {
      labelData.parentId = parentId;
    }

    return $http
      .post(appConfig.baseUrl + 'labels/', labelData, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} labelId
   * @param {string} command
   * @return {Promise.<Object|ApiProblem>}
   */
  this.updateLabel = function (labelId, command) {
    return $http.patch(
      appConfig.baseUrl + 'labels/' + labelId,
      {'command': command},
      defaultApiConfig
    ).then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {uuid} labelId
   * @return {Promise.<Object|ApiProblem>}
   */
  this.deleteLabel = function (labelId) {
    return $http
      .delete(appConfig.baseUrl + 'labels/' + labelId, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {uuid} labelId
   * @return {Promise.<Label>}
   */
  this.getLabelById = function (labelId) {
    return $http
      .get(appConfig.baseUrl + 'labels/' + labelId, defaultApiConfig)
      .then(returnUnwrappedData);
  };

  /**
   * @param {string} query
   *  Matches case-insensitive and any part of a label.
   * @param {Number} [limit]
   *  The limit of results per page.
   * @param {Number} [start]
   * @return {Promise.<PagedCollection>}
   */
  this.findLabels = function (query, limit, start) {
    var requestConfig = _.cloneDeep(defaultApiConfig);
    requestConfig.params = {
      query: query,
      limit: limit ? limit : 30,
      start: start ? start : 0
    };

    return $http
      .get(appConfig.baseUrl + 'labels/', requestConfig)
      .then(returnUnwrappedData);
  };

  /**
   * @param {uuid} roleId
   * @return {Promise.<Role>}
   */
  this.getRoleById = function (roleId) {
    return $http
      .get(appConfig.baseUrl + 'roles/' + roleId, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} query
   *  Matches case-insensitive and any part of a label.
   * @param {Number} [limit]
   *  The limit of results per page.
   * @param {Number} [start]
   * @return {Promise.<PagedCollection>}
   */
  this.findRoles = function (query, limit, start) {
    var requestConfig = _.cloneDeep(defaultApiConfig);
    requestConfig.params = {
      query: query,
      limit: limit ? limit : 30,
      start: start ? start : 0
    };

    return $http
      .get(appConfig.baseUrl + 'roles/', requestConfig)
      .then(returnUnwrappedData);
  };

  /**
   * @param {string}  name
   * @return {Promise.<Object|ApiProblem>} Object containing created roleId
   */
  this.createRole = function (name) {
    var roleData = {
      name: name
    };

    return $http
      .post(appConfig.baseUrl + 'roles/', roleData, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {uuid}    roleId
   * @param {string}  name
   * @return {Promise.<Object|ApiProblem>} Object containing created roleId
   */
  this.updateRoleName = function (roleId, name) {
    var requestOptions = _.cloneDeep(defaultApiConfig);
    requestOptions.headers['Content-Type'] = 'application/ld+json;domain-model=RenameRole';

    var updateData = {
      'name': name
    };

    return $http
      .patch(appConfig.baseUrl + 'roles/' + roleId, updateData, requestOptions)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {uuid}    roleId
   * @param {string}  constraint
   * @return {Promise.<Object|ApiProblem>} Object containing created roleId
   */
  this.updateRoleConstraint = function (roleId, constraint) {
    var requestOptions = _.cloneDeep(defaultApiConfig);
    requestOptions.headers['Content-Type'] = 'application/ld+json;domain-model=SetConstraint';

    var updateData = {
      'constraint': constraint
    };

    return $http
      .patch(appConfig.baseUrl + 'roles/' + roleId, updateData, requestOptions)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @return {Promise.Array<Permission>}
   */
  this.getPermissions = function () {
    var requestConfig = defaultApiConfig;

    return $http
      .get(appConfig.baseUrl + 'permissions/', requestConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} roleId
   *  roleId for the role to retrieve permissions for
   * @return {Promise.Array<Permission>}
   */
  this.getRolePermissions = function (roleId) {
    var requestConfig = defaultApiConfig;
    return $http
      .get(appConfig.baseUrl + 'roles/' + roleId + '/permissions/', requestConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} roleId
   *  roleId for the role to retrieve users for
   * @return {Promise.Array<User>}
   */
  this.getRoleUsers = function (roleId) {
    var requestConfig = defaultApiConfig;
    return $http
      .get(appConfig.baseUrl + 'roles/' + roleId + '/users/', requestConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} permissionKey
   *  The key for the permission
   * @param {string} roleId
   *  roleId for the role
   * @return {Promise}
   */
  this.addPermissionToRole = function (permissionKey, roleId) {
    var requestConfig = defaultApiConfig;

    return $http
      .put(appConfig.baseUrl + 'roles/' + roleId + '/permissions/' + permissionKey, {}, requestConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} permissionKey
   *  The key for the permission
   * @param {string} roleId
   *  roleId for the role
   * @return {Promise}
   */
  this.removePermissionFromRole = function (permissionKey, roleId) {
    var requestConfig = defaultApiConfig;

    return $http
      .delete(appConfig.baseUrl + 'roles/' + roleId + '/permissions/' + permissionKey, requestConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} userId
   *  The id of the user
   * @param {string} roleId
   *  roleId for the role
   * @return {Promise}
   */
  this.addUserToRole = function (userId, roleId) {
    var requestConfig = defaultApiConfig;

    return $http
      .put(appConfig.baseUrl + 'roles/' + roleId + '/users/' + userId, {}, requestConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} email
   *  A valid email address with a specific domain. The wildcard '*' can be used in the local part.
   * @param {Number} [limit]
   *  The limit of results per page.
   * @param {Number} [start]
   * @return {Promise.<PagedCollection>}
   */
  this.findUsersByEmail = function (email, limit, start) {
    var requestConfig = _.cloneDeep(defaultApiConfig);
    requestConfig.params = {
      email: email ? email : '',
      limit: limit ? limit : 30,
      start: start ? start : 0
    };

    return $http
      .get(appConfig.baseUrl + 'users/', requestConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} email
   *  The e-mailaddress of a user.
   * @return {Promise}
   */
  this.findUserWithEmail = function(email) {
    var requestConfig = _.cloneDeep(defaultApiConfig);

    return $http
      .get(appConfig.baseUrl + 'users/emails/' + email, requestConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {uuid} roleId
   *  The uuid of the role to be removed.
   * @return {Promise}
   */
  this.removeRole = function (roleId) {
    return $http
      .delete(appConfig.baseUrl + 'roles/' + roleId, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} roleId
   *  roleId for the role to retrieve labels for
   * @return {Promise.Array<Permission>}
   */
  this.getRoleLabels = function (roleId) {
    return $http
      .get(appConfig.baseUrl + 'roles/' + roleId + '/labels/', defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} roleId
   *  roleId for the role
   * @param {string} labelId
   *  The id of the label to be added
   * @return {Promise}
   */
  this.addLabelToRole = function (roleId, labelId) {
    return $http
      .put(appConfig.baseUrl + 'roles/' + roleId + '/labels/' + labelId, {}, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} roleId
   *  roleId for the role
   * @param {string} labelId
   *  The id of the label to be removed
   * @return {Promise}
   */
  this.removeLabelFromRole = function (roleId, labelId) {
    return $http
      .delete(appConfig.baseUrl + 'roles/' + roleId + '/labels/' + labelId, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} roleId
   *  roleId for the role
   * @param {string} userId
   *  The id of the user to be removed
   * @return {Promise}
   */
  this.removeUserFromRole = function (roleId, userId) {
    return $http
      .delete(appConfig.baseUrl + 'roles/' + roleId + '/users/' + userId, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} userId
   *
   * @returns {Promise.<User>}
   */
  this.getUser = function(userId) {
    return $http
      .get(appConfig.baseUrl + 'users/' + userId, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} userId
   *
   * @return {Promise.<Object[]>}
   */
  this.getUserRoles = function (userId) {
    return $http
      .get(appConfig.baseUrl + 'users/' + userId + '/roles/', defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @return {Promise.<Object[]>}
   */
  this.getMyRoles = function () {
    return $http
      .get(appConfig.baseUrl + 'user/roles/', defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {URL} offerUrl
   * @param {string} domainModel
   * @param {string} reason (optional)
   */
  this.patchOffer = function (offerUrl, domainModel, reason) {
    var requestOptions = _.cloneDeep(defaultApiConfig);
    requestOptions.headers['Content-Type'] = 'application/ld+json;domain-model=' + domainModel;

    var updateData = {
      'reason': reason
    };

    return $http
      .patch(offerUrl, (reason ? updateData : {}), requestOptions)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {Object} errorResponse
   * @return {Promise.<ApiProblem>}
   */
  function returnApiProblem(errorResponse) {
    if (errorResponse) {
      var problem = {
        type: new URL(_.get(errorResponse, 'data.type', appConfig.baseUrl + 'problem')),
        title: _.get(errorResponse, 'data.title', 'Something went wrong.'),
        detail: _.get(errorResponse, 'data.detail', 'We failed to perform the requested action!'),
        status: errorResponse.status
      };

      return $q.reject(problem);
    }
  }
}
