'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormOrganizerAddressController
 * @description
 * # EventFormOrganizerAddressController
 * Modal for setting the reservation period.
 */
angular
    .module('udb.event-form')
    .component('udbOrganizerAddress', {
      templateUrl: 'templates/organizer-address.html',
      controller: OrganizerAddressComponent,
      controllerAs: 'oac',
      bindings: {
        address: '=',
        onUpdate: '&'
      }
    });

/* @ngInject */
function OrganizerAddressComponent($scope, Levenshtein, citiesBE, citiesNL) {
  var controller = this;

  controller.availableCountries = [
      {code: 'BE', label: 'België'},
      {code: 'NL', label: 'Nederland'}
    ];

  controller.defaultCountry = {code: 'BE', label: 'België'};
  controller.selectedCountry = controller.defaultCountry;
  controller.cities = [];
  controller.selectedCity = '';
  controller.requiredAddress = false;

  if (controller.address.addressLocality) {
    controller.selectedCity = controller.address.postalCode + ' ' + controller.address.addressLocality;
    controller.requiredAddress = true;
  }

  controller.streetHasErrors = false;
  controller.cityHasErrors = false;
  controller.addressHasErrors = false;

  controller.validateAddress = validateAddress;
  controller.filterCities = filterCities;
  controller.orderByLevenshteinDistance = orderByLevenshteinDistance;
  controller.selectCity = selectCity;
  controller.changeCitySelection = changeCitySelection;
  controller.changeCountrySelection = changeCountrySelection;

  $scope.$on('organizerAddressSubmit', function () {
    controller.organizerAddressForm.$setSubmitted();
    reset();
    validateAddress();
  });

  function reset() {
    controller.streetHasErrors = false;
    controller.cityHasErrors = false;
    controller.addressHasErrors = false;
  }

  function validateAddress() {
    reset();
    if (controller.requiredAddress) {
      if (controller.address.streetAddress === '' ||
          controller.address.streetAddress === undefined) {
        controller.streetHasErrors = true;
      }
      if (controller.selectedCity === '') {
        controller.cityHasErrors = true;
      }
    }
    else {
      if ((controller.address.streetAddress === '' ||
          controller.address.streetAddress === undefined) && controller.selectedCity !== '') {
        controller.streetHasErrors = true;
      }

      if (controller.selectedCity === '' && controller.address.streetAddress !== '') {
        controller.cityHasErrors = true;
      }
    }

    sendUpdate();
  }

  function filterCities(value) {
    return function (city) {
      var length = value.length;
      var words = value.match(/\w+/g);
      var labelMatches = words.filter(function (word) {
        return city.label.toLowerCase().indexOf(word.toLowerCase()) !== -1;
      });

      return labelMatches.length >= words.length;
    };
  }

  function orderByLevenshteinDistance(value) {
    return function (city) {
      return new Levenshtein(value, city.label);
    };
  }

  /**
   * Select City.
   */
  function selectCity($item, $label) {
    controller.address.postalCode = $item.zip;
    controller.address.addressLocality = $item.name;

    controller.cityAutocompleteTextField = '';
    controller.selectedCity = $label;
    validateAddress();
  }

  /**
   * Change a city selection.
   */
  function changeCitySelection() {
    controller.address.postalCode = '';
    controller.address.addressLocality = '';

    controller.selectedCity = '';
    controller.cityAutocompleteTextField = '';
    validateAddress();
  }

  /**
   * Change a city selection.
   */
  function changeCountrySelection() {
    if (controller.selectedCountry.code === 'NL') {
      controller.cities = citiesNL;
    }
    else {
      controller.cities = citiesBE;
    }
    controller.address.addressCountry = controller.selectedCountry.code;
    changeCitySelection();
  }

  function sendUpdate() {
    controller.addressHasErrors = controller.streetHasErrors || controller.cityHasErrors;
    controller.onUpdate({error: controller.addressHasErrors});
  }
}
