'use strict';

describe('Component: Organizer Contact', function() {
  var
    $scope,
    $componentController,
    component,
    fakeContact,
    organizerContactWrapper;

  var appConfig =  {
      "offerEditor": {
        "urlRegex": "^(?:(?:(?:https?|ftp):)?\\/\\/)(?:\\S+(?::\\S*)?@)?(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z0-9\\u00a1-\\uffff][a-z0-9\\u00a1-\\uffff_-]{0,62})?[a-z0-9\\u00a1-\\uffff]\\.)+(?:[a-z\\u00a1-\\uffff]{2,}\\.?))(?::\\d{2,5})?(?:[/?#]\\S*)?$"
      }
    };


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


  it('should verify if contact url is valid according to the regex', function(){
    var regexp = new RegExp(appConfig.offerEditor.urlRegex);
    var mockUrls= MockData.urls;
    var mockUrlsLength = mockUrls.length;
    for (var i = 0; i < mockUrlsLength; i++) {
      expect(regexp.test(mockUrls[i].url)).toEqual(mockUrls[i].valid);
    }
  })


});
