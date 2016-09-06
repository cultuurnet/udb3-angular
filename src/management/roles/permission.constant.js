'use strict';

/* jshint sub: true */

/**
 * @ngdoc service
 * @name udb.management.roles.Permission
 * @description
 * # Permission
 * All the possible job states defined as a constant
 */
angular
  .module('udb.management.roles')
  .constant('RolePermission',
    /**
     * Enum for permissions
     * @readonly
     * @name RolePermission
     * @enum {string}
     */
    {
      // removed 'AANBOD_INVOEREN' see III-1315
      'AANBOD_BEWERKEN': 'AANBOD_BEWERKEN',
      'AANBOD_MODEREREN': 'AANBOD_MODEREREN',
      'AANBOD_VERWIJDEREN': 'AANBOD_VERWIJDEREN',
      'ORGANISATIES_BEHEREN': 'ORGANISATIES_BEHEREN',
      'GEBRUIKERS_BEHEREN': 'GEBRUIKERS_BEHEREN',
      'LABELS_BEHEREN': 'LABELS_BEHEREN'
    }
  );
