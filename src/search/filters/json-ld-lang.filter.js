'use strict';

/**
 * @ngdoc filter
 * @name udb.search.filter:jsonLDLang
 * @function
 * @description
 * # jsonLDLang
 * Filter JsonLD objects by language.
 */
angular.module('udb.search')
  .filter('jsonLDLang', JsonLDLangFilter);

/* @ngInject */
function JsonLDLangFilter() {
  return function (jsonLDObject, preferredLanguage, shouldFallback) {
    var translatedObject = _.cloneDeep(jsonLDObject),
        containedProperties = ['name', 'description'],
        languages = ['nl', 'en', 'fr', 'de'],
        // set a default language if none is specified
        language = preferredLanguage || 'nl',
        shouldFallbackToDefault = shouldFallback || true;

    _.each(containedProperties, function (property) {
      // make sure the property is set on the object
      if (translatedObject[property]) {
        var translatedProperty = translatedObject[property][language],
            langIndex = 0;

        // if there is no translation available for the provided language or default language
        // check for a default language
        if (shouldFallbackToDefault) {
          while (!translatedProperty && langIndex < languages.length) {
            var fallbackLanguage = languages[langIndex];
            translatedProperty = translatedObject[property][fallbackLanguage];
            ++langIndex;
          }
        }

        translatedObject[property] = translatedProperty;
      }
    });

    return translatedObject;
  };
}
