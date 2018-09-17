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
function UdbOrganizerFactory(UitpasLabels) {

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
    }
  };

  return (UdbOrganizer);
}
