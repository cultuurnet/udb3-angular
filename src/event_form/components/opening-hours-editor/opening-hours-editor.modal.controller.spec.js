'use strict';

describe('Controller: Opening hours editor', function () {
  var $controller, $uibModalInstance, OpeningHoursCollection;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function($injector) {
    $controller = $injector.get('$controller');
    $uibModalInstance = jasmine.createSpyObj('$uibModalInstance', ['close']);
    OpeningHoursCollection = $injector.get('OpeningHoursCollection');
  }));

  /**
   * 
   * @param {OpeningHoursCollection} openingHoursCollection 
   */
  function getController(openingHoursCollection) {
    return $controller('OpeningHoursEditorModalController', {
      $uibModalInstance: $uibModalInstance,
      openingHoursCollection: openingHoursCollection
    })
  }

  it('should automatically add a new set of opening hours when the original list is empty', function () {
    var openingHoursCollection = OpeningHoursCollection.deserialize([]);
    var expectedCollection = _.cloneDeep(openingHoursCollection);
    var controller = getController(openingHoursCollection);
    expectedCollection.createNewOpeningHours();

    expect(controller.openingHoursCollection).toEqual(expectedCollection);
  });

  it('should show errors when trying to save invalid opening hours', function () {
    var openingHoursCollection = OpeningHoursCollection.deserialize([]);
    var expectedErrors = ['dayOfWeek', 'openIsBeforeClose'];
    var controller = getController(openingHoursCollection);

    controller.saveOpeningHours();

    expect(controller.errors).toEqual(expectedErrors);
  });

  it('should close the modal and pass along the new serialized opening hours when saving', function () {
    var openingHoursCollection = OpeningHoursCollection.deserialize([]);
    var controller = getController(openingHoursCollection);
    var newOpeningHoursData = [
      {
        opens: '12:00',
        closes: '18:00',
        dayOfWeek: ['monday', 'friday']
      }
    ];

    controller.openingHoursCollection.deserialize(newOpeningHoursData);
    controller.saveOpeningHours();
    expect($uibModalInstance.close).toHaveBeenCalledWith(newOpeningHoursData);
  });
});
