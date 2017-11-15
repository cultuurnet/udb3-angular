(function () {
  'use strict';

  /**
   * @ngdoc function
   * @name udbApp.controller:EventFormPlaceModalController
   * @description
   * # EventFormPlaceModalController
   * Modal for adding an place.
   */
  angular
    .module('udb.event-form')
    .controller('EventFormPlaceModalController', EventFormPlaceModalController);

  /* @ngInject */
  function EventFormPlaceModalController(
      $scope,
      $uibModalInstance,
      eventCrud,
      UdbPlace,
      location,
      categories,
      title,
      $translate
  ) {

    $scope.categories = categories;
    $scope.location = location;
    $scope.title = title;

    // Scope vars.
    $scope.newPlace = getDefaultPlace();
    $scope.newPlace.eventType.id = getFirstCategoryId();
    $scope.showValidation = false;
    $scope.saving = false;
    $scope.error = false;
    $scope.errorMessage = 'error.default';

    // Scope functions.
    $scope.addLocation = addLocation;
    $scope.resetAddLocation = resetAddLocation;

    /**
     * Get the default Place data
     * @returns {undefined}
     */
    function getDefaultPlace() {
      return {
        name: $scope.title,
        eventType: {
          id: ''
        },
        address: {
          addressCountry: 'BE',
          addressLocality: $scope.location.address.addressLocality,
          postalCode: $scope.location.address.postalCode,
          streetAddress: '',
          locationNumber : '',
          country : 'BE'
        }
      };
    }

    /**
     * Reset the location field(s).
     * @returns {undefined}
     */
    function resetAddLocation() {

      // Clear the current place data.
      $scope.newPlace = getDefaultPlace();

      // Close the modal.
      $uibModalInstance.dismiss();

    }
    /**
     * Adds a location.
     * @returns {undefined}
     */
    function addLocation() {

      // Forms are automatically known in scope.
      $scope.showValidation = true;
      if (!$scope.placeForm.$valid) {
        return;
      }

      if (!validateAddress($scope.newPlace.address.streetAddress)) {
        $scope.error = true;
        $scope.errorMessage = 'error.long'
        return;
      }

      savePlace();
    }

    /**
     * Save the new place in db.
     */
    function savePlace() {

      $scope.saving = true;
      $scope.error = false;

      // Convert this place data to a Udb-place.
      var eventTypeLabel = '';
      for (var i = 0; i < $scope.categories.length; i++) {
        if ($scope.categories[i].id === $scope.newPlace.eventType.id) {
          eventTypeLabel = $scope.categories[i].label;
          break;
        }
      }

      var udbPlace = new UdbPlace();
      udbPlace.name = {nl : $scope.newPlace.name};
      udbPlace.calendarType = 'permanent';
      udbPlace.type = {
        id : $scope.newPlace.eventType.id,
        label : eventTypeLabel,
        domain : 'eventtype'
      };
      udbPlace.address = {
        addressCountry : 'BE',
        addressLocality : $scope.newPlace.address.addressLocality,
        postalCode : $scope.newPlace.address.postalCode,
        streetAddress : $scope.newPlace.address.streetAddress
      };

      function showError() {
        $scope.saving = false;
        $scope.error = true;
      }

      function passOnPlaceData(eventFormData) {
        udbPlace.id = eventFormData.id;
        selectPlace(udbPlace);
        $scope.saving = true;
        $scope.error = false;
      }

      eventCrud
        .createOffer(udbPlace)
        .then(passOnPlaceData, showError);
    }

    $scope.translateLocation = function (label) {
      return $translate.instant('location.' + label);
    };

    /**
     * Select the place that should be used.
     *
     * @param {string} place
     *   Name of the place
     */
    function selectPlace(place) {
      $uibModalInstance.close(place);
    }

    /**
     * @return {string}
     */
    function getFirstCategoryId() {
      var sortedCategories = $scope.categories.sort(
        function(a, b) {
          return a.label.localeCompare(b.label);
        });
      return sortedCategories[0].id;
    }

    function getNumberFromStreetAddress(streetAddress) {
      return streetAddress.split(' ').pop();
    }

    function validateAddress(streetAddress) {
      var maximumNumberLength = 15;
      return getNumberFromStreetAddress(streetAddress).length <= maximumNumberLength;
    }
  }

})();
