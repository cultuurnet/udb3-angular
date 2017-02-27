'use strict';

describe('Factory: Opening hours colleciton', function () {

  var OpeningHoursCollection, givenOpeningHours, $rootscope, dayNames;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function ($rootScope, $injector) {
    $rootscope = $rootScope;
    OpeningHoursCollection = $injector.get('OpeningHoursCollection');
    dayNames = $injector.get('dayNames');

    givenOpeningHours = [
      'openingHour1', 'openingHour2', 'openingHour3', 'openingHour4'
    ];
  }));

  it('init the OpeningHoursCollection', function () {
    OpeningHoursCollection.init();

    expect(OpeningHoursCollection.openingHours).toEqual([]);
    expect(OpeningHoursCollection.temporaryOpeningHours).toEqual([]);
    expect(OpeningHoursCollection.openingHoursErrors).toEqual({});
  });

  it('should return the array with openingHours', function () {
    OpeningHoursCollection.openingHours = givenOpeningHours;
    var openingHours = OpeningHoursCollection.getOpeningHours();

    expect(openingHours).toEqual(givenOpeningHours);
  });

  it('should return the array with temporaryOpeningHours', function () {
    OpeningHoursCollection.temporaryOpeningHours = givenOpeningHours;
    var temporaryOpeningHours = OpeningHoursCollection.getTemporaryOpeningHours();

    expect(temporaryOpeningHours).toEqual(givenOpeningHours);
  });

  it('should set the opening hours', function () {
    var expectedOpeningHour = {
      dayOfWeek: ['monday', 'tuesday'],
      opens: '16:00',
      opensAsDate: new Date('2017', '01', '27', '14', '00'),
      closes: '20:00',
      closesAsDate: new Date('2017', '01', '27', '18', '00'),
      label: 'maandag, dinsdag'
    };

    var expectedOpeningHours = [
      expectedOpeningHour,
      expectedOpeningHour,
      expectedOpeningHour
    ];

    OpeningHoursCollection.setOpeningHours(expectedOpeningHours);
    expect(OpeningHoursCollection.openingHours).toEqual(expectedOpeningHours);
    expect(OpeningHoursCollection.temporaryOpeningHours).toEqual(expectedOpeningHours);
  });

  it('should add an opening hour to the opening hours array', function () {
    var openingHour = {
      dayOfWeek: ['monday', 'tuesday'],
      opens: '16:00',
      opensAsDate: new Date('2017', '01', '27', '14', '00'),
      closes: '20:00',
      closesAsDate: new Date('2017', '01', '27', '18', '00'),
      label: 'maandag, dinsdag'
    };

    var expectedOpeningHours = [{
      dayOfWeek: ['monday', 'tuesday'],
      opens: '16:00',
      opensAsDate: new Date('2017', '01', '27', '14', '00'),
      closes: '20:00',
      closesAsDate: new Date('2017', '01', '27', '18', '00'),
      label: 'maandag, dinsdag'
    }];

    OpeningHoursCollection.addOpeningHour(openingHour);
    expect(OpeningHoursCollection.temporaryOpeningHours).toEqual(expectedOpeningHours);
  });

  it('should remove an OpeningHour from the array', function () {
    var expectedOpeningHours = [
      'openingHour2', 'openingHour3', 'openingHour4'
    ];

    OpeningHoursCollection.temporaryOpeningHours = givenOpeningHours;
    OpeningHoursCollection.removeOpeningHour(0);

    var temporaryOpeningHours = OpeningHoursCollection.getTemporaryOpeningHours();

    expect(temporaryOpeningHours).toEqual(expectedOpeningHours);
  });

  it('should fire an emit when saving the OpeningHours', function () {
    spyOn($rootscope, '$emit');
    OpeningHoursCollection.temporaryOpeningHours = givenOpeningHours;

    OpeningHoursCollection.saveOpeningHours();

    expect(OpeningHoursCollection.openingHours).toEqual(givenOpeningHours);
    expect($rootscope.$emit).toHaveBeenCalledWith('openingHoursChanged', givenOpeningHours);
  });
});
