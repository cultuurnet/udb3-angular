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
        address: '<',
        onUpdate: '&'
      }
    });

/* @ngInject */
function OrganizerAddressComponent($scope, cities, Levenshtein) {
  var controller = this;

  controller.cities = cities;
  controller.selectedCity = '';
  controller.requiredAddress = false;

  if (controller.address.addressLocality) {
    controller.selectedCity = controller.address.postalCode + ' ' + controller.address.addressLocality;
    controller.requiredAddress = true;
  }

  controller.streetHasErrors = false;
  controller.cityHasErrors = false;
  controller.addressHasErrors = false;

  controller.filterCities = filterCities;
  controller.orderByLevenshteinDistance = orderByLevenshteinDistance;
  controller.selectCity = selectCity;
  controller.changeCitySelection = changeCitySelection;

  $scope.$on('organizerContactSubmit', function () {
    controller.organizerAddressForm.$setSubmitted();
    controller.streetHasErrors = false;
    controller.cityHasErrors = false;
    validateAddress();
  });

  function validateAddress() {
    if (controller.requiredAddress) {
      if (controller.address.streetAddress === ''
          || controller.address.streetAddress === undefined) {
        controller.streetHasErrors = true;
      }
      if (controller.selectedCity === '') {
        controller.cityHasErrors = true;
      }
    }
    else {
      if ((controller.address.streetAddress === ''
          || controller.address.streetAddress === undefined) && controller.selectedCity !== '') {
        controller.streetHasErrors = true;
      }
      if (controller.selectedCity === ''
          && controller.address.streetAddress !== '') {
        controller.cityHasErrors = true;
      }
    }

    sendUpdate();
  }

  function filterCities(value) {
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
  }

  function orderByLevenshteinDistance(value) {
    return function (city) {
      return new Levenshtein(value, city.zip + '' + city.name);
    };
  }

  /**
   * Select City.
   */
  function selectCity($item, $label) {
    controller.address.postalCode = $item.zip;
    controller.address.addressLocality = $item.name;
    controller.address.addressCountry = 'BE';

    controller.cityAutocompleteTextField = '';
    controller.selectedCity = $label;
    controller.organizerAddressForm.city.$setUntouched();
  }

  /**
   * Change a city selection.
   */
  function changeCitySelection() {
    controller.address.postalCode = '';
    controller.address.addressLocality = '';
    controller.address.addressCountry = '';

    controller.selectedCity = '';
    controller.cityAutocompleteTextField = '';
  }

  function sendUpdate() {
    controller.addressHasErrors = controller.streetHasErrors || controller.cityHasErrors;
    controller.onUpdate({error: controller.addressHasErrors});
  }
}
