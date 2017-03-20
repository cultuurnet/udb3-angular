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
});
