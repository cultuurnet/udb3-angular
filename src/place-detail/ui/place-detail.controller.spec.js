'use strict';

describe('Controller: Place Detail', function() {
  var $scope,
      placeController,
      placeId,
      udbApi,
      $location,
      jsonLDLangFilter,
      variationRepository,
      offerEditor,
      UdbPlace,
      $q,
      $uibModal,
      eventCrud,
      examplePlaceEventJson = {
        '@id': "http://culudb-silex.dev:8080/place/03458606-eb3f-462d-97f3-548710286702",
        '@context': "/api/1.0/place.jsonld",
        name: "Villa 99, een art deco pareltje",
        description: { 'nl': 'Toto is geen zeekoe' },
        creator: "christophe.vanthuyne@ronse.be",
        created: "2015-06-14T15:22:33+02:00",
        modified: "2015-12-15T14:08:06+01:00",
        publisher: "Invoerders Algemeen ",
        available: "2015-08-03T00:00:00+02:00",
        sameAs: [ ],
        address: {
          addressCountry: "BE",
          addressLocality: "Ronse",
          postalCode: "9600",
          streetAddress: "Engelsenlaan 99"
        },
        bookingInfo: {
          description: "",
          name: "standard price",
          price: 0,
          priceCurrency: "EUR"
        },
        terms: [
          {
            label: "Vlaamse Ardennen",
            domain: "flanderstouristregion",
            id: "reg.365"
          },
          {
            label: "Monument",
            domain: "eventtype",
            id: "0.14.0.0.0"
          },
          {
            label: "9600 Ronse",
            domain: "flandersregion",
            id: "reg.1417"
          }
        ],
        "labels": ['some label']
      };

  var deferredEvent, deferredVariation, deferredPermission, deferredUpdate;

  beforeEach(module('udb.search'));
  beforeEach(module('udb.templates'));

  beforeEach(inject(function($injector, $rootScope, $controller, _$q_) {
    $scope = $rootScope.$new();
    placeId = 'http://culudb-silex.dev:8080/place/03458606-eb3f-462d-97f3-548710286702';
    udbApi = $injector.get('udbApi');
    $location = jasmine.createSpyObj('$location', ['path']);
    jsonLDLangFilter = $injector.get('jsonLDLangFilter');
    variationRepository = $injector.get('variationRepository');
    offerEditor = $injector.get('offerEditor');
    UdbPlace = $injector.get('UdbPlace');
    $q = _$q_;
    $uibModal = jasmine.createSpyObj('$uibModal', ['open']);
    eventCrud = jasmine.createSpyObj('eventCrud', ['findEventsAtPlace']);

    deferredEvent = $q.defer(); deferredVariation = $q.defer();
    deferredPermission = $q.defer();

    spyOn(udbApi, 'hasPermission').and.returnValue($q.resolve());

    spyOn(udbApi, 'getOffer').and.returnValue(deferredEvent.promise);
    deferredEvent.resolve(new UdbPlace(examplePlaceEventJson));

    spyOn(variationRepository, 'getPersonalVariation').and.returnValue(deferredVariation.promise);

    deferredUpdate = $q.defer();
    spyOn(offerEditor, 'editDescription').and.returnValue(deferredUpdate.promise);

    placeController = $controller(
      'PlaceDetailController', {
        $scope: $scope,
        placeId: placeId,
        udbApi: udbApi,
        $location: $location,
        jsonLDLangFilter: jsonLDLangFilter,
        variationRepository: variationRepository,
        offerEditor: offerEditor,
        $uibModal: $uibModal,
        eventCrud: eventCrud
      }
    );
  }));

  it('should fetch the place information', function () {
    deferredVariation.reject('there is no personal variation for offer');
    $scope.$digest();

    expect($scope.placeId).toEqual(placeId);
    expect(udbApi.hasPermission).toHaveBeenCalledWith(
        'http://culudb-silex.dev:8080/place/03458606-eb3f-462d-97f3-548710286702'
    );
    expect(udbApi.getOffer).toHaveBeenCalledWith(
        'http://culudb-silex.dev:8080/place/03458606-eb3f-462d-97f3-548710286702'
    );
    expect($scope.placeIsEditable).toEqual(true);
  });

  it('should loads the place description from the variation', function () {
    var variation = new UdbPlace(examplePlaceEventJson);
    variation.description['nl'] = 'haak is een zeekoe';
    deferredVariation.resolve(variation);
    $scope.$digest();

    expect($scope.place.description).toEqual('haak is een zeekoe');
  });

  it('should update the description', function () {
    deferredVariation.reject('there is no personal variation for offer');

    $scope.$digest();

    $scope.updateDescription('updated description');
    deferredUpdate.resolve();

    expect(offerEditor.editDescription).toHaveBeenCalledWith(
      new UdbPlace(examplePlaceEventJson),
      'updated description'
    );
  });

  it('should replace the description with the cached one when the variation is deleted', function () {
    var variation = new UdbPlace(examplePlaceEventJson);
    variation.description['nl'] = 'haak is een zeekoe';
    deferredVariation.resolve(variation);
    $scope.$digest();

    expect($scope.place.description).toEqual('haak is een zeekoe');

    $scope.updateDescription('');
    deferredUpdate.resolve(false);
    $scope.$digest();

    expect(offerEditor.editDescription).toHaveBeenCalledWith(
      new UdbPlace(examplePlaceEventJson),
      ''
    );
    expect($scope.place.description).toEqual('Toto is geen zeekoe');
  });

  it('should open a confirmation modal showing all the events that are located at the place before deleting it', function () {
    // run a digest so the scope updates with the current place
    $scope.$digest();
    var eventsUsingPlace = [
      'event-one',
      'event-two'
    ];
    var actualOptions;
    var modalOptions = {
      templateUrl: 'templates/place-delete-confirm-modal.html',
      controller: 'PlaceDeleteConfirmModalCtrl',
      resolve: {
        place: jasmine.any(Function),
        events: jasmine.any(Function)
      }
    };
    eventCrud.findEventsAtPlace.and.returnValue($q.resolve(eventsUsingPlace));
    $uibModal.open.and.callFake(function(options){
      actualOptions = options;

      return {
        result: $q.defer().promise
      };
    });

    $scope.deletePlace();
    $scope.$digest();

    expect($uibModal.open).toHaveBeenCalledWith(modalOptions);
    expect(actualOptions.resolve.place()).toEqual($scope.place);
    expect(actualOptions.resolve.events()).toEqual(eventsUsingPlace);
    expect(eventCrud.findEventsAtPlace).toHaveBeenCalled();
  });

  it('should redirect to the dashboard after successfully deleting a Place', function () {
    var job = {
      task: {
        promise: $q.resolve()
      }
    };

    placeController.goToDashboardOnJobCompletion(job);
    $scope.$digest();

    expect($location.path).toHaveBeenCalledWith('/dashboard');
  });
});
