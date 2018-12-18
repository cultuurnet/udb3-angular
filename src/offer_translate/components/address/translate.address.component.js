'use strict';

/**
 * @ngdoc function
 * @name udb.offer-translate:TranslateAddressController
 * @description
 * # TranslateAddressController
 * Controller for the address translation component
 */
angular
    .module('udb.offer-translate')
    .component('offerTranslateAddress', {
      templateUrl: 'templates/translate-address.html',
      controller: TranslateAddressController,
      controllerAs: 'tac',
      bindings: {
        offer: '<',
        activeLanguages: '<'
      }
    });

/* @ngInject */
function TranslateAddressController(offerTranslator) {
  var controller = this;
  var offerType = '';

  controller.translatedAddresses = {};
  if (controller.offer.url !== undefined) {
    offerType = 'places';
  } else {
    offerType = 'organizers';
  }

  controller.originalAddress = _.get(controller.offer.address, controller.offer.mainLanguage, '') ||
      _.get(controller.offer.address, 'nl', '') ||
      _.get(controller.offer, 'address', '');

  controller.translatedAddresses = _.get(controller.offer, 'address');
  _.forEach(controller.activeLanguages, function(language, key) {
    if (controller.translatedAddresses[key] === undefined) {
      controller.translatedAddresses[key] = {
        postalCode: controller.originalAddress.postalCode,
        addressLocality: controller.originalAddress.addressLocality,
        addressCountry: controller.originalAddress.addressCountry
      };
    }
  });

  controller.saveTranslatedAddress = saveTranslatedAddress;

  function saveTranslatedAddress(language) {

    offerTranslator
        .translateAddress(controller.offer, language, controller.translatedAddresses[language], offerType);
  }
}
