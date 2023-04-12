'use strict';

angular
  .module('udb.search')
  .component('udbLabelSelect', {
    templateUrl: 'templates/label-select.html',
    controller: LabelSelectComponent,
    controllerAs: 'select',
    bindings: {
      labels: '<',
      labelAdded: '&',
      labelRemoved: '&'
    }
  });

/** @ngInject */
function LabelSelectComponent(offerLabeller, $q) {
  var select = this;
  /** @type {Label[]} */
  select.availableLabels = [];
  select.suggestLabels = suggestLabels;
  select.createLabel = createLabel;
  select.areLengthCriteriaMet = areLengthCriteriaMet;
  select.areContentCriteriaMet = areContentCriteriaMet;
  /** @type {Label[]} */
  select.labels = objectifyLabels(select.labels);
  select.hiddenLabels = ['new-entry-form'];
  select.minimumInputLength = 2;
  select.maxInputLength = 50;
  select.currentLabel = '';
  select.onSelect = onSelect;
  select.onRemove = onRemove;

  select.$onChanges = updateLabels;

  /**
   * @param {Object} bindingChanges
   * @see https://code.angularjs.org/1.5.9/docs/guide/component
   */
  function updateLabels(bindingChanges) {
    select.labels = objectifyLabels(_.get(bindingChanges, 'labels.currentValue', select.labels));
  }

  select.regex = /^([a-zA-Z0-9ŠŽšœžŸÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]{1}[a-zA-Z0-9ŠŽšœžŸÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ_-\s]+)$/;

  function onSelect(item) {
    select.currentLabel = '';
    select.labelAdded({label: item});
    select.labels.push(item);
  }

  function onRemove(label) {
    select.currentLabel = '';
    select.labelRemoved({label: label});
    select.labels = _.without(select.labels, label);
  }

  /**
   * @param {string[]|Label[]} labels
   * @return {Label[]}
   */
  function objectifyLabels(labels) {
    return _.map(select.labels, function (label) {
      return _.isString(label) ? {name:label} : label;
    });
  }

  function areLengthCriteriaMet(length) {
    return (length >= select.minimumInputLength && length <= select.maxInputLength);
  }

  function areContentCriteriaMet(labelName) {
    return select.regex.test(labelName);
  }

  function createLabel(labelName) {
    if (areContentCriteriaMet(labelName)) {

      var similarLabel = _.find(select.labels, function (existingLabel) {
        return existingLabel.name.toUpperCase() === labelName.toUpperCase();
      });
      if (!similarLabel && select.areLengthCriteriaMet(labelName.length) && select.areContentCriteriaMet(labelName)) {
        return {name:labelName};
      }
    }

  }

  function findSuggestions(name) {
    return offerLabeller
      .getSuggestions(name, 6)
      .then(function(labels) {
        labels.push({name: name});
        return setAvailableLabels(labels);
      });
  }

  function suggestLabels(name) {
    if (areContentCriteriaMet(name)) {
      setAvailableLabels([]);
      return findSuggestions(name);
    } else {
      setAvailableLabels([]);
    }
  }

  /** @param {Label[]} labels */
  function setAvailableLabels(labels) {
    select.availableLabels = _.chain(labels)
      .filter(function(label) {
        return areContentCriteriaMet(label.name);
      })
      .reject(function(label) {
        return _.find(select.labels, {'name': label.name});
      })
      .uniq(function (label) {
        return label.name.toUpperCase();
      })
      .value();
    return select.availableLabels;
  }
}
