'use strict';

describe('Organisation Suggestion Directive', function () {
  var $q, $scope, $compile;

  beforeEach(module('udb.uitpas'));
  beforeEach(module('udb.core'));
  beforeEach(module('udb.templates'));
  beforeEach(inject(function (_$q_, $rootScope, _$compile_) {
    $q = _$q_;
    $scope = $rootScope.$new();
    $compile = _$compile_;
  }));

  function getSuggestionElement(organisation) {
    $scope.organisation = organisation;
    $scope.query = 'vis';
    var element = $compile(
      '<a uitpas-organisation-suggestion organisation="organisation" query="query"></a>'
    )($scope);

    $scope.$digest();

    return element;
  }

  it('should show an UiTPAS tag when the organisation has an UiTPAS label', function () {
    var organisation = {
      name: 'Heidevissers',
      labels: [
        'green',
        'blue',
        'UiTPAS'
      ],
      isUitpas: true
    };

    var suggestionElement = getSuggestionElement(organisation);
    expect(suggestionElement.children('.uitpas-tag').length).toEqual(1);
  });

  it('should not tag an organisation without labels other than UiTPAS', function () {
    var organisationWithOtherLabels = {
      name: 'Heidevissers',
      labels: [
        'purple',
        'orange'
      ],
      isUitpas: false
    };

    var suggestionElement = getSuggestionElement(organisationWithOtherLabels);
    expect(suggestionElement.children('.uitpas-tag').length).toEqual(0);
  });


  it('should not tag an organisation without labels', function () {
    var organisationWithoutLabels = {
      name: 'Heidevissers',
      labels: [],
      isUitpas: false
    };

    var suggestionElement = getSuggestionElement(organisationWithoutLabels);
    expect(suggestionElement.children('.uitpas-tag').length).toEqual(0);
  });

  it('should show the organisation name', function () {
    var organisation = {
      name: 'Heidevissers',
      labels: [
        'indigo'
      ]
    };

    var suggestionElement = getSuggestionElement(organisation);
    expect(suggestionElement.isolateScope().os.organisation.name).toEqual('Heidevissers');

    var highlightedName = suggestionElement.children('.organisation-name').html();
    expect(highlightedName).toEqual('Heide<strong>vis</strong>sers');
  });
});