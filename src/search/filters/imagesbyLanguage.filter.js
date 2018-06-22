'use strict';

/**
 * @ngdoc filter
 * @name udb.search.filter:imagesByLanguage
 * @function
 * @description
 * # jsonLDLang
 * Filter JsonLD objects by language.
 */
angular.module('udb.search')
  .filter('imagesByLanguage', imagesByLanguageFilter);

/* @ngInject */
function imagesByLanguageFilter() {
  return function (mediaObjects, preferredLanguage) {
    console.log(mediaObjects);
    var filtered = _.filter(mediaObjects, function(mediaObject) {
      return mediaObject['@type'] === 'schema:ImageObject' &&
        (mediaObject.inLanguage === preferredLanguage || angular.isUndefined(mediaObject.inLanguage));
    });
    return filtered;
  };
}
