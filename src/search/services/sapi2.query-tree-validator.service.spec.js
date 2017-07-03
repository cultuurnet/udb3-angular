'use strict';

describe('Service: sapi2QueryTreeValidator', function () {

  // load the service's module
  beforeEach(module('udb.search'));

  beforeEach(module(function($provide) {
    var queryFields = [
      {name: 'allowed-query-field', type: 'string'},
      {name: 'name.nl', type: 'string'},
      {name: 'name.fr', type: 'string'}
    ];

    $provide.value('sapi2QueryFields', queryFields);
  }));

  // instantiate validator
  var QueryTreeValidator;
  beforeEach(inject(function (sapi2QueryTreeValidator) {
    QueryTreeValidator = sapi2QueryTreeValidator;
  }));

  it('should not allow unspecified query field', function () {
    var queryTree = {
        left: {
          field: 'unapproved-query-field',
          term: 'some-search-term'
        }
      },
      errors = [];

    QueryTreeValidator.validate(queryTree, errors);

    expect(errors[0]).toBe('unapproved-query-field is not a valid search field');

  });

  it('should allow valid query field', function () {
    var queryTree = {
        left: {
          field: 'allowed-query-field',
          term: 'some-search-term'
        }
      },
      errors = [];

    QueryTreeValidator.validate(queryTree, errors);

    expect(errors.length).toBe(0);
  });

  it('should always allow the _exists_ field', function () {
    var queryTree = {
        left: {
          field: '_exists_',
          term: 'name.fr'
        }
      },
      errors = [];

    QueryTreeValidator.validate(queryTree, errors);

    expect(errors.length).toBe(0);
  });

  it('should allow wildcards for fields that have child properties', function () {
    var queryTree = {
        left: {
          field: 'name.\\*',
          term: 'braderie'
        }
      },
      errors = [];

    QueryTreeValidator.validate(queryTree, errors);

    expect(errors.length).toBe(0);
  });

  it('should not allow wildcards for fields without child properties', function () {
    var queryTree = {
        left: {
          field: 'allowed-query-field.\\*',
          term: 'nope'
        }
      },
      errors = [];

    QueryTreeValidator.validate(queryTree, errors);

    var expectedErrors = [
      'allowed-query-field is not a valid parent search field that can be used with a wildcard'
    ];

    expect(errors).toEqual(expectedErrors);
  });
});
