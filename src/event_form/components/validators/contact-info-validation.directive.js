'use strict';

/**
* @ngdoc directive
* @name udb.event-form.directive:udbContactInfoValidation
* @description
* # directive for contact info validation
*/
angular
  .module('udb.event-form')
  .directive('udbContactInfoValidation', UdbContactInfoValidationDirective);

function UdbContactInfoValidationDirective() {

  var URL_REGEXP = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
  var EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

  return {
    restrict: 'A',
    require: 'ngModel',
    link: link
  };

  function link (scope, elem, attrs, ngModel) {
    // Scope methods.
    scope.validateInfo = validateInfo;
    scope.clearInfo = clearInfo;
    scope.infoErrorMessage = '';

    /**
     * Validate the entered info.
     */
    function validateInfo() {

      ngModel.$setValidity('contactinfo', true);
      scope.infoErrorMessage = '';

      if (!ngModel.$viewValue.value) {
        scope.infoErrorMessage = 'Gelieve dit veld niet leeg te laten.';
        ngModel.$setValidity('contactinfo', false);
      }
      else {
        if (ngModel.$modelValue.type === 'email' && !EMAIL_REGEXP.test(ngModel.$modelValue.value)) {
          EMAIL_REGEXP.test(ngModel.$modelValue.value);
          scope.infoErrorMessage = 'Gelieve een geldig e-mailadres in te vullen.';
          ngModel.$setValidity('contactinfo', false);

        }
        else if (ngModel.$modelValue.type === 'url') {
          var viewValue = ngModel.$viewValue;

          if (!URL_REGEXP.test(viewValue.value)) {
            scope.infoErrorMessage = 'Gelieve een geldige url in te vullen.';
            ngModel.$setValidity('contactinfo', false);
          }
        }
      }
    }

    /**
     * Clear the entered info when switching type.
     */
    function clearInfo() {
      ngModel.$modelValue.value = '';
      ngModel.$modelValue.booking = false;
      scope.infoErrorMessage = '';
      ngModel.$setValidity('contactinfo', true);
    }

  }
}
