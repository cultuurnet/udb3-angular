'use strict'

describe('Controller: Dashboard', function () {
  var $controller, $scope, $q, udbApi;
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
      },
    ],
    'firstPage': 'http://culudb-silex.dev:8080/dashboard/items?page=1',
    'lastPage': 'http://culudb-silex.dev:8080/dashboard/items?page=1',
    'nextPage': 'http://culudb-silex.dev:8080/dashboard/items?page=1'
  }
  /** @type {UiTIDUser} */
  var activeUser = {
    id: '0075baee-344b-4bee-87de-baa123a458d5',
    nick: 'dirk',
    mbox: 'dirk@dirk.me',
    givenName: 'Dirk Dirkington'
  }

  beforeEach(module('udb.core'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = $rootScope.$new();
    udbApi = jasmine.createSpyObj('udbApi', ['getMe', 'getDashboardItems']);
  }));

  function getController(activeUser, dashboardItems) {
    udbApi.getDashboardItems.and.returnValue($q.resolve(dashboardItems));

    udbApi.getMe.and.returnValue($q.resolve(activeUser))

    return $controller('DashboardController', {
      '$scope': $scope,
      'udbApi': udbApi
    });
  }

  it('should greet the active user when the dashboard loads', function () {
    var controller = getController(activeUser, []);
    $scope.$digest();

    expect(controller.username).toEqual('dirk');
  });

  it('should load the first page of items when the dashboard loads', function () {
    var expectedItems = [
      {
        '@id': 'http://culudb-silex.dev:8080/event/316f4b6c-0908-45df-a5cd-42ea7a2506ca',
        '@type': 'Event'
      },
      {
        '@id': 'http://culudb-silex.dev:8080/place/a5924dc0-e06a-4450-8151-cae5486ed4d7',
        '@type': 'Place'
      },
    ];
    var controller = getController(activeUser, pagedDashboardItems);
    $scope.$digest();

    expect(controller.pagedItemViewer.events).toEqual(expectedItems);
  })

});
