'use strict';

describe('Service: Organizer manager Service', function () {
  var udbApi, jobLogger, BaseJob, service, $scope, $q, fakeOrganizer, organizerId, labelId;

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
      'removeItemFromCache'
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
    udbApi.removeItemFromCache.and.callThrough().and.callFake(done);

    service
      .removeOrganizerFromCache(organizerId)
      .then(function () {
        expect(udbApi.removeItemFromCache).toHaveBeenCalledWith(organizerId);
      });

    $scope.$apply();
  });
});