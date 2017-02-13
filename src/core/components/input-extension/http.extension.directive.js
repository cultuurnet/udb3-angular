'use strict';

/**
* @ngdoc directive
* @name udb.http.extension.directive:udbHttpExtension
* @description
* # directive to add http if it isn't already in the link
*/
angular
  .module('udb.core')
  .directive('udbHttpExtension', UdbHttpExtensionDirective);

function UdbHttpExtensionDirective() {

  return {
    restrict: 'A',
    require: 'ngModel',
    link: link
  };

  function link (scope, elem, attrs, ngModel) {
    var modelSetter = model.assign;

    elem.bind('change',attachHttp())

    function attachHttp() {
      if(!elem.includes(attrs.udbHttpExtension) || !elem.includes(attrs.udbHttpsExtension)) {
          modelSetter(scope,attrs.udbHttpExtension + elem.val());
      }
    }
  }
}
