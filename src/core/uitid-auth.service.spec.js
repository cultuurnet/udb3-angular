'use strict';

describe('Service: uitidAuth', function () {

  var $window, $location, $cookies, uitidAuth;
  var appConfig = { authUrl: 'http://google.be/', baseUrl: 'http://culudb-app.dev:8080/' };
  var token = 'blubblub';

  beforeEach(module('udb.core', function ($provide) {
    $provide.constant('appConfig', appConfig);

    $window = {location: {href: jasmine.createSpy()}};
    $provide.value('$window', $window);

    $location = {absUrl: function(){}, search: jasmine.createSpy(), path: jasmine.createSpy()};
    $provide.value('$location', $location);

    $cookies = jasmine.createSpyObj('$cookies', ['get', 'getObject', 'put', 'remove']);
    $provide.provider('$cookies', {
      $get: function () {
        return $cookies;
      }
    });
  }));

  beforeEach(inject(function ($injector) {
    uitidAuth = $injector.get('uitidAuth');
  }));

  it('should set a token', function () {
    uitidAuth.setToken(token);
    expect($cookies.put).toHaveBeenCalledWith('token', token);
  });

  it('should logout a user by removing the right cookies and reseting the location', function () {
    uitidAuth.logout();
    expect($cookies.remove).toHaveBeenCalledWith('token');
    expect($cookies.remove).toHaveBeenCalledWith('user');

  });

  it('should login a user by redirecting to the right url', function () {
    var currentUrl = 'blah';
    spyOn($location, 'absUrl').and.returnValue(currentUrl);

    uitidAuth.login();
    expect($window.location.href).toBe(appConfig.authUrl + 'connect?destination=blah');
  });

  it('should get a user from the cookieStore', function () {
    uitidAuth.getUser();
    expect($cookies.getObject).toHaveBeenCalledWith('user');
  });
});
