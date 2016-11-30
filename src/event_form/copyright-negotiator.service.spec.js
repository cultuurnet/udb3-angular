'use strict';

describe('Service: Copyright negotiator', function () {

  var copyrightNegotiator;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function ($injector) {
    copyrightNegotiator = $injector.get('copyrightNegotiator');
  }));

  it('should remember when the copyright agreement is confirmed', function () {
    copyrightNegotiator.confirm();

    expect(copyrightNegotiator.confirmed()).toEqual(false);
  });
});
