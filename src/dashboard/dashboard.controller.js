(function () {
  'use strict';

  /**
   * @ngdoc function
   * @name udbApp.controller:DashboardCtrl
   * @description
   * # DashboardCtrl
   * dashboard
   */
  angular
    .module('udb.dashboard')
    .controller('DashboardController', DashboardController);

  /* @ngInject */
  function DashboardController($scope, $uibModal, udbApi, eventCrud, offerLocator, SearchResultViewer, appConfig) {

    var dash = this;

    dash.pagedItemViewer = new SearchResultViewer(50, 1);
    dash.openDeleteConfirmModal = openDeleteConfirmModal;
    dash.updateItemViewer = updateItemViewer;
    dash.username = '';

    if (typeof(appConfig.toggleAddOffer) !== 'undefined') {
      dash.toggleAddOffer = appConfig.toggleAddOffer;
    }
    else {
      dash.toggleAddOffer = true;
    }

    udbApi
      .getMe()
      .then(greetUser);

    function greetUser(user) {
      dash.username = user.nick;
    }

    /**
     * @param {PagedCollection} results
     */
    function setItemViewerResults(results) {
      offerLocator.addPagedCollection(results);
      dash.pagedItemViewer.setResults(results);
    }

    function updateItemViewer() {
      udbApi
        .getDashboardItems(dash.pagedItemViewer.currentPage)
        .then(setItemViewerResults);
    }
    updateItemViewer();

    function openEventDeleteConfirmModal(item) {
      var modalInstance = $uibModal.open({
        templateUrl: 'templates/event-delete-confirm-modal.html',
        controller: 'EventDeleteConfirmModalCtrl',
        resolve: {
          item: function () {
            return item;
          }
        }
      });
      modalInstance.result.then(updateItemViewerOnJobFeedback);
    }

    function openPlaceDeleteConfirmModal(place) {

      function displayModal(place, events) {
        var modalInstance = $uibModal.open({
          templateUrl: 'templates/place-delete-confirm-modal.html',
          controller: 'PlaceDeleteConfirmModalCtrl',
          resolve: {
            place: function () {
              return place;
            },
            events: function () {
              return events;
            }
          }
        });

        modalInstance.result.then(updateItemViewerOnJobFeedback);
      }

      function showModalWithEvents(events) {
        displayModal(place, events);
      }

      // Check if this place has planned events.
      eventCrud
        .findEventsAtPlace(place.apiUrl)
        .then(showModalWithEvents);
    }

    /**
     * @param {EventCrudJob} job
     */
    function updateItemViewerOnJobFeedback(job) {
      function unlockItem() {
        job.item.showDeleted = false;
      }

      job.task.promise.then(updateItemViewer, unlockItem);
    }

    /**
     * Open the confirmation modal to delete an event/place.
     *
     * @param {Object} item
     */
    function openDeleteConfirmModal(item) {
      var itemType = item['@id'].indexOf('event') === -1 ? 'place' : 'event';

      if (itemType === 'event') {
        openEventDeleteConfirmModal(item);
      }
      else {
        openPlaceDeleteConfirmModal(item);
      }
    }

  }

})();
