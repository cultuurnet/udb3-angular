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
function ModerationOfferComponent(ModerationManager, jsonLDLangFilter, OfferWorkflowStatus, $uibModal) {
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
  ModerationManager
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
    ModerationManager
      .approveOffer(moc.offer)
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

    modalInstance.result.then(function(reason) {
      if (reason === 'DUPLICATE') {
        duplicate();
      } else if (reason === 'INAPPROPRIATE') {
        inappropriate();
      } else {
        reject(reason);
      }
    })
  }

  /**
   * an offer can be rejected without a reason added.
   */
  function reject(reason) {
    moc.sendingJob = true;
    moc.error = false;
    ModerationManager
      .rejectOffer(moc.offer, reason)
      .then(function() {
        moc.offer.workflowStatus = OfferWorkflowStatus.REJECTED;
      })
      .catch(showProblem)
      .finally(function() {
        moc.sendingJob = false;
      });
  }

  function duplicate() {
    moc.sendingJob = true;
    moc.error = false;
    ModerationManager
      .duplicateOffer(moc.offer)
      .then(function() {
        moc.offer.workflowStatus = OfferWorkflowStatus.REJECTED;
      })
      .catch(showProblem)
      .finally(function() {
        moc.sendingJob = false;
      });
  }

  function inappropriate() {
    moc.sendingJob = true;
    moc.error = false;
    ModerationManager
      .inappropriateOffer(moc.offer)
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
