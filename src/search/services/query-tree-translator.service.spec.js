'use strict';

describe('Service: QueryTreeTranslator', function () {

  // load the service's module
  beforeEach(module('udb.search'));

  beforeEach(module(function($provide) {
    var translations = {
      sapi2: {
        LOCATION_LABEL: 'location_label'
      },
      en: {
        LOCATION_LABEL: 'location'
      },
      nl: {
        LOCATION_LABEL: 'locatie'
      }
    };

    var queryFields = [
      {name: 'location_label', field: 'location.name.*', type: 'tokenized-string', group:'where', editable: true}
    ];

    $provide.constant('queryFieldTranslations', translations);
    $provide.value('queryFields', queryFields);
  }));

  // instantiate translator
  var QueryTreeTranslator;
  beforeEach(inject(function (_QueryTreeTranslator_) {
    QueryTreeTranslator = _QueryTreeTranslator_;
  }));

  it('should translate dutch query fields', function () {
    var queryTree = {
        left: {
          field: 'locatie',
          term: 'Tienen'
        }
      };
    var expectedQueryTree = {
      left: {
        field: 'location.name.*',
        term: 'Tienen'
      }
    };

    QueryTreeTranslator.translateQueryTree(queryTree);
    expect(queryTree).toEqual(expectedQueryTree);

  });

  it('should translate english query fields', function () {
    var queryTree = {
      left: {
        field: 'location',
        term: 'Leuven'
      }
    };
    var expectedQueryTree = {
      left: {
        field: 'location.name.*',
        term: 'Leuven'
      }
    };

    QueryTreeTranslator.translateQueryTree(queryTree);
    expect(queryTree).toEqual(expectedQueryTree);
  });

  it('should translate sapi2 query fields', function () {
    var queryTree = {
      left: {
        field: 'location_label',
        term: 'Brussel'
      }
    };
    var expectedQueryTree = {
      left: {
        field: 'location.name.*',
        term: 'Brussel'
      }
    };

    QueryTreeTranslator.translateQueryTree(queryTree);
    expect(queryTree).toEqual(expectedQueryTree);
  });
});
