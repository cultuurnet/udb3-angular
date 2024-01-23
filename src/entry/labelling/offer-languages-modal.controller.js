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
  lmc.close = close;
  lmc.ok = ok;

  lmc.options = [
    {label: 'één taalicoon', value: 'één taalicoon', text: 'om te kunnen deelnemen, moet je nog niet veel Nederlands spreken of gebruiken.'},
    {label: 'twee taaliconen', value: 'twee taaliconen', text: 'deelnemers begrijpen al een beetje Nederlands maar spreken het nog niet zo goed.'},
    {label: 'drie taaliconen', value: 'drie taaliconen', text: 'deelnemers spreken vrij veel Nederlands en kunnen ook iets vertellen.'},
    {label: 'vier taaliconen', value: 'vier taaliconen', text: 'deelnemers begrijpen Nederlands en spreken het ook goed.'},
  ];

  function close() {
    $uibModalInstance.dismiss('cancel');
  }

  function ok() {
    var selected = lmc.options.filter(function (option) {
      return option.selected;
    }).map(function (option) {
      return option.value;
    });

    if (!selected.length) {
      return;
    }

    $uibModalInstance.close(selected);
  }
}
