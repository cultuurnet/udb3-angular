'use strict';

/**
 * @ngdoc service
 * @name udb.core.UdbOrganizer
 * @description
 * # UdbOrganizer
 * UdbOrganizer factory
 */
angular
  .module('udb.core')
  .factory('UdbOrganizer', UdbOrganizerFactory);

/* @ngInject */
function UdbOrganizerFactory(UitpasLabels, EventTranslationState) {

  function isUitpas(organizer) {
    return hasUitpasLabel(organizer.labels) ||
      hasUitpasLabel(organizer.hiddenLabels);
  }

  function hasUitpasLabel(labels) {
    return arrayToLowerCase(labels) &&
        !_.isEmpty(_.intersection(arrayToLowerCase(labels), _.values(arrayToLowerCase(UitpasLabels))));
  }

  function arrayToLowerCase(array) {
    var lowerCaseArray = [];
    _.each(array, function(element, key) {
      lowerCaseArray[key] = element.toLowerCase();
    });

    return lowerCaseArray;
  }

  function getFirst(jsonOrganizer, path) {
    return _
      .chain(jsonOrganizer)
      .get(path, [])
      .first()
      .value();
  }

  function updateTranslationState(organizer) {

    var languages = {'en': false, 'fr': false, 'de': false},
        properties = ['name'];

    _.forEach(languages, function (language, languageKey) {
      var translationCount = 0,
          state;

      _.forEach(properties, function (property) {
        if (organizer[property] && organizer[property][languageKey]) {
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

    organizer.translationState = languages;
  }

  /**
   * @class UdbOrganizer
   * @constructor
   */
  var UdbOrganizer = function (jsonOrganizer) {
    this.id = '';
    this.name = '';

    if (jsonOrganizer) {
      this.parseJson(jsonOrganizer);
    }
  };

  UdbOrganizer.prototype = {
    parseJson: function (jsonOrganizer) {
      this['@id'] = jsonOrganizer['@id'];
      this.id = jsonOrganizer['@id'].split('/').pop();
      // 1. Main language is now a required property.
      // Organizers can be created in a given main language.
      // 2. Previous projections had a default main language of nl.
      // 3. Even older projections had a non-translated name.
      // @todo @mainLanguage after a full replay only case 1 needs to be supported.
      this.name = _.get(jsonOrganizer.name, jsonOrganizer.mainLanguage, null) ||
          _.get(jsonOrganizer.name, 'nl', null) ||
        _.get(jsonOrganizer, 'name', '');
      this.address = _.get(jsonOrganizer.address, jsonOrganizer.mainLanguage, null) ||
          _.get(jsonOrganizer.address, 'nl', null) || jsonOrganizer.address || [];
      this.email = getFirst(jsonOrganizer, 'contactPoint.email');
      this.phone = getFirst(jsonOrganizer, 'contactPoint.phone');
      //this.url = jsonOrganizer.url;
      this.website = jsonOrganizer.url;
      this.contactPoint = jsonOrganizer.contactPoint;
      this.labels = _.union(jsonOrganizer.labels, jsonOrganizer.hiddenLabels);
      this.hiddenLabels = jsonOrganizer.hiddenLabels || [];
      this.isUitpas = isUitpas(jsonOrganizer);
      this.created = new Date(jsonOrganizer.created);
      this.deleted = Boolean(jsonOrganizer.workflowStatus === 'DELETED');
      this.detailUrl = '/organizer/' + this.id;
    },
    updateTranslationState: function (organizer) {
      organizer = organizer || this;
      updateTranslationState(organizer);
    },
    regex : {
      url: new RegExp(/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i)
    }
  };

  return (UdbOrganizer);
}
