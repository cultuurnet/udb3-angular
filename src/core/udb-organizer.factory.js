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
    return labels && !_.isEmpty(_.intersection(labels, _.values(UitpasLabels)));
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
      this.url = jsonOrganizer.url;
      this.contactPoint = jsonOrganizer.contactPoint;
      this.labels = _.union(jsonOrganizer.labels, jsonOrganizer.hiddenLabels);
      this.hiddenLabels = jsonOrganizer.hiddenLabels || [];
      this.isUitpas = isUitpas(jsonOrganizer);
      this.created = new Date(jsonOrganizer.created);
      this.deleted = Boolean(jsonOrganizer.workflowStatus === 'DELETED');
      this.detailUrl = '/manage/organisations/' + this.id;
    },
    updateTranslationState: function (organizer) {
      organizer = organizer || this;
      updateTranslationState(organizer);
    }
  };

  return (UdbOrganizer);
}
