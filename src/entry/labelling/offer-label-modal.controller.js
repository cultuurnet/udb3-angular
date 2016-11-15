'use strict';

/**
 * @ngdoc function
 * @name udb.entry.controller:OfferLabelModalCtrl
 * @description
 * # OfferLabelModalCtrl
 * Controller of the udb.entry
 */
angular
  .module('udb.entry')
  .controller('OfferLabelModalCtrl', OfferLabelModalCtrl);

/* @ngInject */
function OfferLabelModalCtrl($uibModalInstance, udbApi) {
  var lmc = this;
  // ui-select can't get to this scope variable unless you reference it from the $parent scope.
  // seems to be 1.3 specific issue, see: https://github.com/angular-ui/ui-select/issues/243
  lmc.labels = [];
  lmc.close = close;
  lmc.ok = ok;
  lmc.labelNames = '';
  lmc.labelSelection = [];
  lmc.alert = false;
  lmc.minimumInputLength = 2;
  lmc.maxInputLength = 255;

  udbApi
    .getRecentLabels()
    .then(function (labels) {
      lmc.labelSelection = _.map(labels, function (label) {
        return {'name': label, 'selected': false};
      });
    });

  function ok() {
    // reset error msg
    lmc.alert = false;

    // Get the labels selected by checkbox
    var checkedLabels = lmc.labelSelection.filter(function (label) {
      return label.selected;
    }).map(function (label) {
      return label.name;
    });

    //add the labels
    var inputLabels = parseLabelInput(lmc.labelNames);

    if (lmc.alert) {
      return;
    }

    // join arrays and remove doubles
    var labels = _.union(checkedLabels, inputLabels);

    $uibModalInstance.close(labels);
  }

  function close() {
    $uibModalInstance.dismiss('cancel');
  }

  function areLengthCriteriaMet(length) {
    return (length >= lmc.minimumInputLength && length <= lmc.maxInputLength);
  }

  function parseLabelInput(stringWithLabels) {
    //split sting into array of labels
    var labels = stringWithLabels.split(';');

    // trim whitespaces
    labels = _.each(labels, function (label, index) {
      labels[index] = label.trim();
    });

    // remove empty strings
    labels = _.without(labels, '');

    var i;
    for (i = 0; i < labels.length; i++) {
      if (!areLengthCriteriaMet(labels[i].length)) {
        lmc.alert = 'Een label mag minimum 2 en maximum 255 karakters bevatten.';
        break;
      }
    }

    return labels;
  }
}
