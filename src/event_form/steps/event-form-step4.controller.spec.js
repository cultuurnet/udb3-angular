'use strict';

describe('Controller: event form step 4', function (){

  beforeEach(module('udb.event-form'));

  var $controller, stepController, $scope, $q, EventFormData, eventCrud, $uibModal, SearchResultViewer;

  beforeEach(inject(function ($rootScope, $injector) {
    $controller = $injector.get('$controller');
    $scope = $rootScope.$new();
    $q = $injector.get('$q');
    EventFormData = $injector.get('EventFormData');
    eventCrud = jasmine.createSpyObj('eventCrud', ['updateMajorInfo']);
    $uibModal = jasmine.createSpyObj('$uibModal', ['open']);
    SearchResultViewer = $injector.get('SearchResultViewer');
    stepController = $controller('EventFormStep4Controller', {
      $scope: $scope,
      eventCrud: eventCrud,
      $uibModal: $uibModal
    });
  }));

  function formForExistingEvent() {
    // The id of the form-data is used to store the id of an existing event.
    // Setting it means the event exists and the user already has gone through all the steps.
    EventFormData.id = 1;
  }

  function getResultViewer() {
    var resultViewer = new SearchResultViewer();
    resultViewer.setResults({
      itemsPerPage: 12,
      member: [
        {'@id': 'http://culudb-silex.dev:8080/place/f01900c5-4384-49fb-92a8-5019f7470973', '@type': 'udb:Place'},
        {'@id': 'http://culudb-silex.dev:8080/place/cb3a4573-5612-4b1c-8a3d-3ba4bcd1d031', '@type': 'udb:Place'},
        {'@id': 'http://culudb-silex.dev:8080/event/9ca8f1e9-40bf-4719-9449-c4f0d92d98ee', '@type': 'udb:Place'}
      ],
      totalItems: 3
    });

    return resultViewer;
  }

  it('should open a suggestion modal with the selected items shown using the active offer type', function () {
    var resultViewer = getResultViewer();
    EventFormData.isEvent = false;
    var actualOptions;
    $uibModal.open.and.callFake(function(options){
      actualOptions = options;
    });

    $scope.previewSuggestedItem({id: 'cb3a4573-5612-4b1c-8a3d-3ba4bcd1d031'});

    expect($uibModal.open).toHaveBeenCalled();
    expect(actualOptions.resolve.selectedSuggestionId()).toEqual('cb3a4573-5612-4b1c-8a3d-3ba4bcd1d031');
    expect(actualOptions.resolve.resultViewer()).toEqual(jasmine.any(Object));
    expect(actualOptions.resolve.suggestionType()).toEqual('place');
  });
});
