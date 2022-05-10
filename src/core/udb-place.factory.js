'use strict';

/**
 * @ngdoc service
 * @name udb.core.UdbTimestamps
 * @description
 * # UdbTimestamps
 * Contains timestamps info for the calendar
 */
angular
  .module('udb.core')
  .factory('UdbPlace', UdbPlaceFactory);

/* @ngInject */
function UdbPlaceFactory(EventTranslationState, placeCategories, UdbOrganizer) {

  function getCategoryByType(jsonPlace, domain) {
    var category = _.find(jsonPlace.terms, function (category) {
      return category.domain === domain;
    });

    if (category) {
      return category;
    }

    return;
  }

  /**
   * Return all categories for a given type.
   */
  function getCategoriesByType(jsonPlace, domain) {
    var categories = [];

    if (jsonPlace.terms) {
      for (var i = 0; i < jsonPlace.terms.length; i++) {
        if (jsonPlace.terms[i].domain === domain) {
          categories.push(jsonPlace.terms[i]);
        }
      }
    }

    return categories;
  }

  function updateTranslationState(place) {
    var languages = {'en': false, 'fr': false, 'de': false},
        properties = ['name', 'description'];

    _.forEach(languages, function (language, languageKey) {
      var translationCount = 0,
          state;

      _.forEach(properties, function (property) {
        if (place[property] && place[property][languageKey]) {
          ++translationCount;
        }
      });

      if (translationCount) {
        if (translationCount === properties.length) {
          state = EventTranslationState.ALL;
        } else {
          state = EventTranslationState.SOME;
        }
      } else {
        state = EventTranslationState.NONE;
      }

      languages[languageKey] = state;
    });

    place.translationState = languages;
  }

  /**
   * Get the images that exist for this event.
   */
  function getImages(jsonPlace) {

    var images = [];
    if (jsonPlace.mediaObject) {
      for (var i = 0; i < jsonPlace.mediaObject.length; i++) {
        if (jsonPlace.mediaObject[i]['@type'] === 'schema:ImageObject') {
          images.push(jsonPlace.mediaObject[i]);
        }
      }
    }

    return images;

  }

  /**
   * @class UdbPlace
   * @constructor
   */
  var UdbPlace = function (placeJson) {
    this.id = '';
    this.name = {};
    this.type = '';
    this.theme = {};
    this.status = {};
    this.calendar = {};
    this.address = {};
    /*this.address = {
      'addressCountry' : 'BE',
      'addressLocality' : '',
      'postalCode' : '',
      'streetAddress' : ''
    };*/

    if (placeJson) {
      this.parseJson(placeJson);
    }
  };

  UdbPlace.prototype = {
    parseJson: function (jsonPlace) {

      this.id = jsonPlace['@id'] ? jsonPlace['@id'].split('/').pop() : '';
      this['@id'] = jsonPlace['@id'];
      this['@type'] = jsonPlace['@type'];
      if (jsonPlace['@id']) {
        this.apiUrl = new URL(jsonPlace['@id']);
      }
      this.name = jsonPlace.name || {};
      //this.address = (jsonPlace.address && jsonPlace.address.nl) || jsonPlace.address || this.address;
      this.address = jsonPlace.address || {};
      this.theme = getCategoryByType(jsonPlace, 'theme') || {};
      this.status = jsonPlace.status;
      this.description = angular.copy(jsonPlace.description) || {};
      this.calendarType = jsonPlace.calendarType || '';
      this.startDate = jsonPlace.startDate;
      this.endDate = jsonPlace.endDate;
      this.openingHours = jsonPlace.openingHours || [];
      this.typicalAgeRange = jsonPlace.typicalAgeRange || '';
      this.priceInfo = jsonPlace.priceInfo || [];
      this.bookingInfo = jsonPlace.bookingInfo || {};
      if (this.bookingInfo.urlLabel) {
        this.bookingInfo.urlLabel = _.get(
          jsonPlace.bookingInfo.urlLabel,
          jsonPlace.mainLanguage,
          jsonPlace.bookingInfo.urlLabel
        );
      }
      this.contactPoint = jsonPlace.contactPoint || {
        'url': [],
        'phone': [],
        'email': []
      };
      if (jsonPlace.organizer) {
        // if it's a full organizer object, parse it as one
        if (jsonPlace.organizer['@id']) {
          this.organizer = new UdbOrganizer(jsonPlace.organizer);
        } else {
          // just create an object
          this.organizer = {
            name: jsonPlace.organizer.name,
            email: jsonPlace.organizer.email ? (jsonPlace.organizer.email[0] || '-') : '-',
            phone: jsonPlace.organizer.phone ? (jsonPlace.organizer.phone[0] || '-') : '-'
          };
        }
      }
      this.image = jsonPlace.image;
      this.images = _.reject(getImages(jsonPlace), 'contentUrl', jsonPlace.image);
      this.labels = _.union(jsonPlace.labels, jsonPlace.hiddenLabels);
      this.mediaObject = jsonPlace.mediaObject || [];
      this.facilities = getCategoriesByType(jsonPlace, 'facility') || [];
      this.additionalData = jsonPlace.additionalData || {};
      if (jsonPlace['@id']) {
        this.url = 'place/' + this.id;
      }
      this.creator = jsonPlace.creator;
      if (jsonPlace.created) {
        this.created = new Date(jsonPlace.created);
      }
      this.modified = jsonPlace.modified;

      if (jsonPlace.terms) {
        var place = this;

        // Only add terms related to locations.
        angular.forEach(jsonPlace.terms, function (term) {
          angular.forEach(placeCategories, function(category) {
            if (term.id === category.id) {
              place.type = term;
              return;
            }
          });
        });
      }

      if (jsonPlace.workflowStatus) {
        this.workflowStatus = jsonPlace.workflowStatus;
      }

      if (jsonPlace.availableFrom) {
        this.availableFrom = jsonPlace.availableFrom;
      }

      this.facilities = _.filter(_.get(jsonPlace, 'terms', []), {domain: 'facility'});
      this.mainLanguage = jsonPlace.mainLanguage || 'nl';
      this.languages = jsonPlace.languages || [];

      if (jsonPlace.isDummyPlaceForEducationEvents) {
        this.isDummyPlaceForEducationEvents = jsonPlace.isDummyPlaceForEducationEvents;
      }
      if (this.id === '00000000-0000-0000-0000-000000000000') {
        this.isVirtualLocation = true;
      }

      this.isRealLocation = !this.isDummyPlaceForEducationEvents && !this.isVirtualLocation;
    },

    /**
     * Set the name of the event for a given langcode.
     */
    setName: function(name, langcode) {
      this.name[langcode] = name;
    },

    /**
     * Get the name of the event for a given langcode.
     */
    getName: function(langcode) {
      return this.name[langcode];
    },

    /**
     * Set the event type for this event.
     */
    setEventType: function(id, label) {
      this.type = {
        'id' : id,
        'label' : label,
        'domain' : 'eventtype',
      };
    },

    /**
     * Get the event type for this event.
     */
    getEventType: function() {
      return this.type;
    },

    /**
     * Get the label for the event type.
     */
    getEventTypeLabel: function() {
      return this.type.label ? this.type.label : '';
    },

    /**
     * Set the event type for this event.
     */
    setTheme: function(id, label) {
      this.theme = {
        'id' : id,
        'label' : label,
        'domain' : 'thema',
      };
    },

    /**
     * Get the event type for this event.
     */
    getTheme: function() {
      return this.theme;
    },

    /**
     * Get the label for the theme.
     */
    getThemeLabel: function() {
      return this.theme.label ? this.theme.label : '';
    },

    /**
     * Reset the opening hours.
     */
    resetOpeningHours: function() {
      this.openinghours = [];
    },

    /**
     * Get the opening hours for this event.
     *
     * @returns {OpeningHoursData[]}
     */
    getOpeningHours: function() {
      return this.openinghours;
    },

    setCountry: function(country) {
      this.address.country = country;
    },

    setLocality: function(locality) {
      this.address.addressLocality = locality;
    },

    setPostal: function(postalCode) {
      this.address.postalCode = postalCode;
    },

    setStreet: function(street) {
      this.address.streetAddress = street;
    },

    getCountry: function() {
      return this.address.country;
    },

    getLocality: function() {
      return this.address.addressLocality;
    },

    getPostal: function() {
      return this.address.postalCode;
    },

    getStreet: function(street) {
      return this.address.streetAddress;
    },

    /**
     * Label the event with a label or a list of labels
     * @param {string|string[]} label
     */
    label: function (label) {
      var newLabels = [];
      var existingLabels = this.labels;

      if (_.isArray(label)) {
        newLabels = label;
      }

      if (_.isString(label)) {
        newLabels = [label];
      }

      newLabels = _.filter(newLabels, function (newLabel) {
        var similarLabel = _.find(existingLabels, function (existingLabel) {
          return existingLabel.toUpperCase() === newLabel.toUpperCase();
        });

        return !similarLabel;
      });

      this.labels = _.union(this.labels, newLabels);
    },

    /**
     * Unlabel a label from an event
     * @param {string} labelName
     */
    unlabel: function (labelName) {
      _.remove(this.labels, function (label) {
        return label === labelName;
      });
    },

    updateTranslationState: function (event) {
      event = event || this;
      updateTranslationState(event);
    },
    isExpired: function () {
      return this.calendarType !== 'permanent' && (new Date(this.endDate) < new Date());
    },
    hasFutureAvailableFrom: function() {
      var tomorrow = moment(new Date()).add(1, 'days');
      tomorrow.hours(0);
      tomorrow.minutes(0);
      tomorrow.seconds(0);
      if (this.availableFrom || this.availableFrom !== '') {
        var publicationDate = new Date(this.availableFrom);
        if (tomorrow < publicationDate) {
          return true;
        }
        else {
          return false;
        }
      } else {
        return false;
      }
    }

  };

  return (UdbPlace);
}
