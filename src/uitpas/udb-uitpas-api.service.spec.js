'use strict';

describe('Service: UDB3 Uitpas Api', function () {

  var $httpBackend, $scope, $timeout, service, uitidAuth;

  var appConfig = {
    uitpasUrl: 'http://uit.pas/'
  };

  beforeEach(module('udb.core', function ($provide) {
    uitidAuth = jasmine.createSpyObj('uitidAuth', ['getUser', 'getToken']);
    $timeout = function (callable) {
      return callable();
    };

    $provide.constant('appConfig', appConfig);

    $provide.provider('uitidAuth', {
      $get: function () {
        return uitidAuth;
      }
    });

    $provide.provider('$timeout', {
      $get: function () {
        return $timeout;
      }
    });
  }));

  beforeEach(inject(function (_$httpBackend_, udbUitpasApi, $rootScope) {
    $httpBackend = _$httpBackend_;
    service = udbUitpasApi;
    $scope = $rootScope.$new();
  }));

  it('should return the active card systems of an event', function (done) {
    var response = [{
      id: 'D0AB7BED-4073-4566-B984-BD48D7B016FE',
      name: 'test system',
      distributionKeys: [
        {
          id: 'E9249FA2-F9CC-4140-976A-BE49D869291F',
          name: 'test key'
        }
      ]
    }];
    var cdbid = '0823f57e-a6bd-450a-b4f5-8459b4b11043';

    $httpBackend
      .expectGET('http://uit.pas/events/' + cdbid + '/cardSystems/')
      .respond(JSON.stringify(response));

    service
      .getEventCardSystems(cdbid)
      .then(done);

    $httpBackend.flush();
  });

  it('should poke UiTPAS a few times until the card systems of an event return', function (done) {
    var response = [{
      id: 'D0AB7BED-4073-4566-B984-BD48D7B016FE',
      name: 'test system',
      distributionKeys: [
        {
          id: 'E9249FA2-F9CC-4140-976A-BE49D869291F',
          name: 'test key'
        }
      ]
    }];
    var cdbid = '0823f57e-a6bd-450a-b4f5-8459b4b11043';

    $httpBackend
      .expectGET('http://uit.pas/events/' + cdbid + '/cardSystems/')
      .respond(404, 'unknown event');

    $httpBackend
      .expectGET('http://uit.pas/events/' + cdbid + '/cardSystems/')
      .respond(404, 'unknown event');

    $httpBackend
      .expectGET('http://uit.pas/events/' + cdbid + '/cardSystems/')
      .respond(JSON.stringify(response));

    service
      .getEventCardSystems(cdbid)
      .then(function (cardSystems) {
        expect(cardSystems.length).toEqual(1);
        done();
      });

    $httpBackend.flush();
  });

  it('should return an empty collection when UiTPAS repeatedly fails to return the card systems for an event', function (done) {
    var cdbid = '0823f57e-a6bd-450a-b4f5-8459b4b11043';

    function expectCardSystemsRequest() {
      $httpBackend
        .expectGET('http://uit.pas/events/' + cdbid + '/cardSystems/')
        .respond(404, 'unknown event');
    }

    function assertEmptyCollection(cardSystems) {
      expect(cardSystems).toEqual([]);
      done();
    }

    _.times(5, expectCardSystemsRequest);

    service.getEventCardSystems(cdbid).then(assertEmptyCollection);

    $httpBackend.flush();
  });

  it('should add a card system to an event by card system id', function (done) {
    var response = {};
    var eventId = '0823f57e-a6bd-450a-b4f5-8459b4b11043';
    var cardSystemId = '981CDA4F-2E98-4055-AF5E-D9F4EE5B5C31';    

    $httpBackend
      .expectPUT('http://uit.pas/events/' + eventId + '/cardSystems/' + cardSystemId)
      .respond(JSON.stringify(response));

    service
      .addEventCardSystem(eventId, cardSystemId)
      .then(done);

    $httpBackend.flush();
  });

  it('should add a card system to an event by distribution key id', function (done) {
    var response = {};
    var eventId = '0823f57e-a6bd-450a-b4f5-8459b4b11043';
    var cardSystemId = '981CDA4F-2E98-4055-AF5E-D9F4EE5B5C31';
    var distributionKeyId = '7A135EF8-F47B-4EDC-BB1C-143C58541752';

    $httpBackend
      .expectPUT('http://uit.pas/events/' + eventId + '/cardSystems/' + cardSystemId + '/' + distributionKeyId)
      .respond(JSON.stringify(response));

    service
      .addEventCardSystemDistributionKey(eventId, cardSystemId, distributionKeyId)
      .then(done);

    $httpBackend.flush();
  });
  
  it('should remove a card system from an event by card system id', function (done) {
    var response = {};
    var eventId = '0823f57e-a6bd-450a-b4f5-8459b4b11043';
    var cardSystemId = '981CDA4F-2E98-4055-AF5E-D9F4EE5B5C31';    

    $httpBackend
      .expectDELETE('http://uit.pas/events/' + eventId + '/cardSystems/' + cardSystemId)
      .respond(JSON.stringify(response));

    service
      .removeEventCardSystem(eventId, cardSystemId)
      .then(done);

    $httpBackend.flush();
  });

  it('should get all the cardsystems of a given organizer', function (done) {
    var response = {};
    var organizerId = '0823f57e-a6bd-450a-b4f5-8459b4b11043';

    $httpBackend
      .expectGET('http://uit.pas/organizers/' + organizerId + '/cardSystems/')
      .respond(JSON.stringify(response));

    service
      .findOrganisationsCardSystems(organizerId)
      .then(done);

    $httpBackend.flush();
  });
});