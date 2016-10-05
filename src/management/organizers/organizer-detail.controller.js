'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:OrganizerEditorController
 * @description
 * # OrganizerEditorController
 */
angular
  .module('udb.management.organizers')
  .controller('OrganizerDetailController', OrganizerDetailController);

/* @ngInject */
function OrganizerDetailController(OrganizerManager, $stateParams, $q) {
  var editor = this;
  var organizerId = $stateParams.id;

  loadOrganizer(organizerId);

  function loadOrganizer(organizerId) {
    OrganizerManager
      .get(organizerId)
      .then(showOrganizer);
  }

  /**
   * @param {Organizer} organizer
   */
  function showOrganizer(organizer) {
    editor.organizer = organizer;
  }

}
