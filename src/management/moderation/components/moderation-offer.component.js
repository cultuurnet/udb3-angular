'use strict';

/**
 * @ngdoc component
 * @name udb.search.directive:udbSearchBar
 * @description
 * # udbQuerySearchBar
 */
angular
  .module('udb.management.moderation')
  .component('udbModerationOffer', {
    templateUrl: 'templates/moderation-offer.html',
    controller: ModerationOfferComponent,
    controllerAs: 'moc',
    bindings: {
      offerId: '@',
      offerType: '@'
    }
  });

/* @ngInject */
function ModerationOfferComponent(ModerationManager, jsonLDLangFilter, OfferWorkflowStatus) {
  var moc = this;
  var defaultLanguage = 'nl';

  moc.loading = true;
  moc.offer = {};

  moc.isReadyForValidation = isReadyForValidation;
  moc.isApproved = isApproved;
  moc.isRejected = isRejected;

  // fetch offer
  ModerationManager
    .getModerationOffer(moc.offerId)
    .then(function(offer) {
      offer.updateTranslationState();
      moc.offer = jsonLDLangFilter(offer, defaultLanguage);
    })
    .catch(showError)
    .finally(function() {
      moc.loading = false;
    });

  function showError(problem) {
    moc.error = problem || 'Dit aanbod kon niet geladen worden.';
  }

  function isReadyForValidation() {
    return moc.offer.workflowStatus === OfferWorkflowStatus.READY_FOR_VALIDATION;
  }

  function isApproved() {
    return moc.offer.workflowStatus === OfferWorkflowStatus.APPROVED;
  }

  function isRejected() {
    return moc.offer.workflowStatus === OfferWorkflowStatus.REJECTED;
  }
}
