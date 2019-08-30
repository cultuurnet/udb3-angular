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

  // Id ofdummy location for Bookable Event
  $scope.bookableEventLocationId = appConfig.offerEditor.bookableEvent.dummyLocationId;

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
  $scope.filterAvailableCountries = filterAvailableCountries;
  $scope.filterCities = function(value) {
    return function (city) {
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
    $scope.asyncPlaceSuggestion = '';
    $scope.selectedCity = $label;
    $scope.selectedCityObj = city;
    $scope.selectedLocation = undefined;

    setMajorInfoChanged();
  };
  $scope.selectCity = controller.selectCity;

  /**
   * filter the available countries
   * @param {boolean} isPlace
   * @returns {Array}
   */
  function filterAvailableCountries(isPlace) {
    return $scope.availableCountries.filter(function(country) {
      // country code ZZ (bookable event) should not be visible when eventType is a place
      return !isPlace || country.code !== 'ZZ';
    });
  }

  /**
   * Change a city selection.
   */
  function changeCitySelection() {
    EventFormData.resetLocation();
    $scope.selectedCity = '';
    $scope.placeStreetAddress = '';
    $scope.cityAutocompleteTextField = '';
    $scope.asyncPlaceSuggestion = '';
    $scope.locationsSearched = false;
    $scope.locationAutocompleteTextField = '';
    $scope.bookableEventShowStep4 = false;
    isBookableEvent();
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
   * @param {string} $id
   * @param {string} $label
   * @returns {undefined}
   */
  controller.selectLocation = function ($id, $label) {

    var selectedLocation = null;
    if ($scope.isBookableEvent) {
      // fetch the location based on the id when bookable event
      return cityAutocomplete
        .getPlaceById($id)
        .then(function(location) {
          selectedLocation = location;
          $label = selectedLocation.name;
          setLocationToFormData(selectedLocation);
          $scope.bookableEventShowStep4 = true;
        });
    }else {
      selectedLocation = _.find($scope.locationsForCity, function (location) {
        return location.id === $id;
      });
      setLocationToFormData(selectedLocation);
    }

    function setLocationToFormData(selectedLocation) {
      // Assign selection, hide the location field and show the selection.
      $scope.selectedLocation = selectedLocation;
      $scope.locationAutocompleteTextField = '';
      var location = EventFormData.getLocation();
      location.id = $id;
      location.name = $label;
      location.address = selectedLocation.address;
      location.isDummyPlaceForEducationEvents = selectedLocation.isDummyPlaceForEducationEvents;
      EventFormData.setLocation(location);
      controller.stepCompleted();
      setMajorInfoChanged();
      $rootScope.$emit('locationSelected', location);
    }

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
    $scope.asyncPlaceSuggestion = '';
    $scope.locationsSearched = false;
    $scope.selectedCityObj = city;

    controller.stepUncompleted();
  }

  controller.getPlaces = function(filterValue) {

    // Do not look for place suggestions until the user has entered at least 3 characters
    if (filterValue.length < 3) {
      $scope.locationsSearched = false;
      return;
    }

    $scope.locationsSearched = true;

    function updateLocationsAndReturnList (locations) {
      // Loop over all locations to check if location is translated.
      _.each(locations, function(location, key) {
        locations[key] = jsonLDLangFilter(locations[key], language, true);
      });
      // never show dummy locations in suggestion box
      var locationsWithoutDummy = locations.filter(function(location) {
        return !location.isDummyPlaceForEducationEvents;
      });
      var sortedLocations = locationsWithoutDummy.sort(orderLocationsByLevenshtein(filterValue));
      $scope.locationsForCity = sortedLocations;
      return sortedLocations;
    }

    function showErrorAndReturnEmptyList () {
      $scope.locationAutoCompleteError = true;
      return [];
    }

    if ($scope.selectedCountry.code === 'BE') {
      return cityAutocomplete
        .getPlacesByZipcode($scope.selectedCityObj.zip, 'BE', filterValue)
        .then(updateLocationsAndReturnList, showErrorAndReturnEmptyList);
    }

    if ($scope.selectedCountry.code === 'NL') {
      return cityAutocomplete
        .getPlacesByCity($scope.selectedCityObj.name, 'NL')
        .then(updateLocationsAndReturnList, showErrorAndReturnEmptyList);
    }

  };

  $scope.getPlaces = controller.getPlaces;

  controller.cityHasLocations = function () {
    return $scope.locationsForCity instanceof Array && $scope.locationsForCity.length > 0;
  };

  /**
   * Order locations by Levenshtein distance
   *
   * @param {string} filterValue
   */

  function orderLocationsByLevenshtein(filterValue) {
    return function (location) {
      return new Levenshtein(filterValue, location.name + '' + location.address.streetAddress);
    };
  }

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
   * Checks if event is a bookable event
   */
  function isBookableEvent() {
    $scope.isBookableEvent = ($scope.selectedCountry.code === 'ZZ') ? true : false;
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
      if (EventFormData.location.name) {
        $scope.selectedLocation = angular.copy(EventFormData.location);
      }
      if (EventFormData.location.isDummyPlaceForEducationEvents) {
        $scope.isBookableEvent = EventFormData.location.isDummyPlaceForEducationEvents;
        $scope.bookableEventShowStep4 = true;
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

    if ($scope.isBookableEvent) {
      $scope.selectedCountry = _.find($scope.availableCountries, function(country) {
        return country.code === 'ZZ';
      });
    }

  };

  controller.init(EventFormData);
}
