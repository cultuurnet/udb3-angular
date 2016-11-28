(function () {
'use strict';

/**
 * @ngdoc component
 * @name udb.core.directive:udbTime
 * @description
 * # udbTime
 */
angular
  .module('udb.core')
  .directive('udbTime', udbTimeDirective);

function udbTimeDirective() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: link
  };

  function link (scope, elem, attr, ngModel) {

    if (!ngModel) {
      return;
    }

    if (attr.type !== 'time') {
      return;
    }

    ngModel.$formatters.unshift(function(value) {
      return value.replace(/:\d{2}[.,]\d{3}$/, '');
    });

    elem.bind('blur', function() {
      elem.toggleClass('has-error', elem.$invalid);
    });
  }
}
})();
