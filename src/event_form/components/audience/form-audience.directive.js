'use strict';

/**
 * @ngdoc directive
 * @name udb.event-form.directive:udbFormAudience
 * @description
 * # Target audience component for event forms
 */
angular
  .module('udb.event-form')
  .directive('udbFormAudience', FormAudienceDirective);

/* @ngInject */
function FormAudienceDirective() {
  return {
    templateUrl: 'templates/form-audience.html',
    restrict: 'EA',
    controller: 'FormAudienceController',
    controllerAs: 'fac'
  };
}
