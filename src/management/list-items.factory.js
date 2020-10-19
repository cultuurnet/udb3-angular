'use strict';

/**
 * @ngdoc service
 * @name udb.management.listItems
 * @description
 * # Management list items
 * Return the management list items to show in the sidebar as  a promise.
 */
angular
  .module('udb.management')
  .factory('managementListItems', listItems);

/**
 * @ngInject
 * @return {Promise.<ManagementListItem[]>}
 */
function listItems(
  RolePermission,
  authorizationService,
  ModerationService,
  $q,
  managementListItemDefaults,
  appConfig
) {
  var globalPermissionListItems = authorizationService
    .getPermissions()
    .then(generateListItems);

  var moderationListItems = ModerationService
    .getMyRoles()
    .then(generateModerationListItems);

  return $q
    .all([globalPermissionListItems, moderationListItems])
    .then(_.flatten);

  /**
   * @param {Role[]} roles
   * @return {number}
   */
  function countOffersWaitingForValidation(roles) {
    var query = '';

    _.forEach(roles, function(role) {
      if (role.constraints !== undefined && role.constraints.v3) {
        query += (query ? ' OR ' : '') + role.constraints.v3;
      }
    });
    query = (query ? '(' + query + ')' : '');
    return ModerationService
      .find(query, 10, 0)
      .then(function(searchResult) {
        return searchResult.totalItems;
      });
  }

  /**
   *
   * @param {number} waitingOfferCount
   * @return {ManagementListItem}
   */
  function generateModerationListItem(waitingOfferCount) {
    var defaultModerationListItem = _.find(
      managementListItemDefaults,
      {permission: RolePermission.AANBOD_MODEREREN}
    );

    var moderationListItem = angular.copy(defaultModerationListItem);
    //
    moderationListItem.notificationCount = waitingOfferCount;

    return moderationListItem;
  }

  /**
   * @param {Role[]} userRoles
   * @return {Promise.<ManagementListItem[]>}
   */
  function generateModerationListItems(userRoles) {
    var deferredListItems = $q.defer();

    var moderationRoles = _.filter(userRoles, function(role) {
      return _.includes(role.permissions, RolePermission.AANBOD_MODEREREN);
    });

    if (moderationRoles.length > 0) {
      countOffersWaitingForValidation(moderationRoles)
        .then(generateModerationListItem)
        .then(function(moderationListItem) {
          deferredListItems.resolve([moderationListItem]);
        });
    } else {
      deferredListItems.resolve([]);
    }

    return deferredListItems.promise;
  }

  /**
   * @param {RolePermission[]} userPermissions
   * @return {Promise.<ManagementListItem[]>}
   */
  function generateListItems(userPermissions) {
    var globalUserPermissions = _.without(userPermissions, RolePermission.AANBOD_MODEREREN);

    var listItems = _.filter(managementListItemDefaults, function (listItem) {
      return _.includes(globalUserPermissions, listItem.permission);
    });

    return $q.resolve(listItems);
  }
}
