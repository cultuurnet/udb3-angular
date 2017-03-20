'use strict';

describe('Factory: Opening hours collection', function () {

  var OpeningHoursCollection, givenOpeningHours, $scope, dayNames;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function ($rootScope, $injector) {
    $scope = $rootScope;
    OpeningHoursCollection = $injector.get('OpeningHoursCollection');
    dayNames = $injector.get('dayNames');

    givenOpeningHours = [
      'openingHour1', 'openingHour2', 'openingHour3', 'openingHour4'
    ];
  }));

  it('should deserialize opening hours from form data', function () {
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

  xit('should add an opening hour to the opening hours array', function () {
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

  xit('should remove an OpeningHour from the array', function () {
    var expectedOpeningHours = [
      'openingHour2', 'openingHour3', 'openingHour4'
    ];

    OpeningHoursCollection.temporaryOpeningHours = givenOpeningHours;
    OpeningHoursCollection.removeOpeningHour(0);

    var temporaryOpeningHours = OpeningHoursCollection.getTemporaryOpeningHours();

    expect(temporaryOpeningHours).toEqual(expectedOpeningHours);
  });

  xit('should fire an emit when saving the OpeningHours', function () {
    spyOn($scope, '$emit');
    OpeningHoursCollection.temporaryOpeningHours = givenOpeningHours;

    OpeningHoursCollection.saveOpeningHours();

    expect(OpeningHoursCollection.openingHours).toEqual(givenOpeningHours);
    expect($scope.$emit).toHaveBeenCalledWith('openingHoursChanged', givenOpeningHours);
  });
});
