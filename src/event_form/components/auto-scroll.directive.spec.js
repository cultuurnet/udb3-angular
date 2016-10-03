'use strict';

describe('Directive: Auto scroll', function () {

  var $rootScope, $document, $compile, $scope;

  beforeEach(module('udb.event-form'));

  beforeEach(inject(function(_$compile_, _$document_, _$rootScope_){
    $compile = _$compile_;
    $document = _$document_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
  }));

  function getElementWithAutoScroll() {
    var element = $compile(
      '<input type="text" udb-auto-scroll>'
    )($scope);

    $scope.$digest();

    return element;
  }

  it('should scroll to an element when focused', function () {
    var element = getElementWithAutoScroll();
    spyOn($document, 'scrollTo');

    element.trigger('focusin');

    expect($document.scrollTo).toHaveBeenCalled();
  });

  it('should scroll to an element when clicked', function () {
    var element = getElementWithAutoScroll();
    spyOn($document, 'scrollTo');

    element.trigger('click');

    expect($document.scrollTo).toHaveBeenCalled();
  });
});