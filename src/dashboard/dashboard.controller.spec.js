'use strict';

describe('Controller: Dashboard', function () {
  var $controller, $scope, $q, udbApi, $state;
  var appConfig =  {
    "offerEditor": {
      "defaultPublicationDate": "2017-08-01"
    }
  };
  var pagedDashboardItems = {
    '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
    '@type': 'PagedCollection',
    'itemsPerPage': 50,
    'totalItems': 19,
    'member': [
      {
        '@id': 'http://culudb-silex.dev:8080/event/316f4b6c-0908-45df-a5cd-42ea7a2506ca',
        '@type': 'Event'
      },
      {
        '@id': 'http://culudb-silex.dev:8080/place/a5924dc0-e06a-4450-8151-cae5486ed4d7',
        '@type': 'Place'
      }
    ],
    'firstPage': 'http://culudb-silex.dev:8080/dashboard/items?page=1',
    'lastPage': 'http://culudb-silex.dev:8080/dashboard/items?page=1',
    'nextPage': 'http://culudb-silex.dev:8080/dashboard/items?page=1'
  };

  var pagedDashboardOrganizers = {
    '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
    '@type': 'PagedCollection',
    'itemsPerPage': 50,
    'totalItems': 19,
    'member': [
      {
        '@id': 'http://culudb-silex.dev:8080/event/316f4b6c-0908-45df-a5cd-42ea7a2506ca',
        '@type': 'Organizer'
      },
      {
        '@id': 'http://culudb-silex.dev:8080/place/a5924dc0-e06a-4450-8151-cae5486ed4d7',
        '@type': 'Organizer'
      }
    ],
    'firstPage': 'http://culudb-silex.dev:8080/dashboard/items?page=1',
    'lastPage': 'http://culudb-silex.dev:8080/dashboard/items?page=1',
    'nextPage': 'http://culudb-silex.dev:8080/dashboard/items?page=1'
  };
  /** @type {UiTIDUser} */
  var activeUser = {
    id: '0075baee-344b-4bee-87de-baa123a458d5',
    nick: 'dirk',
    uuid: '0075baee-344b-4bee-87de-baa123a458d5',
    username: 'dirk',
    email: 'dirk@dirk.com'
  };

  beforeEach(module('udb.core'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = $rootScope;
    udbApi = jasmine.createSpyObj('udbApi', ['getMe', 'getDashboardItems', 'getDashboardOrganizers']);
    $state = jasmine.createSpyObj('$state', ['go']);
  }));

  function getController(activeUser, dashboardItems, dashboardOrganizers) {
    udbApi.getDashboardItems.and.returnValue($q.resolve(dashboardItems));
    udbApi.getMe.and.returnValue($q.resolve(activeUser));

    udbApi.getDashboardOrganizers.and.returnValue($q.resolve(dashboardOrganizers));

    return $controller('DashboardController', {
      '$document': jasmine.createSpyObj('$document', ['scrollTop']),
      'udbApi': udbApi,
      'appConfig': appConfig,
      '$state': $state
    });
  }

  it('should greet the active user when the dashboard loads', function () {
    var controller = getController(activeUser, [], []);
    $scope.$digest();

    expect(controller.username).toEqual('dirk');
  });

  it('should load the first page of items and organizers when the dashboard loads', function () {
    var expectedItems = [
      {
        '@id': 'http://culudb-silex.dev:8080/event/316f4b6c-0908-45df-a5cd-42ea7a2506ca',
        '@type': 'Event'
      },
      {
        '@id': 'http://culudb-silex.dev:8080/place/a5924dc0-e06a-4450-8151-cae5486ed4d7',
        '@type': 'Place'
      }
    ];

    var expectedOrganizers = [
      {
        '@id': 'http://culudb-silex.dev:8080/event/316f4b6c-0908-45df-a5cd-42ea7a2506ca',
        '@type': 'Organizer'
      },
      {
        '@id': 'http://culudb-silex.dev:8080/place/a5924dc0-e06a-4450-8151-cae5486ed4d7',
        '@type': 'Organizer'
      }
    ];

    var controller = getController(activeUser, pagedDashboardItems, pagedDashboardOrganizers);
    $scope.$digest();

    expect(controller.pagedItemViewer.events).toEqual(expectedItems);
    expect(controller.pagedItemViewerOrganizers.events).toEqual(expectedOrganizers);
  });

  it('should hide the publicationdate if a default is set', function () {
    var controller = getController(activeUser, pagedDashboardItems, pagedDashboardOrganizers);
    $scope.$digest();
    expect(controller.hideOnlineDate).toBeTruthy();
  });

  it('should show the publicationdate if the default date is empty', function () {
    appConfig.offerEditor.defaultPublicationDate = '';
    var controller = getController(activeUser, pagedDashboardItems, pagedDashboardOrganizers);
    $scope.$digest();
    expect(controller.hideOnlineDate).toBeFalsy();
  });

});
