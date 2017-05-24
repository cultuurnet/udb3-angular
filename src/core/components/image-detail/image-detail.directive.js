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
        images: '<udbImageDetail',
        main : '<image'
      }
    };
  });

/* @ngInject */
function ImageDetailController($scope) {
  angular.forEach($scope.images, function(image) {
    image.main = (image.contentUrl === $scope.main);
  });
}
