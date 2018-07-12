'use strict';

/**
 * @ngdoc function
 * @name udb.offer-translate:TranslateDescriptionController
 * @description
 * # TranslateDescriptionController
 * Controller for the description translation component
 */
angular
    .module('udb.offer-translate')
    .component('offerTranslateDescription', {
      templateUrl: 'templates/translate-description.html',
      controller: TranslateDescriptionController,
      controllerAs: 'ttd',
      bindings: {
        offer: '<',
        activeLanguages: '<'
      }
    });

/* @ngInject */
function TranslateDescriptionController(offerTranslator) {
  var controller = this;

  controller.translatedDescriptions = {};
  controller.originalDescription = _.get(controller.offer.description, controller.offer.mainLanguage, '') ||
      _.get(controller.offer.description, 'nl', '') ||
      _.get(controller.offer, 'description', '');
  controller.originalDescription = _.isEmpty(controller.originalDescription) ? '' : controller.originalDescription;

  controller.translatedDescriptions = _.get(controller.offer, 'description');

  controller.saveTranslatedDescription = saveTranslatedDescription;

  function saveTranslatedDescription(language) {
    offerTranslator
        .translateProperty(controller.offer, 'description', language, controller.translatedDescriptions[language])
        .then(function() {
          //
        });
  }
}
