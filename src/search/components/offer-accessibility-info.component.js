'use strict';

angular
  .module('udb.search')
  .component('udbOfferAccessibilityInfo', {
    templateUrl: 'templates/offer-accessibility-info.component.html',
    controller: AccessibilityInfoController,
    bindings: {
      'offerType': '<',
      'offer': '='
    }
  });

/* @ngInject */
function AccessibilityInfoController(facilities, $uibModal) {
  var controller = this;

  controller.changeFacilities = function () {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/search-facilities-modal.html',
      controller: 'SearchFacilitiesModalController',
      resolve: {
        offer: function () {
          return controller.offer;
        },
        facilities: function () {
          return 'place' === controller.offerType ? _.pick(facilities, 'place') : _.omit(facilities, 'place');
        }
      }
    });
  };
}
