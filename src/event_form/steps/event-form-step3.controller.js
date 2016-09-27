'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormStep3Controller
 * @description
 * # EventFormStep3Controller
 * Step 3 of the event form
 */
angular
  .module('udb.event-form')
  .controller('EventFormStep3Controller', EventFormStep3Controller);

/* @ngInject */
function EventFormStep3Controller(
    $scope,
    EventFormData,
    cityAutocomplete,
    placeCategories,
    $uibModal,
    cities,
    Levenshtein,
    eventCrud,
    $location,
    $anchorScroll
) {

  var controller = this;

  // Scope vars.
  // main storage for event form.
  $scope.eventFormData = EventFormData;

  $scope.categories = placeCategories;

  // Autocomplete model field for the City/Postal code.
  $scope.cityAutocompleteTextField = '';

  // Autocomplete model field for the Location.
  $scope.locationAutocompleteTextField = '';

  // Autocomplete helper vars.
  $scope.searchingCities = false;
  $scope.cityAutoCompleteError = false;
  $scope.loadingPlaces = false;
  $scope.locationAutoCompleteError = false;
  $scope.locationsSearched = false;

  $scope.selectedCity = '';
  $scope.selectedLocation = undefined;
  $scope.placeStreetAddress = '';
  $scope.openPlaceModal = openPlaceModal;

  // Validation.
  $scope.showValidation = false;

  // Convenient scope variables for current controller (in multistep).
  $scope.locationsForCity = [];

  // Scope functions.
  $scope.cities = cities;
  $scope.changeCitySelection = changeCitySelection;
  $scope.changeLocationSelection = changeLocationSelection;
  $scope.setStreetAddress = setStreetAddress;
  $scope.changeStreetAddress = changeStreetAddress;
  $scope.setMajorInfoChanged = setMajorInfoChanged;
  $scope.filterCities = function(value) {
    return function (city) {
      var length = value.length;
      var words = value.match(/\w+/g);
      var zipMatches = words.filter(function (word) {
        return city.zip.substring(0, length) === word;
      });
      var nameMatches = words.filter(function (word) {
        return city.name.toLowerCase().indexOf(word.toLowerCase()) !== -1;
      });

      return zipMatches.length + nameMatches.length >= words.length;
    };
  };
  $scope.orderByLevenshteinDistance = function(value) {
    return function (city) {
      return new Levenshtein(value, city.zip + '' + city.name);
    };
  };

  $scope.scrollToBottom = scrollToBottom;

  // Default values
  if (EventFormData.location && EventFormData.location.address && EventFormData.location.address.postalCode) {

    $scope.selectedCity = EventFormData.location.address.postalCode +
      ' ' + EventFormData.location.address.addressLocality;

    // Location has a name => an event.
    if (EventFormData.location.name) {
      $scope.selectedLocation = EventFormData.location;
    }
    else {
      $scope.placeStreetAddress = EventFormData.location.address.streetAddress;
      $scope.selectedLocation = EventFormData.location;
    }
  }

  /**
   * Select City.
   */
  controller.selectCity = function ($item, $label) {

    var zipcode = $item.zip,
        name = $item.name;

    EventFormData.resetLocation();
    var location = $scope.eventFormData.getLocation();
    location.address.postalCode = zipcode;
    location.address.addressLocality = name;
    EventFormData.setLocation(location);

    $scope.cityAutocompleteTextField = '';
    $scope.selectedCity = $label;
    $scope.selectedLocation = undefined;

    setMajorInfoChanged();

    controller.getLocations(zipcode);
  };
  $scope.selectCity = controller.selectCity;

  /**
   * Change a city selection.
   */
  function changeCitySelection() {
    EventFormData.resetLocation();
    $scope.selectedCity = '';
    $scope.selectedLocation = undefined;
    $scope.cityAutocompleteTextField = '';
    $scope.locationsSearched = false;
    $scope.locationAutocompleteTextField = '';
    controller.stepUncompleted();
  }

  /**
   * Select location.
   * @returns {undefined}
   */
  controller.selectLocation = function ($item, $model, $label) {

    var selectedLocation = _.find($scope.locationsForCity, function (location) {
      return location.id === $model;
    });

    // Assign selection, hide the location field and show the selection.
    $scope.selectedLocation = selectedLocation;
    $scope.locationAutocompleteTextField = '';

    var location = EventFormData.getLocation();
    location.id = $model;
    location.name = $label;
    EventFormData.setLocation(location);

    controller.stepCompleted();
    setMajorInfoChanged();

  };
  $scope.selectLocation = controller.selectLocation;

  /**
   * Change selected location.
   * @returns {undefined}
   */
  function changeLocationSelection() {

    // Reset only the location data of the location.
    var location = EventFormData.getLocation();
    location.id = '';
    location.name = '';
    EventFormData.setLocation(location);

    //$scope.selectedCity = '';
    $scope.selectedLocation = false;
    $scope.locationAutocompleteTextField = '';
    $scope.locationsSearched = false;

    controller.stepUncompleted();
  }

  /**
   * Get locations for Event.
   * @returns {undefined}
   * @param {string} zipcode
   */
  controller.getLocations = function (zipcode) {

    function showErrorAndReturnEmptyList () {
      $scope.locationAutoCompleteError = true;
      return [];
    }

    function updateLocationsAndReturnList (locations) {
      $scope.locationsForCity = locations;
      return locations;
    }

    function clearLoadingState() {
      $scope.locationsSearched = false;
      $scope.loadingPlaces = false;
    }

    $scope.loadingPlaces = true;
    $scope.locationAutoCompleteError = false;
    return cityAutocomplete
      .getPlacesByZipcode(zipcode)
      .then(updateLocationsAndReturnList, showErrorAndReturnEmptyList)
      .finally(clearLoadingState);
  };

  controller.cityHasLocations = function () {
    return $scope.locationsForCity instanceof Array && $scope.locationsForCity.length > 0;
  };
  $scope.cityHasLocations = controller.cityHasLocations;

  controller.locationSearched = function () {
    $scope.locationsSearched = true;
  };
  $scope.locationSearched = controller.locationSearched;

  controller.filterCityLocations = function (filterValue) {
    return function (location) {
      var words = filterValue.match(/\w+/g).filter(function (word) {
        return word.length > 2;
      });
      var addressMatches = words.filter(function (word) {
        return location.address.streetAddress.toLowerCase().indexOf(word.toLowerCase()) !== -1;
      });
      var nameMatches = words.filter(function (word) {
        return location.name.toLowerCase().indexOf(word.toLowerCase()) !== -1;
      });

      return addressMatches.length + nameMatches.length >= words.length;
    };
  };
  $scope.filterCityLocations = controller.filterCityLocations;

  controller.orderCityLocations = function (filterValue) {
    return function (location) {
      return new Levenshtein(location, location.name + '' + location.address.streetAddress);
    };
  };
  $scope.orderCityLocations = controller.orderCityLocations;

  /**
   * Open the place modal.
   */
  function openPlaceModal() {

    var modalInstance = $uibModal.open({
      templateUrl: 'templates/event-form-place-modal.html',
      controller: 'EventFormPlaceModalController',
      resolve: {
        location: function () {
          return $scope.eventFormData.location;
        },
        categories: function () {
          return $scope.categories;
        },
        title: function () {
          return $scope.locationAutocompleteTextField;
        }
      }
    });

    /**
     * @param {UdbPlace} place
     */
    function setEventFormDataPlace(place) {

      // Assign the just saved place to the event form data.
      EventFormData.place = place;

      // Assign selection, hide the location field and show the selection.
      $scope.selectedCity = place.address.postalCode + ' ' + place.address.addressLocality;

      var location = {
        'id' : place.id,
        'name': place.name.nl,
        'address': {
          'addressCountry': 'BE',
          'addressLocality': place.address.addressLocality,
          'postalCode': place.address.postalCode,
          'streetAddress': place.address.streetAddress
        }
      };
      EventFormData.setLocation(location);
      $scope.selectedLocation = location;

      controller.stepCompleted();
    }

    modalInstance.result
      .then(setEventFormDataPlace);
  }

  function setStreetAddress() {
    // Forms are automatically known in scope.
    $scope.showValidation = true;
    if (!$scope.step3Form.$valid) {
      return;
    }

    var location = EventFormData.getLocation();
    location.address.addressCountry = 'BE';
    location.address.streetAddress = $scope.placeStreetAddress;
    EventFormData.setLocation(location);

    $scope.selectedLocation = location;

    controller.stepCompleted();
  }

  /**
   * Change StreetAddress
   */
  function changeStreetAddress() {

    // Reset only the street/number data of the location.
    var location = EventFormData.getLocation();
    location.address.addressCountry = '';
    location.address.streetAddress = '';
    EventFormData.setLocation(location);

    $scope.selectedLocation = undefined;

    controller.stepUncompleted();

    setMajorInfoChanged();
  }

  /**
   * Mark the major info as changed.
   */
  function setMajorInfoChanged() {
    if (EventFormData.id) {
      EventFormData.majorInfoChanged = true;
    }
  }

  controller.stepCompleted = function () {
    EventFormData.showStep(4);
    scrollToBottom('titel');

    if (EventFormData.id) {
      eventCrud.updateMajorInfo(EventFormData);
    }
  };

  controller.stepUncompleted = function () {
    if (!EventFormData.id) {
      EventFormData.hideStep(4);
    }
  };

  controller.init = function (EventFormData) {
    if (EventFormData.location.address.addressCountry) {
      var location = EventFormData.location;

      $scope.selectedCity = location.address.addressLocality;
      controller.getLocations(location.address.postalCode);
      $scope.placeStreetAddress = location.address.streetAddress;
      $scope.selectedLocation = location;
    }
  };

  function scrollToBottom (where) {
    $location.hash(where);
    $anchorScroll();
  }

  controller.init(EventFormData);
}
