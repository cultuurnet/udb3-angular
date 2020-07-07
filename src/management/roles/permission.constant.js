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
      'AANBOD_BEWERKEN': 'AANBOD_BEWERKEN',
      'AANBOD_MODEREREN': 'AANBOD_MODEREREN',
      'AANBOD_VERWIJDEREN': 'AANBOD_VERWIJDEREN',
      'ORGANISATIES_BEWERKEN': 'ORGANISATIES_BEWERKEN',
      'ORGANISATIES_BEHEREN': 'ORGANISATIES_BEHEREN',
      'GEBRUIKERS_BEHEREN': 'GEBRUIKERS_BEHEREN',
      'LABELS_BEHEREN': 'LABELS_BEHEREN',
      'VOORZIENINGEN_BEWERKEN': 'VOORZIENINGEN_BEWERKEN',
      'PRODUCTIES_AANMAKEN': 'PRODUCTIES_AANMAKEN'
    }
  );
