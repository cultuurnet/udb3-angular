'use strict';

/* jshint sub: true */

/**
 * @ngdoc service
 * @name udb.uitpas.UitpasLabelsProvider
 * @description
 * # UiTPAS Labels Provider
 *
 * All the known UiTPAS labels that link an organizer to card-systems on 2017-03-01 are in the DefaultUitpasLabels
 * constant. The file used to be updated each time labels changed but now acts as a placeholder.
 *
 * The actual labels should be fetched when building or bootstrapping your app and written to the ExtermalUitpasLabels
 * constant. The UiTPAS service should have an endpoint with all the labels for your environment.
 * e.g.: https://uitpas.uitdatabank.be/labels for production
 */
angular
  .module('udb.uitpas')
  .provider('UitpasLabels', UitpasLabelsProvider);

function UitpasLabelsProvider() {
  var customUitpasLabels;

  /**
   * Configure the UiTPAS labels by providing a map of {LABEL_KEY: label name}
   * @param {object} labels
   */
  this.useLabels = function(labels) {
    customUitpasLabels = labels;
  };

  this.$get = ['DefaultUitpasLabels', function(DefaultUitpasLabels) {
    return !!customUitpasLabels ? customUitpasLabels : DefaultUitpasLabels;
  }];
}
