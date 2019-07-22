'use strict';

describe('Service: Organizer manager Service', function () {
  var udbApi, service, $scope, $q, fakeOrganizer, organizerId, labelId;

  organizerId = '0823f57e-a6bd-450a-b4f5-8459b4b11043';
  labelId = '80f63f49-5de2-42ea-9642-59fc0400f2c5';

  fakeOrganizer = {
    "name": "STUK",
    "address": {
      "addressCountry": "BE",
      "addressLocality": "Leuven",
      "postalCode": 3000,
      "streetAddress": "Sluisstraat 79"
    },
    "contactPoint": {
      "url": [
        "http://google.be"
      ],
      "email": [
        "joske@2dotstwice.be"
      ],
      "phone": [
        "0123456789"
      ]
    },
    "creator": "evenementen@stad.diksmuide.be",
    "created": "2015-05-07T12:02:53+00:00",
    "modified": "2015-05-07T12:02:53+00:00",
    "url": "http://www.stuk.be/",
    "labels": [
      {
        "uuid": "80f63f49-5de2-42ea-9642-59fc0400f2c5",
        "name": "Mijn label"
      }
    ]
  };

  beforeEach(module('udb.core', function ($provide) {
    var appConfig = {
      baseUrl: 'http://example.com/'
    };

    $provide.constant('appConfig', appConfig);

    udbApi = jasmine.createSpyObj('udbApi', [
      'getOrganizerById',
      'addLabelToOrganizer',
      'deleteLabelFromOrganizer',
      'removeItemFromCache',
      'deleteOrganization',
      'findOrganisations',
      'updateOrganizerWebsite',
      'updateOrganizerName',
      'updateOrganizerAddress',
      'updateOrganizerContact'
    ]);
    udbApi.mainLanguage = 'nl';

    $provide.provider('udbApi', {
      $get: function () {
        return udbApi;
      }
    });
  }));

  beforeEach(inject(function (OrganizerManager, _$rootScope_, _$q_) {
    service = OrganizerManager;
    $scope = _$rootScope_.$new();
    $q = _$q_;
  }));

  it('should delete an organizer', function (done) {
    udbApi.deleteOrganization.and.returnValue();

    service
        .delete(fakeOrganizer);

    expect(udbApi.deleteOrganization).toHaveBeenCalledWith(fakeOrganizer);
    done();

    $scope.$apply();
  });

  it('should find an organizer by a given query', function (done) {
    var expectedSearchResult = {
      "itemsPerPage": 30,
      "totalItems": 3562,
      "member": [
        {
          "name": "STUK",
          "address": {
            "addressCountry": "BE",
            "addressLocality": "Leuven",
            "postalCode": 3000,
            "streetAddress": "Sluisstraat 79"
          },
          "contactPoint": {
            "url": [
              "http://google.be"
            ],
            "email": [
              "joske@2dotstwice.be"
            ],
            "phone": [
              "0123456789"
            ]
          },
          "creator": "evenementen@stad.diksmuide.be",
          "created": "2015-05-07T12:02:53+00:00",
          "modified": "2015-05-07T12:02:53+00:00",
          "url": "http://www.stuk.be/",
          "labels": [
            {
              "uuid": "80f63f49-5de2-42ea-9642-59fc0400f2c5",
              "name": "Mijn label"
            }
          ]
        }
      ]
    };

    udbApi.findOrganisations.and.returnValue($q.resolve(expectedSearchResult));

    function assertOrganizerFindResult (result) {
      expect(udbApi.findOrganisations).toHaveBeenCalled();
      expect(result).toEqual(expectedSearchResult);
      done();
    }

    service
        .find('blub', 0, 20)
        .then(assertOrganizerFindResult);

    $scope.$apply();
  });

  it('should get an organizer by a given ID', function (done) {
    udbApi.getOrganizerById.and.returnValue($q.resolve(fakeOrganizer));

    function assertOrganizerResult (result) {
      expect(udbApi.getOrganizerById).toHaveBeenCalled();
      expect(result).toEqual(fakeOrganizer);
      done();
    }

    service
      .get(organizerId)
      .then(assertOrganizerResult);

    $scope.$apply();
  });

  it('should add a label to an organizer', function (done) {
    udbApi.addLabelToOrganizer.and.returnValue($q.resolve());

    function assertAPICall() {
      expect(udbApi.addLabelToOrganizer).toHaveBeenCalledWith(organizerId, labelId);
      done();
    }

    service
      .addLabelToOrganizer(organizerId, labelId)
      .then(assertAPICall);

    $scope.$apply();
  });

  it('should remove a label from an organizer', function (done) {
    udbApi.deleteLabelFromOrganizer.and.returnValue($q.resolve());

    function assertAPICall() {
      expect(udbApi.deleteLabelFromOrganizer).toHaveBeenCalledWith(organizerId, labelId);
      done();
    }

    service
      .deleteLabelFromOrganizer(organizerId, labelId)
      .then(assertAPICall);

    $scope.$apply();
  });

  it('should remove an organizer from the cache', function (done) {
    udbApi.removeItemFromCache.and.returnValue($q.resolve());

    service
      .removeOrganizerFromCache(organizerId)
      .then(function () {
        expect(udbApi.removeItemFromCache).toHaveBeenCalledWith(organizerId);
        done();
      });

    $scope.$apply();
  });

  it('should update an organizer\'s website', function (done) {
    udbApi.updateOrganizerWebsite.and.returnValue($q.resolve());

    function assertAPICall() {
      expect(udbApi.updateOrganizerWebsite).toHaveBeenCalledWith(organizerId, 'http://google.be');
      done();
    }

    service
        .updateOrganizerWebsite(organizerId, 'http://google.be')
        .then(assertAPICall);

    $scope.$apply();
  });

  it('should update an organizer\'s name', function (done) {
    udbApi.updateOrganizerName.and.returnValue($q.resolve());

    function assertAPICall() {
      expect(udbApi.updateOrganizerName).toHaveBeenCalledWith(organizerId, 'blaaaaah', 'nl');
      done();
    }

    service
        .updateOrganizerName(organizerId, 'blaaaaah', 'nl')
        .then(assertAPICall);

    $scope.$apply();
  });

  it('should update an organizer\'s address', function (done) {
    var address = {
      "addressCountry": "BE",
      "addressLocality": "Leuven",
      "postalCode": 3000,
      "streetAddress": "Sluisstraat 79"
    };

    udbApi.updateOrganizerAddress.and.returnValue($q.resolve());

    function assertAPICall() {
      expect(udbApi.updateOrganizerAddress).toHaveBeenCalledWith(organizerId, address, 'nl');
      done();
    }

    service
        .updateOrganizerAddress(organizerId, address, 'nl')
        .then(assertAPICall);

    $scope.$apply();
  });

  it('should update an organizer\'s contact info', function (done) {
    var contactPoint = {
      "url": [
        "http://google.be"
      ],
      "email": [
        "joske@2dotstwice.be"
      ],
      "phone": [
        "0123456789"
      ]
    };

    var language = 'nl';

    udbApi.updateOrganizerContact.and.returnValue($q.resolve());

    function assertAPICall() {
      expect(udbApi.updateOrganizerContact).toHaveBeenCalledWith(organizerId, contactPoint, language);
      done();
    }

    service
        .updateOrganizerContact(organizerId, contactPoint, language)
        .then(assertAPICall);

    $scope.$apply();
  });
});
