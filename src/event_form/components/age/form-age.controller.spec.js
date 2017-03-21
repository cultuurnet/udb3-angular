describe('Controller: Form: Age', function () {

  var $controller, eventCrud, $scope;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function (_$controller_, $rootScope) {
    $controller = _$controller_;
    eventCrud = jasmine.createSpyObj('eventCrud', ['updateTypicalAgeRange']);
    $scope = $rootScope;
    spyOn(_, 'debounce').and.callFake(function (debounceFunction) {
      return function(args) {
        debounceFunction.apply(this, arguments);
      };
    });
  }));

  function getController(formData) {
    return $controller(
      'FormAgeController', {
        EventFormData: formData,
        eventCrud: eventCrud
      }
    );
  }

  it('should initialize with an active age range when age form data is not empty', function () {
    var formData = {typicalAgeRange: '-'};
    var controller = getController(formData);

    expect(controller.activeAgeRange).toEqual('ALL');
  });

  it('should not initialize with an active age range when age form data is empty', function () {
    var formData = {typicalAgeRange: ''};
    var controller = getController(formData);

    expect(controller.activeAgeRange).toEqual(undefined);
  });

  it('should initialize with a CUSTOM active age range when form data does not match a known range', function () {
    var formData = {typicalAgeRange: '5-55'};
    var controller = getController(formData);

    expect(controller.activeAgeRange).toEqual('CUSTOM');
    expect(controller.minAge).toEqual(5);
    expect(controller.maxAge).toEqual(55);
  });

  it('should initialize with an active age range and boundary when form data matches this range', function () {
    var formData = {typicalAgeRange: '12-17'};
    var controller = getController(formData);

    expect(controller.activeAgeRange).toEqual('YOUNGSTERS');
    expect(controller.minAge).toEqual(12);
    expect(controller.maxAge).toEqual(17);
  });

  it('should initialize with an active age range and boundary when form data matches a range with one boundary', function () {
    var formData = {typicalAgeRange: '18-'};
    var controller = getController(formData);

    expect(controller.activeAgeRange).toEqual('ADULTS');
    expect(controller.minAge).toEqual(18);
    expect(controller.maxAge).toEqual(undefined);
  });

  it('should set the boundaries to their default value when a age range is set by type', function () {
    var formData = jasmine.createSpyObj('formData', ['setTypicalAgeRange']);
    var controller = getController(formData);

    controller.setAgeRangeByType('PRESCHOOLERS');

    expect(controller.activeAgeRange).toEqual('PRESCHOOLERS');
    expect(controller.minAge).toEqual(3);
    expect(controller.maxAge).toEqual(5);
    expect(formData.setTypicalAgeRange).toHaveBeenCalledWith(3, 5);
  });

  it('should show an error when trying to save a range with an invalid lower bound', function () {
    var formData = jasmine.createSpyObj('formData', ['setTypicalAgeRange']);
    var controller = getController(formData);

    controller.minAge = 33;
    controller.maxAge = 3;
    controller.saveAgeRange();

    expect(controller.error).toEqual('De minimum ouderdom moet lager zijn dan maximum.');
    expect(formData.setTypicalAgeRange).not.toHaveBeenCalled();
  });

  it('should show an error when trying to save a range with a lower bound and an upper bound set to zero', function () {
    var formData = jasmine.createSpyObj('formData', ['setTypicalAgeRange']);
    var controller = getController(formData);

    controller.minAge = 18;
    controller.maxAge = 0;
    controller.saveAgeRange();

    expect(controller.error).toEqual('De minimum ouderdom moet lager zijn dan maximum.');
    expect(formData.setTypicalAgeRange).not.toHaveBeenCalled();
  });
});
