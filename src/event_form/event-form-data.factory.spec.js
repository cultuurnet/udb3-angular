'use strict';

describe('Factory: Event form data', function () {

  var EventFormData;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function (_EventFormData_) {
    EventFormData = _EventFormData_;
  }));

  it('should indicate when the timing is not a valid periodic range', function () {
    var timingData = [
      {
        type: 'periodic',
        start: new Date('2012-12-12'),
        end: null,
        valid: false
      },
      {
        type: 'periodic',
        start: null,
        end: new Date('2012-12-12'),
        valid: false
      },
      {
        type: 'permanent',
        start: new Date('2012-12-12'),
        end: null,
        valid: false
      },
      {
        type: 'periodic',
        start: new Date('2012-12-13'),
        end: new Date('2012-12-12'),
        valid: false
      },
      {
        type: 'periodic',
        start: new Date('2012-12-11'),
        end: new Date('2012-12-12'),
        valid: true
      }
    ];

    timingData.forEach(function (timing) {
      EventFormData.calendarType = timing.type;
      EventFormData.startDate = timing.start;
      EventFormData.endDate = timing.end;

      expect(EventFormData.hasValidPeriodicRange()).toEqual(timing.valid);
    });

  });

  it('should update the list of media objects when adding an image', function () {
    var image = {
      '@id': 'http://culudb-silex.dev:8080/media/d2efceac-46ec-49b1-903f-d73b4c69fe70',
      '@type': 'schema:ImageObject',
      'contentUrl': 'http://culudb-silex.dev:8080/media/d2efceac-46ec-49b1-903f-d73b4c69fe70.png',
      'thumbnailUrl': 'http://culudb-silex.dev:8080/media/d2efceac-46ec-49b1-903f-d73b4c69fe70.png',
      'description': 'desc',
      'copyrightHolder': 'copy'
    };

    EventFormData.addImage(image);
    expect(EventFormData.mediaObjects).toEqual([image]);
  });

  it('should remove update the list of media objects when removing a media object', function () {
    var imageToRemove = {
      '@id': 'http://culudb-silex.dev:8080/media/d2efceac-46ec-49b1-903f-d73b4c69fe70',
      '@type': 'schema:ImageObject',
      'contentUrl': 'http://culudb-silex.dev:8080/media/d2efceac-46ec-49b1-903f-d73b4c69fe70.png',
      'thumbnailUrl': 'http://culudb-silex.dev:8080/media/d2efceac-46ec-49b1-903f-d73b4c69fe70.png',
      'description': 'desc',
      'copyrightHolder': 'copy'
    };

    var otherMediaObject = {
      '@id': 'http://culudb-silex.dev:8080/media/d2efceac-6666-49b1-1234-d73b4c69fe70',
      '@type': 'schema:ImageObject',
      'contentUrl': 'http://culudb-silex.dev:8080/media/d2efceac-6666-49b1-1234-d73b4c69fe70.png',
      'thumbnailUrl': 'http://culudb-silex.dev:8080/media/d2efceac-6666-49b1-1234-d73b4c69fe70.png',
      'description': 'desc',
      'copyrightHolder': 'copy'
    };

    EventFormData.mediaObjects = [
      imageToRemove,
      otherMediaObject
    ];

    EventFormData.removeMediaObject(imageToRemove);
    expect(EventFormData.mediaObjects).toEqual([otherMediaObject]);
  });

  it('should reindex the media objects with the main image on top when selecting a new one', function () {
    var oldMainImage = {
      '@id': 'http://culudb-silex.dev:8080/media/d2efceac-46ec-49b1-903f-d73b4c69fe70',
      '@type': 'schema:ImageObject',
      'contentUrl': 'http://culudb-silex.dev:8080/media/d2efceac-46ec-49b1-903f-d73b4c69fe70.png',
      'thumbnailUrl': 'http://culudb-silex.dev:8080/media/d2efceac-46ec-49b1-903f-d73b4c69fe70.png',
      'description': 'old main image',
      'copyrightHolder': 'Dirk Dirkington'
    };

    var newMainImage = {
      '@id': 'http://culudb-silex.dev:8080/media/48f4bad5-827e-4da7-bc93-d5ff782948b4',
      '@type': 'schema:ImageObject',
      'contentUrl': 'http://culudb-silex.dev:8080/media/48f4bad5-827e-4da7-bc93-d5ff782948b4.png',
      'thumbnailUrl': 'http://culudb-silex.dev:8080/media/48f4bad5-827e-4da7-bc93-d5ff782948b4.png',
      'description': 'new main image',
      'copyrightHolder': 'Danny DeVito'
    };

    EventFormData.mediaObjects = [
      oldMainImage,
      newMainImage
    ];

    EventFormData.selectMainImage(newMainImage);
    expect(EventFormData.mediaObjects).toEqual([newMainImage, oldMainImage]);
  });

  it('should init with workflowStatus DRAFT', function () {
    EventFormData.init();
    expect(EventFormData.workflowStatus).toEqual('DRAFT');
  });

  it('should display an error message when the range of periodic calendar is invalid', function () {
    EventFormData.init();

    EventFormData.id = 1;
    EventFormData.startDate = new Date('2015-12-12');
    EventFormData.endDate = new Date('2015-12-10');
    EventFormData.calendarType = 'periodic';
    EventFormData.periodicTimingChanged();

    expect(EventFormData.periodicRangeError).toEqual(true);
  });

  it('should notify that the event timing has changed when toggling off the start time', function (done) {
    EventFormData.initCalendar();

    var timestamp = {
      date: new Date(),
      startHour: '',
      endHour: '',
      showEndHour: true,
      showStartHour: false
    };

    EventFormData
      .timingChanged$
      .subscribe(done);

    EventFormData.toggleStartHour(timestamp);
  });

  it('should notify that the event timing has changed when toggling off the end time', function (done) {
    EventFormData.initCalendar();

    var timestamp = {
      date: new Date(),
      startHour: '',
      endHour: '',
      showEndHour: false,
      showStartHour: false
    };

    EventFormData
      .timingChanged$
      .subscribe(done);

    EventFormData.toggleEndHour(timestamp);
    expect(timestamp.endHour).toEqual('23:59');
  });

  it('should update timing when the calendar type is set to permanent', function (done) {
    EventFormData.initCalendar();

    EventFormData
      .timingChanged$
      .subscribe(done);

    EventFormData.setCalendarType('permanent');
  });

  it('should notify that the event timing has changed when the start or end hour changed', function (done) {
    EventFormData.initCalendar();

    var timestamp = {
      date: new Date(),
      startHour: '',
      startHourAsDate: new Date('2017', '01', '27', '14', '00'),
      endHourAsDate: new Date('2017', '01', '27', '18', '00'),
      endHour: '',
      showEndHour: true,
      showStartHour: true
    };

    EventFormData
      .timingChanged$
      .subscribe(done);

    EventFormData.hoursChanged(timestamp);
    expect(timestamp.startHour).toEqual('14:00');
    expect(timestamp.endHour).toEqual('18:00');
  });

  it('should reset both activeCalendarType and calendarType when resetting the calendar', function () {
    EventFormData.calendarType = 'periodic';
    EventFormData.activeCalendarType = 'periodic';
    EventFormData.initCalendar();
    EventFormData.resetCalendar();

    expect(EventFormData.calendarType).toEqual('');
    expect(EventFormData.activeCalendarType).toEqual('');
  });

  it('should notify that the event timing has changed when the start or end hour is reset', function (done) {
    EventFormData.initCalendar();

    var timestamp = {
      date: new Date(),
      startHour: '',
      endHour: '',
      showEndHour: true,
      showStartHour: true
    };

    EventFormData
      .timingChanged$
      .subscribe(done);

    EventFormData.hoursChanged(timestamp);
    expect(timestamp.startHour).toEqual('00:00');
    expect(timestamp.endHour).toEqual('00:00');
  });

  it('should set a valid placeholder for start en end hour when toggle start hour is on', function () {
    EventFormData.initCalendar();

    var timestamp = {
      date: new Date('2017', '01', '27', '23', '00'),
      startHour: '',
      endHour: '',
      showEndHour: true,
      showStartHour: true
    };

    EventFormData.toggleStartHour(timestamp);
    expect(timestamp.startHour).toEqual('23:00');
    expect(timestamp.endHour).toEqual('23:59');
    expect(timestamp.showEndHour).toBeFalsy();
  });

  it('should set a valid placeholder for end hour when the toggle end hour is on', function () {
    EventFormData.initCalendar();

    var timestamp = {
      date: new Date('2017', '01', '27', '14', '00'),
      startHour: '',
      startHourAsDate: new Date('2017', '01', '27', '19', '00'),
      endHour: '',
      showEndHour: true,
      showStartHour: true
    };

    EventFormData.toggleEndHour(timestamp);
    expect(timestamp.endHour).toEqual('22:00');
  });

  it('should notify that the event timing has changed when saving opening hours', function (done) {
    EventFormData.initCalendar();

    EventFormData
      .timingChanged$
      .subscribe(done);

    EventFormData.saveOpeningHours();
  });
});
