'use strict';

describe('Component: Organizer Address', function() {
  var $scope, $componentController, cities, component, Levenshtein;

  var fakeAddress =  {
    addressCountry: 'BE',
    addressLocality: 'Leuven',
    postalCode: 3000,
    streetAddress: 'Sluisstraat 79'
  };

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function($rootScope, _$componentController_, $injector) {
    $scope = $rootScope.$new();
    $componentController = _$componentController_;
    cities = $injector.get('cities');
    Levenshtein = $injector.get('Levenshtein')
  }));

  function sendUpdateMock(address, error) {
    address = typeof address !== 'undefined' ? address : fakeAddress;
    error = typeof error !== 'undefined' ? error : false;
    return {address: address, error: error};
  }

  function getComponent() {
    return $componentController(
        'udbOrganizerAddress',
        {$scope: $scope},
        {address: fakeAddress},
        {cities: cities},
        {Levenshtein: Levenshtein}
    );
  }

  it('should initialise the organizer address component', function () {
    component = getComponent();
    expect(component.selectedCity).toEqual('3000 Leuven');
    expect(component.cities).toEqual(cities);
  });

  it('should initialise the component even when the address is empty', function () {
    fakeAddress.addressLocality = '';
    component = getComponent();

    expect(component.selectedCity).toEqual('');
  });

  it('should validate the input of streetAddress', function () {
    fakeAddress.addressLocality = 'Leuven';
    component = getComponent();
    component.onUpdate = function() {
      sendUpdateMock();
    };

    component.validateStreet();

    expect(component.streetHasErrors).toBeFalsy();
  });

  it('should validate the input of streetAddress and throw an error when not valid', function () {
    fakeAddress.streetAddress = '';
    component = getComponent();
    component.onUpdate = function() {
      sendUpdateMock(fakeAddress, true);
    };

    component.validateStreet();

    expect(component.streetHasErrors).toBeTruthy();
  });

  it('should select a city', function() {
    var item = {
      name: 'Turnhout',
      zip: '2300'
    };
    component = getComponent();
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