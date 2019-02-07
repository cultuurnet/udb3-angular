'use strict';

describe('Controller: reservation period directive', function () {

  beforeEach(module('udb.event-form'));

  var $controller, reservationPeriodController, scope, rootScope, EventFormData, $q;

  beforeEach(inject(function ($rootScope, $injector) {
    $controller = $injector.get('$controller');
    scope = $rootScope.$new();
    rootScope = $rootScope;
    EventFormData = $injector.get('EventFormData');
    $q = $injector.get('$q');
    reservationPeriodController = getController();
    scope.onBookingPeriodSaved = jasmine.createSpy('onBookingPeriodSaved');
  }));

  function getController() {
    return $controller('ReservationPeriodController', {
      $scope: scope,
      EventFormData: EventFormData,
      $rootScope: rootScope
    });
  }

  it ('should fail in validating the booking period', function () {
    scope.availabilityStarts = new Date('02/09/2016');
    scope.availabilityEnds = new Date('02/07/2016');

    scope.validateBookingPeriod();

    expect(scope.errorMessage).toEqual('De gekozen einddatum moet na de startdatum vallen.');
  });

  it ('should validate the booking period', function () {
    scope.availabilityEnds = new Date('02/09/2016');
    scope.availabilityStarts = new Date('02/07/2016');

    scope.validateBookingPeriod();

    expect(scope.errorMessage).toEqual('');
  });

  it ('should save the bookingPeriod', function () {
    scope.availabilityEnds = moment(new Date('02/09/2016')).format();
    scope.availabilityStarts = moment(new Date('02/07/2016')).format();

    scope.saveBookingPeriod();
    scope.$digest();

    expect(EventFormData.bookingInfo.availabilityStarts).toEqual(scope.availabilityStarts);
    expect(EventFormData.bookingInfo.availabilityEnds).toEqual(scope.availabilityEnds);
    expect(scope.onBookingPeriodSaved).toHaveBeenCalled();
    expect(scope.bookingPeriodInfoError).toBeFalsy();
  });

  it ('should fail in saving the bookingPeriod', function () {
    scope.availabilityEnds = moment(new Date('02/09/2016')).format();
    scope.availabilityStarts = moment(new Date('02/07/2016')).format();

    scope.saveBookingPeriod();
    scope.$digest();

    expect(EventFormData.bookingInfo.availabilityStarts).toEqual(scope.availabilityStarts);
    expect(EventFormData.bookingInfo.availabilityEnds).toEqual(scope.availabilityEnds);
  });

  it ('should delete the booking period', function () {
    scope.availabilityEnds = new Date('02/09/2016');
    scope.availabilityStarts = new Date('02/07/2016');

    scope.deleteBookingPeriod();

    expect(scope.availabilityStarts).toEqual('');
    expect(scope.availabilityEnds).toEqual('');
    expect(scope.haveBookingPeriod).toBeFalsy();
  });

  it ('should change the boolean haveBookingPeriod', function () {
    scope.haveBookingPeriod = false;

    scope.changeHaveBookingPeriod();

    expect(scope.haveBookingPeriod).toBeTruthy();
  });

  it ('should open popup 1', function () {
    scope.open1();

    expect(scope.popup1.opened).toBeTruthy();
  });

  it ('should open popup 2', function () {
    scope.open2();

    expect(scope.popup2.opened).toBeTruthy();
  });

  it ('should initialize the booking period form', function () {
    EventFormData.bookingInfo.availabilityEnds = '02/09/2016';
    EventFormData.bookingInfo.availabilityStarts = '02/07/2016';

    scope.initBookingPeriodForm();

    expect(scope.haveBookingPeriod).toBeTruthy();
    expect(scope.availabilityStarts).toEqual(new Date(EventFormData.bookingInfo.availabilityStarts));
    expect(scope.availabilityEnds).toEqual(new Date(EventFormData.bookingInfo.availabilityEnds));
  });
});
