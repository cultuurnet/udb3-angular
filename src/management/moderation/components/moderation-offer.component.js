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
function ModerationOfferComponent(ModerationService, jsonLDLangFilter, OfferWorkflowStatus, $uibModal) {
  var moc = this;
  var defaultLanguage = 'nl';

  moc.loading = true;
  moc.offer = {};
  moc.sendingJob = false;
  moc.error = false;

  moc.isReadyForValidation = isReadyForValidation;
  moc.isApproved = isApproved;
  moc.isRejected = isRejected;
  moc.approve = approve;
  moc.askForRejectionReasons = askForRejectionReasons;

  // fetch offer
  ModerationService
    .getModerationOffer(moc.offerId)
    .then(function(offer) {
      offer.updateTranslationState();
      moc.offer = jsonLDLangFilter(offer, defaultLanguage);
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

  function isApproved() {
    return moc.offer.workflowStatus === OfferWorkflowStatus.APPROVED;
  }

  function isRejected() {
    return moc.offer.workflowStatus === OfferWorkflowStatus.REJECTED;
  }

  function approve() {
    moc.sendingJob = true;
    moc.error = false;
    ModerationService
      .approve(moc.offer)
      .then(function() {
        moc.offer.workflowStatus = OfferWorkflowStatus.APPROVED;
      })
      .catch(showProblem)
      .finally(function() {
        moc.sendingJob = false;
      });
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
    moc.sendingJob = true;
    moc.error = false;
    ModerationService
      .reject(moc.offer, reason)
      .then(function() {
        moc.offer.workflowStatus = OfferWorkflowStatus.REJECTED;
      })
      .catch(showProblem)
      .finally(function() {
        moc.sendingJob = false;
      });
  }

  function flagAsDuplicate() {
    moc.sendingJob = true;
    moc.error = false;
    ModerationService
      .flagAsDuplicate(moc.offer)
      .then(function() {
        moc.offer.workflowStatus = OfferWorkflowStatus.REJECTED;
      })
      .catch(showProblem)
      .finally(function() {
        moc.sendingJob = false;
      });
  }

  function flagAsInappropriate() {
    moc.sendingJob = true;
    moc.error = false;
    ModerationService
      .flagAsInappropriate(moc.offer)
      .then(function() {
        moc.offer.workflowStatus = OfferWorkflowStatus.REJECTED;
      })
      .catch(showProblem)
      .finally(function() {
        moc.sendingJob = false;
      });
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    moc.error = problem.title + (problem.detail ? ' ' + problem.detail : '');
  }
}
