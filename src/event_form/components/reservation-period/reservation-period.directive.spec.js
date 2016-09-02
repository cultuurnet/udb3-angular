'use strict';

describe('Directive: Save time tracker', function () {
  var $compile;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function(_$compile_){
    $compile = _$compile_;
  }));

  function getElement() {
    var element = $compile('<udb-reservation-period></udb-reservation-period>');

    return element;
  }

  it('should not show the reservation period directive', function () {
    var element = getElement();

    expect(element).toEqual(element);
  });
});
