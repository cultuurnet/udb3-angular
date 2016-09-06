'use strict';

angular
  .module('udb.management.labels')
  .directive('udbSemicolonLabelCheck', SemicolonLabelCheckDirective);

/** @ngInject */
function SemicolonLabelCheckDirective($q) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, controller) {

      function hasNoSemicolons(name) {
        return (name.indexOf(';') === -1);
      }

      controller.$validators.semicolonLabel = hasNoSemicolons;
    }
  };
}
