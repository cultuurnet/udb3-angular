describe('Controller: Form: Audience', function () {

  var $controller, eventCrud;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function (_$controller_) {
    $controller = _$controller_;
    eventCrud = jasmine.createSpyObj('eventCrud', ['setAudienceType']);
  }));

  function getController(formData) {
    return $controller(
      'FormAudienceController', {
        EventFormData: formData,
        eventCrud: eventCrud
      }
    );
  }

  it('should be enabled if the current form data is an event', function () {
    var formData = { isEvent: true },
        controller = getController(formData);

    expect(controller.enabled).toEqual(true);
  });

  it('should load the audience type for the event in form data', function () {
    var formData = { isEvent: true, audienceType: 'education' },
      controller = getController(formData);

    expect(controller.audienceType).toEqual('education');
  });

  it('should persist the audience type for an event', function() {
    var formData = {
          isEvent: true,
          apiUrl: new URL('http://du.de/event/1da2bb3c-616f-4e89-9b17-f142413046d2')
        },
        controller = getController(formData);

    controller.setAudienceType('education');

    expect(eventCrud.setAudienceType).toHaveBeenCalledWith(
      formData,
      'education'
    );
  });
});
