'use strict';

describe('Component: Organizer Contact', function() {
  var $scope, $componentController, component, fakeContact, organizerContactWrapper;


  beforeEach(module('udb.event-form'));

  beforeEach(inject(function ($rootScope, _$componentController_) {
    $scope = $rootScope.$new();
    $componentController = _$componentController_;

    fakeContact = [
      {
        type: 'url',
        value: 'http://google.be'
      },
      {
        type: 'email',
        value: 'joske@2dotstwice.be'
      },
      {
        type: 'phone',
        value: '0123456789'
      }
    ];

    organizerContactWrapper = {
      $invalid: false
    }
  }));

  function sendUpdateMock(contact, error) {
    contact = typeof contact !== 'undefined' ? contact : fakeContact;
    error = typeof error !== 'undefined' ? error : false;
    return {contact: contact, error: error};
  }

  function getComponent() {
    return $componentController(
        'udbOrganizerContact',
        {$scope: $scope},
        {contact: fakeContact}
    );
  }

  it('should initialize the component', function () {
    component = getComponent();
    component.organizerContactWrapper = organizerContactWrapper;
    expect(component.contactHasErrors).toBeFalsy();
  });

  it('should validate the contact info', function () {
    component = getComponent();
    component.onUpdate = function() {
      sendUpdateMock();
    };
    component.organizerContactWrapper = organizerContactWrapper;
    component.validateContact();

    expect(component.contactHasErrors).toBeFalsy();
  });

  it('should validate the contact info and send an error when not valid', function () {
    component = getComponent();
    component.contact.push({
      type: 'phone',
      value: ''
    });
    component.onUpdate = function() {
      sendUpdateMock();
    };

    component.validateContact();

    expect(component.contactHasErrors).toBeTruthy();
  });

  it('should delete a contact item from the contact array', function () {
    var expectedContact = [
      {
        type: 'url',
        value: 'http://google.be'
      },
      {
        type: 'email',
        value: 'joske@2dotstwice.be'
      }
    ];

    component = getComponent();
    component.onUpdate = function() {
      sendUpdateMock();
    };
    component.organizerContactWrapper = organizerContactWrapper;
    component.deleteOrganizerContactInfo(2);

    expect(component.contact).toEqual(expectedContact);
  });

  it('should add an item to the contact array', function () {
    var expectedContact = [
      {
        type: 'url',
        value: 'http://google.be'
      },
      {
        type: 'email',
        value: 'joske@2dotstwice.be'
      },
      {
        type: 'phone',
        value: '0123456789'
      },
      {
        type: 'phone',
        value: ''
      }
    ];

    component = getComponent();
    component.onUpdate = function() {
      sendUpdateMock();
    };
    component.organizerContactWrapper = organizerContactWrapper;
    component.addOrganizerContactEntry('phone');
    component.addOrganizerContactInfo();
    expect(component.contact).toEqual(expectedContact);
  });

});
