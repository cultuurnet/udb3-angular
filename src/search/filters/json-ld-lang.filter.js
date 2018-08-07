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

function isALanguageKey(key) {
  return key.length === 2;
}

function translateProperties(jsonLDProperty, preferredLanguage, shouldFallback) {
  jsonLDProperty = _.each(jsonLDProperty, function(val, key) {
    if (_.isObject(val)) {
      var allKeys = Object.keys(val);
      if (allKeys.length > 0 && allKeys.every(isALanguageKey)) {
        if (val[preferredLanguage]) {
          jsonLDProperty[key] = val[preferredLanguage];
        } else {
          if (shouldFallback) {
            var fallbackLanguage = allKeys[0];
            var translatedProperty = val[fallbackLanguage];
            jsonLDProperty[key] = translatedProperty;
          }
        }
      } else {
        val = translateProperties(val, preferredLanguage, shouldFallback);
      }
    }
  });
  return jsonLDProperty;
}
