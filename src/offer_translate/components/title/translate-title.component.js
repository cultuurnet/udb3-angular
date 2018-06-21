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
function TranslateTitleController(appConfig, $translate, offerTranslator) {
  var controller = this;

  controller.cachedOffer = controller.offer;
  controller.translatedNames = {};
  controller.originalName = _.get(controller.offer.name, controller.offer.mainLanguage, null) ||
      _.get(controller.offer.name, 'nl', null) ||
      _.get(controller.offer, 'name', '');

  controller.translatedNames = _.get(controller.offer, 'name');

  controller.saveTranslatedName = saveTranslatedName;

  function saveTranslatedName(language) {
    offerTranslator
        .translateProperty(controller.cachedOffer, 'name', language, controller.translatedNames[language])
        .then(function() {
          //
        });
  }
}
