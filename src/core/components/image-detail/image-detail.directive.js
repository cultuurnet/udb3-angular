'use strict';

/**
 * @ngdoc component
 * @name udb.image-detail.directive:Image-detail
 * @description
 * # Image-detail
 */
angular
  .module('udb.core')
  .directive('udbImageDetail', function () {
    return {
      templateUrl: 'templates/image-detail.directive.html',
      controller: ImageDetailController,
      restrict: 'A',
      scope: {
        images: '<udbImageDetail'
      }
    };
  });

/* @ngInject */
function ImageDetailController($scope) {

}
