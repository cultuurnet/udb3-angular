'use strict';

/**
 * @ngdoc component
 * @name udb.management.moderation:udbModerationSummaryComponent
 * @description
 * # udbModerationSummary
 */
angular
  .module('udb.management.moderation')
  .component('udbModerationSummary', {
    templateUrl: 'templates/moderation-summary.html',
    controller: ModerationSummaryComponent,
    controllerAs: 'moc',
    bindings: {
      offerId: '@',
      offerType: '@'
    }
  });

/* @ngInject */
function ModerationSummaryComponent(ModerationService, jsonLDLangFilter, OfferWorkflowStatus) {
  var moc = this;
  var defaultLanguage = 'nl';

  moc.loading = true;
  moc.offer = {};
  moc.sendingJob = false;
  moc.error = false;

  moc.isReadyForValidation = isReadyForValidation;

  // fetch offer
  ModerationService
    .getModerationOffer(moc.offerId)
    .then(function(offer) {
      offer.updateTranslationState();
      moc.offer = jsonLDLangFilter(offer, defaultLanguage);
      if(moc.offer.image) {
        moc.offer.image = moc.offer.image + '?maxwidth=150&maxheight=150';
      }
    })
    .catch(showLoadingError)
    .finally(function() {
      moc.loading = false;
    });

  function showLoadingError(problem) {
    showProblem(problem || {title:'Dit aanbod kon niet geladen worden.'});
  }

  function isReadyForValidation() {
    return moc.offer.workflowStatus === OfferWorkflowStatus.READY_FOR_VALIDATION;
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    moc.error = problem.title + (problem.detail ? ' ' + problem.detail : '');
  }
}
