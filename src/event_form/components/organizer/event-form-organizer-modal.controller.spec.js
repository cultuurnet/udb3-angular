'use strict';

describe('Controller: Event Form Organizer Modal', function() {
  var
    $q,
    $scope,
    $controller,
    $uibModalInstance,
    udbOrganizers,
    organizerName,
    eventCrud;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function($rootScope, _$q_, _$controller_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = $rootScope.$new();

    $uibModalInstance = jasmine.createSpyObj('$uibModalInstance', ['close', 'dismiss']);
    udbOrganizers = jasmine.createSpyObj('udbOrganizers', ['findOrganizersWebsite']);
    eventCrud = jasmine.createSpyObj('eventCrud', ['createOrganizer']);

    organizerName = 'The organizers';
  }));

  function getController() {
    return $controller(
      'EventFormOrganizerModalController', {
        $scope: $scope,
        $uibModalInstance: $uibModalInstance,
        $q: $q,
        udbOrganizers: udbOrganizers,
        organizerName: organizerName ,
        eventCrud: eventCrud
      }
    );
  }

  it('enables submit button on valid website and name', function() {
    getController();

    $scope.newOrganizer = {
      website: 'http://google.be',
      name: 'The CooCoo'
    };
    $scope.websiteError = false;

    $scope.updateName();

    expect($scope.disableSubmit).toBeFalsy();
  });

  it('disables submit button on valid website but invalid name', function() {
    getController();

    $scope.newOrganizer = {
      website: 'http://google.be',
      name: undefined
    };
    $scope.websiteError = false;

    $scope.updateName();

    expect($scope.disableSubmit).toBeTruthy();
  });

  it('disables submit button on valid name but invalid website', function() {
    getController();

    $scope.newOrganizer = {
      website: 'http://google.be',
      name: 'The CooCoo'
    };
    $scope.websiteError = true;

    $scope.updateName();

    expect($scope.disableSubmit).toBeTruthy();
  });

  it('should just close the modal on cancel', function() {
    var controller = getController();
    $scope.$digest();

    $scope.cancel();

    expect($uibModalInstance.dismiss).toHaveBeenCalled();
  });

  it('should return the chosen organizer', function() {
    // aka the origanizer found with the same url
    var controller = getController();
    $scope.$digest();

    var org = {
      website: 'http://google.be',
      name : 'The CooCoo',
      address : {
        streetAddress : 'Teststraat 6',
        addressLocality : 'Leuven',
        postalCode: '3000',
        addressCountry : 'BE'
      },
      contact: []
    };

    $scope.selectOrganizer(org);

    expect($uibModalInstance.close).toHaveBeenCalledWith(org);
  });

  it('should save a new organizer', function() {
    eventCrud.createOrganizer.and.returnValue($q.resolve({data: {
      organizerId: '73dbf765-1622-4454-aed9-6c1fe5771568'
    }}));
    var controller = getController();
    $scope.$digest();

    var org = {
      website: 'http://google.be',
      name : 'The CooCoo',
      address : {
        streetAddress : 'Teststraat 6',
        addressLocality : 'Leuven',
        postalCode: '3000',
        addressCountry : 'BE'
      },
      contact: []
    };

    $scope.newOrganizer = _.clone(org);

    $scope.saveOrganizer();

    $scope.$digest();

    expect(eventCrud.createOrganizer).toHaveBeenCalledWith(org);
    expect($scope.newOrganizer.id).toEqual('73dbf765-1622-4454-aed9-6c1fe5771568');
    org.id = '73dbf765-1622-4454-aed9-6c1fe5771568';
    expect($uibModalInstance.close).toHaveBeenCalledWith(org);
  });

  it('should save a new organizer without address', function() {
    eventCrud.createOrganizer.and.returnValue($q.resolve({data: {
      organizerId: '73dbf765-1622-4454-aed9-6c1fe5771568'
    }}));
    var controller = getController();
    $scope.$digest();

    var expecteOrg = {
      website: 'http://google.be',
      name : 'The CooCoo',
      contact: []
    };

    $scope.newOrganizer = {
      website: 'http://google.be',
      name : 'The CooCoo',
      address : {
        streetAddress : '',
        addressLocality : '',
        postalCode: '',
        addressCountry : 'BE'
      },
      contact: []
    };

    $scope.saveOrganizer();

    $scope.$digest();

    expect(eventCrud.createOrganizer).toHaveBeenCalledWith(expecteOrg);
    expect($scope.newOrganizer.id).toEqual('73dbf765-1622-4454-aed9-6c1fe5771568');
    expect($uibModalInstance.close).toHaveBeenCalledWith($scope.newOrganizer);
  });

  it('should not return the new organizer when the save fails', function() {
    eventCrud.createOrganizer.and.returnValue($q.reject());
    var controller = getController();
    $scope.$digest();

    var expecteOrg = {
      website: 'http://google.be',
      name : 'The CooCoo',
      contact: []
    };

    $scope.newOrganizer = {
      website: 'http://google.be',
      name : 'The CooCoo',
      address : {
        streetAddress : '',
        addressLocality : '',
        postalCode: '',
        addressCountry : 'BE'
      },
      contact: []
    };

    $scope.saveOrganizer();

    $scope.$digest();

    expect(eventCrud.createOrganizer).toHaveBeenCalledWith(expecteOrg);
    expect($scope.newOrganizer.id).not.toEqual('73dbf765-1622-4454-aed9-6c1fe5771568');
    expect($uibModalInstance.close).not.toHaveBeenCalled();
  });
});
