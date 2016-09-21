'use strict';

describe('Directive: Semicolon check', function () {
  var $compile, $rootScope, $q;

  beforeEach(module('udb.management.labels'));

  beforeEach(inject(function(_$compile_, _$rootScope_, _$q_){
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $q = _$q_;
  }));

  function getFormElement(labelName) {
    $rootScope.name = labelName;
    var elementMarkup = '<input name="name" type="text" ng-model="name" udb-semicolon-label-check />';
    var formElement = $compile('<form name="form">' + elementMarkup + '</form>')($rootScope);
    $rootScope.$digest();

    return formElement;
  }

  it('should check if a label name contains a semicolon', function () {
    var formElement = getFormElement('the dreaded ;');
    expect($rootScope.form.name.$error).toEqual({'semicolonLabel': true});

    $rootScope.name = ';the dreaded';
    expect($rootScope.form.name.$error).toEqual({'semicolonLabel': true});

    $rootScope.name = 'dreaded; the';
    expect($rootScope.form.name.$error).toEqual({'semicolonLabel': true});
  });

  it('should check if a label name does not contain a semicolon', function () {
    var formElement = getFormElement('the brand new label');
    expect($rootScope.form.name.$error).toEqual({});
  });
});
