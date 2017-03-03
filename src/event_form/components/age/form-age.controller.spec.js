xdescribe('Controller: Form: Age', function () {

  var $controller, eventCrud;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function (_$controller_) {
    $controller = _$controller_;
    eventCrud = jasmine.createSpyObj('eventCrud', ['setAudienceType']);
  }));

  function getController(formData) {
    return $controller(
      'FormAgeController', {
        EventFormData: formData,
        eventCrud: eventCrud
      }
    );
  }

  it('should set the right form data and save it when all ages is selected', function () {
    spyOn(scope, 'saveAgeRange');
    scope.ageRange = scope.ageRanges[0];
    scope.ageRangeChanged(scope.ageRanges[0]);

    expect(scope.saveAgeRange).toHaveBeenCalled();
  });

  it('should check if the minimum age is in range of the selected age-range when saving', function () {
    var testCases = {
      'min and max set and not in range': {
        range: { min: 12, max: 18 },
        expectedInvalid: true,
        minAge: 10
      },
      'max set and in range': {
        range: { max: 18 },
        expectedInvalid: false,
        minAge: 10
      },
      'max set and not in range': {
        range: { max: 18 },
        expectedInvalid: true,
        minAge: 69
      },
      'range without boundaries': {
        range: { },
        expectedInvalid: false,
        minAge: 10
      }
    };
    eventCrud.updateTypicalAgeRange.and.returnValue($q.resolve());

    for (var caseName in testCases) {
      var testCase = testCases[caseName];

      scope.ageRange = testCase.range;
      scope.minAge = testCase.minAge;
      scope.saveAgeRange();

      expect(scope.invalidAgeRange).toEqual(testCase.expectedInvalid);
    }
  });

  it('should format the age-range when saving', function () {
    var testCases = {
      'all ages': {
        range: scope.ageRanges[0],
        minAge: null,
        expectedResult: null
      },
      'range with max and min': {
        range: { max: 18, min: 12 },
        minAge: 12,
        expectedResult: '12-18'
      },
      'range with only min': {
        range: { min: 18 },
        minAge: 21,
        expectedResult: '21-'
      }
    };
    eventCrud.updateTypicalAgeRange.and.returnValue($q.resolve());
    eventCrud.deleteTypicalAgeRange.and.returnValue($q.resolve());

    for (var caseName in testCases) {
      var testCase = testCases[caseName];

      scope.ageRange = testCase.range;
      scope.minAge = testCase.minAge;
      scope.saveAgeRange();

      expect(EventFormData.typicalAgeRange).toEqual(testCase.expectedResult);
    }
  });

  it('should set the ageRange to all ages', function () {
    scope.setAllAges();
    expect(scope.ageRange).toEqual(AgeRange.ALL);
  });

  it('should rest the age selection', function () {
    scope.resetAgeRange();

    expect(scope.ageRange).toEqual(null);
    expect(scope.minAge).toEqual(null);
    expect(scope.ageCssClass).toEqual('state-incomplete');
  });

  it('should initialize with an "adult" age range when the min age is over 18', function () {
    EventFormData.typicalAgeRange = '21-';
    EventFormData.id = 1;
    stepController = getController();

    expect(scope.ageRange).toEqual(AgeRange.ADULTS);
    expect(scope.minAge).toEqual(21);
  });

  it('should initialize with an "all" age range when no specific age range is included', function () {
    EventFormData.typicalAgeRange = '';
    EventFormData.id = 1;
    stepController = getController();

    expect(scope.ageRange).toEqual(AgeRange.ALL);
    expect(scope.minAge).toEqual(0);
  });

  it('should initialize with an "teens" age range when only for 18 year olds', function () {
    EventFormData.typicalAgeRange = 18;
    EventFormData.id = 1;
    EventFormData.facilities = ['f1', 'f2', 'f3'];
    stepController = getController();

    expect(scope.ageRange).toEqual(AgeRange.TEENS);
    expect(scope.minAge).toEqual(18);
    expect(scope.selectedFacilities).toEqual(EventFormData.facilities);
    expect(scope.facilitiesInapplicable).toBeFalsy();
  });

  it('should initialize with an "teens" age range between 12-18 years', function () {
    EventFormData.typicalAgeRange = '12-18';
    EventFormData.id = 1;
    stepController = getController();

    expect(scope.ageRange).toEqual(AgeRange.TEENS);
    expect(scope.minAge).toEqual(12);
  });
});
