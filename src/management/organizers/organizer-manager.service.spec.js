'use strict';

describe('Service: Organizer manager Service', function () {
  var udbApi, jobLogger, BaseJob, service,
      $scope, $q, fakeOrganizer, organizerId, labelId;

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

    jobLogger = jasmine.createSpyObj('jobLogger', ['addJob']);


    $provide.provider('jobLogger', {
      $get: function () {
        return jobLogger;
      }
    })
  }));

  beforeEach(inject(function (OrganizerManager, _$rootScope_, _$q_, _BaseJob_) {
    service = OrganizerManager;
    $scope = _$rootScope_.$new();
    $q = _$q_;
    BaseJob = _BaseJob_;
  }));

  it('should delete an organizer', function (done) {
    var expectedCommandId = {
      commandId: 'c75003dd-cc77-4424-a186-66aa4abd917f'
    };
    udbApi.deleteOrganization.and.returnValue($q.resolve(expectedCommandId));

    function deleteOrganizerResult (job) {
      expect(udbApi.deleteOrganization).toHaveBeenCalledWith(fakeOrganizer);
      expect(job.id).toEqual(expectedCommandId.commandId);
      done();
    }

    service
        .delete(fakeOrganizer)
        .then(deleteOrganizerResult);

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
    var expectedCommandId = {
      commandId: 'c75003dd-cc77-4424-a186-66aa4abd917f'
    };

    udbApi.addLabelToOrganizer.and.returnValue($q.resolve(expectedCommandId));

    function assertOrganizerResult (job) {
      expect(udbApi.addLabelToOrganizer).toHaveBeenCalledWith(organizerId, labelId);
      expect(job.id).toEqual(expectedCommandId.commandId);
      done();
    }

    service
      .addLabelToOrganizer(organizerId, labelId)
      .then(assertOrganizerResult);

    $scope.$apply();
  });

  it('should remove a label from an organizer', function (done) {
    var expectedCommandId = {
      commandId: 'c75003dd-cc77-4424-a186-66aa4abd917f'
    };

    udbApi.deleteLabelFromOrganizer.and.returnValue($q.resolve(expectedCommandId));

    function assertOrganizerResult (job) {
      expect(udbApi.deleteLabelFromOrganizer).toHaveBeenCalledWith(organizerId, labelId);
      expect(job.id).toEqual(expectedCommandId.commandId);
      done();
    }

    service
      .deleteLabelFromOrganizer(organizerId, labelId)
      .then(assertOrganizerResult);

    $scope.$apply();
  });

  it('should remove an organizer from the cache', function (done) {
    var expectedCommandId = {
      commandId: 'c75003dd-cc77-4424-a186-66aa4abd917f'
    };
    udbApi.removeItemFromCache.and.returnValue($q.resolve(expectedCommandId));

    service
      .removeOrganizerFromCache(organizerId)
      .then(function () {
        expect(udbApi.removeItemFromCache).toHaveBeenCalledWith(organizerId);
        done();
      });

    $scope.$apply();
  });

  it('should update an organizer\'s website', function (done) {
    var expectedCommandId = {
      commandId: 'c75003dd-cc77-4424-a186-66aa4abd917f'
    };
    udbApi.updateOrganizerWebsite.and.returnValue($q.resolve(expectedCommandId));

    function assertOrganizerResult (job) {
      expect(udbApi.updateOrganizerWebsite).toHaveBeenCalledWith(organizerId, 'http://google.be');
      expect(job.id).toEqual(expectedCommandId.commandId);
      done();
    }

    service
        .updateOrganizerWebsite(organizerId, 'http://google.be')
        .then(assertOrganizerResult);

    $scope.$apply();
  });

  it('should update an organizer\'s name', function (done) {
    var expectedCommandId = {
      commandId: 'c75003dd-cc77-4424-a186-66aa4abd917f'
    };
    udbApi.updateOrganizerName.and.returnValue($q.resolve(expectedCommandId));

    function assertOrganizerResult (job) {
      expect(udbApi.updateOrganizerName).toHaveBeenCalledWith(organizerId, 'blaaaaah');
      expect(job.id).toEqual(expectedCommandId.commandId);
      done();
    }

    service
        .updateOrganizerName(organizerId, 'blaaaaah')
        .then(assertOrganizerResult);

    $scope.$apply();
  });

  it('should update an organizer\'s address', function (done) {
    var expectedCommandId = {
      commandId: 'c75003dd-cc77-4424-a186-66aa4abd917f'
    };

    var address = {
      "addressCountry": "BE",
      "addressLocality": "Leuven",
      "postalCode": 3000,
      "streetAddress": "Sluisstraat 79"
    };

    udbApi.updateOrganizerAddress.and.returnValue($q.resolve(expectedCommandId));

    function assertOrganizerResult (job) {
      expect(udbApi.updateOrganizerAddress).toHaveBeenCalledWith(organizerId, address);
      expect(job.id).toEqual(expectedCommandId.commandId);
      done();
    }

    service
        .updateOrganizerAddress(organizerId, address)
        .then(assertOrganizerResult);

    $scope.$apply();
  });

  it('should update an organizer\'s contact info', function (done) {
    var expectedCommandId = {
      commandId: 'c75003dd-cc77-4424-a186-66aa4abd917f'
    };

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

    udbApi.updateOrganizerContact.and.returnValue($q.resolve(expectedCommandId));

    function assertOrganizerResult (job) {
      expect(udbApi.updateOrganizerContact).toHaveBeenCalledWith(organizerId, contactPoint);
      expect(job.id).toEqual(expectedCommandId.commandId);
      done();
    }

    service
        .updateOrganizerContact(organizerId, contactPoint)
        .then(assertOrganizerResult);

    $scope.$apply();
  });
});