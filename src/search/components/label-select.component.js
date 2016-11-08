'use strict';

angular
  .module('udb.search')
  .component('udbLabelSelect', {
    templateUrl: 'templates/label-select.html',
    controller: LabelSelectComponent,
    controllerAs: 'select',
    bindings: {
      offer: '<',
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
  /** @type {Label[]} */
  select.labels = _.map(select.offer.labels, function (labelName) {
    return {name:labelName};
  });
  select.minimumInputLength = 2;
  select.maxInputLength = 255;
  select.findDelay = 300;
  select.refreshing = false;

  function areLengthCriteriaMet(length) {
    return (length >= select.minimumInputLength && length <= select.maxInputLength);
  }

  function createLabel(labelName) {
    // strip semi-colon, which doesn't get stripped automatically
    // due to the same problem as https://github.com/angular-ui/ui-select/issues/1151
    // see also: https://github.com/angular-ui/ui-select/blob/v0.19.4/src/uiSelectController.js#L633
    labelName = labelName.replace(/;/g, '').trim();

    var similarLabel = _.find(select.labels, function (existingLabel) {
      return existingLabel.name.toUpperCase() === labelName.toUpperCase();
    });
    if (!similarLabel && select.areLengthCriteriaMet(labelName.length)) {
      return {name:labelName};
    }
  }

  function findSuggestions(name) {
    return offerLabeller
      .getSuggestions(name, 6)
      .then(function(labels) {
        labels.push({name: name});
        setAvailableLabels(labels);
        return $q.resolve();
      })
      .finally(function () {
        select.refreshing = false;
      });
  }

  function suggestLabels(name) {
    select.refreshing = true;
    setAvailableLabels([]);
    // returning the promise for testing purposes
    return findSuggestions(name);
  }

  /** @param {Label[]} labels */
  function setAvailableLabels(labels) {
    select.availableLabels = _.chain(labels)
      .reject(function(label) {
        return _.find(select.labels, {'name': label.name});
      })
      .uniq(function (label) {
        return label.name.toUpperCase();
      })
      .value();
  }
}
