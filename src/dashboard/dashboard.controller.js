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
      moment,
      $state,
      $translate
  ) {

    var dash = this;
    var language = $translate.use();
    dash.pagedItemViewer = new SearchResultViewer(50, 1);
    dash.pagedItemViewerOrganizers = new SearchResultViewer(50, 1);
    dash.openDeleteConfirmModal = openDeleteConfirmModal;
    dash.updateItemViewer = updateItemViewer;
    dash.openCreateOrganizerModal = openCreateOrganizerModal;
    dash.updateOrganizerViewer = updateOrganizerViewer;
    dash.username = '';
    dash.hideOnlineDate = false;

    if (typeof(appConfig.addOffer) !== 'undefined') {
      if (typeof(appConfig.addOffer.toggle) !== 'undefined') {
        dash.toggleAddOffer = appConfig.addOffer.toggle;

        if (appConfig.addOffer.toggle) {
          if (typeof(appConfig.addOffer.expirationDate) !== 'undefined' ||
              appConfig.addOffer.expirationDate !== '') {
            if (moment().isAfter(moment(appConfig.addOffer.expirationDate))) {
              dash.toggleAddOffer = false;
            }
            else {
              dash.toggleAddOffer = true;
            }
          }
        }
      }
      else {
        dash.toggleAddOffer = true;
      }

      if (typeof(appConfig.addOffer.expirationMessage) !== 'undefined' ||
          appConfig.addOffer.expirationMessage !== '') {
        dash.addOfferExpirationMessage = appConfig.addOffer.expirationMessage;
      }
      else {
        dash.addOfferExpirationMessage = '';
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

    if (typeof(appConfig.publicationRulesLink) !== 'undefined') {
      var publicationRulesLink = appConfig.publicationRulesLink;
      if (publicationRulesLink !== '') {
        dash.publicationRulesLink = publicationRulesLink;
      }
    }

    if (typeof(appConfig.enableMyOrganizers) !== 'undefined') {
      var enableMyOrganizers = appConfig.enableMyOrganizers;
      if (enableMyOrganizers !== '') {
        dash.enableMyOrganizers = enableMyOrganizers;
      }
    }

    udbApi
      .getMe()
      .then(greetUser);

    function greetUser(user) {
      dash.username = user.username;
    }

    function reformatJsonLDData(results) {
      if (results.member) {
        results.member = results.member.map(function(member) {
          var memberContext = (member['@context']) ? member['@context'].split('/').pop() : '';
          memberContext = memberContext.charAt(0).toUpperCase() + memberContext.slice(1);
          member['@type'] = (member['@type']) ? member['@type'] : memberContext;
          return member;
        });
      }
      return results;
    }

    /**
     * @param {PagedCollection} results
     */
    function setItemViewerResults(results) {
      results = reformatJsonLDData(results);
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

    /**
     * @param {PagedCollection} results
     */
    function setOrganizerViewerResults(results) {
      results = reformatJsonLDData(results);
      offerLocator.addPagedCollection(results);
      dash.pagedItemViewerOrganizers.setResults(results);
      $document.scrollTop(0);
    }

    function updateOrganizerViewer() {
      udbApi
          .getDashboardOrganizers(dash.pagedItemViewer.currentPage)
          .then(setOrganizerViewerResults);
    }
    updateOrganizerViewer();

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
      modalInstance.result.then(function () {
        item.showDeleted = true;
      });
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

        modalInstance.result.then(function () {
          place.showDeleted = true;
        });
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
     * Open the confirmation modal to delete an event/place.
     *
     * @param {Object} item
     */
    function openDeleteConfirmModal(item) {
      var itemType = item['@id'].indexOf('place') === -1 ? 'event' : 'place';

      // Fix for III-2625. Escaping single quotes won't work here.
      item.name = item.name.replace(/'/g, '');

      if (itemType === 'event') {
        openEventDeleteConfirmModal(item);
      }
      else {
        openPlaceDeleteConfirmModal(item);
      }
    }

    function openCreateOrganizerModal() {
      var modalInstance = $uibModal.open({
        templateUrl: 'templates/event-form-organizer-modal.html',
        controller: 'EventFormOrganizerModalController',
        resolve: {
          organizerName: function () {
            return '';
          }
        }
      });

      modalInstance.result.then(function(organization) {
        $state.go('management.organizers.detail', {id: organization.id});
      });
    }
  }

})();
