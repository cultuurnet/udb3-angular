'use strict';

angular
  .module('udb.management.roles')
  .component('udbSearchLabel', {
    templateUrl: 'templates/search-label.html',
    controller: LabelSearchComponent,
    controllerAs: 'select',
    bindings: {
      labelAdded: '&',
      labelRemoved: '&'
    }
  });

/** @ngInject */
function LabelSearchComponent(LabelManager) {
  var select = this;
  /** @type {Label[]} */
  select.availableLabels = [];
  select.suggestLabels = suggestLabels;
  select.minimumInputLength = 2;
  select.findDelay = 300;
  select.label = null;

  function findSuggestions(name) {
    LabelManager
      .find(name, 6, 0)
      .then(function(results) {
        setAvailableLabels(results.member);
      })
      .finally(function () {
        select.refreshing = false;
      });
  }

  function suggestLabels(name) {
    select.refreshing = true;
    setAvailableLabels([]);
    findSuggestions(name);
  }

  /** @param {Label[]} labels */
  function setAvailableLabels(labels) {
    select.availableLabels = labels;
  }
}
