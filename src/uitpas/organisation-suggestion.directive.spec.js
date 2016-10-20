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
        {
          name: 'green',
          uuid: '6befb6d0-aefe-42bb-8496-960e9ceec05f'
        },
        {
          name: 'blue',
          uuid: '33837f92-3ce7-45d5-9d5d-02cd69556aed'
        },
        {
          name: 'UiTPAS',
          uuid: '10e44536-44e2-4b42-98c8-b8dd86a6d60b'
        }
      ]
    };

    var suggestionElement = getSuggestionElement(organisation);
    expect(suggestionElement.isolateScope().os.isUitpas).toEqual(true);
    expect(suggestionElement.children('.uitpas-tag').length).toEqual(1);
  });

  it('should not tag an organisation without labels other than UiTPAS', function () {
    var organisationWithOtherLabels = {
      name: 'Heidevissers',
      labels: [
        {
          name: 'purple',
          uuid: '252f5476-5442-4a2d-81ad-b1703fe8e88e'
        },
        {
          name: 'orange',
          uuid: '0beb5b08-7660-460e-be5c-c2636787c231'
        }
      ]
    };

    var suggestionElement = getSuggestionElement(organisationWithOtherLabels);
    expect(suggestionElement.isolateScope().os.isUitpas).toEqual(false);
    expect(suggestionElement.children('.uitpas-tag').length).toEqual(0);
  });


  it('should not tag an organisation without labels', function () {
    var organisationWithoutLabels = {
      name: 'Heidevissers',
      labels: []
    };

    var suggestionElement = getSuggestionElement(organisationWithoutLabels);
    expect(suggestionElement.isolateScope().os.isUitpas).toEqual(false);
    expect(suggestionElement.children('.uitpas-tag').length).toEqual(0);
  });

  it('should show the organisation name', function () {
    var organisation = {
      name: 'Heidevissers',
      labels: [
        {
          name: 'indigo',
          uuid: '64410657-1125-41b4-b50d-7af2a156405a'
        }
      ]
    };

    var suggestionElement = getSuggestionElement(organisation);
    expect(suggestionElement.isolateScope().os.organisation.name).toEqual('Heidevissers');

    var highlightedName = suggestionElement.children('.organisation-name').html();
    expect(highlightedName).toEqual('Heide<strong>vis</strong>sers');
  });
});