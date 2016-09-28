'use strict';

/**
 * @ngdoc directive
 * @name udb.event-form.directive:udbAutoScroll
 * @description
 * auto scrolls to the attached element when focused.
 */
angular
  .module('udb.event-form')
  .directive('udbAutoScroll', AutoScroll);

/* @ngInject */
function AutoScroll($document) {
  return {
    restrict: 'A',
    link: link
  };

  function link(scope, element) {
    var scrollDuration = 1000;
    var easeInOutQuad = function (t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };

    element.on('click focusin', scrollToTarget);

    function scrollToTarget(event) {
      $document.scrollTo(event.target, 0, scrollDuration, easeInOutQuad);
    }
  }
}
