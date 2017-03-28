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
    return labels && !_.isEmpty(_.intersection(labels, _.values(UitpasLabels)));
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
      this.name = jsonOrganizer.name || '';
      this.address = jsonOrganizer.address || [];
      this.email = getFirst(jsonOrganizer, 'contactPoint.email');
      this.phone = getFirst(jsonOrganizer, 'contactPoint.phone');
      this.url = getFirst(jsonOrganizer, 'contactPoint.url');
      this.labels = _.union(jsonOrganizer.labels, jsonOrganizer.hiddenLabels);
      this.hiddenLabels = jsonOrganizer.hiddenLabels || [];
      this.isUitpas = isUitpas(jsonOrganizer);
    }
  };

  return (UdbOrganizer);
}
