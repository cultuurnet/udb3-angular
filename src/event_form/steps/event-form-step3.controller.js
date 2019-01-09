'use strict';

/**
 * @typedef {Object} City
 * @property {string} zip
 * @property {string} name
 */

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
    citiesBE,
    citiesNL,
    Levenshtein,
    eventCrud,
    $rootScope,
    $translate,
    jsonLDLangFilter,
    appConfig
) {

  var controller = this;

  function getEmptyLocation() {
    var emptyLocation = {
      'id' : null,
      'name': '',
      'address': {
        'addressCountry': '',
        'addressLocality': '',
        'postalCode': '',
        'streetAddress': ''
      }
    };

    return _.cloneDeep(emptyLocation);
  }

  var language = $translate.use() || 'nl';

  // Scope vars.
  // main storage for event form.
  $scope.eventFormData = EventFormData;

  $scope.categories = placeCategories;

  // Autocomplete model field for the City/Postal code.
  $scope.cityAutocompleteTextField = '';

  // Autocomplete model field for the Location.
  $scope.locationAutocompleteTextField = '';

  $scope.availableCountries = appConfig.offerEditor.countries;
  $scope.defaultCountry = _.find($scope.availableCountries, function(country) { return country.default; });
  $scope.selectedCountry = $scope.defaultCountry;

  // Autocomplete helper vars.
  $scope.searchingCities = false;
  $scope.cityAutoCompleteError = false;
  $scope.loadingPlaces = false;
  $scope.locationAutoCompleteError = false;
  $scope.locationsSearched = false;

  $scope.selectedCity = '';
  $scope.selectedLocation = undefined;
  $scope.placeStreetAddress = '';
  $scope.newPlaceStreetAddress = '';
  $scope.openPlaceModal = openPlaceModal;

  // Validation.
  $scope.showValidation = false;
  $scope.showStreetValidation = false;
  $scope.showZipValidation = false;

  // Convenient scope variables for current controller (in multistep).
  $scope.locationsForCity = [];

  // Scope functions.

  $scope.cities = $scope.selectedCountry.code === 'BE' ? citiesBE : citiesNL;

  $scope.changeCountrySelection = changeCountrySelection;
  $scope.changeCitySelection = changeCitySelection;
  $scope.changeLocationSelection = changeLocationSelection;
  $scope.setPlaceStreetAddress = setPlaceStreetAddress;
  $scope.setNLPlaceStreetAddress = setNLPlaceStreetAddress;
  $scope.changePlaceStreetAddress = changePlaceStreetAddress;
  $scope.resetStreetValidation = resetStreetValidation;
  $scope.resetZipValidation = resetZipValidation;
  $scope.setMajorInfoChanged = setMajorInfoChanged;
  $scope.filterCities = function(value) {
    return function (city) {
      var length = value.length;
      var words = value.match(/.+/g);
      var labelMatches = words.filter(function (word) {
        return city.label.toLowerCase().indexOf(word.toLowerCase()) !== -1;
      });

      return labelMatches.length >= words.length;
    };
  };
  $scope.orderByLevenshteinDistance = function(value) {
    return function (city) {
      return new Levenshtein(value, city.label);
    };
  };

  /**
   * @param {City} city
   * @param {string} $label
   */
  controller.selectCity = function (city, $label) {

    var zipcode = city.zip,
        name = city.name;

    var newAddressInfo = {
      postalCode: zipcode,
      addressLocality: name,
      addressCountry: $scope.selectedCountry.code
    };

    if (EventFormData.isPlace) {
      var currentAddress = $scope.eventFormData.address;
      $scope.eventFormData.address = _.merge(getEmptyLocation().address, currentAddress, newAddressInfo);
    } else { //assume an event
      var newLocationInfo = {address: newAddressInfo};
      var currentLocation = $scope.eventFormData.getLocation();
      var newLocation = _.merge(getEmptyLocation(), currentLocation, newLocationInfo);
      EventFormData.setLocation(newLocation);
    }

    $scope.cityAutocompleteTextField = '';
    $scope.selectedCity = $label;
    $scope.selectedLocation = undefined;

    setMajorInfoChanged();

    controller.getLocations(city);
  };
  $scope.selectCity = controller.selectCity;

  /**
   * Change a city selection.
   */
  function changeCitySelection() {
    EventFormData.resetLocation();
    $scope.selectedCity = '';
    $scope.placeStreetAddress = '';
    $scope.cityAutocompleteTextField = '';
    $scope.locationsSearched = false;
    $scope.locationAutocompleteTextField = '';
    controller.stepUncompleted();
  }

  /**
   * Change a country selection.
   */
  function changeCountrySelection() {
    if ($scope.selectedCountry.code === 'NL') {
      $scope.cities = citiesNL;
    }
    else {
      $scope.cities = citiesBE;
    }
    changeCitySelection();
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
    location.address = selectedLocation.address;
    EventFormData.setLocation(location);

    controller.stepCompleted();
    setMajorInfoChanged();
    $rootScope.$emit('locationSelected', location);

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
    var city = {};
    city.zip = location.address.postalCode;
    city.name = location.address.addressLocality;
    EventFormData.setLocation(location);

    $scope.selectedLocation = false;
    $scope.locationAutocompleteTextField = '';
    $scope.locationsSearched = false;

    controller.stepUncompleted();
    controller.getLocations(city);
  }

  /**
   * Get locations for Event.
   * @returns {undefined}
   * @param {Object} city
   */
  controller.getLocations = function (city) {

    function showErrorAndReturnEmptyList () {
      $scope.locationAutoCompleteError = true;
      return [];
    }

    function updateLocationsAndReturnList (locations) {
      // Loop over all locations to check if location is translated.
      _.each(locations, function(location, key) {
        locations[key] = jsonLDLangFilter(locations[key], language, true);
      });
      $scope.locationsForCity = locations;
      return locations;
    }

    function clearLoadingState() {
      $scope.locationsSearched = false;
      $scope.loadingPlaces = false;
    }

    $scope.loadingPlaces = true;
    $scope.locationAutoCompleteError = false;

    if ($scope.selectedCountry.code === 'BE') {
      return cityAutocomplete
        .getPlacesByZipcode(city.zip, 'BE')
        .then(updateLocationsAndReturnList, showErrorAndReturnEmptyList)
        .finally(clearLoadingState);
    }
    if ($scope.selectedCountry.code === 'NL') {
      return cityAutocomplete
        .getPlacesByCity(city.label, 'NL')
        .then(updateLocationsAndReturnList, showErrorAndReturnEmptyList)
        .finally(clearLoadingState);
    }
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
        'name': place.name,
        'address': {
          'addressCountry': $scope.selectedCountry.code,
          'addressLocality': place.address.addressLocality,
          'postalCode': place.address.postalCode,
          'streetAddress': place.address.streetAddress
        }
      };
      EventFormData.setLocation(location);
      $scope.selectedLocation = angular.copy(location);

      controller.stepCompleted();
    }

    modalInstance.result
      .then(setEventFormDataPlace);
  }

  function getNumberFromStreetAddress(streetAddress) {
    return streetAddress.split(' ').pop() || '';
  }

  function validateAddress(streetAddress) {
    if (streetAddress) {
      var maximumNumberLength = 15;
      return getNumberFromStreetAddress(streetAddress).length <= maximumNumberLength;
    }
  }

  function validateNlPostalCode(postalCode) {
    var regex = new RegExp(/^[0-9]{4}[a-z]{2}$/i);
    return regex.test(postalCode);
  }

  /**
   * Set the street address for a Place.
   *
   * @param {string} streetAddress
   */
  function setPlaceStreetAddress(streetAddress) {
    // Forms are automatically known in scope.
    $scope.showValidation = true;

    $scope.step3Form.street.$setValidity('invalid', true);
    if (!$scope.step3Form.$valid) {
      return;
    }

    if (!validateAddress(streetAddress)) {
      $scope.showStreetValidation = true;
      $scope.step3Form.street.$setValidity('invalid', false);
      return;
    }

    var currentAddress = EventFormData.address;
    var newAddressInfo = {
      streetAddress: streetAddress
    };

    EventFormData.address = _.merge(getEmptyLocation().address, currentAddress, newAddressInfo);
    $scope.placeStreetAddress = streetAddress;

    controller.stepCompleted();
  }

  function setNLPlaceStreetAddress(streetAddress, postalCode) {
    // Forms are automatically known in scope.
    $scope.showValidation = true;

    $scope.step3Form.street.$setValidity('invalid', true);

    if ($scope.selectedCountry.code === 'NL') {
      $scope.step3Form.postalCode.$setValidity('invalid', true);
    }

    if (!$scope.step3Form.$valid) {
      return;
    }

    if (!validateAddress(streetAddress)) {
      $scope.showStreetValidation = true;
      $scope.step3Form.street.$setValidity('invalid', false);
    }

    if ($scope.selectedCountry.code === 'NL') {
      if (!validateNlPostalCode(postalCode)) {
        $scope.showZipValidation = true;
        $scope.step3Form.postalCode.$setValidity('invalid', false);
      }
    }

    if ($scope.showStreetValidation || $scope.showZipValidation) {
      return;
    }

    var currentAddress = EventFormData.address;
    var newAddressInfo = {
      streetAddress: streetAddress,
      postalCode: postalCode
    };

    EventFormData.address = _.merge(getEmptyLocation().address, currentAddress, newAddressInfo);
    $scope.placeStreetAddress = streetAddress;

    controller.stepCompleted();
  }

  function resetStreetValidation() {
    $scope.showValidation = false;
    $scope.showStreetValidation = false;
  }

  function resetZipValidation() {
    $scope.showValidation = false;
    $scope.showZipValidation = false;
  }

  /**
   * Change StreetAddress
   */
  function changePlaceStreetAddress() {
    $scope.newPlaceStreetAddress = $scope.placeStreetAddress ? $scope.placeStreetAddress : '';
    $scope.placeStreetAddress = '';
    $scope.showValidation = false;
    $scope.showStreetValidation = false;
    $scope.showZipValidation = false;
    controller.stepUncompleted();
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
    var address;

    // Set location data when the form data contains an Event with a location
    if (EventFormData.isEvent && EventFormData.location.name) {
      address = _.get(EventFormData, 'location.address');
      controller.getLocations(address.postalCode);
      if (EventFormData.location.name) {
        $scope.selectedLocation = angular.copy(EventFormData.location);
      }
    }

    // Set the address when the form contains Place address info
    if (EventFormData.isPlace && EventFormData.address.postalCode) {
      address = EventFormData.address;

      $scope.placeStreetAddress = address.streetAddress;
    }

    if (address) {
      $scope.selectedCity = address.addressLocality;
      $scope.selectedCountry = _.find($scope.availableCountries, function(country) {
        return country.code === address.addressCountry;
      });
    }
  };

  controller.init(EventFormData);
}
