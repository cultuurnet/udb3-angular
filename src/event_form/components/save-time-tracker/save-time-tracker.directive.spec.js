'use strict';

describe('Directive: Save time tracker', function () {
  var $compile,
      $rootScope;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function(_$compile_, _$rootScope_){
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  function getElement() {
    var element = $compile('<udb-event-form-save-time-tracker></udb-event-form-save-time-tracker>')($rootScope);
    $rootScope.$digest();

    return element;
  }

  it('should not show the time tracker when no form has been saved', function () {
    var element = getElement();
    expect(element.children('.save-time-tracker').length).toEqual(0);
  });

  it('should show the time tracker after an event form is saved', function () {
    var element = getElement();
    $rootScope.$emit('eventFormSaved', {});
    $rootScope.$apply();
    expect(element.children('.save-time-tracker').length).toEqual(1);
  });

  it('should indicate the time when a event form was last saved', function () {
    var trackerElement = getElement();
    var baseTime = moment('2015-11-16T22:23:48').toDate();
    jasmine.clock().mockDate(baseTime);

    $rootScope.$emit('eventFormSaved', {});
    $rootScope.$apply();
    var timeLastSavedElement = trackerElement.find('span.time-last-saved');
    expect(timeLastSavedElement.html()).toEqual('22:23');
  });
});
