'use strict';

angular
  .module('udb.search')
  .component('udbTranslationStatus', {
    templateUrl: 'templates/translation-status.component.html',
    controller: TranslationStatusComponent,
    controllerAs: 'tsc',
    bindings: {
      offer: '<',
    }
  });

/** @ngInject */
function TranslationStatusComponent(EventTranslationState) {
  var controller = this;
  controller.availableLanguages = ['nl','fr','en','de'];
  controller.getLanguageTranslationIcon = function(language) {
    var icon = EventTranslationState.NONE.icon;

    if (controller.offer && controller.offer.translationState && language) {
      icon = controller.offer.translationState[language].icon;
    }

    return icon;
  }
}
