'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormStep4Controller
 * @description
 * # EventFormStep4Controller
 * Step 4 of the event form
 */
angular
  .module('udb.event-form')
  .controller('EventFormStep4Controller', EventFormStep4Controller);

/* @ngInject */
function EventFormStep4Controller(
  $scope,
  EventFormData,
  udbApi,
  appConfig,
  SearchResultViewer,
  eventCrud,
  $rootScope,
  $uibModal
) {

  var controller = this;
  var ignoreDuplicates = _.get(appConfig, 'offerEditor.ignoreDuplicates', false);

  // Scope vars.
  // main storage for event form.
  $scope.eventFormData = EventFormData;

  $scope.titleInputOptions = EventFormData.id === '' ?
    {updateOn: 'default'} :
    {updateOn: 'change blur'};

  $scope.infoMissing = false;
  $scope.duplicatesSearched = false;
  $scope.saving = false;
  $scope.error = false;

  $scope.validateEvent = validateEvent;
  $scope.saveEvent = createOffer;
  $scope.resultViewer = new SearchResultViewer();
  $scope.eventTitleChanged = eventTitleChanged;
  $scope.previewSuggestedItem = previewSuggestedItem;

  // Check if we need to show the leave warning
  window.onbeforeunload = function (event) {
    if (EventFormData.majorInfoChanged) {
      return 'Bent u zeker dat je de pagina wil verlaten? Gegevens die u hebt ingevoerd worden niet opgeslagen.';
    }
  };

  /**
   * Validate date after step 4 to enter step 5.
   */
  function validateEvent() {

    // First check if all data is correct.
    $scope.infoMissing = false;
    $scope.missingInfo = [];

    if (!EventFormData.type.id) {
      $scope.missingInfo.push('event type missing');
    }

    if (EventFormData.calendarType === 'single' && EventFormData.timestamps[0].date === '') {
      $scope.missingInfo.push('timestamp missing');
    }
    else if (EventFormData.calendarType === 'periodic' &&
      (EventFormData.startDate === '' || EventFormData.endDate === '')
    ) {
      $scope.missingInfo.push('start or end date missing');
    }
    else if (EventFormData.calendarType === '') {
      $scope.missingInfo.push('when missing');
    }

    if (EventFormData.isEvent && !EventFormData.location.id) {
      $scope.missingInfo.push('place missing for event');
    }
    else if (EventFormData.isPlace && !EventFormData.address.streetAddress) {
      $scope.missingInfo.push('address missing for place');
    }

    if ($scope.missingInfo.length > 0) {
      $scope.infoMissing = true;
      return;
    }

    if (ignoreDuplicates) {
      createOffer();
    }
    else {
      suggestExistingOffers(EventFormData);
    }

  }

  /**
   * @param {EventFormData} formData
   */
  function suggestExistingOffers(formData) {
    $scope.saving = true;
    $scope.error = false;

    $scope.resultViewer.loading = true;
    $scope.duplicatesSearched = true;

    findDuplicates(formData).then(showDuplicates, showMajorInfoError);
  }

  /**
   * @param {PagedCollection} pagedDuplicates
   */
  function showDuplicates(pagedDuplicates) {

    // Set the results for the duplicates modal,
    if (pagedDuplicates.totalItems > 0) {
      $scope.saving = false;
      $scope.resultViewer.setResults(pagedDuplicates);
    }
    // or save the event immediately if no duplicates were found.
    else {
      createOffer();
    }
  }

  function findDuplicates(data) {
    var conditions = duplicateSearchConditions(data);

    var expressions = [];
    angular.forEach(conditions, function (value, key) {
      expressions.push(key + ':"' + value + '"');
    });

    var queryString = expressions.join(' AND ');

    return udbApi.findEvents(queryString);
  }

  /**
   * Duplicates are searched for by identical properties:
   * - title is the same
   * - on the same location
   */
  function duplicateSearchConditions(data) {

    var location = data.getLocation();

    if (EventFormData.isEvent) {
      /*jshint camelcase: false*/
      /*jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
      return {
        text: EventFormData.name.nl,
        location_label : location.name
      };
    }
    else {
      /*jshint camelcase: false */
      return {
        text: EventFormData.name.nl,
        zipcode: EventFormData.address.postalCode,
        keywords: 'UDB3 place'
      };
    }
  }

  /**
   * Save Event for the first time.
   */
  function createOffer() {

    resetMajorInfoError();

    var eventCrudPromise;
    eventCrudPromise = eventCrud.createOffer(EventFormData);

    eventCrudPromise.then(function(newEventFormData) {
      EventFormData = newEventFormData;
      EventFormData.majorInfoChanged = false;

      controller.eventFormSaved();
      $scope.saving = false;
      $scope.resultViewer = new SearchResultViewer();
      EventFormData.showStep(5);

    }, showMajorInfoError);

  }

  function resetMajorInfoError() {
    $scope.error = false;
    $scope.saving = true;
  }

  function showMajorInfoError() {
    // Error while saving.
    $scope.error = true;
    $scope.saving = false;
  }

  controller.eventFormSaved = function () {
    $rootScope.$emit('eventFormSaved', EventFormData);
  };

  /**
   * Notify that the title of an event has changed.
   */
  function eventTitleChanged() {
    if (EventFormData.id) {
      $rootScope.$emit('eventTitleChanged', EventFormData);
    }
  }

  /**
   * Open the organizer modal.
   *
   * @param {object} item
   *  An item to preview from the suggestions in the current result viewer.
   */
  function previewSuggestedItem(item) {
    $uibModal.open({
      templateUrl: 'templates/suggestion-preview-modal.html',
      controller: 'SuggestionPreviewModalController',
      resolve: {
        selectedSuggestionId: function () {
          return item.id;
        },
        resultViewer: function () {
          return $scope.resultViewer;
        },
        suggestionType: function () {
          return EventFormData.getType();
        }
      }
    });
  }

}
