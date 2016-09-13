'use strict';

/**
 * @typedef {Object} ManagementListItem
 * @property {string} name
 * @property {RolePermission} permission
 * @property {number} notificationCount
 * @property {number} index
 * @property {string} sref
 * @property {string} icon
 */

/**
 * @ngdoc service
 * @name udb.management.listItemDefaults
 * @description
 * # Management list item defaults
 * These are the defaut values for the list items you can show in the app side bar.
 */
angular
  .module('udb.management')
  .factory('managementListItemDefaults', listItemDefaults);

/**
 * @ngInject
 * @return {ManagementListItem[]}
 */
function listItemDefaults(RolePermission) {
  return [
    {
      name: 'valideren',
      permission: RolePermission.AANBOD_MODEREREN,
      notificationCount: 0,
      index: 1,
      sref: 'management.moderation.list',
      icon: 'fa-flag'
    },
    {
      name: 'Gebruikers',
      permission: RolePermission.GEBRUIKERS_BEHEREN,
      notificationCount: 0,
      index: 2,
      sref: 'management.users.list',
      icon: 'fa-user'
    },
    {
      name: 'Rollen',
      permission: RolePermission.GEBRUIKERS_BEHEREN,
      notificationCount: 0,
      index: 3,
      sref: 'split.manageRoles.list',
      icon: 'fa-users'
    },
    {
      name: 'Labels',
      permission: RolePermission.LABELS_BEHEREN,
      notificationCount: 0,
      index: 4,
      sref: 'split.manageLabels.list',
      icon: 'fa-tag'
    },
    {
      name: 'Organisaties',
      permission: RolePermission.ORGANISATIES_BEHEREN,
      notificationCount: 0,
      index: 5,
      sref: 'split.manageOrganisations',
      icon: 'fa-slideshare'
    }
  ];
}
