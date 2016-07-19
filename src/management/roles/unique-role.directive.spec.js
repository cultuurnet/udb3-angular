'use strict';

describe('Directive: Unique label', function () {
  var $compile, $rootScope, $q, LabelManager;

  beforeEach(module('udb.management.labels', function($provide) {
    LabelManager = jasmine.createSpyObj('LabelManager', ['get']);
    $provide.value('LabelManager', LabelManager);
  }));

  beforeEach(inject(function(_$compile_, _$rootScope_, _$q_){
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $q = _$q_;
  }));

  function getFormElement(labelName) {
    $rootScope.name = labelName;
    var elementMarkup = '<input name="name" type="text" ng-model="name" udb-unique-label />';
    var formElement = $compile('<form name="form">' + elementMarkup + '</form>')($rootScope);
    $rootScope.$digest();

    return formElement;
  }

  it('should check if a label name is unique', function () {
    LabelManager.get.and.returnValue($q.reject());
    var formElement = getFormElement('unique-label');
    expect($rootScope.form.name.$error).toEqual({});
  });

  it('should mark a duplicate label as invalid', function () {
    LabelManager.get.and.returnValue($q.resolve({
      name: 'popular-label',
      id: 'EE764EB5-B541-4C07-8DDD-CAE6C175D262',
      isVisible: true,
      isPrivate: false
    }));

    var formElement = getFormElement('popular-label');
    expect($rootScope.form.name.$error).toEqual({'uniqueLabel': true});
  });

  it('should should not trigger validation for empty input', function () {
    var formElement = getFormElement('');
    expect(LabelManager.get).not.toHaveBeenCalled();
  });
});
