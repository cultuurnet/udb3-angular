'use strict';

describe('Directive: udbSaveSearch', function () {
  var $rootScope, $compile, modal, modalInstance, $q;

  var name = 'In Leuven';
  var savedSearchesService;
  var apiRequest;

  beforeEach(module('udb.core'));
  beforeEach(module('udb.templates'));

  beforeEach(inject(function(_$rootScope_, _$compile_, _$modal_, _$q_, _savedSearchesService_) {
    modal = _$modal_;
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $q = _$q_;
    savedSearchesService = _savedSearchesService_;

    var original = modal.open;

    spyOn(modal, 'open').andCallFake(function () {
       modalInstance = original.apply(null, arguments);
       return modalInstance;
    });
  }));

  beforeEach(function () {
    $rootScope.queryString = 'city:leuven';
    var element = $compile('<udb-save-search udb-query-string="queryString"></udb-save-search>')($rootScope);
    $rootScope.$digest();
    element.find('a').triggerHandler('click');
    spyOn(savedSearchesService, 'createSavedSearch').andCallFake(function() {
      apiRequest = $q.defer();
      return apiRequest.promise;
    });
  });

  it('shows a modal saving a search', function () {
    expect(modal.open).toHaveBeenCalled();
  });

  it('saves the search when confirming the modal', function () {
    modalInstance.close(name);
    $rootScope.$digest();
    apiRequest.resolve();
    expect(savedSearchesService.createSavedSearch).toHaveBeenCalledWith(name, 'city:leuven');
  });

  it('does not save the search when the modal is dismissed', function () {
    modalInstance.dismiss('cancel');
    $rootScope.$digest();
    expect(savedSearchesService.createSavedSearch).not.toHaveBeenCalled();
  });

  it('shows an error modal when the search cannot be saved', function () {
    modalInstance.close('some name');
    $rootScope.$digest();
    apiRequest.reject();
    $rootScope.$digest();
    expect(modal.open.calls.length).toEqual(2);
  })
});
