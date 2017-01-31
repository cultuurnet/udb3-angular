'use strict';

/**
 * @ngdoc service
 * @name udb.core.scroller
 * @description
 * # Scroller
 */
angular
  .module('udb.core')
  .service('scroller', Scroller);

/* @ngInject */
function Scroller($document) {
  var scroller = this;

  scroller.scrollTo = function (targetId) {
    var targetElement = angular.element($document[0].getElementById(targetId));
    $document.scrollTo(targetElement, 100, 1000);
  };
}
