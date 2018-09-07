'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:offer-translate.html
 * @description
 * # udb offer translate directive
 */
angular
  .module('udb.offer-translate')
  .directive('udbOfferTranslate', OfferTranslateDirective);

/* @ngInject */
function OfferTranslateDirective() {
  return {
    templateUrl: 'templates/offer-translate.html',
    restrict: 'EA',
  };
}
