'use strict';

describe('Service: UDB3 Uitpas Api', function () {

  var $httpBackend, $scope, service, uitidAuth;

  var appConfig = {
    uitpasUrl: 'http://uit.pas/'
  };

  beforeEach(module('udb.core', function ($provide) {
    uitidAuth = jasmine.createSpyObj('uitidAuth', ['getUser', 'getToken']);

    $provide.constant('appConfig', appConfig);

    $provide.provider('uitidAuth', {
      $get: function () {
        return uitidAuth;
      }
    });
  }));

  beforeEach(inject(function (_$httpBackend_, udbUitpasApi, $rootScope) {
    $httpBackend = _$httpBackend_;
    service = udbUitpasApi;
    $scope = $rootScope.$new();
  }));

  it('should find the Uitpas data for a given event', function (done) {
    var response = {};
    var cdbid = '0823f57e-a6bd-450a-b4f5-8459b4b11043';

    $httpBackend
      .expectGET('http://uit.pas/events/' + cdbid + '/distributionKeys/')
      .respond(JSON.stringify(response));

    service
      .getEventUitpasData(cdbid)
      .then(done);

    $httpBackend.flush();
  });

  it('should update the Uitpas data of a given event', function (done) {
    var response = {};
    var cdbid = '0823f57e-a6bd-450a-b4f5-8459b4b11043';

    $httpBackend
      .expectPUT('http://uit.pas/events/' + cdbid + '/distributionKeys/')
      .respond(JSON.stringify(response));

    service
      .updateEventUitpasData([], cdbid)
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