'use strict';

/**
 * @ngdoc component
 * @name udb.management.moderation.directive:udbModerationOffer
 * @description
 * # udbModerationOffer
 */
angular
  .module('udb.management.moderation')
  .component('udbModerationOffer', {
    templateUrl: 'templates/moderation-offer.html',
    controller: ModerationOfferComponent,
    controllerAs: 'moc',
    bindings: {
      continue: '@',
      offerId: '@',
      offerType: '@'
    }
  });

/* @ngInject */
function ModerationOfferComponent(ModerationService, jsonLDLangFilter, OfferWorkflowStatus, $uibModal) {
  var moc = this;
  var defaultLanguage = 'nl';

  moc.loading = true;
  moc.offer = {};
  moc.error = false;

  moc.isReadyForValidation = isReadyForValidation;
  moc.isApproved = isApproved;
  moc.isRejected = isRejected;
  moc.approve = approve;
  moc.askForRejectionReasons = askForRejectionReasons;
  moc.continueValidation = continueValidation;

  // fetch offer
  ModerationService
    .getModerationOffer(moc.offerId)
    .then(function (offer) {
      offer.updateTranslationState();
      moc.offer = jsonLDLangFilter(offer, defaultLanguage);
    })
    .catch(showLoadingError)
    .finally(function () {
      moc.loading = false;
    });

  function showLoadingError(problem) {
    showProblem(problem || {title: 'Dit aanbod kon niet geladen worden.'});
  }

  function continueValidation() {
    return moc.continue === 'true';
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

  function approve() {
    moc.error = false;
    ModerationService
      .approve(moc.offer)
      .then(function () {
        setWorkflowStatus(OfferWorkflowStatus.APPROVED);
      })
      .catch(showProblem);
  }

  function askForRejectionReasons() {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/reject-offer-confirm-modal.html',
      controller: 'RejectOfferConfirmModalCtrl'
    });

    modalInstance.result.then(reject);
  }

  /**
   * @param {string} reason
   *  DUPLICATE
   *  INAPPROPRIATE
   *  or a custom reason
   */
  function reject(reason) {
    if (reason === 'DUPLICATE') {
      flagAsDuplicate();
    } else if (reason === 'INAPPROPRIATE') {
      flagAsInappropriate();
    } else {
      rejectWithReason(reason);
    }
  }

  /**
   * an offer can be rejected without a reason added.
   */
  function rejectWithReason(reason) {
    moc.error = false;
    ModerationService
      .reject(moc.offer, reason)
      .then(function () {
        setWorkflowStatus(OfferWorkflowStatus.REJECTED);
      })
      .catch(showProblem);
  }

  function flagAsDuplicate() {
    moc.error = false;
    ModerationService
      .flagAsDuplicate(moc.offer)
      .then(function () {
        setWorkflowStatus(OfferWorkflowStatus.REJECTED);
      })
      .catch(showProblem);
  }

  function flagAsInappropriate() {
    moc.error = false;
    ModerationService
      .flagAsInappropriate(moc.offer)
      .then(function () {
        setWorkflowStatus(OfferWorkflowStatus.REJECTED);
      })
      .catch(showProblem);
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    moc.error = problem.title + (problem.detail ? ' ' + problem.detail : '');
  }

  function setWorkflowStatus(workflowStatus) {
    moc.offer.workflowStatus = workflowStatus;
    window.parent.postMessage({source: 'UDB', type: 'OFFER_MODERATED', status: workflowStatus}, '*');
  }
}
