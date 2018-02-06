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
  function DashboardController(
      $document,
      $uibModal,
      udbApi,
      eventCrud,
      offerLocator,
      SearchResultViewer,
      appConfig,
      moment
  ) {

    var dash = this;

    dash.pagedItemViewer = new SearchResultViewer(50, 1);
    dash.openDeleteConfirmModal = openDeleteConfirmModal;
    dash.updateItemViewer = updateItemViewer;
    dash.username = '';
    dash.hideOnlineDate = false;

    if (typeof(appConfig.addOffer) !== 'undefined') {
      if (typeof(appConfig.addOffer.toggleAddOffer) !== 'undefined') {
        dash.toggleAddOffer = appConfig.addOffer.toggleAddOffer;

        if (typeof(appConfig.addOffer.embargoDate) !== 'undefined' ||
            appConfig.addOffer.embargoDate !== '') {
          if (moment() > moment(appConfig.addOffer.embargoDate)) {
            dash.toggleAddOffer = false;
          }
          else {
            dash.toggleAddOffer = true;
          }
        }
      }
      else {
        dash.toggleAddOffer = true;
      }

      if (typeof(appConfig.addOffer.replaceMessage) !== 'undefined' ||
          appConfig.addOffer.replaceMessage !== '') {
        dash.addOfferReplaceMessage = appConfig.addOffer.replaceMessage;
      }
      else {
        dash.addOfferReplaceMessage = '';
      }
    }
    else {
      dash.toggleAddOffer = true;
    }

    if (typeof(appConfig.offerEditor.defaultPublicationDate) !== 'undefined') {
      var defaultPublicationDate = appConfig.offerEditor.defaultPublicationDate;
      if (defaultPublicationDate !== '') {
        dash.hideOnlineDate = true;
      }
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
      $document.scrollTop(0);
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
