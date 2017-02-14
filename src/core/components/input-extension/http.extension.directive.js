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

function UdbHttpExtensionDirective($parse) {

  return {
    restrict: 'A',
    require: 'ngModel',
    link: link
  };

  function link (scope, elem, attrs) {

    var model = $parse(attrs.ngModel);
    var modelSetter = model.assign;

    elem.on('blur', attachHttp());

    function attachHttp() {
      if (!elem.val().includes(attrs.udbHttpExtension) || !elem.val().includes(attrs.udbHttpsExtension)) {
        var val = attrs.udbHttpExtension + elem.val();
        modelSetter(scope, val);
      }
    }
  }
}
