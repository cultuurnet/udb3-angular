'use strict';

describe('Controller: event form step 3', function (){

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

  it('should fetch a list of places by city when a Dutch city is selected', function () {
    var zipcode = '1234';
    spyOn(stepController, 'getLocations');

    stepController.selectCity({city: 'some-city-id', country: 'NL'}, 'some-Dutch-city');

    expect(stepController.getLocations).toHaveBeenCalledWith({city: 'some-Dutch-city', country: 'NL'});
  });

  it('should fetch a list of places by zipcode when a city is selected', function () {
    var zipcode = '1234';
    spyOn(stepController, 'getLocations');

    stepController.selectCity({zip: zipcode, country: 'BE'}, 'some-city-id');

    expect(stepController.getLocations).toHaveBeenCalledWith({zip: zipcode, country: 'BE'});
  });

  it('should update the event form address when a city is selected for a place', function () {
    spyOn(stepController, 'getLocations');
    var address = {
      'addressCountry': 'BE',
      'addressLocality': 'Tienen',
      'postalCode': '3300',
      'streetAddress': 'Sluisstraat 79',
      'country': 'BE'
    };

    var expectedAddress = {
      'addressCountry': 'BE',
      'addressLocality': 'Leuven',
      'postalCode': '3000',
      'streetAddress': 'Sluisstraat 79',
      'country': 'BE'
    };

    EventFormData.address = address;
    EventFormData.isPlace = true;
    stepController.init(EventFormData);

    stepController.selectCity({zip: '3000', name: 'Leuven', country: 'BE'}, '3300 Leuven');
    expect(EventFormData.address).toEqual(expectedAddress);
  });

  it('should update the event form location when a city is selected for an event', function () {
    spyOn(stepController, 'getLocations');
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

  it('should return a list of places in a city filtered by address', function () {
    var filterString = 'straat';
    var cityFilter = stepController.filterCityLocations(filterString);
    var locations = [
      {
        id: 'a-place-id',
        name: 'do-not-filter-me',
        address: {
          streetAddress: 'Daalstraat 114'
        }
      },
      {
        id: 'a-place-id',
        name: 'filter-me',
        address: {
          streetAddress: 'Daalstraaat 114'
        }
      }
    ];

    var filteredPlaces = locations.filter(cityFilter);

    expect(filteredPlaces).toEqual([locations[0]]);
  });

  it('should return a list of places in a city filtered by name', function () {
    var filterString = 'do-not-filter-me';
    var cityFilter = stepController.filterCityLocations(filterString);
    var locations = [
      {
        id: 'a-place-id',
        name: 'do-not-filter-me',
        address: {
          streetAddress: 'Daalstraat 114'
        }
      },
      {
        id: 'a-place-id',
        name: 'filter-me',
        address: {
          streetAddress: 'Daalstraat 114'
        }
      }
    ];

    var filteredPlaces = locations.filter(cityFilter);

    expect(filteredPlaces).toEqual([locations[0]]);
  });

  it('should indicate that a city-place-search has happened to suggest creating a new place when no results are available', function () {
    // whenever getLocations() is called this flag is flipped to false
    // searching for places should make it true
    scope.locationsSearched = false;

    scope.locationSearched();

    expect(scope.locationsSearched).toBeTruthy();
  });

  it('should suggest creating a new location when selecting a city without any locations', function (){
    cityAutocomplete.getPlacesByZipcode.and.returnValue($q.resolve([]));

    stepController.selectCity({zip: '1234'}, 'some-city-id');
    scope.$apply();

    expect(stepController.cityHasLocations()).toEqual(false);
  });

  it('should allow to search the known locations in a city', function () {
    cityAutocomplete.getPlacesByZipcode.and.returnValue($q.resolve([
      {name: 'hello', address: {streetAddress: 'straat'}},
      {name: 'world', address: {streetAddress: 'street'}}
    ]));

    stepController.selectCity({zip: '1234', name: 'test'}, 'some-city-id');
    scope.$apply();

    expect(stepController.cityHasLocations()).toEqual(true);
  });

  it('should display an error when locations for a city fail to load', function () {
    cityAutocomplete.getPlacesByZipcode.and.returnValue($q.reject('kapot'));

    stepController.getLocations('6000');
    scope.$apply();

    expect(stepController.cityHasLocations()).toEqual(false);
    expect(scope.locationAutoCompleteError).toEqual(true);
  });

  it('should set the location when initializing with event form data', function () {
    spyOn(stepController, 'getLocations');
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
    expect(stepController.getLocations).toHaveBeenCalledWith('3000');
  });

  it('should set the address when initializing with place form data', function () {
    spyOn(stepController, 'getLocations');
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
    spyOn(stepController, 'getLocations');
    EventFormData.setLocation(getExampleLocation());
    stepController.init(EventFormData);

    scope.changePlaceStreetAddress();

    expect(EventFormData.location).toEqual(getExampleLocation());
    expect(scope.placeStreetAddress).toEqual('');
  });

  it('should update the address info when street changes are confirmed', function () {
    spyOn(stepController, 'getLocations');
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

  it('should ask if the street address is still correct when changing the city', function () {
    spyOn(stepController, 'getLocations');
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
});
