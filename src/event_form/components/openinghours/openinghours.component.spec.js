describe('Component: Opening Hours', function () {

  var $componentController, OpeningHourComponent, OpeningHoursCollection, $scope, today, openingHour;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function (_$componentController_, $rootScope, $injector) {
    $componentController = _$componentController_;
    $scope = $rootScope.$new();
    OpeningHoursCollection = $injector.get('OpeningHoursCollection');

    OpeningHourComponent = $componentController(
      'udbEventFormOpeningHours',
      {
        openingHours: OpeningHoursCollection
      });

    today = moment('2017-01-27 14:01').toDate();
    jasmine.clock().install();
    jasmine.clock().mockDate(today);

    openingHour = {
      opensAsDate: moment('2017-01-27 15:00').toDate(),
      closesAsDate: moment('2017-01-27 18:00').toDate(),
      dayOfWeek: [],
      opens: '',
      closes: '',
      hasErrors: true,
      errors: {}
    };

    OpeningHourComponent.prototype = openingHour;
  }));

  afterEach(function () {
    jasmine.clock().uninstall();

    openingHour = {
      opensAsDate: moment('2017-01-27 15:00').toDate(),
      closesAsDate: moment('2017-01-27 18:00').toDate(),
      dayOfWeek: [],
      opens: '',
      closes: '',
      hasErrors: true,
      errors: {}
    };
  });

  it('should validate the prototype\'s opening hour', function () {
    OpeningHourComponent.prototype.opensAsDate = moment('2017-01-27 18:00').toDate();
    OpeningHourComponent.prototype.closesAsDate = moment('2017-01-27 18:00').toDate();

    OpeningHourComponent.validatePrototypeOpeningHour();

    //expect(OpeningHourComponent.prototype.errors.openIsClose).toBeTruthy();
    expect(OpeningHourComponent.prototype.hasErrors).toBeTruthy();
  });

  it('should set a default opening hour when it doesn\'t exists', function () {
    OpeningHourComponent.prototype.opensAsDate = null;

    OpeningHourComponent.validatePrototypeOpeningHour();

    expect(OpeningHourComponent.prototype.opensAsDate).toEqual(moment('2017-01-27 00:00:00').toDate());
    expect(OpeningHourComponent.prototype.errors.openIsClose).toBeFalsy();
    expect(OpeningHourComponent.prototype.hasErrors).toBeFalsy();
  });

  it('should set a default closing hour when it doesn\'t exists', function () {
    OpeningHourComponent.prototype.closesAsDate = null;

    OpeningHourComponent.validatePrototypeClosingHour();

    expect(OpeningHourComponent.prototype.closesAsDate).toEqual(moment('2017-01-27 23:59:59').toDate());
    expect(OpeningHourComponent.prototype.hasErrors).toBeFalsy();
  });
});
