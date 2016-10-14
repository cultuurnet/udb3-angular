'use strict';

describe('Organisation Suggestion Component', function () {
  var $componentController, offerLabeller, $q, $scope, $compile;

  beforeEach(module('udb.uitpas'));
  beforeEach(inject(function (_$componentController_, _$q_, $rootScope, _$compile_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope.$new();
    $compile = _$compile_;
  }));

  function getSuggestionElement(organisation) {
    $scope.organisation = organisation;
    var element = $compile(
      '<uitpas-organisation-suggestion organisation="organisation"></uitpas-organisation-suggestion>'
    )($scope);

    $scope.$digest();

    return element.children().first();
  }

  it('should show an UiTPAS tag when the organisation has an UiTPAS label', function () {
    var organisation = {
      name: 'Heidevissers',
      labels: [
        'green',
        'blue',
        'UiTPAS'
      ]
    };

    var suggestionElement = getSuggestionElement(organisation);
    expect(suggestionElement.scope().os.isUitpas).toEqual(true);
    expect(suggestionElement.children('.uitpas-tag').length).toEqual(1);
  });

  it('should not tag an organisation without labels other than UiTPAS', function () {
    var organisationWithOtherLabels = {
      name: 'Heidevissers',
      labels: [
        'purple',
        'orange'
      ]
    };

    var suggestionElement = getSuggestionElement(organisationWithOtherLabels);
    expect(suggestionElement.scope().os.isUitpas).toEqual(false);
    var content = suggestionElement.html();
    expect(suggestionElement.children('.uitpas-tag').length).toEqual(0);
  });


  it('should not tag an organisation without labels', function () {
    var organisationWithoutLabels = {
      name: 'Heidevissers',
      labels: []
    };

    var suggestionElement = getSuggestionElement(organisationWithoutLabels);
    expect(suggestionElement.scope().os.isUitpas).toEqual(false);
    expect(suggestionElement.children('.uitpas-tag').length).toEqual(0);
  });

  it('should show the organisation name', function () {
    var organisation = {
      name: 'Heidevissers',
      labels: ['indigo']
    };

    var suggestionElement = getSuggestionElement(organisation);
    expect(suggestionElement.children('.organisation-name').first().html()).toEqual('Heidevissers');
  });
});