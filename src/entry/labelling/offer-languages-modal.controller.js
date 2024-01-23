'use strict';

/**
 * @ngdoc function
 * @name udb.entry.controller:OfferLanguagesModalCtrl
 * @description
 * # OfferLanguagesModalCtrl
 * Controller of the udb.entry
 */
angular
  .module('udb.entry')
  .controller('OfferLanguagesModalCtrl', OfferLanguagesModalCtrl);

/* @ngInject */
function OfferLanguagesModalCtrl($uibModalInstance) {
  var lmc = this;
  lmc.options = [
    {label: 'één taalicoon', text: 'om te kunnen deelnemen, moet je nog niet veel Nederlands spreken of gebruiken.'},
    {label: 'twee taaliconen', text: 'deelnemers begrijpen al een beetje Nederlands maar spreken het nog niet zo goed.'},
    {label: 'drie taaliconen', text: 'deelnemers spreken vrij veel Nederlands en kunnen ook iets vertellen.'},
    {label: 'vier taaliconen', text: 'deelnemers begrijpen Nederlands en spreken het ook goed.'},
  ];
}
