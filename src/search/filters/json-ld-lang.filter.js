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
    var translatedJsonLDObject = _.cloneDeep(jsonLDObject);
    translatedJsonLDObject = translateProperties(translatedJsonLDObject, preferredLanguage, shouldFallback);
    return translatedJsonLDObject;
  };
}

function translateProperties(jsonLDProperty, preferredLanguage, shouldFallback) {
  var languages = ['nl', 'en', 'fr', 'de'];
  jsonLDProperty = _.each(jsonLDProperty, function(val, key) {
    if (_.isObject(val)) {
      if (val.nl || val.en || val.fr || val.de) {
        if (val[preferredLanguage]) {
          jsonLDProperty[key] = val[preferredLanguage];
        } else {
          if (shouldFallback) {
            var langIndex = 0, translatedProperty;
            while (!translatedProperty && langIndex < languages.length) {
              var fallbackLanguage = languages[langIndex];
              translatedProperty = val[fallbackLanguage];
              jsonLDProperty[key] = translatedProperty;
              ++langIndex;
            }
          }
        }
      } else {
        val = translateProperties(val, preferredLanguage, shouldFallback);
      }
    }
  });
  return jsonLDProperty;
}
