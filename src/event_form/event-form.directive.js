'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:event-form.html
 * @description
 * # udb event form directive
 */
angular
  .module('udb.event-form')
  .directive('udbEventForm', EventFormDirective);

/* @ngInject */
function EventFormDirective() {
  return {
    templateUrl: 'templates/event-form.html',
    restrict: 'EA',
  };
}

/**
 * @ngdoc directive
 * @name udb.search.directive:event-form-extras.html
 * @description
 * # event form extras. Default empty, decorate it to add custom extras.
 */
angular
  .module('udb.event-form')
  .directive('udbEventFormExtras', EventFormExtras);

/* @ngInject */
function EventFormExtras() {
  return {
    template: '',
    restrict: 'EA',
  };
}

/**
 * @ngdoc directive
 * @name udb.search.directive:udbEvent
 * @description
 * # udb search directive
 */
angular
  .module('udb.event-form')
  .directive('udbEventFormStep1', EventFormStep1Directive);

/* @ngInject */
function EventFormStep1Directive() {
  return {
    templateUrl: 'templates/event-form-step1.html',
    restrict: 'EA',
  };
}

/**
 * @ngdoc directive
 * @name udb.search.directive:udbEvent
 * @description
 * # udb search directive
 */
angular
  .module('udb.event-form')
  .directive('udbEventFormStep2', EventFormStep2Directive);

/* @ngInject */
function EventFormStep2Directive() {
  return {
    templateUrl: 'templates/event-form-step2.html',
    restrict: 'EA',
  };
}

/**
 * @ngdoc directive
 * @name udb.search.directive:udbEvent
 * @description
 * # udb search directive
 */
angular
  .module('udb.event-form')
  .directive('udbEventFormStep3', EventFormStep3Directive);

/* @ngInject */
function EventFormStep3Directive() {
  return {
    templateUrl: 'templates/event-form-step3.html',
    restrict: 'EA',
  };
}

/**
 * @ngdoc directive
 * @name udb.search.directive:udbEvent
 * @description
 * # udb search directive
 */
angular
  .module('udb.event-form')
  .directive('udbEventFormStep4', EventFormStep4Directive);

/* @ngInject */
function EventFormStep4Directive() {
  return {
    templateUrl: 'templates/event-form-step4.html',
    restrict: 'EA',
  };
}

/**
 * @ngdoc directive
 * @name udb.search.directive:udbEvent
 * @description
 * # udb search directive
 */
angular
  .module('udb.event-form')
  .directive('udbEventFormStep5', EventFormStep5Directive);

/* @ngInject */
function EventFormStep5Directive() {
  return {
    templateUrl: 'templates/event-form-step5.html',
    restrict: 'EA',
  };
}

/**
 * @ngdoc directive
 * @name udb.event-form.directive:udbEventFormPublish
 * @description
 * # udb event form publish directive
 */
angular
  .module('udb.event-form')
  .directive('udbEventFormPublish', EventFormPublishDirective);

/* @ngInject */
function EventFormPublishDirective() {
  return {
    templateUrl: 'templates/event-form-publish.html',
    restrict: 'EA',
    controller: 'EventFormPublishController',
    controllerAs: 'efpc'
  };
}
