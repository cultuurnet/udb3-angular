'use strict';

describe('Label Select Component', function() {
  var $componentController, offerLabeller, $q, $scope;
  var bindings = {labels: ['Wolverine', 'Deadpool']};

  beforeEach(module('udb.search'));
  beforeEach(inject(function(_$componentController_, _$q_, $rootScope) {
    $componentController = _$componentController_;
    offerLabeller = jasmine.createSpyObj('offerLabeller', ['getSuggestions']);
    $q = _$q_;
    $scope = $rootScope.$new();
  }));

  function getComponentController(bindings) {
    // Here we are passing actual bindings to the component
    return $componentController('udbLabelSelect', {'offerLabeller': offerLabeller}, bindings);
  }

  it('should init the labels array as Label objects', function() {
    var ctrl = getComponentController(bindings);

    expect(ctrl.labels.length).toBe(2);
    expect(ctrl.labels[0].name).toBe('Wolverine');
    expect(ctrl.labels[1].name).toBe('Deadpool');
  });

  it('should evalualate whether the length criteria are met', function() {
    var ctrl = getComponentController(bindings);

    // needs to be higher than or equal to 2
    expect(ctrl.areLengthCriteriaMet(1)).toBe(false);
    // needs to be less than or equal to 255
    expect(ctrl.areLengthCriteriaMet(256)).toBe(false);
    expect(ctrl.areLengthCriteriaMet(45)).toBe(true);
  });

  it('should evalualate whether the content criteria are met', function() {
    var ctrl = getComponentController(bindings);

    var invalidLabels = ['_underscore', 'leesteken!', '#hashtag', 'sp.a', '\"quote\"' ];
    for(var label = 0; label < invalidLabels.length; label++) {
      expect(ctrl.areContentCriteriaMet(invalidLabels[label])).toBe(false);
    }

    var validLabels = ['week_van_het_bos', '14-18', 'sp-a'];
    for(var label = 0; label < validLabels.length; label++) {
      expect(ctrl.areContentCriteriaMet(validLabels[label])).toBe(true);
    }
  });

  it('should not add the same label twice', function() {
    var ctrl = getComponentController(bindings);

    // add already added label
    expect(ctrl.createLabel('Wolverine')).toBe(undefined);
    // add a label not yet added
    expect(ctrl.createLabel('Francis')).not.toBe(undefined);
    expect(ctrl.createLabel('Francis').name).toBe('Francis');
  });

  it('should not add a label that does not meet the length criteria', function() {
    var ctrl = getComponentController(bindings);

    // needs to be higher or equal to 2
    expect(ctrl.createLabel('w')).toBe(undefined);
    // needs to be less than or equal to 255
    var bigLabel = 'turnip greens yarrow ricebean rutabaga endive cauliflower sea lettuce kohlrabi amaranth water spinach avocado daikon napa cabbage asparagus winter purslane kale celery potato scallion desert raisin horseradish spinach carrot soko Lotus root water spinach fennel';
    expect(ctrl.createLabel(bigLabel)).toBe(undefined);
  });

  it('should find suggestions according to supplied search string', function(done) {
    var ctrl = getComponentController(bindings);

    expect(ctrl.availableLabels).toEqual([]);

    var suggestions = [{name: 'one'}, {name: 'two'}];
    offerLabeller.getSuggestions.and.returnValue($q.resolve(suggestions));

    ctrl.suggestLabels('Blub').then(function() {
      expect(offerLabeller.getSuggestions).toHaveBeenCalledWith('Blub', 6);
      expect(ctrl.availableLabels).toEqual([{name: 'one'}, {name: 'two'}, {name: 'Blub'}]);
      done();
    });
    $scope.$digest();
  });

  it('should find do not suggest something twice', function(done) {
    var ctrl = getComponentController(bindings);

    expect(ctrl.availableLabels).toEqual([]);

    var suggestions = [{name: 'one', uuid: 'uuid1'}, {name: 'two', uuid: 'uuid2'}];
    offerLabeller.getSuggestions.and.returnValue($q.resolve(suggestions));

    ctrl.suggestLabels('one').then(function() {
      expect(offerLabeller.getSuggestions).toHaveBeenCalledWith('one', 6);
      expect(ctrl.availableLabels).toEqual([{name: 'one', uuid: 'uuid1'}, {name: 'two', uuid: 'uuid2'}]);
      done();
    });
    $scope.$digest();
  });

  it('should not suggest a label wherefore the content criteria are not met', function(done) {
    var ctrl = getComponentController(bindings);

    expect(ctrl.availableLabels).toEqual([]);

    var suggestions = [{name: 'wrong!', uuid: 'uuid1'}, {name: 'valid', uuid: 'uuid2'}];
    offerLabeller.getSuggestions.and.returnValue($q.resolve(suggestions));

    ctrl.suggestLabels('one').then(function() {
      expect(offerLabeller.getSuggestions).toHaveBeenCalledWith('one', 6);
      expect(ctrl.availableLabels).toEqual([{name: 'valid', uuid: 'uuid2'},{name: 'one'}]);
      done();
    });
    $scope.$digest();
  });

});
