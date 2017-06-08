'use strict';

describe('Service: QueryTreeValidator', function () {

  // load the service's module
  beforeEach(module('udb.search'));

  beforeEach(module(function($provide) {
    var queryFields = [
      {name: 'allowed-query-field', field:'allowed.query.field', type: 'string'},
      {field: 'workflowStatus', type: 'choice', options: ['DRAFT', 'READY_FOR_VALIDATION', 'APPROVED', 'REJECTED', 'DELETED']},
      {field: 'name.nl', type: 'string'},
      {field: 'name.fr', type: 'string'}
    ];

    $provide.value('queryFields', queryFields);
  }));

  // instantiate validator
  var QueryTreeValidator;
  beforeEach(inject(function (_QueryTreeValidator_) {
    QueryTreeValidator = _QueryTreeValidator_;
  }));

  it('should not allow unspecified query field', function () {
    var queryTree = {
          left: {
            field: 'unapproved.query.field',
            term: 'some-search-term'
          }
        },
        errors = [];

    QueryTreeValidator.validate(queryTree, errors);

    expect(errors[0]).toBe('unapproved.query.field is not a valid search field');

  });

  it('should allow valid query field', function () {
    var queryTree = {
        left: {
          field: 'allowed.query.field',
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
          field: 'allowed.query.field.\\*',
          term: 'nope'
        }
      },
      errors = [];

    QueryTreeValidator.validate(queryTree, errors);

    var expectedErrors = [
      'allowed.query.field is not a valid parent search field that can be used with a wildcard'
    ];

    expect(errors).toEqual(expectedErrors);
  });

  it('should allow unnamed query field', function () {
    var queryTree = {
        left: {
          field: 'workflowStatus',
          term: 'APPROVED'
        }
      },
      errors = [];

    QueryTreeValidator.validate(queryTree, errors);

    expect(errors.length).toBe(0);
  });
});
