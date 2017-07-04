'use strict';

describe('Service: sapi2QueryTreeTranslator', function () {

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
  var sapi2QueryTreeTranslator;
  beforeEach(inject(function (_sapi2QueryTreeTranslator_) {
    sapi2QueryTreeTranslator = _sapi2QueryTreeTranslator_;
  }));

  it('should translate dutch query fields', function () {
    var queryTree = {
      left: {
        field: 'locatienaam',
        term: 'Tienen'
      }
    };

    sapi2QueryTreeTranslator.translateQueryTree(queryTree);

    expect(queryTree.left.field).toBe('location_label');

  });

  it('should translate english query fields', function () {
    var queryTree = {
      left: {
        field: 'location',
        term: 'Tienen'
      }
    };

    sapi2QueryTreeTranslator.translateQueryTree(queryTree);

    expect(queryTree.left.field).toBe('location_label');

  });

});
