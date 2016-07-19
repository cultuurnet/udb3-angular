'use strict';

angular
  .module('udb.management.roles')
  .directive('udbUniqueRole', UniqueRoleDirective);

/** @ngInject */
function UniqueRoleDirective(RoleManager, $q) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, controller) {
      function isUnique(roleName) {
        if (controller.$isEmpty(roleName)) {
          return $q.when();
        }

        var deferredUniqueCheck = $q.defer();

        RoleManager
          .get(roleName)
          .then(deferredUniqueCheck.reject, deferredUniqueCheck.resolve);

        return deferredUniqueCheck.promise;
      }

      controller.$asyncValidators.uniqueRole = isUnique;
    }
  };
}
