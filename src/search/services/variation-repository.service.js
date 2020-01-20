'use strict';

/**
 * @ngdoc service
 * @name udb.search.variationRepository
 * @description
 * # variationRepository
 * Service in the udb.search.
 */
angular
  .module('udb.search')
  .service('variationRepository', VariationRepository);

/* @ngInject */
function VariationRepository(udbApi, $cacheFactory, $q, UdbEvent, $rootScope, UdbPlace) {

  var requestChain = $q.when();
  var interruptRequestChain = false;
  var personalVariationCache = $cacheFactory('personalVariationCache');

  this.getPersonalVariation = function (offer) {
    var deferredVariation =  $q.defer(),
        personalVariation = personalVariationCache.get(offer['@id']);

    if (personalVariation) {
      if (personalVariation === 'no-personal-variation') {
        deferredVariation.reject('there is no personal variation for offer with url: ' + offer['@id']);
      } else {
        deferredVariation.resolve(personalVariation);
      }
    } else {
      var userPromise = udbApi.getMe();

      userPromise
        .then(function(user) {
          requestChain = requestChain.then(
            requestVariation(user.uuid, 'personal', offer['@id'], deferredVariation)
          );
        });
    }

    return deferredVariation.promise;
  };

  function requestVariation(userId, purpose, offerUrl, deferredVariation) {
    return function () {
      var offerLocation = offerUrl.toString();

      if (interruptRequestChain) {
        deferredVariation.reject('interrupting request for offer variation located at: ' + offerLocation);
        return deferredVariation;
      }

      var personalVariationRequest = udbApi.getOfferVariations(userId, purpose, offerUrl, deferredVariation);

      personalVariationRequest.success(function (variations) {
        var jsonPersonalVariation = _.first(variations.member);
        if (jsonPersonalVariation) {
          var variation;
          if (jsonPersonalVariation['@context'] === '/api/1.0/event.jsonld') {
            variation = new UdbEvent(jsonPersonalVariation);
          } else if (jsonPersonalVariation['@context'] === '/api/1.0/place.jsonld') {
            variation = new UdbPlace(jsonPersonalVariation);
          }
          personalVariationCache.put(offerLocation, variation);
          deferredVariation.resolve(variation);
        } else {
          personalVariationCache.put(offerLocation, 'no-personal-variation');
          deferredVariation.reject('there is no personal variation for the offer located at: ' + offerLocation);
        }
      });

      personalVariationRequest.error(function () {
        deferredVariation.reject('no variations found for offer located at: ' + offerLocation);
      });

      return personalVariationRequest.then();
    };
  }

  /**
   * @param {string} offerLocation
   * @param {(UdbPlace|UdbEvent)} variation
   */
  this.save = function (offerLocation, variation) {
    personalVariationCache.put(offerLocation, variation);
  };

  /**
   * @param {string} offerLocation
   */
  this.remove = function (offerLocation) {
    personalVariationCache.remove(offerLocation);
  };

  $rootScope.$on('$locationChangeStart', function() {
    interruptRequestChain = true;
    requestChain = requestChain.finally(function () {
      interruptRequestChain = false;
    });
  });
}
