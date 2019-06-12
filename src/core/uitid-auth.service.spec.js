'use strict';

describe('Service: uitidAuth', function () {

  var $window, $location, $cookies, jwtHelper, uitidAuth;
  var appConfig = { authUrl: 'http://google.be/', baseUrl: 'http://culudb-app.dev:8080/' };

  // uid: C88F3BF5-B456-41D0-923E-D2137BE93A99
  // nick: test
  // email: test@test.com
  // iss: http://culudb-jwt-provider.dev
  // iat: 1560339749
  // exp: 1560343349
  // nbf: 1560339749
  // signature keys: same as dev environments
  var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9jdWx1ZGItand0LXByb3ZpZGVyLmRldiIsInVpZCI6IjZFOTE1RjRGLThFRTctNDczOS04Mzg1LUEwNjI3QkNGNDhDQiIsIm5pY2siOiJ0ZXN0IiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwiaWF0IjoxNTYwMzM5NzQ5LCJleHAiOjE1NjAzNDMzNDksIm5iZiI6MTU2MDMzOTc0OX0.qWYtN19T8yBsBcCAIHB8lnj5kri9hCBFIMeMAuYRFsoxC5BAYKgSvHWTEwrCWGJD8Af2hjVxlFjvUBvGt97XBdMh_-BxUMRategXeGAhIYweO3ES4q9sHB-bcgw9cTEg8XchMPftqIzKr3m23vyJSH6FQnACswMQQ9-8og_wE2DMCHuGFhBW8atIsAYt9hSMLg0UvNeKTikRLQCCPl5bZWa9be7I4LS7TgqSPPJA6Yq0vMqMciZV2_b7OkQjx9QTUk4C6rDhsiOWM3o1PUzus-KK0g67GT_fiALR5W6gJ8JJCf9HVrEoivis6YOsWBE_sP_cBGmN9-fzprSJkrQ-eQ';

  beforeEach(module('udb.core', function ($provide) {
    $provide.constant('appConfig', appConfig);

    $window = {location: {href: jasmine.createSpy()}};
    $provide.value('$window', $window);

    $location = {
      absUrl: function(){},
      search: jasmine.createSpy(),
      path: jasmine.createSpy(),
      protocol: function() {return 'http'},
      port: function() {return 80},
      host: function() {return 'auth.uitdatabank.be'}
    };
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
    jwtHelper = $injector.get('jwtHelper');
  }));

  it('should set a token', function () {
    uitidAuth.setToken(token);
    expect($cookies.put).toHaveBeenCalledWith('token', token);
  });

  it('should logout a user by removing the right cookies and redirecting to the logout page', function () {
    var expectedLogoutUrl = 'http://google.be/logout?destination=http%3A%2F%2Fauth.uitdatabank.be';

    uitidAuth.logout();

    expect($cookies.remove).toHaveBeenCalledWith('token');
    expect($cookies.remove).toHaveBeenCalledWith('user');
    expect($window.location.href).toBe(expectedLogoutUrl);
  });

  it('should login a user by redirecting to the right url', function () {
    var currentUrl = 'blah';
    spyOn($location, 'absUrl').and.returnValue(currentUrl);

    uitidAuth.login('nl');
    expect($window.location.href).toBe(appConfig.authUrl + 'connect?destination=blah&lang=nl');
  });

  it('should get a user from the cookieStore', function () {
    uitidAuth.getUser();
    expect($cookies.getObject).toHaveBeenCalledWith('user');
  });

  it('should decode the current user\'s token data', function () {
    var data = uitidAuth.getTokenData();
    expect(data.uid).toEqual('C88F3BF5-B456-41D0-923E-D2137BE93A99');
    expect(data.nick).toEqual('test');
    expect(data.email).toEqual('test@test.com');
  });
});
