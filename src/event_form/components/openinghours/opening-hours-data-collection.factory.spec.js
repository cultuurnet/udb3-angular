'use strict';

describe('Factory: Opening hours collection', function () {

  var OpeningHoursCollection, givenOpeningHours, $scope, dayNames;
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
    dayNames = $injector.get('dayNames');

    givenOpeningHours = [
      'openingHour1', 'openingHour2', 'openingHour3', 'openingHour4'
    ];
  }));

  function giveSomeOpeningHours() {
    return angular.copy(formDataOpeningHours);
  }

  it('should deserialize opening hours from form data', function () {
    var formDataOpeningHours = giveSomeOpeningHours();
    OpeningHoursCollection.deserialize(formDataOpeningHours);
    var expectedOpeningHours = [
      {
        'dayOfWeek': [
          'monday'
        ],
        'opens': '11:00',
        'opensAsDate': new Date(1970, 0, 1, 11),
        'closes': '14:00',
        'closesAsDate': new Date(1970, 0, 1, 14),
        'label': 'Maandag'
      },
      {
        'dayOfWeek': [
          'tuesday'
        ],
        'opens': '12:00',
        'opensAsDate': new Date(1970, 0, 1, 12),
        'closes': '14:00',
        'closesAsDate': new Date(1970, 0, 1, 14),
        'label': 'Dinsdag'
      }
    ];

    expect(OpeningHoursCollection.getOpeningHours()).toEqual(expectedOpeningHours);
  });

  it('should create a new set of opening hours', function () {
    OpeningHoursCollection.createNewOpeningHours();

    var expectedOpeningHours = [
      {
        'dayOfWeek': [],
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
        'dayOfWeek': [
          'tuesday'
        ],
        'opens': '12:00',
        'opensAsDate': new Date(1970, 0, 1, 12),
        'closes': '14:00',
        'closesAsDate': new Date(1970, 0, 1, 14),
        'label': 'Dinsdag'
      }
    ];

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
});
