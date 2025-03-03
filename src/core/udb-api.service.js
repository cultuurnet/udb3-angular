'use strict';

/**
 * @typedef {Object} UiTIDUser
 * @property {string} id        The UiTID of the user.
 * @property {string} nick      A user nickname.
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
 * @property {string} @context
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
  $cookies,
  uitidAuth,
  $cacheFactory,
  UdbEvent,
  UdbPlace,
  UdbOrganizer,
  Upload,
  $translate
) {
  var apiUrl = appConfig.baseApiUrl;
  var defaultApiConfig = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + uitidAuth.getToken(),
      'X-Api-Key': _.get(appConfig, 'apiKey')
    },
    params: {}
  };
  var offerCache = $cacheFactory('offerCache');

  function withoutAuthorization(apiConfig) {
    var config = _.cloneDeep(apiConfig);
    config.withCredentials = false;
    /**
     * @todo: use _.unset when lodash is updated to v4: https://lodash.com/docs/4.17.4#unset
     */
    delete config.headers.Authorization;

    return config;
  }

  this.mainLanguage = $translate.use() || 'nl';

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
      .post(appConfig.baseUrl + 'saved-searches/v3', post, defaultApiConfig)
      .then(returnUnwrappedData);
  };

  this.getSavedSearches = function () {
    return $http
      .get(appConfig.baseUrl + 'saved-searches/v3', defaultApiConfig)
      .then(returnUnwrappedData);
  };

  this.deleteSavedSearch = function (searchId) {
    return $http
      .delete(appConfig.baseUrl + 'saved-searches/v3/' + searchId, defaultApiConfig)
      .then(returnUnwrappedData);
  };

  this.editSavedSearch = function (searchId, name, query) {
    return $http
      .put(appConfig.baseUrl + 'saved-searches/v3/' + searchId, {name: name, query: query}, defaultApiConfig)
      .then(returnUnwrappedData);
  };

  /**
   * @param {string} queryString - The query used to find offers.
   * @param {number} [start] - From which offset the result set should start.
   * @param {boolean} showUnavailable - Include offers which are normally unavailable.
   * @returns {Promise.<PagedCollection>} A promise that signals a successful retrieval of
   *  search results or a failure.
   */
  this.findOffers = function (queryString, start, showUnavailable) {
    var offset = start || 0,
        searchParams = {
          start: offset,
          disableDefaultFilters: true,
          workflowStatus: 'READY_FOR_VALIDATION,APPROVED',
          embed: true
        };

    var requestOptions = _.cloneDeep(defaultApiConfig);
    requestOptions.params = searchParams;

    if (queryString.length) {
      searchParams.q = queryString;
    }

    if (showUnavailable) {
      var uniqueStatuses = ['DRAFT', 'REJECTED', 'DELETED'].concat(searchParams.workflowStatus.split(','));
      searchParams.workflowStatus = _.uniq(uniqueStatuses).join(',');
    }

    return $http
      .get(appConfig.baseUrl + 'offers/', withoutAuthorization(requestOptions))
      .then(returnUnwrappedData, returnApiProblem);
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
   * @param {string} queryString - The query used to find offer to moderate.
   * @param {number} [start] - From which offset the result set should start.
   * @param {number} [itemsPerPage] - How many items should be in the result set.
   * @returns {Promise.<PagedCollection>} A promise that signals a successful retrieval of
   *  search results or a failure.
   */
  this.findToModerate = function (queryString, start, itemsPerPage) {
    var path = appConfig.baseUrl + 'events/' + '?q=' + queryString +  '';
    var currentDate = moment.utc().format();

    var searchParams = {
      start: start,
      limit: itemsPerPage,
      workflowStatus: 'READY_FOR_VALIDATION',
      audienceType: 'everyone',
      availableFrom: currentDate,
      availableTo: '*'
    };

    var requestOptions = _.cloneDeep(defaultApiConfig);
    requestOptions.params = searchParams;

    return $http
      .get(path, requestOptions)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {URL} offerLocation
   * @return {UdbPlace|UdbEvent|UdbOrganizer}
   */
  this.getOffer = function(offerLocation) {
    var deferredOffer = $q.defer();
    var offer = offerCache.get(offerLocation);
    function cacheAndResolveOffer(jsonOffer) {
      var type = jsonOffer['@id'].split('/').reverse()[1];
      var offer = formatJsonLDEntity(type, jsonOffer);
      offer.parseJson(jsonOffer);
      offerCache.put(offerLocation, offer);
      deferredOffer.resolve(offer);
    }

    if (offer) {
      deferredOffer.resolve(offer);
    } else {
      $http
        .get(offerLocation.toString() + '?embedUitpasPrices=false', defaultApiConfig)
        .success(cacheAndResolveOffer)
        .error(deferredOffer.reject);
    }

    return deferredOffer.promise;
  };

  /**
   * @param {Array} events
   * @return {Array}
   */
  this.reformatJsonLDData = function(events) {
    events.member = events.member.map(function(member) {
      var memberContext = (member['@context']) ? member['@context'].split('/').pop() : '';
      memberContext = memberContext.charAt(0).toUpperCase() + memberContext.slice(1);
      member['@type'] = (member['@type']) ? member['@type'] : memberContext;
      return member;
    });
    return events;
  };

  /**
   * @param {object} jsonLD
   * @return {object}
   */
  this.formatJsonLDEntity = function(jsonLD) {
    var type = jsonLD['@type'].toLowerCase();
    var offer = formatJsonLDEntity(type, jsonLD);
    return offer;
  };

  /**
   * @param {string} type
   * @param {object} jsonLD
   * @return {object}
   */
  function formatJsonLDEntity(type, jsonLD) {
    var offer = {};
    switch (type) {
      case 'event':
        offer = new UdbEvent();
        break;
      case 'place':
        offer = new UdbPlace();
        break;
      case 'organizers':
        offer = new UdbOrganizer();
        break;
      default:
        console.warn('Unsupported ' +  type + ' in UdbApi.formateOfferClass');
    }
    offer.parseJson(jsonLD);
    return offer;
  }

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
   * @param {string|null} query
   *
   * @return {Promise.<PagedCollection>}
   */
  this.findOrganisations = function(start, limit, website, query) {
    var params = {
      limit: limit ? limit : 10,
      start: start ? start : 0,
      embed: true
    };
    if (website) {
      params.website = website;
    }
    if (query) {
      params.name = query;
    }

    var configWithQueryParams = _.set(withoutAuthorization(defaultApiConfig), 'params', params);
    return $http
      .get(appConfig.baseUrl + 'organizers/', configWithQueryParams)
      .then(returnUnwrappedData);
  };

  /**
   * @param {string} organizerId
   * @param {string} labelName
   * @returns {Promise.<CommandInfo|ApiProblem>}
   */
  this.addLabelToOrganizer = function(organizerId, labelName) {
    return $http
      .put(appConfig.baseUrl + 'organizers/' + organizerId + '/labels/' + labelName, {}, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} organizerId
   * @param {string} labelName
   * @returns {Promise.<CommandInfo|ApiProblem>}
   */
  this.deleteLabelFromOrganizer = function(organizerId, labelName) {
    return $http
        .delete(appConfig.baseUrl + 'organizers/' + organizerId + '/labels/' + labelName, defaultApiConfig)
        .then(returnUnwrappedData, returnApiProblem);
  };
  /**
   * @param {string} organizerId
   * @param {string} website
   * @returns {Promise.<CommandInfo|ApiProblem>}
   */
  this.updateOrganizerWebsite = function(organizerId, website) {
    var params = {
      url: website
    };

    return $http
        .put(appConfig.baseUrl + 'organizers/' + organizerId + '/url', params, defaultApiConfig)
        .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} organizerId
   * @param {string} name
   * @param {string} language
   * @returns {Promise.<CommandInfo|ApiProblem>}
   */
  this.updateOrganizerName = function(organizerId, name, language) {
    var params = {
      name: name
    };

    return $http
        .put(appConfig.baseUrl + 'organizers/' + organizerId + '/name/' + language, params, defaultApiConfig)
        .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} organizerId
   * @param {Object} address
   * @param {string} language
   * @returns {Promise.<CommandInfo|ApiProblem>}
   */
  this.updateOrganizerAddress = function(organizerId, address, language) {

    return $http
        .put(appConfig.baseUrl + 'organizers/' + organizerId + '/address/' + language, address, defaultApiConfig)
        .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} organizerId
   * @returns {Promise.<CommandInfo|ApiProblem>}
   */
  this.removeOrganizerAddress = function(organizerId) {

    return $http
        .delete(appConfig.baseUrl + 'organizers/' + organizerId + '/address', defaultApiConfig)
        .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} organizerId
   * @param {Array} contact
   * @returns {Promise.<CommandInfo|ApiProblem>}
   */
  this.updateOrganizerContact = function(organizerId, contact) {

    return $http
        .put(appConfig.baseUrl + 'organizers/' + organizerId + '/contactPoint', contact, defaultApiConfig)
        .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} organizerId
   *  roleId for the role to retrieve permissions for
   * @return {Promise.Array<Permission>}
   */
  this.getOrganizerPermissions = function (organizerId) {
    var requestConfig = defaultApiConfig;
    return $http
        .get(appConfig.baseUrl + 'organizers/' + organizerId + '/permissions', requestConfig)
        .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} id
   * @param {string} type
   * @return {*}
   */
  this.getHistory = function (id, type) {
    var endpoint = (type === 'place') ? 'places/' : 'event/';
    return $http
      .get(appConfig.baseUrl + endpoint + id + '/history', defaultApiConfig)
      .then(returnUnwrappedData);
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
        uuid: userData.uuid,
        username: userData.username,
        email: userData.email
      };

      $cookies.putObject('user', user);
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
          .error(function (_, status) {
            if (status === -1) {
              return;
            }
            window.parent.postMessage({
              source: 'UDB',
              type: 'HTTP_ERROR_CODE',
              code: status || 403
            }, '*');
            deferredPermissions.reject();
          });
      } else {
        deferredPermissions.resolve(permissions);
      }
    } else {
      window.parent.postMessage({
        source: 'UDB',
        type: 'HTTP_ERROR_CODE',
        code: 401
      }, '*');
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
      return !!response.data.hasPermission;
    });
  };

  this.getUserPermissions = function(offerLocation) {
    return $http.get(
      offerLocation + '/permissions',
      defaultApiConfig
    ).then(function (response) {
      return response.data.permissions;
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
      order: format === 'pdf' ? {availableTo: 'asc'} : {},
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

    if (propertyName === 'name') {
      propertyName = 'title';
    }

    return $http.post(
      offerLocation + '/' + language + '/' + propertyName,
      translationData,
      defaultApiConfig
    );
  };

  this.translateAddress = function (offerId, language, translation) {
    return $http.put(
        appConfig.baseUrl + 'places/' + offerId + '/address/' + language,
        {
          addressCountry: translation.addressCountry,
          addressLocality: translation.addressLocality,
          postalCode: translation.postalCode,
          streetAddress: translation.streetAddress
        },
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

  this.updateTypicalAgeRange = function(offerLocation, typicalAgeRange) {
    var updateData = {
      'typicalAgeRange': typicalAgeRange
    };
    return $http.put(
      offerLocation + '/typicalAgeRange',
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
   *   The location of the offer to update
   * @param {string[]} facilities
   *   A list of facility ids
   */
  this.updateOfferFacilities = function (offerLocation, facilities) {
    return $http.put(
      offerLocation + '/facilities/',
      {facilities: facilities},
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
    // @see https://stackoverflow.com/questions/332872/encode-url-in-javascript
    return $http
      .delete(offerLocation + '/labels/' + encodeURIComponent(label), defaultApiConfig)
      .catch(returnApiProblem);
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
   * @param {udbOrganizer} organization
   *
   * @return {Promise.<Object|ApiProblem>}
   */
  this.deleteOrganization = function (organization) {
    return $http
      .delete(organization['@id'], defaultApiConfig)
      .catch(returnApiProblem);
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
      );
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
      );
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
    );
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
      );
  };

  /**
   * @param {URL} itemLocation
   * @param {('everyone'|'members'|'education')} audienceType
   *
   * @returns {Promise.<CommandInfo|ApiProblem>}
   */
  this.setAudienceType = function (itemLocation, audienceType) {
    return $http
      .put(itemLocation.toString() + '/audience', {'audienceType': audienceType}, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  function returnUnwrappedData(response) {
    return $q.resolve(response.data);
  }

  /**
   * @param {int} page
   * @return {Promise.<PagedCollection>}
   */
  this.getDashboardItems = function(page) {
    var params = {
      'disableDefaultFilters': true,
      'workflowStatus': 'DRAFT,READY_FOR_VALIDATION,APPROVED,REJECTED',
      'sort[modified]': 'desc',
      'limit': 50,
      'start': (page - 1) * 50,
      'embed': true
    };

    var createdByQueryMode = _.get(appConfig, 'created_by_query_mode', 'uuid');

    return this.getMe()
      .then(function(userData) {
        var userId = userData.uuid;
        var userEmail = userData.email;

        if (createdByQueryMode === 'uuid') {
          params.creator = userId;
        } else if (createdByQueryMode === 'email') {
          params.creator = userEmail;
        } else if (createdByQueryMode === 'mixed') {
          params.q = 'creator:(' + userId + ' OR ' + userEmail + ')';
        }

        var requestConfig = _.cloneDeep(defaultApiConfig);
        requestConfig.params = params;

        return $http
          .get(appConfig.baseUrl + 'offers/', requestConfig)
          .then(returnUnwrappedData);
      });
  };

  /**
   * @param {int} page
   * @return {Promise.<PagedCollection>}
   */
  this.getDashboardOrganizers = function(page) {
    var requestConfig = _.cloneDeep(defaultApiConfig);

    return this.getMe()
      .then(function(userData) {
        var userId = userData.uuid;

        requestConfig.params = {
          'creator': userId,
          'sort[modified]': 'desc',
          'limit': 50,
          'start': (page - 1) * 50,
          'embed': true
        };

        return $http
          .get(appConfig.baseUrl + 'organizers/', requestConfig)
          .then(returnUnwrappedData);
      });
  };

  this.uploadMedia = function (imageFile, description, copyrightHolder, language) {
    var uploadOptions = {
      url: appConfig.baseUrl + 'images/',
      fields: {
        description: description,
        copyrightHolder: copyrightHolder,
        language: language
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
   * @param {Boolean} [suggestion]
   * @return {Promise.<PagedCollection>}
   */
  this.findLabels = function (query, limit, start, suggestion) {
    var requestConfig = _.cloneDeep(defaultApiConfig);
    requestConfig.params = {
      query: query,
      suggestion: suggestion === false ? undefined : true,
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
   *
   * @param {uuid}    roleId
   * @param {string}  constraint
   * @return {Promise.<Object|ApiProblem>} Object containing created constraint.
   */
  this.createRoleConstraint = function (roleId, constraint) {
    var requestOptions = _.cloneDeep(defaultApiConfig);
    requestOptions.headers['Content-Type'] = 'application/ld+json;domain-model=addConstraint';

    var constraintData = {
      query: constraint
    };

    return $http
        .post(appConfig.baseUrl + 'roles/' + roleId + '/constraints/', constraintData, requestOptions)
        .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   *
   * @param {uuid}    roleId
   * @param {string}  constraint
   * @return {Promise.<Object|ApiProblem>} Object containing updated constraint.
   */
  this.updateRoleConstraint = function (roleId, constraint) {
    var requestOptions = _.cloneDeep(defaultApiConfig);
    requestOptions.headers['Content-Type'] = 'application/ld+json;domain-model=updateConstraint';

    var updateData = {
      query: constraint
    };

    return $http
        .put(appConfig.baseUrl + 'roles/' + roleId + '/constraints/', updateData, requestOptions)
        .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   *
   * @param {uuid}    roleId
   * @return {Promise.<Object|ApiProblem>} Object containing updated constraint.
   */
  this.removeRoleConstraint = function (roleId) {
    var requestOptions = _.cloneDeep(defaultApiConfig);
    requestOptions.headers['Content-Type'] = 'application/ld+json;domain-model=removeConstraint';

    return $http
        .delete(appConfig.baseUrl + 'roles/' + roleId + '/constraints/', requestOptions)
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
   * @param {URL} offerUrl
   * @param {Date} [publicationDate]
   * @returns {Promise.<Object|ApiProblem>}
   */
  this.publishOffer = function (offerUrl, publicationDate) {
    var requestOptions = _.cloneDeep(defaultApiConfig);
    requestOptions.headers['Content-Type'] = 'application/ld+json;domain-model=Publish';
    var data = publicationDate instanceof Date ? {publicationDate: publicationDate} : {};

    return $http
      .patch(offerUrl.toString(), data, requestOptions)
      .then(returnUnwrappedData, returnApiProblem);
  };

  this.getCalendarSummary = function(offerId, format, language) {
    var plainConfig = _.cloneDeep(defaultApiConfig);
    var offerUrl = appConfig.baseUrl + 'events/' + offerId;
    var langCode = language + '_BE';
    plainConfig.headers.Accept = 'text/html';

    return $http
      .get(offerUrl + '/calsum?format=' + format + '&langCode=' + langCode, plainConfig)
      .then(returnUnwrappedData);
  };

  /**
   * @param {URL} eventUrl
   * @param {Object} newCalendarData
   * @return {Promise.<Object|ApiProblem>} Object containing the duplicate info
   */
  this.duplicateEvent = function(eventUrl, newCalendarData) {
    return $http
      .post(eventUrl + '/copies/', newCalendarData, defaultApiConfig)
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
