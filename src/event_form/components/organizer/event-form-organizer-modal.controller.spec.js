'use strict';

describe('Controller: Event Form Organizer Modal', function() {
  var
    $q,
    $scope,
    $controller,
    $uibModalInstance,
    udbOrganizers,
    organizerName,
    eventCrud,
    organizerForm,
    fakeSearchResult,
    UdbOrganizer;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function($rootScope, _$q_, _$controller_, $injector) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = $rootScope.$new();

    $uibModalInstance = jasmine.createSpyObj('$uibModalInstance', ['close', 'dismiss']);
    udbOrganizers = jasmine.createSpyObj('udbOrganizers', ['findOrganizersWebsite']);
    eventCrud = jasmine.createSpyObj('eventCrud', ['createOrganizer']);
    UdbOrganizer = $injector.get('UdbOrganizer');

    organizerName = 'The organizers';
    organizerForm = {
      website: {
        $valid: true
      }
    };

    fakeSearchResult = {
      itemsPerPage: 30,
      totalItems: 3562,
      member: [
        {
          '@id': '1234567890987654321',
          name: 'STUK2',
          address: {
            addressCountry: 'BE',
            addressLocality: 'Leuven',
            postalCode: 3000,
            streetAddress: 'Sluisstraat 79'
          },
          contactPoint: {
            url: [
              'http://google.be'
            ],
            email: [
              'joske@2dotstwice.be'
            ],
            phone: [
              '0123456789'
            ]
          },
          creator: 'evenementen@stad.diksmuide.be',
          created: '2015-05-07T12:02:53+00:00',
          modified: '2015-05-07T12:02:53+00:00',
          url: 'http://www.stuk.be/',
          labels: [
              '80f63f49-5de2-42ea-9642-59fc0400f2c5',
              'Mijn label'
          ],
          hiddenLabes: [
              'UiTPAS Gent'
          ]
        }
      ]
    };
  }));

  function getController() {
    return $controller(
      'EventFormOrganizerModalController', {
        $scope: $scope,
        $uibModalInstance: $uibModalInstance,
        $q: $q,
        udbOrganizers: udbOrganizers,
        UdbOrganizer: UdbOrganizer,
        organizerName: organizerName ,
        eventCrud: eventCrud
      }
    );
  }

  it('should just close the modal on cancel', function() {
    getController();
    $scope.$digest();

    $scope.cancel();

    expect($uibModalInstance.dismiss).toHaveBeenCalled();
  });

  it('should validate the website and throw an error when the form is not valid', function() {
    getController();
    $scope.organizerForm = organizerForm;
    organizerForm.website.$valid = false;

    $scope.validateWebsite();

    expect($scope.showWebsiteValidation).toBeFalsy();
  });

  it ('should validate the website when the given website is used by another organizer', function () {
    getController();

    $scope.newOrganizer = {
      website: 'http://google.be',
      name: 'The CooCoo'
    };
    $scope.organizerForm = organizerForm;
    udbOrganizers.findOrganizersWebsite.and.returnValue($q.resolve(fakeSearchResult));

    $scope.validateWebsite();
    $scope.$digest();

    expect(udbOrganizers.findOrganizersWebsite).toHaveBeenCalledWith($scope.newOrganizer.website);
    expect($scope.organizersWebsiteFound).toBeTruthy();
    expect($scope.showWebsiteValidation).toBeFalsy();
    expect($scope.disableSubmit).toBeTruthy();
  });

  it ('should validate the website when the given website isn\'t used by another organizer', function () {
    getController();

    $scope.newOrganizer = {
      website: 'http://google.be',
      name: 'The CooCoo'
    };
    $scope.organizerForm = organizerForm;
    fakeSearchResult.totalItems = 0;
    udbOrganizers.findOrganizersWebsite.and.returnValue($q.resolve(fakeSearchResult));

    $scope.validateWebsite();
    $scope.$digest();

    expect(udbOrganizers.findOrganizersWebsite).toHaveBeenCalledWith($scope.newOrganizer.website);
    expect($scope.organizersWebsiteFound).toBeFalsy();
    expect($scope.showWebsiteValidation).toBeFalsy();
  });

  it ('should fail in validating the website', function () {
    getController();

    $scope.newOrganizer = {
      website: 'http://google.be',
      name: 'The CooCoo'
    };
    $scope.organizerForm = organizerForm;
    udbOrganizers.findOrganizersWebsite.and.returnValue($q.reject());

    $scope.validateWebsite();
    $scope.$digest();

    expect(udbOrganizers.findOrganizersWebsite).toHaveBeenCalledWith($scope.newOrganizer.website);
    expect($scope.websiteError).toBeTruthy();
    expect($scope.showWebsiteValidation).toBeFalsy();
  });

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

  it('should validate the organizer\'s address', function() {
    getController();
    $scope.validateAddress(false);

    expect($scope.addressError).toBeFalsy();
  });

  it('should validate the organizer\'s contact info', function() {
    getController();
    $scope.validateContact(false);

    expect($scope.contactError).toBeFalsy();
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
