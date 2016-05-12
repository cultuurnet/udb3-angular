'use strict';

/**
 * @ngdoc service
 * @name udb.core.UdbEvent
 * @description
 * # UdbEvent
 * UdbEvent factory
 */
angular
  .module('udb.core')
  .factory('UdbEvent', UdbEventFactory);

/* @ngInject */
function UdbEventFactory(EventTranslationState, UdbPlace) {

  var EventPricing = {
    FREE: 'free',
    UNKNOWN: 'unknown',
    PAYED: 'payed'
  };

  function getCategoryLabel(jsonEvent, domain) {
    var label;
    var category = _.find(jsonEvent.terms, function (category) {
      return category.domain === domain;
    });

    if (category) {
      label = category.label;
    }

    return category;
  }

  function getPricing(jsonEvent) {
    var pricing = EventPricing.UNKNOWN;

    if (jsonEvent.bookingInfo && jsonEvent.bookingInfo.length > 0) {
      var price = parseFloat(jsonEvent.bookingInfo[0].price);
      if (price > 0) {
        pricing = EventPricing.PAYED;
      } else {
        pricing = EventPricing.FREE;
      }
    }

    return pricing;
  }

  function updateTranslationState(event) {
    var languages = {'en': false, 'fr': false, 'de': false},
        properties = ['name', 'description'];

    _.forEach(languages, function (language, languageKey) {
      var translationCount = 0,
          state;

      _.forEach(properties, function (property) {
        if (event[property] && event[property][languageKey]) {
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

    event.translationState = languages;
  }

  /**
   * Get the images that exist for this event.
   */
  function getImages(jsonEvent) {

    var images = [];
    if (jsonEvent.mediaObject) {
      for (var i = 0; i < jsonEvent.mediaObject.length; i++) {
        if (jsonEvent.mediaObject[i]['@type'] === 'ImageObject') {
          images.push(jsonEvent.mediaObject[i]);
        }
      }
    }

    return images;

  }

  /**
   * @class UdbEvent
   * @constructor
   * @param {object}  jsonEvent
   */
  var UdbEvent = function (jsonEvent) {
    this.id = '';
    this.name = {};
    this.place = {};
    this.type = {};
    this.theme = {};
    this.openingHours = [];

    if (jsonEvent) {
      this.parseJson(jsonEvent);
    }
  };

  UdbEvent.prototype = {
    parseJson: function (jsonEvent) {
      this.id = jsonEvent['@id'].split('/').pop();
      this['@id'] = jsonEvent['@id'];
      this['@type'] = jsonEvent['@type'];
      this.apiUrl = new URL(jsonEvent['@id']);
      this.name = jsonEvent.name || {};
      this.description = angular.copy(jsonEvent.description) || {};
      this.calendarSummary = jsonEvent.calendarSummary;
      this.location = new UdbPlace(jsonEvent.location);
      // @todo Use getImages() later on.
      this.image = jsonEvent.image;
      this.labels = _.map(jsonEvent.labels, function (label) {
        return label;
      });
      if (jsonEvent.organizer) {
        this.organizer = {
          name: jsonEvent.organizer.name,
          email: jsonEvent.organizer.email ? (jsonEvent.organizer.email[0] || '-') : '-',
          phone: jsonEvent.organizer.phone ? (jsonEvent.organizer.phone[0] || '-') : '-'
        };
      }
      if (jsonEvent.bookingInfo && jsonEvent.bookingInfo.length > 0) {
        this.price = parseFloat(jsonEvent.bookingInfo[0].price);
      }
      this.pricing = getPricing(jsonEvent);
      this.publisher = jsonEvent.publisher || '';
      this.created = new Date(jsonEvent.created);
      this.modified = new Date(jsonEvent.modified);
      this.creator = jsonEvent.creator || '';
      this.type = getCategoryLabel(jsonEvent, 'eventtype') || '';
      this.theme = getCategoryLabel(jsonEvent, 'theme') || '';
      this.calendarType = jsonEvent.calendarType || '';
      this.startDate = jsonEvent.startDate;
      this.endDate = jsonEvent.endDate;
      this.subEvent = jsonEvent.subEvent || [];
      this.openingHours = jsonEvent.openingHours || [];
      this.mediaObject = jsonEvent.mediaObject || [];
      this.typicalAgeRange = jsonEvent.typicalAgeRange || '';
      this.bookingInfo = jsonEvent.bookingInfo || {};
      this.contactPoint = jsonEvent.contactPoint || {};
      this.url = 'event/' + this.id;
      this.sameAs = jsonEvent.sameAs;
      this.additionalData = jsonEvent.additionalData || {};
      if (jsonEvent.typicalAgeRange) {
        this.typicalAgeRange = jsonEvent.typicalAgeRange;
      }
      if (jsonEvent.available) {
        this.available = jsonEvent.available;
      }
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
      this.openingHours = [];
    },

    /**
     * Get the opening hours for this event.
     */
    getOpeningHours: function() {
      return this.openingHours;
    },

    /**
     * Set the location of this event.
     */
    setLocation: function(location) {
      this.location = location;
    },

    /**
     * Get the calendar for this event.
     */
    getLocation: function() {
      return this.location;
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
    updateTranslationState: function () {
      updateTranslationState(this);
    }
  };

  return (UdbEvent);
}
