'use strict';

describe('Directive: Unique label', function () {
  var $compile, $rootScope, $q, LabelManager;

  beforeEach(module('udb.management.labels', function($provide) {
    LabelManager = jasmine.createSpyObj('LabelManager', ['find']);
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
    LabelManager.find.and.returnValue($q.resolve({
      member: [
        {name: 'other-label'}
      ]
    }));

    var formElement = getFormElement('unique-label');
    expect($rootScope.form.name.$error).toEqual({});
  });

  it('should mark a duplicate label as invalid', function () {
    LabelManager.find.and.returnValue($q.resolve({
      member: [
        {name: 'unique-label'}
      ]
    }));

    var formElement = getFormElement('unique-label');
    expect($rootScope.form.name.$error).toEqual({'uniqueLabel': true});
  });

  it('should should not trigger validation for empty input', function () {
    var formElement = getFormElement('');
    expect(LabelManager.find).not.toHaveBeenCalled();
  });
});
