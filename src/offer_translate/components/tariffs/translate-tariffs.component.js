'use strict';

/**
 * @ngdoc function
 * @name udb.offer-translate:TranslateTariffsController
 * @description
 * # TranslateTariffsController
 * Controller for the tariffs translation component
 */
angular
    .module('udb.offer-translate')
    .component('offerTranslateTariffs', {
      templateUrl: 'templates/translate-tariffs.html',
      controller: TranslateTariffsController,
      controllerAs: 'ttsc',
      bindings: {
        offer: '<',
        activeLanguages: '<'
      }
    });

/* @ngInject */
function TranslateTariffsController(eventCrud) {
  var controller = this;

  controller.translatedTariffs = [];

  controller.originalTariffs = getOriginalTariffs();
  controller.translatedTariffs = getTranslatedTariffs();

  controller.saveTranslatedTariffs = saveTranslatedTariffs;

  function saveTranslatedTariffs() {
    for (var key in controller.offer.priceInfo) {
      if (key > 0) {
        var originalTariff = {};
        originalTariff[controller.offer.mainLanguage] = controller.originalTariffs[key - 1];
        controller.offer.priceInfo[key].name =
            _.merge(originalTariff, controller.translatedTariffs[key - 1]);
      }
    }

    eventCrud.updatePriceInfo(controller.offer);
  }

  function getOriginalTariffs() {
    var originalTariffs = [];
    for (var key in controller.offer.priceInfo) {
      if (key > 0) {
        originalTariffs.push(
            controller.offer.priceInfo[key].name[controller.offer.mainLanguage] ?
                controller.offer.priceInfo[key].name[controller.offer.mainLanguage] :
                controller.offer.priceInfo[key].name);
      }
    }

    return originalTariffs;
  }

  function getTranslatedTariffs() {
    var translatedTariffs = [];
    for (var key in controller.offer.priceInfo) {
      if (key > 0) {
        translatedTariffs.push(controller.offer.priceInfo[key].name);
      }
    }

    return translatedTariffs;
  }
}
