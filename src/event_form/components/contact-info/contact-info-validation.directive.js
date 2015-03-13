(function () {
  'use strict';

/**
 * @ngdoc directive
 * @name udb.core.directive:udbContactInfoValidation
 * @description
 * # directive for contact info validation
 */
  angular
  .module('udb.core')
  .directive('udbContactInfoValidation', UdbContactInfoValidationDirective);

  function UdbContactInfoValidationDirective() {

    var URL_REGEXP = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
    var EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, elem, attrs, ngModel) {

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

          if (ngModel.$modelValue.type === 'email' && !EMAIL_REGEXP.test(ngModel.$modelValue.value)) {
            EMAIL_REGEXP.test(ngModel.$modelValue.value);
            scope.infoErrorMessage = 'Gelieve een geldig email adres in te vullen';
            ngModel.$setValidity('contactinfo', false);

          }
          else if (ngModel.$modelValue.type === 'url') {

            var viewValue = ngModel.$viewValue;
            // Autoset http://.
            if (ngModel.$modelValue.value.substring(0, 7) !== 'http://') {
              viewValue.value = 'http://' + viewValue.value;
              ngModel.$setViewValue(viewValue);
            }

            if (!URL_REGEXP.test(viewValue.value)) {
              scope.infoErrorMessage = 'Gelieve een geldige url in te vullen';
              ngModel.$setValidity('contactinfo', false);
            }
          }
        }

        /**
         * Clear the entered info when switching type.
         */
        function clearInfo() {
          ngModel.$modelValue.value = '';
          scope.infoErrorMessage = '';
          ngModel.$setValidity('contactinfo', true);
        }

      },

    };

  }

})();
