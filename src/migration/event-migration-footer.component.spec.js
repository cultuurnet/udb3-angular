'use strict';

describe('Event Migration Footer Component', function () {

  var $componentController;

  beforeEach(module('udb.migration'));

  beforeEach(inject(function ($injector) {
    $componentController = $injector.get('$componentController');
  }));

  function getComponentController(formData) {
   return $componentController('udbEventMigrationFooter',
      {
        EventFormData: formData
      }
    );
  }

  it('should not allow editing of the event before completing the migration', function () {
    var formData = {
      location: {
        name: 'Blue'
      }
    };

    var footer = getComponentController(formData);

    expect(footer.readyToEdit()).toEqual(false);
  });

  it('should mark the event as ready to edit when the migration is completed', function () {
    var formData = {
      location: {
        id: 'ef9f6d8a-3c3e-4299-8f51-e04d0686f575'
      }
    };

    var footer = getComponentController(formData);

    expect(footer.readyToEdit()).toEqual(true);
  });
});