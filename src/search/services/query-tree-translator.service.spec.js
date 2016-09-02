'use strict';

describe('Service: QueryTreeTranslator', function () {

  // load the service's module
  beforeEach(module('udb.search'));

  beforeEach(module(function($provide) {
    var translations = {
      en: {
        LOCATION_LABEL: 'location'
      },
      nl: {
        LOCATION_LABEL: 'locatie (naam)'
      }
    };

    $provide.value('queryFieldTranslations', translations);
  }));

  // instantiate translator
  var QueryTreeTranslator;
  beforeEach(inject(function (_QueryTreeTranslator_) {
    QueryTreeTranslator = _QueryTreeTranslator_;
  }));

  it('should translate dutch query fields', function () {
    var queryTree = {
        left: {
          field: 'locatie (naam)',
          term: 'Tienen'
        }
      };

    QueryTreeTranslator.translateQueryTree(queryTree);

    expect(queryTree.left.field).toBe('location_label');

  });

  it('should translate english query fields', function () {
    var queryTree = {
      left: {
        field: 'location',
        term: 'Tienen'
      }
    };

    QueryTreeTranslator.translateQueryTree(queryTree);

    expect(queryTree.left.field).toBe('location_label');

  });

});
