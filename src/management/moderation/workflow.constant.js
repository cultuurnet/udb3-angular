'use strict';

/* jshint sub: true */

/**
 * @ngdoc service
 * @name udb.management.moderation.OfferWorkflowStatus
 * @description
 * # OfferWorkflowStatus
 * All the possible workflow states defined as a constant
 */
angular
  .module('udb.management.moderation')
  .constant('OfferWorkflowStatus',
    /**
     * Enum for workflowStatus
     * @readonly
     * @name OfferWorkflowStatus
     * @enum {string}
     */
    {
      'DRAFT': 'DRAFT',
      'READY_FOR_VALIDATION': 'READY_FOR_VALIDATION',
      'APPROVED': 'APPROVED',
      'REJECTED': 'REJECTED',
      'DELETED': 'DELETED'
    }
  );
