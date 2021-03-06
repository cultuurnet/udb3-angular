'use strict';

describe('Factory: Opening hours collection', function () {

  var OpeningHoursCollection, givenOpeningHours, $scope;
  var formDataOpeningHours = [
    {
      "dayOfWeek": [
        "monday"
      ],
      "opens": "11:00",
      "closes": "14:00"
    },
    {
      "dayOfWeek": [
        "tuesday"
      ],
      "opens": "12:00",
      "closes": "14:00"
    }
  ];

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function ($rootScope, $injector) {
    $scope = $rootScope;
    OpeningHoursCollection = $injector.get('OpeningHoursCollection');

    givenOpeningHours = [
      'openingHour1', 'openingHour2', 'openingHour3', 'openingHour4'
    ];
  }));

  function giveSomeOpeningHours() {
    return angular.copy(formDataOpeningHours);
  }

  function getExpectedDayOfWeekOpeningHours() {
    return {
      'monday': {label: 'weekdays.monday.label', name: 'weekdays.monday.name', open: false},
      'tuesday': {label: 'weekdays.tuesday.label', name: 'weekdays.tuesday.name', open: false},
      'wednesday': {label: 'weekdays.wednesday.label', name: 'weekdays.wednesday.name', open: false},
      'thursday': {label: 'weekdays.thursday.label', name: 'weekdays.thursday.name', open: false},
      'friday': {label: 'weekdays.friday.label', name: 'weekdays.friday.name', open: false},
      'saturday': {label: 'weekdays.saturday.label', name: 'weekdays.saturday.name', open: false},
      'sunday': {label: 'weekdays.sunday.label', name: 'weekdays.sunday.name', open: false}
    }
  }

  it('should deserialize opening hours from form data', function () {
    var formDataOpeningHours = giveSomeOpeningHours();
    OpeningHoursCollection.deserialize(formDataOpeningHours);
    var expectedOpeningHours = [
      {
        'dayOfWeek': getExpectedDayOfWeekOpeningHours(),
        'opens': '11:00',
        'opensAsDate': new Date(1970, 0, 1, 11),
        'closes': '14:00',
        'closesAsDate': new Date(1970, 0, 1, 14),
        'label': 'weekdays.monday.name'
      },
      {
        'dayOfWeek': getExpectedDayOfWeekOpeningHours(),
        'opens': '12:00',
        'opensAsDate': new Date(1970, 0, 1, 12),
        'closes': '14:00',
        'closesAsDate': new Date(1970, 0, 1, 14),
        'label': 'weekdays.tuesday.name'
      }
    ];
    expectedOpeningHours[0].dayOfWeek.monday.open = true;
    expectedOpeningHours[1].dayOfWeek.tuesday.open = true;

    expect(OpeningHoursCollection.getOpeningHours()).toEqual(expectedOpeningHours);
  });

  it('should create a new set of opening hours', function () {
    OpeningHoursCollection.createNewOpeningHours();

    var expectedOpeningHours = [
      {
        'dayOfWeek': getExpectedDayOfWeekOpeningHours(),
        'opens': '00:00',
        'opensAsDate': new Date(1970, 0, 1),
        'closes': '00:00',
        'closesAsDate': new Date(1970, 0, 1),
        'label': ''
      }
    ];

    expect(OpeningHoursCollection.getOpeningHours()).toEqual(expectedOpeningHours);
  });

  it('should remove opening hours', function () {
    var formDataOpeningHours = giveSomeOpeningHours();
    var expectedOpeningHours = [
      {
        'dayOfWeek': getExpectedDayOfWeekOpeningHours(),
        'opens': '12:00',
        'opensAsDate': new Date(1970, 0, 1, 12),
        'closes': '14:00',
        'closesAsDate': new Date(1970, 0, 1, 14),
        'label': 'weekdays.tuesday.name'
      }
    ];
    expectedOpeningHours[0].dayOfWeek.tuesday.open = true;

    OpeningHoursCollection.deserialize(formDataOpeningHours);
    OpeningHoursCollection.removeOpeningHours(OpeningHoursCollection.getOpeningHours()[0]);

    expect(OpeningHoursCollection.getOpeningHours()).toEqual(expectedOpeningHours);
  });

  it('should return a validation error when closing hour is before opening hour', function () {
    var formDataOpeningHours = [
      {
        "dayOfWeek": [
          "monday"
        ],
        "opens": "16:00",
        "closes": "09:00"
      }
    ];
    var expectedValidationErrors = ['openIsBeforeClose'];

    OpeningHoursCollection.deserialize(formDataOpeningHours);

    expect(OpeningHoursCollection.validate()).toEqual(expectedValidationErrors);
  });

  it('should return a validation error when closing time is missing', function () {
    var formDataOpeningHours = giveSomeOpeningHours();
    var expectedValidationErrors = ['openAndClose', 'openIsBeforeClose'];

    OpeningHoursCollection.deserialize(formDataOpeningHours);
    OpeningHoursCollection.openingHours[0].closesAsDate = null;

    expect(OpeningHoursCollection.validate()).toEqual(expectedValidationErrors);
  });

  it('should return a validation error when opening time is missing', function () {
    var formDataOpeningHours = giveSomeOpeningHours();
    var expectedValidationErrors = ['openAndClose', 'openIsBeforeClose'];

    OpeningHoursCollection.deserialize(formDataOpeningHours);
    OpeningHoursCollection.openingHours[0].opensAsDate = null;

    expect(OpeningHoursCollection.validate()).toEqual(expectedValidationErrors);
  });

  it('should return a validation error when opening days are missing', function () {
    var formDataOpeningHours = [
      {
        "dayOfWeek": [],
        "opens": "12:00",
        "closes": "15:00"
      }
    ];
    var expectedValidationErrors = ['dayOfWeek'];

    OpeningHoursCollection.deserialize(formDataOpeningHours);

    expect(OpeningHoursCollection.validate()).toEqual(expectedValidationErrors);
  });

  it('should return an empty error list when valid', function () {
    var formDataOpeningHours = giveSomeOpeningHours();
    var expectedValidationErrors = [];

    OpeningHoursCollection.deserialize(formDataOpeningHours);

    expect(OpeningHoursCollection.validate()).toEqual(expectedValidationErrors);
  });

  it('should serialize a list of opening hours', function () {
    var formDataOpeningHours = giveSomeOpeningHours();
    var expectedOpeningHours = [
      {
        "dayOfWeek": [
          "monday"
        ],
        "opens": "14:00",
        "closes": "18:00"
      },
      {
        "dayOfWeek": [
          "tuesday"
        ],
        "opens": "12:00",
        "closes": "14:00"
      }
    ];
    OpeningHoursCollection.deserialize(formDataOpeningHours);
    OpeningHoursCollection.openingHours[0].opensAsDate = new Date(1970, 0, 1, 14);
    OpeningHoursCollection.openingHours[0].closesAsDate = new Date(1970, 0, 1, 18);

    expect(OpeningHoursCollection.serialize()).toEqual(expectedOpeningHours);
  });
});
