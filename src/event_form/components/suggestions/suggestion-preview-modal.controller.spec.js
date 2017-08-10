'use strict';

describe('Controller: Suggestion Preview Modal', function() {
  var $scope, modal, $controller, SearchResultViewer;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function($rootScope, _$controller_, _SearchResultViewer_) {
    $controller = _$controller_;
    $scope = $rootScope.$new();
    modal = jasmine.createSpyObj(modal, ['close']);
    SearchResultViewer = _SearchResultViewer_;
  }));

  function getController(selectedSuggestionId, resultViewer, suggestionType) {
    return $controller(
      'SuggestionPreviewModalController', {
        $scope: $scope,
        $uibModalInstance: modal,
        selectedSuggestionId: selectedSuggestionId,
        resultViewer: resultViewer,
        suggestionType: suggestionType
      }
    );
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

  it('should open with the selected event active', function() {
    var resultViewer = getResultViewer();
    var controller = getController('9ca8f1e9-40bf-4719-9449-c4f0d92d98ee', resultViewer, 'place');

    expect($scope.currentSuggestionIndex).toEqual(2);
  });

  it('should close the modal when trying to navigate to the next suggestion but there is none', function () {
    var resultViewer = getResultViewer();
    var controller = getController('9ca8f1e9-40bf-4719-9449-c4f0d92d98ee', resultViewer, 'place');

    $scope.nextSuggestion();

    expect(modal.close).toHaveBeenCalled();
  });

  it('should show the following suggestion when the list is not depleted and the next one is requested', function () {
    var resultViewer = getResultViewer();
    var controller = getController('f01900c5-4384-49fb-92a8-5019f7470973', resultViewer, 'place');

    $scope.nextSuggestion();

    expect($scope.currentSuggestionIndex).toEqual(1);
  });

  it('should show the earlier suggestion when the list is not depleted and the previous one is requested', function () {
    var resultViewer = getResultViewer();
    var controller = getController('9ca8f1e9-40bf-4719-9449-c4f0d92d98ee', resultViewer, 'place');

    $scope.previousSuggestion();

    expect($scope.currentSuggestionIndex).toEqual(1);
  });

  it('should close the modal when trying to navigate to the previous suggestion but there is none', function () {
    var resultViewer = getResultViewer();
    var controller = getController('f01900c5-4384-49fb-92a8-5019f7470973', resultViewer, 'place');

    $scope.previousSuggestion();

    expect(modal.close).toHaveBeenCalled();
  });
});
