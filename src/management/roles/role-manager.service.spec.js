'use strict';

describe('Service: Role Manager', function () {
  var udbApi, jobLogger, BaseJob, $q, service;

  var baseUrl = 'http://example.com/';

  beforeEach(module('udb.core', function ($provide) {
    var appConfig = {
      baseUrl: baseUrl
    };

    $provide.constant('appConfig', appConfig);
  }));

  beforeEach(inject(function ($injector) {
    jobLogger = $injector.get('jobLogger');
    BaseJob = $injector.get('BaseJob');
    $q = $injector.get('$q');
    service = jasmine.createSpyObj('RoleManager', ['find']);
  }));

  it('should return a list of roles for a given query', function () {
    udbApi = jasmine.createSpyObj('udbApi', ['findRoles']);
    var expectedRoles = {
      "itemsPerPage": 10,
      "member": [
        {
          "uuid": "3",
          "name": "test rol 3"
        },
        {
          "uuid": "1",
          "name": "test rol"
        },
        {
          "uuid": "2",
          "name": "test rol 2"
        }
      ],
      "totalItems": "3"
    };
    service.find.and.returnValue(expectedRoles);
    udbApi.findRoles.and.returnValue(expectedRoles);

    //expect(service.find).toHaveBeenCalled();
    //expect(udbApi.findRoles).toHaveBeenCalled();
  });
});