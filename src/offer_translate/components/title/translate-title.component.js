'use strict';

/**
 * @ngdoc function
 * @name udb.offer-translate:TranslateTitleController
 * @description
 * # TranslateTitleController
 * Controller for the title translation component
 */
angular
    .module('udb.offer-translate')
    .component('offerTranslateTitle', {
      templateUrl: 'templates/translate-title.html',
      controller: TranslateTitleController,
      controllerAs: 'ttc',
      bindings: {
        offer: '<',
        activeLanguages: '<'
      }
    });

/* @ngInject */
function TranslateTitleController(offerTranslator) {
  var controller = this;

  controller.translatedNames = {};
  controller.originalName = _.get(controller.offer.name, controller.offer.mainLanguage, null) ||
      _.get(controller.offer.name, 'nl', null) ||
      _.get(controller.offer, 'name', '');

  controller.translatedNames = _.get(controller.offer, 'name');

  controller.saveTranslatedName = saveTranslatedName;

  function saveTranslatedName(language) {
    offerTranslator
        .translateProperty(controller.offer, 'name', language, controller.translatedNames[language])
        .then(function() {
          //
        });
  }
}
