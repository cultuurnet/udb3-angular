'use strict';

describe('Controller: event form step 3', function (){

  beforeEach(module('udb.core', function ($provide) {
    var appConfig = {
      "offerEditor": {
        "bookableEvent": {
          "dummyLocationId": ""
        },
        "countries": [
          {"code": "BE", "default": true},
          {"code": "NL", "default": false},
          {"code": "ZZ", "default": false},
        ]
      }
    };

    $provide.constant('appConfig', appConfig);
  }));

  beforeEach(module('udb.event-form'));

  var $controller, stepController, scope, $q, cityAutocomplete, EventFormData, eventCrud;

  beforeEach(inject(function ($rootScope, $injector) {
    $controller = $injector.get('$controller');
    scope = $rootScope;
    $q = $injector.get('$q');
    cityAutocomplete = jasmine.createSpyObj('cityAutocomplete', ['getPlacesByZipcode']);
    EventFormData = $injector.get('EventFormData');
    eventCrud = jasmine.createSpyObj('eventCrud', ['updateMajorInfo']);
    stepController = $controller('EventFormStep3Controller', {
      $scope: scope,
      cityAutocomplete: cityAutocomplete,
      eventCrud: eventCrud
    });
  }));

  function formForExistingEvent() {
    // The id of the form-data is used to store the id of an existing event.
    // Setting it means the event exists and the user already has gone through all the steps.
    EventFormData.id = 1;
  }

  it('should save a dutch city to the scope', function () {
    stepController.selectCity({city: 'some-Dutch-city', country: 'NL'}, 'some-Dutch-city');

    expect(scope.selectedCity).toEqual('some-Dutch-city');
  });

  it('should save a belgian city to the scope', function () {
    var zipcode = '1234';
    stepController.selectCity({zip: zipcode, country: 'BE'}, 'some-city-id');

    expect(scope.selectedCity).toEqual('some-city-id');
  });

  it('should save the selected city to the scope', function () {
    var expectedZip = {
      'zip': '1000',
      'name': 'Brussel'
    };
    stepController.selectCity({zip: '1000', name: 'Brussel'}, '1000 Brussel');

    expect(scope.selectedCityObj).toEqual(expectedZip);
  });

  it('should NOT trigger a search when the search query has less than 2 characters', function(){
    stepController.getPlaces('aw');
    expect(scope.locationsSearched).toBeFalsy();
  });

  it('should trigger a search when the search query has more than 2 characters', function(){
    cityAutocomplete.getPlacesByZipcode.and.returnValue($q.resolve());
    scope.selectedCityObj = {
      zip: '1000',
      name: 'Brussel'
    };
    stepController.getPlaces('awesome-place');
    expect(scope.locationsSearched).toBeTruthy();
  });


  it('should fetch a list with places for a certain search-query', function(){
    cityAutocomplete.getPlacesByZipcode.and.returnValue($q.resolve());
    scope.selectedCityObj = {
      zip: '1000',
      name: 'Brussel'
    };
    stepController.getPlaces('magic-place');
    expect(cityAutocomplete.getPlacesByZipcode).toHaveBeenCalledWith('1000', 'BE', 'magic-place');
  });

  it('should show suggestion of creating new place if no places where found with this search query', function(){
    spyOn(stepController, 'getPlaces');
    var emptyList = [];
    cityAutocomplete.getPlacesByZipcode.and.returnValue($q.resolve(emptyList));
    scope.selectedCityObj = {
      zip: '1000',
      name: 'Brussel'
    };
    stepController.getPlaces('dummy-searchquery');
    expect(scope.cityHasLocations).toBeFalsy();
  });

  it('should update the event form location when a city is selected for an event', function () {
    var location = {
      'id' : 'd955afda-86ed-4047-b0c3-9f52e8dd2298',
      'name': 'De Hoorn',
      'address': {
        'addressCountry': 'BE',
        'addressLocality': 'Leuven',
        'postalCode': '3000',
        'streetAddress': 'Sluisstraat 79',
        'country': 'BE'
      }
    };

    var expectedLocation = {
      'id' : 'd955afda-86ed-4047-b0c3-9f52e8dd2298',
      'name': 'De Hoorn',
      'address': {
        'addressCountry': 'BE',
        'addressLocality': 'Brussel',
        'postalCode': '1000',
        'streetAddress': 'Sluisstraat 79',
        'country': 'BE'
      }
    };

    EventFormData.setLocation(location);
    stepController.init(EventFormData);

    stepController.selectCity({zip: '1000', name: 'Brussel'}, '1000 Brussel');
    expect(EventFormData.getLocation()).toEqual(expectedLocation);
  });

  it('should suggest creating a new location when selecting a city without any locations', function (){
    cityAutocomplete.getPlacesByZipcode.and.returnValue($q.resolve([]));

    stepController.selectCity({zip: '1234'}, 'some-city-id');
    scope.$apply();

    expect(stepController.cityHasLocations()).toEqual(false);
  });

  it('should display an error when fetching places failed', function () {
    cityAutocomplete.getPlacesByZipcode.and.returnValue($q.reject('error'));
    scope.selectedCityObj = {
      zip: '1000',
      name: 'Brussel'
    };
    stepController.getPlaces('magic-place');
    scope.$apply();
    expect(stepController.cityHasLocations()).toEqual(false);
    expect(scope.locationAutoCompleteError).toEqual(true);
  });

  it('should set the location when initializing with event form data', function () {
    var location = {
      'id' : 182,
      'name': 'De Hoorn',
      'address': {
        'addressCountry': 'BE',
        'addressLocality': 'Leuven',
        'postalCode': '3000',
        'streetAddress': 'Sluisstraat 79'
      }
    };

    EventFormData.setLocation(location);
    stepController.init(EventFormData);

    expect(scope.selectedCity).toEqual('Leuven');
    expect(scope.selectedLocation).toEqual(location);
  });

  it('should set the address when initializing with place form data', function () {
    var address = {
      'addressCountry': 'BE',
      'addressLocality': 'Leuven',
      'postalCode': '3000',
      'streetAddress': 'Sluisstraat 79'
    };

    EventFormData.address = address;
    EventFormData.isPlace = true;
    stepController.init(EventFormData);

    expect(scope.selectedCity).toEqual('Leuven');
    expect(scope.placeStreetAddress).toEqual('Sluisstraat 79');
  });

  it('should hide the next step when this step becomes incomplete and the event is not yet created', function () {
    spyOn(EventFormData, 'hideStep');

    stepController.stepUncompleted();

    expect(EventFormData.hideStep).toHaveBeenCalledWith(4);
  });

  it('should not hide the next step when this step becomes incomplete and the event already exists', function () {
    spyOn(EventFormData, 'hideStep');
    formForExistingEvent();
    stepController.stepUncompleted();

    expect(EventFormData.hideStep).not.toHaveBeenCalled();
  });

  it('should show the next step when this one is completed', function () {
    spyOn(EventFormData, 'showStep');

    stepController.stepCompleted();

    expect(EventFormData.showStep).toHaveBeenCalledWith(4);
  });

  it('should update and existing event on step completion', function () {
    formForExistingEvent();
    stepController.stepCompleted();

    expect(eventCrud.updateMajorInfo).toHaveBeenCalled();
  });

  it('should not update location info when street address changes are not confirmed', function () {
    EventFormData.setLocation(getExampleLocation());
    stepController.init(EventFormData);

    scope.changePlaceStreetAddress();

    expect(EventFormData.location).toEqual(getExampleLocation());
    expect(scope.placeStreetAddress).toEqual('');
  });

  it('should update the address info when street changes are confirmed', function () {
    var expectedAddress = {
      'addressCountry': 'BE',
      'addressLocality': 'Leuven',
      'postalCode': '3000',
      'streetAddress': 'Kerkstraat 69'
    };

    EventFormData.address = getExampleLocation().address;
    EventFormData.isPlace = true;
    stepController.init(EventFormData);

    scope.changePlaceStreetAddress();
    scope.step3Form = {
      $valid: true,
      street: {
        $setValidity: function(){ return true }
      }
    };
    spyOn(scope.step3Form.street, '$setValidity');
    scope.setPlaceStreetAddress('Kerkstraat 69');

    expect(EventFormData.address).toEqual(expectedAddress);
  });

  it('should update the NL address info when street changes and postalCode are confirmed', function () {
    var expectedAddress = {
      'addressCountry': 'NL',
      'addressLocality': 'Groningen',
      'postalCode': '1104AC',
      'streetAddress': 'Kerkstraat 69'
    };

    EventFormData.address = getNlExampleLocation().address;
    EventFormData.isPlace = true;
    stepController.init(EventFormData);

    scope.changePlaceStreetAddress();
    scope.step3Form = {
      $valid: true,
      street: {
        $setValidity: function(){ return true }
      },
      postalCode: {
        $setValidity: function(){ return true }
      }
    };
    spyOn(scope.step3Form.street, '$setValidity');
    spyOn(scope.step3Form.postalCode, '$setValidity');
    scope.setNLPlaceStreetAddress('Kerkstraat 69', '1104AC');

    expect(EventFormData.address).toEqual(expectedAddress);
  });

  it('should ask if the street address is still correct when changing the city', function () {
    EventFormData.setLocation(getExampleLocation());
    stepController.init(EventFormData);

    scope.changeCitySelection();

    expect(scope.placeStreetAddress).toEqual('');
  });

  function getExampleLocation() {
    var location = {
      'id' : null,
      'name': '',
      'address': {
        'addressCountry': 'BE',
        'addressLocality': 'Leuven',
        'postalCode': '3000',
        'streetAddress': 'Sluisstraat 79'
      }
    };

    return _.cloneDeep(location);
  }

  function getNlExampleLocation() {
    var location = {
      'id' : null,
      'name': '',
      'address': {
        'addressCountry': 'NL',
        'addressLocality': 'Groningen',
        'postalCode': '1104AC',
        'streetAddress': 'Sluisstraat 79'
      }
    };

    return _.cloneDeep(location);
  }
});
