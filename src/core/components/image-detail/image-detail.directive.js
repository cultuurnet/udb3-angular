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
function ImageDetailController($scope, $translate) {
  $scope.language = $translate.use() || 'nl';

  angular.forEach($scope.images, function(image) {
    if (image.contentUrl === $scope.main) {
      image.main = true;
      var reindexedMedia = _.without($scope.images, image);
      reindexedMedia.unshift(image);
      $scope.images = reindexedMedia;
    }
  });

  $scope.translateImageDetail = function (label, translationData) {
    translationData = (translationData !== undefined) ? translationData : {};
    return $translate.instant('imageDetail.' + label, translationData);
  };
}
