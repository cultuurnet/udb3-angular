'use strict';

describe('Controller: event form step 3', function (){

  beforeEach(module('udb.event-form'));

  var $controller, stepController, scope, $q, cityAutocomplete, EventFormData;

  beforeEach(inject(function ($rootScope, $injector) {
    $controller = $injector.get('$controller');
    scope = $rootScope;
    $q = $injector.get('$q');
    cityAutocomplete = jasmine.createSpyObj('cityAutocomplete', ['getPlacesByZipcode']);
    EventFormData = $injector.get('EventFormData');
    stepController = $controller('EventFormStep3Controller', {
      $scope: scope,
      cityAutocomplete: cityAutocomplete
    });
  }));

  it('should fetch a list of places by zipcode when a city is selected', function () {
    var zipcode = '1234';
    spyOn(stepController, 'getLocations');

    stepController.selectCity({zip: zipcode}, 'some-city-id');

    expect(stepController.getLocations).toHaveBeenCalledWith(zipcode);
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
      {name: 'hello'},
      {name: 'world'}
    ]));

    stepController.selectCity({zip: '1234'}, 'some-city-id');
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

  it('should set the location when initializing with form data that has already has one', function () {
    spyOn(stepController, 'getLocations');
    var location = {
      'id' : 182,
      'name': 'De Hoorn',
      'address': {
        'addressCountry': 'Belgium',
        'addressLocality': 'Leuven',
        'postalCode': '3000',
        'streetAddress': 'Sluisstraat 79'
      }
    };

    EventFormData.setLocation(location);
    stepController.init(EventFormData);

    expect(scope.selectedCity).toEqual('Leuven');
    expect(scope.placeStreetAddress).toEqual('Sluisstraat 79');
    expect(scope.selectedLocation).toEqual(location);
    expect(stepController.getLocations).toHaveBeenCalledWith('3000');
  });

  it('should hide the next step when this step becomes incomplete and the event is not yet created', function () {
    spyOn(EventFormData, 'hideStep');

    stepController.stepUncompleted();

    expect(EventFormData.hideStep).toHaveBeenCalledWith(4);
  });

  it('should not hide the next step when this step becomes incomplete and the event already exists', function () {
    spyOn(EventFormData, 'hideStep');
    // The id of the form-data is used to store the id of an existing event.
    // Setting it means the event exists and the user already has gone through all the steps.
    EventFormData.id = 1;
    stepController.stepUncompleted();

    expect(EventFormData.hideStep).not.toHaveBeenCalled();
  });

  it('should show the next step when this one is completed', function () {
    spyOn(EventFormData, 'showStep');

    stepController.stepCompleted();

    expect(EventFormData.showStep).toHaveBeenCalledWith(4);
  });
});
