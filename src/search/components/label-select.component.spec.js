'use strict';

describe('Label Select Component', function() {
  var $componentController;
  var bindings = {offer: {labels: ['Wolverine', 'Deadpool']}};

  beforeEach(module('udb.search'));
  beforeEach(inject(function(_$componentController_) {
    $componentController = _$componentController_;
  }));

  function getComponentController(bindings) {
    // Here we are passing actual bindings to the component
    return $componentController('udbLabelSelect', null, bindings);
  }

  it('should expose a `offer` object', function() {
    var ctrl = getComponentController(bindings);

    expect(ctrl.offer).toBeDefined();
    expect(ctrl.offer.labels).toBe(bindings.offer.labels);
  });

  it('should init the labels array', function() {
    var ctrl = getComponentController(bindings);

    expect(ctrl.labels.length).toBe(2);
    expect(ctrl.labels[0].name).toBe('Wolverine');
    expect(ctrl.labels[1].name).toBe('Deadpool');
  });

  it('should evalutate whether the length criteria are met', function() {
    var ctrl = getComponentController(bindings);

    // needs to be higher than or equal to 3
    expect(ctrl.areLengthCriteriaMet(2)).toBe(false);
    // needs to be less than or equal to 255
    expect(ctrl.areLengthCriteriaMet(256)).toBe(false);
    expect(ctrl.areLengthCriteriaMet(45)).toBe(true);
  });

  it('should not add the same label to the offer twice', function() {
    var ctrl = getComponentController(bindings);

    // add already added label
    expect(ctrl.createLabel('Wolverine')).toBe(undefined);
    // add a label not yet added
    expect(ctrl.createLabel('Francis')).not.toBe(undefined);
    expect(ctrl.createLabel('Francis').name).toBe('Francis');
  });

  it('should not add a label that does not meet the length criteria', function() {
    var ctrl = getComponentController(bindings);

    // needs to be higher or equal to 3
    expect(ctrl.createLabel('wo')).toBe(undefined);
    // needs to be less than or equal to 255
    var bigLabel = 'turnip greens yarrow ricebean rutabaga endive cauliflower sea lettuce kohlrabi amaranth water spinach avocado daikon napa cabbage asparagus winter purslane kale celery potato scallion desert raisin horseradish spinach carrot soko Lotus root water spinach fennel';
    expect(ctrl.createLabel(bigLabel)).toBe(undefined);
  });
});