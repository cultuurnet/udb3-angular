'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:OrganizerAddressController
 * @description
 * # OrganizerAddressController
 * Modal for setting the reservation period.
 */
angular
    .module('udb.organizers')
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
function OrganizerAddressComponent($scope, Levenshtein, citiesBE, citiesNL, appConfig) {
  var controller = this;

  controller.availableCountries = appConfig.offerEditor.countries;
  controller.defaultCountry = _.find(controller.availableCountries, function(country) { return country.default; });
  controller.selectedCountry = controller.defaultCountry;
  controller.address.addressCountry = controller.selectedCountry.code;

  controller.cities = controller.selectedCountry.code === 'BE' ? citiesBE : citiesNL;
  controller.selectedCity = '';
  controller.requiredAddress = false;

  if (controller.address.addressLocality) {
    controller.selectedCity = controller.address.postalCode + ' ' + controller.address.addressLocality;
    controller.requiredAddress = true;
  }

  controller.streetHasErrors = false;
  controller.cityHasErrors = false;
  controller.addressHasErrors = false;
  controller.zipHasErrors = false;
  controller.zipValidateError = false;

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
    controller.zipValidateError = false;
    controller.zipHasErrors = false;
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
      if (controller.selectedCountry.code === 'NL') {
        if (controller.address.postalCode === '' ||
            controller.address.postalCode === undefined) {
          controller.zipHasErrors = true;
          controller.zipValidateError = !validateNlPostalCode(controller.address.postalCode);
        }
      }
    }
    else {
      if (controller.selectedCity !== '') {
        if (controller.address.streetAddress === '' ||
            controller.address.streetAddress === undefined) {
          controller.streetHasErrors = true;
        }

        if (controller.selectedCountry.code === 'NL') {
          if (controller.address.postalCode === '' ||
              controller.address.postalCode === undefined) {
            controller.zipHasErrors = true;
            controller.zipValidateError = !validateNlPostalCode(controller.address.postalCode);
          }
        }
      }

      if (controller.address.streetAddress !== '') {
        if (controller.selectedCity === '') {
          controller.cityHasErrors = true;
        }

        if (controller.address.postalCode === '' ||
            controller.address.postalCode === undefined) {
          controller.zipHasErrors = true;
          controller.zipValidateError = !validateNlPostalCode(controller.address.postalCode);
        }
      }

      if (controller.selectedCountry.code === 'NL') {
        if (controller.address.postalCode !== '') {
          if (controller.address.streetAddress === '' ||
              controller.address.streetAddress === undefined) {
            controller.streetHasErrors = true;
          }

          if (controller.selectedCity === '') {
            controller.cityHasErrors = true;
          }
          controller.zipValidateError = !validateNlPostalCode(controller.address.postalCode);
        }
      }
    }
    sendUpdate();
  }

  function validateNlPostalCode(postalCode) {
    var regex = new RegExp(/^[0-9]{4}[a-z]{2}$/i);
    return regex.test(postalCode);
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
    if (controller.selectedCountry.code === 'BE') {
      controller.address.postalCode = $item.zip;
    }

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
    controller.addressHasErrors = controller.streetHasErrors || controller.cityHasErrors ||
        controller.zipHasErrors || controller.zipValidateError;
    controller.onUpdate({error: controller.addressHasErrors});
  }
}
