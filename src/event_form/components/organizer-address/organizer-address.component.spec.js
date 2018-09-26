'use strict';

describe('Component: Organizer Address', function() {
  var $scope, $componentController, citiesBE, citiesNL, component, Levenshtein;

  var fakeAddress =  {
    addressCountry: 'BE',
    addressLocality: 'Leuven',
    postalCode: 3000,
    streetAddress: 'Sluisstraat 79'
  };

  var organizerAddressForm = {
    $submitted: false
  };

  beforeEach(module('udb.core', function ($provide) {
    var appConfig = {
      "offerEditor": {
        "countries": [
          {"code": "BE", "default": true},
          {"code": "NL", "default": false}
        ]
      }
    };

    $provide.constant('appConfig', appConfig);
  }));

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function($rootScope, _$componentController_, $injector) {
    $scope = $rootScope.$new();
    $componentController = _$componentController_;
    citiesBE = $injector.get('citiesBE');
    citiesNL = $injector.get('citiesNL');
    Levenshtein = $injector.get('Levenshtein')
  }));

  function sendUpdateMock(address, error) {
    error = typeof error !== 'undefined' ? error : false;
    return {error: error};
  }

  function getComponent() {
    return $componentController(
        'udbOrganizerAddress',
        {$scope: $scope},
        {address: fakeAddress},
        {citiesBE: citiesBE},
        {citiesNL: citiesNL},
        {Levenshtein: Levenshtein}
    );
  }

  it('should initialise the organizer address component', function () {
    component = getComponent();
    component.selectedCountry.code = 'BE';
    expect(component.selectedCity).toEqual('3000 Leuven');
    expect(component.cities).toEqual(citiesBE);
  });

  it('should load a different cities list when country is changed', function () {
    component = getComponent();
    component.selectedCountry.code = 'NL';

    component.onUpdate = function() {
      sendUpdateMock();
    };

    component.changeCountrySelection();
    expect(component.cities).toEqual(citiesNL);
  });

  it('should load belgian cities', function () {
    component = getComponent();
    component.selectedCountry.code = 'BE';

    component.onUpdate = function() {
      sendUpdateMock();
    };

    component.changeCountrySelection();
    expect(component.cities).toEqual(citiesBE);
  });

  it('should initialise the component even when the address is empty', function () {
    fakeAddress.addressLocality = '';
    component = getComponent();

    expect(component.selectedCity).toEqual('');
  });

  it('should validate the address when address is required', function () {
    fakeAddress.addressLocality = '';
    fakeAddress.addressCountry = '';
    fakeAddress.postalCode = '';
    fakeAddress.streetAddress = '';

    component = getComponent();
    component.requiredAddress = true;
    component.onUpdate = function() {
      sendUpdateMock();
    };

    component.validateAddress();

    expect(component.streetHasErrors).toBeTruthy();
    expect(component.cityHasErrors).toBeTruthy();
  });

  it('should validate a belgian address when address is not required', function () {
    fakeAddress.addressLocality = '';
    fakeAddress.addressCountry = '';
    fakeAddress.postalCode = '';
    fakeAddress.streetAddress = '';

    component = getComponent();
    component.organizerAddressForm = organizerAddressForm;
    component.requiredAddress = false;
    component.selectedCity = '2300 Turnhout';
    component.onUpdate = function() {
      sendUpdateMock();
    };

    component.validateAddress();

    expect(component.streetHasErrors).toBeTruthy();

    fakeAddress.streetAddress = 'Sluisstraat 79';
    component = getComponent();
    component.organizerAddressForm = organizerAddressForm;
    component.requiredAddress = false;
    component.selectedCity = '';
    component.onUpdate = function() {
      sendUpdateMock();
    };

    component.validateAddress();

    expect(component.cityHasErrors).toBeTruthy();
  });

  it('should validate a dutch address when address is not required', function () {
    fakeAddress.addressLocality = '';
    fakeAddress.addressCountry = '';
    fakeAddress.postalCode = '';
    fakeAddress.streetAddress = '';

    component = getComponent();
    component.selectedCountry.code = 'NL';
    component.organizerAddressForm = organizerAddressForm;
    component.requiredAddress = false;
    component.selectedCity = 'Groningen';
    component.onUpdate = function() {
      sendUpdateMock();
    };

    component.validateAddress();

    expect(component.streetHasErrors).toBeTruthy();

    fakeAddress.streetAddress = 'Sluisstraat 79';
    component = getComponent();
    component.selectedCountry.code = 'NL';
    component.organizerAddressForm = organizerAddressForm;
    component.requiredAddress = false;
    component.selectedCity = '';
    component.onUpdate = function() {
      sendUpdateMock();
    };

    component.validateAddress();

    expect(component.cityHasErrors).toBeTruthy();

    component = getComponent();
    component.selectedCountry.code = 'NL';
    component.address.postalCode = '1004AC';
    component.address.streetAddress = '';
    component.organizerAddressForm = organizerAddressForm;
    component.requiredAddress = false;
    component.selectedCity = '';
    component.onUpdate = function() {
      sendUpdateMock();
    };

    component.validateAddress();

    expect(component.streetHasErrors).toBeTruthy();
    expect(component.cityHasErrors).toBeTruthy();

  });

  it('should select a city', function() {
    var item = {
      name: 'Turnhout',
      zip: '2300'
    };
    component = getComponent();
    component.organizerAddressForm = organizerAddressForm;
    component.onUpdate = function() {
      sendUpdateMock();
    };

    component.selectCity(item, '2300 Turnhout');

    expect(component.address.postalCode).toEqual('2300');
    expect(component.address.addressLocality).toEqual('Turnhout');
    expect(component.cityAutocompleteTextField).toEqual('');
    expect(component.selectedCity).toEqual('2300 Turnhout');
  });

  it('should reset the city selection', function () {
    component = getComponent();
    component.onUpdate = function() {
      sendUpdateMock();
    };

    component.changeCitySelection();

    expect(component.selectedCity).toEqual('');
    expect(component.cityAutocompleteTextField).toEqual('');
  });

});
