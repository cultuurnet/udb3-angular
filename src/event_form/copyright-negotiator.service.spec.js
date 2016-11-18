'use strict';

describe('Service: Copyright negotiator', function () {

  var copyrightNegotiator, $cookies;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function ($injector) {
    $cookies = $injector.get('$cookies');
    spyOn($cookies, 'putObject');
    spyOn($cookies, 'getObject');

    copyrightNegotiator = $injector.get('copyrightNegotiator');
  }));

  it('should remember when the copyright agreement is confirmed', function () {
    copyrightNegotiator.confirm();
    expect($cookies.putObject).toHaveBeenCalled();

    $cookies.getObject.and.returnValue({
      confirmed: true
    });
    expect(copyrightNegotiator.confirmed()).toEqual(true);
  });
});
