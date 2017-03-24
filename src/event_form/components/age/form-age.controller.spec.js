describe('Controller: Form: Age', function () {

  var $controller, eventCrud, $scope, EventFormData;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function (_$controller_, $rootScope, _EventFormData_) {
    $controller = _$controller_;
    eventCrud = jasmine.createSpyObj('eventCrud', ['updateTypicalAgeRange']);
    $scope = $rootScope;
    EventFormData = _EventFormData_;
  }));

  function getController(formData) {
    var controller = $controller(
      'FormAgeController', {
        $scope: $scope,
        EventFormData: formData,
        eventCrud: eventCrud
      }
    );
    controller.delayedSaveAgeRange = jasmine.createSpyObj('delayedSaveAgeRange', ['cancel']);
    return controller;
  }

  function getMockedFormData (ageRangeData) {
    var formData = EventFormData.clone();
    formData.typicalAgeRange = ageRangeData;
    spyOn(formData, 'setTypicalAgeRange').and.callThrough();

    return formData;
  }

  it('should initialize with an active age range when age form data is not empty', function () {
    var formData = getMockedFormData('-');
    var controller = getController(formData);

    expect(controller.activeAgeRange).toEqual('ALL');
  });

  it('should not initialize with an active age range when age form data is empty', function () {
    var formData = getMockedFormData('');
    var controller = getController(formData);

    expect(controller.activeAgeRange).toEqual(undefined);
  });

  it('should initialize with a CUSTOM active age range when form data does not match a known range', function () {
    var formData = getMockedFormData('5-55');
    var controller = getController(formData);

    expect(controller.activeAgeRange).toEqual('CUSTOM');
    expect(controller.minAge).toEqual(5);
    expect(controller.maxAge).toEqual(55);
  });

  it('should initialize with an active age range and boundary when form data matches this range', function () {
    var formData = getMockedFormData('12-17');
    var controller = getController(formData);

    expect(controller.activeAgeRange).toEqual('YOUNGSTERS');
    expect(controller.minAge).toEqual(12);
    expect(controller.maxAge).toEqual(17);
  });

  it('should initialize with an active age range and boundary when form data matches a range with one boundary', function () {
    var formData = getMockedFormData('18-');
    var controller = getController(formData);

    expect(controller.activeAgeRange).toEqual('ADULTS');
    expect(controller.minAge).toEqual(18);
    expect(controller.maxAge).toEqual(undefined);
  });

  it('should set the boundaries to their default value when a age range is set by type', function () {
    var formData = getMockedFormData('');
    var controller = getController(formData);

    controller.setAgeRangeByType('PRESCHOOLERS');

    expect(controller.activeAgeRange).toEqual('PRESCHOOLERS');
    expect(controller.minAge).toEqual(3);
    expect(controller.maxAge).toEqual(5);
    expect(formData.setTypicalAgeRange).toHaveBeenCalledWith(3, 5);
  });

  it('should show an error when trying to save a range with an invalid lower bound', function () {
    var formData = getMockedFormData('');
    var controller = getController(formData);

    controller.minAge = 33;
    controller.maxAge = 3;
    controller.instantSaveAgeRange();

    expect(controller.error).toEqual('De minimum ouderdom mag niet hoger zijn dan maximum.');
    expect(formData.setTypicalAgeRange).not.toHaveBeenCalled();
  });

  it('should show an error when trying to save a range with a lower bound and an upper bound set to zero', function () {
    var formData = getMockedFormData('');
    var controller = getController(formData);

    controller.minAge = 18;
    controller.maxAge = 0;
    controller.instantSaveAgeRange();

    expect(controller.error).toEqual('De minimum ouderdom mag niet hoger zijn dan maximum.');
    expect(formData.setTypicalAgeRange).not.toHaveBeenCalled();
  });

  it('should not error when upper and lower boundary are the same', function () {
    var formData = getMockedFormData('');
    var controller = getController(formData);

    controller.minAge = 18;
    controller.maxAge = 18;
    controller.instantSaveAgeRange();

    expect(controller.error).toEqual('');
    expect(formData.setTypicalAgeRange).toHaveBeenCalled();
  });

  it('should not clear the age range boundaries when type is set to CUSTOM', function () {
    var formData = getMockedFormData('');
    var controller = getController(formData);

    controller.minAge = 18;
    controller.maxAge = 26;
    controller.setAgeRangeByType('CUSTOM');

    expect(controller.minAge).toEqual(18);
    expect(controller.maxAge).toEqual(26);
    expect(formData.setTypicalAgeRange).toHaveBeenCalledWith(18, 26);
  });

  it('should not persist the age range when saving with the same old form data', function () {
    var formData = getMockedFormData('');
    var controller = getController(formData);

    controller.minAge = 6;
    controller.maxAge = 11;
    controller.instantSaveAgeRange();

    controller.setAgeRangeByType('KIDS');

    controller.instantSaveAgeRange();

    expect(formData.setTypicalAgeRange.calls.count()).toEqual(1);
  });
});
