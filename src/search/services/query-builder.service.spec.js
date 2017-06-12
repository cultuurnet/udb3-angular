'use strict';

describe('Service: LuceneQueryBuilder', function () {

  // load the service's module
  beforeEach(module('udb.search'));

  // instantiate service
  var LuceneQueryBuilder;
  beforeEach(inject(function (_LuceneQueryBuilder_) {
    LuceneQueryBuilder = _LuceneQueryBuilder_;
  }));

  describe('Service: LuceneQueryBuilder', function () {

    var createAndCompareUnparsedQuery = function (queryString) {
      var query = LuceneQueryBuilder.createQuery(queryString),
        unparsedQueryString = LuceneQueryBuilder.unparse(query);

      expect(unparsedQueryString).toEqual(queryString);
    };

    var exampleQueries = [
      'title:term',
      'foo:-"fizz buzz"',
      'title:"The Right Way" AND text:go'
    ];

    exampleQueries.forEach(function (exampleQuery) {
      it('Unparses example query: "' + exampleQuery + '"', function () {
        createAndCompareUnparsedQuery(exampleQuery);
      });
    });

    it('Unparses queries with range expressions', function () {
      createAndCompareUnparsedQuery('foo:[bar TO baz]');
      createAndCompareUnparsedQuery('foo:{bar TO baz}');
    });

    it('Unparses queries with modifiers', function () {
      createAndCompareUnparsedQuery('jakarta^4');
      createAndCompareUnparsedQuery('jakarta~0.1');
      createAndCompareUnparsedQuery('-jakarta');
      createAndCompareUnparsedQuery('+jakarta');
    });

    it('Uparses queries with operators', function () {
      createAndCompareUnparsedQuery('ride AND go');
      createAndCompareUnparsedQuery('foo OR bar');
      createAndCompareUnparsedQuery('"jakarta apache" NOT "Apache Lucene"');
    });

    it('Unparses queries with grouping', function () {
      createAndCompareUnparsedQuery('(jakarta OR apache) AND website');
    });

    it('Unparses queries with field grouping', function () {
      createAndCompareUnparsedQuery('title:(+return +"pink panther")');
    });

    it('Unparses queries with field grouping containing a single negated term', function () {
      createAndCompareUnparsedQuery('calendarType:(!permanent)');
    });

    it('Unparses queries with field grouping containing multiple negated terms', function () {
      createAndCompareUnparsedQuery('calendarType:(!permanent !periodic)');
    });

    it('Groups a query tree with a single field and term', function () {
      var queryString = 'battery:horse';
      var query = LuceneQueryBuilder.createQuery(queryString);
      var groupedQueryTree = LuceneQueryBuilder.groupQueryTree(query.queryTree);

      var expectedQueryTree = {
        operator: 'OR',
        type: 'root',
        nodes: [
          {
            type: 'field',
            operator: 'OR',
            nodes: [
              {
                field: 'battery',
                fieldType: 'string',
                transformer: '=',
                term: 'horse'
              }
            ]
          }
        ]
      };

      expect(groupedQueryTree).toEqual(expectedQueryTree);
    });

    it('Groups query tree fields with different operators', function () {
      var queryString = 'battery:horse AND staple:chair OR car:dinosaur';
      var query = LuceneQueryBuilder.createQuery(queryString);
      var groupedQueryTree = LuceneQueryBuilder.groupQueryTree(query.queryTree);

      var expectedQueryTree = {
        type: 'root',
        operator: 'AND',
        nodes: [
          {
            type: 'field',
            operator: 'AND',
            nodes: [
              {
                field: 'battery',
                fieldType: 'string',
                transformer: '=',
                term: 'horse'
              }
            ]
          },
          {
            type: 'group',
            operator: 'OR',
            nodes: [
              {
                field: 'staple',
                fieldType: 'string',
                transformer: '=',
                term: 'chair'
              },
              {
                field: 'car',
                fieldType: 'string',
                transformer: '=',
                term: 'dinosaur'
              }
            ]
          }
        ]
      };

      expect(groupedQueryTree).toEqual(expectedQueryTree);
    });

    it('Groups query tree fields with grouped terms', function () {
      var queryString = 'animal:(cat dog deer)';
      var query = LuceneQueryBuilder.createQuery(queryString);
      var groupedQueryTree = LuceneQueryBuilder.groupQueryTree(query.queryTree);

      var expectedQueryTree = {
        operator: 'OR',
        type: 'root',
        nodes: [
          {
            type: 'group',
            operator: 'OR',
            nodes: [
              {
                field: 'animal',
                term: 'cat',
                transformer: '=',
                fieldType: 'string'
              },
              {
                field: 'animal',
                term: 'dog',
                transformer: '=',
                fieldType: 'string'
              },
              {
                field: 'animal',
                term: 'deer',
                transformer: '=',
                fieldType: 'string'
              }
            ]
          }
        ]
      };

      expect(groupedQueryTree).toEqual(expectedQueryTree);
    });


    it('Excludes and includes groups when unparsing grouped trees', function () {
      var groupedTree = {
        "type": "root",
        "nodes": [
          {
            "type": "group",
            "operator": "NOT",
            "nodes": [
              {
                "field": "city",
                "fieldType": "string",
                "transformer": "=",
                "term": "Tienen"
              }
            ]
          },
          {
            "type": "group",
            "operator": "OR",
            "nodes": [
              {
                "field": "location_label",
                "term": "Bibliotheek Tienen",
                "fieldType": "tokenized-string",
                "transformer": "+"
              }
            ],
            "excluded": true
          }
        ]
      };

      var queryString = LuceneQueryBuilder.unparseGroupedTree(groupedTree);
      expect(queryString).toBe('city:Tienen NOT location_label:"Bibliotheek Tienen"');
    });
  });

  it('Combines OR fields', function () {
    var groupedTree = {
      "type": "root",
      "nodes": [
        {
          "type": "group",
          "operator": "OR",
          "nodes": [
            {
              "field": "city",
              "term": "Leuven",
              "fieldType": "string",
              "transformer": "="
            },
            {
              "field": "city",
              "term": "Tienen",
              "fieldType": "string",
              "transformer": "="
            }
          ]
        }
      ]
    };

    var queryString = LuceneQueryBuilder.unparseGroupedTree(groupedTree);
    expect(queryString).toBe('city:Leuven OR city:Tienen');
  });

  it('Combines AND groups with a single field', function () {
    var groupedTree = {
      "type": "root",
      "nodes": [
        {
          "type": "group",
          "operator": "OR",
          "nodes": [
            {
              "field": "city",
              "term": "Leuven",
              "fieldType": "string",
              "transformer": "="
            },
            {
              "field": "city",
              "term": "Tienen",
              "fieldType": "string",
              "transformer": "="
            },
            {
              "type": "group",
              "operator": "AND",
              "nodes": [
                {
                  "field": "category_eventtype_name",
                  "term": "Concert",
                  "fieldType": "term",
                  "transformer": "="
                }
              ]
            }
          ]
        }
      ]
    };

    var queryString = LuceneQueryBuilder.unparseGroupedTree(groupedTree);
    expect(queryString).toBe('(city:Leuven OR city:Tienen) AND category_eventtype_name:Concert');
  });

  it('Combines AND groups with multiple fields', function () {
    var groupedTree = {
      "type": "root",
      "nodes": [
        {
          "type": "group",
          "operator": "OR",
          "nodes": [
            {
              "field": "city",
              "term": "Leuven",
              "fieldType": "string",
              "transformer": "="
            },
            {
              "type": "group",
              "operator": "AND",
              "nodes": [
                {
                  "field": "category_eventtype_name",
                  "term": "Concert",
                  "fieldType": "term",
                  "transformer": "="
                },
                {
                  "field": "category_eventtype_name",
                  "term": "Film",
                  "fieldType": "term",
                  "transformer": "="
                }
              ]
            }
          ]
        }
      ]
    };

    var queryString = LuceneQueryBuilder.unparseGroupedTree(groupedTree);
    expect(queryString).toBe('city:Leuven AND (category_eventtype_name:Concert OR category_eventtype_name:Film)');
  });

  it('Combines OR groups with multiple fields', function () {
    var groupedTree = {
      "type": "root",
      "nodes": [
        {
          "type": "group",
          "operator": "OR",
          "nodes": [
            {
              "field": "city",
              "term": "Gent",
              "fieldType": "string",
              "transformer": "="
            },
            {
              "type": "group",
              "operator": "AND",
              "nodes": [
                {
                  "field": "category_eventtype_name",
                  "term": "Concert",
                  "fieldType": "term",
                  "transformer": "="
                }
              ]
            }
          ]
        },
        {
          "type": "group",
          "operator": "OR",
          "nodes": [
            {
              "field": "city",
              "term": "Brugge",
              "fieldType": "string",
              "transformer": "=",
              "$$hashKey": "object:912"
            },
            {
              "type": "group",
              "operator": "AND",
              "nodes": [
                {
                  "field": "category_eventtype_name",
                  "term": "Film",
                  "fieldType": "term",
                  "transformer": "="
                }
              ]
            }
          ]
        }
      ]
    };

    var queryString = LuceneQueryBuilder.unparseGroupedTree(groupedTree);
    expect(queryString).toBe('(city:Gent AND category_eventtype_name:Concert) OR (city:Brugge AND category_eventtype_name:Film)');
  });

  it('Combines NOT groups with multiple fields and AND subgroups', function () {
    var groupedTree = {
      "type": "root",
      "nodes": [
        {
          "type": "group",
          "operator": "OR",
          "nodes": [
            {
              "field": "city",
              "term": "Gent",
              "fieldType": "string",
              "transformer": "="
            },
            {
              "field": "city",
              "term": "Ledeberg",
              "fieldType": "string",
              "transformer": "="
            }
          ]
        },
        {
          "type": "group",
          "operator": "OR",
          "nodes": [
            {
              "field": "city",
              "term": "Ledeberg",
              "fieldType": "string",
              "transformer": "="
            },
            {
              "type": "group",
              "operator": "AND",
              "nodes": [
                {
                  "field": "category_eventtype_name",
                  "term": "Cursus of workshop",
                  "fieldType": "term",
                  "transformer": "!"
                }
              ]
            }
          ],
          "excluded": true
        }
      ]
    };

    var queryString = LuceneQueryBuilder.unparseGroupedTree(groupedTree);
    expect(queryString).toBe('(city:Gent OR city:Ledeberg) NOT (city:Ledeberg AND !category_eventtype_name:"Cursus of workshop")');
  });

  it('Combines leading OR fields followed by OR', function () {
    var groupedTree = {
      "type": "root",
      "nodes": [
        {
          "type": "group",
          "operator": "OR",
          "nodes": [
            {
              "field": "city",
              "term": "Leuven",
              "fieldType": "string",
              "transformer": "="
            },
            {
              "field": "city",
              "term": "Tienen",
              "fieldType": "string",
              "transformer": "="
            }
          ]
        },
        {
          "type": "group",
          "operator": "OR",
          "nodes": [
            {
              "field": "category_eventtype_name",
              "term": "Concert",
              "fieldType": "term",
              "transformer": "="
            }
          ]
        }
      ]
    };

    var queryString = LuceneQueryBuilder.unparseGroupedTree(groupedTree);
    expect(queryString).toBe('(city:Leuven OR city:Tienen) OR category_eventtype_name:Concert');
  });

  it('Combines leading OR fields followed by AND', function () {
    var groupedTree = {
      "type": "root",
      "nodes": [
        {
          "type": "group",
          "operator": "OR",
          "nodes": [
            {
              "field": "title",
              "term": "a",
              "fieldType": "tokenized-string",
              "transformer": "+"
            },
            {
              "field": "title",
              "term": "b",
              "fieldType": "tokenized-string",
              "transformer": "+"
            },
            {
              "type": "group",
              "operator": "AND",
              "nodes": [
                {
                  "field": "city",
                  "term": "c",
                  "fieldType": "string",
                  "transformer": "="
                }
              ]
            }
          ],
          "treeGroupId": "1"
        }
      ]
    };

    var queryString = LuceneQueryBuilder.unparseGroupedTree(groupedTree);
    expect(queryString).toBe('(title:a OR title:b) AND city:c');
  });
});
