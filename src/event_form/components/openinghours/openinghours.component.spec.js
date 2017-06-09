describe('Component: Opening Hours', function () {

  var $componentController, $uibModal, $scope;
  var OpeningHourComponent, OpeningHoursCollection, today, openingHour, formData;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function (_$componentController_, $rootScope, $injector) {
    $componentController = _$componentController_;
    $scope = $rootScope.$new();
    OpeningHoursCollection = $injector.get('OpeningHoursCollection');
    formData = $injector.get('EventFormData');
    $uibModal = $injector.get('$uibModal');
    $q = $injector.get('$q');

    OpeningHourComponent = $componentController(
      'udbEventFormOpeningHours',
      {
        $uibModal: $uibModal
      },
      {
        openingHoursCollection: OpeningHoursCollection,
        formData: formData
      }
    );

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

  it('should pass along data to the offer form when updating opening-hours', function () {
    var expectedOpeningHoursList = ['foo', 'bar'];
    function immediatelyResolveWithList() {
      return {
        result: $q.resolve(expectedOpeningHoursList)
      };
    }

    spyOn($uibModal, "open").and.callFake(immediatelyResolveWithList);
    spyOn(formData, "saveOpeningHours");

    OpeningHourComponent.edit();
    $scope.$digest();

    expect(formData.saveOpeningHours).toHaveBeenCalledWith(expectedOpeningHoursList);
  });
});
