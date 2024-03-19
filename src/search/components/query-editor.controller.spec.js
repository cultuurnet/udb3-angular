describe('QueryEditorController', function() {
    var $controller, $rootScope, queryFields, queryFieldTranslations;

    beforeEach(module('udb.search'));

    beforeEach(module(function ($provide) {
        queryFields = [
            {name: 'cdbid', field:'id', type: 'string', group: 'what', editable: true},
            {name: 'offertype', field:'_type', type: 'choice', group: 'what', editable: true, options: ['event', 'place']},
            {name: 'keywords', field: 'labels', type: 'string', group: 'what', editable: true},
            {name: 'title', field: 'name.\\*', type: 'tokenized-string', group: 'what', editable: true},
            {name: 'category_eventtype_name', field:'terms.id', type: 'term', group: 'what', editable: true},
            {name: 'locationtype', field:'terms.id', type: 'term', group: 'what', editable: true},
            {name: 'category_theme_name', field:'terms.id', type: 'term', group: 'what', editable: true},
            {name: 'text', field:'<implicit>', type: 'tokenized-string', group: 'what', editable: true},
        
            {name: 'city', field:'address.\\*.addressLocality', type: 'string', group:'where', editable: true},
            {name: 'zipcode', field:'address.\\*.postalCode', type: 'string', group:'where', editable: true},
            {name: 'location_id', field:'location.id', type: 'string', group:'where', editable: true},
            {name: 'country', field: 'address.\\*.addressCountry', type: 'choice', group:'where', editable: false, options: ['AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM']},
            {name: 'location_name', field: 'location.name.\\*', type: 'tokenized-string', group:'where', editable: true},
            {name: 'location_labels', field: 'location.labels', type: 'string', group:'where', editable: true},
            {name: 'nisRegions', field:'regions', type: 'termNis' , group:'where', editable: true},
        
            {name: 'date', field:'dateRange', type: 'date-range', group:'when', editable: true},
            {name: 'permanent', field:'calendarType', type:'check', group:'when', editable: true},
        
            {name: 'lastupdated', field: 'modified', type: 'date-range', group:'input-information', editable: true},
            {name: 'creationdate', field: 'created', type: 'date-range', group:'input-information', editable: true},
            {name: 'createdby', field: 'creator', type: 'string', group:'input-information', editable: true},
            {name: 'availablefrom', field: 'availableRange', type: 'date-range', group:'input-information', editable: true},
        
            {name: 'detail_lang', field: 'languages', type: 'choice', group:'translations', editable: true, options: ['nl', 'fr', 'en', 'de']},
        
            {name: 'organiser_keywords', field: 'organizer.labels', type: 'string', group: 'other', editable: true},
            {name: 'organiser_id', field: 'organizer.id', type: 'string', group: 'other', editable: true},
            {name: 'agefrom', field:'typicalAgeRange', type: 'number', group: 'other', editable: true},
            {name: 'attendance_mode', field:'attendanceMode', type: 'choice', group: 'other', editable: true, options: ['online', 'offline', 'mixed']},
            {name: 'price', field: 'price', type: 'number' , group: 'other', editable: true},
            {name: 'status', field: 'status', type: 'choice', group: 'other', editable: true, options: ['Available', 'Unavailable', 'TemporarilyUnavailable']},
            {name: 'booking_availability', field: 'bookingAvailability', type: 'choice', group: 'other', editable: true, options: ['available', 'unavailable']},
            {name: 'organiser_label', field: 'organizer.name.\\*', type: 'tokenized-string', group: 'other', editable: true},
            {name: 'category_facility_name', field:'terms.id', type: 'term', group: 'other', editable: true},
            {name: 'category_targetaudience_name', field: 'audienceType', type: 'choice', group: 'other', editable: true, options: ['everyone', 'members', 'education']},
        
            // The following fields are supported but not named and do not show up in the builder
            // https://github.com/cultuurnet/udb3-search-docs/blob/master/advanced-queries.md#supported-fields
            {field: 'calendarType', type: 'string'},
            {field: 'workflowStatus', type: 'choice', options: ['DRAFT', 'READY_FOR_VALIDATION', 'APPROVED', 'REJECTED', 'DELETED']},
            {field: 'name.nl', type: 'tokenized-string'},
            {field: 'name.fr', type: 'tokenized-string'},
            {field: 'name.de', type: 'tokenized-string'},
            {field: 'name.en', type: 'tokenized-string'},
            {field: 'description.nl', type: 'tokenized-string'},
            {field: 'description.fr', type: 'tokenized-string'},
            {field: 'description.de', type: 'tokenized-string'},
            {field: 'description.en', type: 'tokenized-string'},
            {field: 'terms.label', type: 'string'},
            {field: 'mediaObjectsCount', type: 'number'},
            {field: 'videosCount', type: 'number'},
            {field: 'address.\\*.streetAddress', type: 'string'},
            {field: 'location.id', type: 'string'},
            {field: 'location.name.nl', type: 'tokenized-string'},
            {field: 'location.name.fr', type: 'tokenized-string'},
            {field: 'location.name.de', type: 'tokenized-string'},
            {field: 'location.name.en', type: 'tokenized-string'},
            {field: 'location.terms.id', type: 'string'},
            {field: 'organizer.id', type: 'string'},
            {field: 'organizer.name.nl', type: 'tokenized-string'},
            {field: 'organizer.name.fr', type: 'tokenized-string'},
            {field: 'organizer.name.de', type: 'tokenized-string'},
            {field: 'organizer.name.en', type: 'tokenized-string'},
            {field: 'allAges', type: 'string'},
            {field: 'contributors', type: 'string'},
        
            // Start- and end-date have been dropped in favor of a single date field. Keep these around to map SAPI2 translations.
            {name: 'startdate', field:'dateRange', type: 'date-range'},
            {name: 'enddate', field:'dateRange', type: 'date-range'}
        ];
        $provide.value('queryFieldTranslations', queryFieldTranslations);
        $provide.value('fieldTypeTransformers', {});
        $provide.value('eventTypes', {});
        $provide.value('placeTypes', {});
        $provide.value('queryFields', queryFields);
    }));
    
    beforeEach(inject(function(_$controller_, _$rootScope_, _queryFields_, _queryFieldTranslations_, _fieldTypeTransformers_, _eventTypes_, _placeTypes_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
    }));

    it('Should parse eventType from query', function() {
        var $scope = $rootScope.$new();
        var controller = $controller('QueryEditorController', { $scope: $scope });

       var expectedResult  =  {
            type: "root",
            operator: "OR",
            nodes: [
              {
                "type": "group",
                "operator": "OR",
                "nodes": [
                  {
                    "field": "terms.id",
                    "fieldType": "term",
                    "name": "category_eventtype_name",
                    "term": "0.50.4.0.0",
                    "transformer": "=",
                  }
                ],
              }
            ]
        };

        var query = 'terms.id:0.50.4.0.0';
        var result = controller.parseModalValuesFromQuery(query);

        expect(result).toEqual(expectedResult);
    });

    it('Should parse query name is NOT equal to "test"', function(){
        var $scope = $rootScope.$new();
        var controller = $controller('QueryEditorController', { $scope: $scope });

      var expectedResult = {
        "type": "root",
        "operator": "OR",
        "nodes": [
          {
            "type": "group",
            "operator": "OR",
            "nodes": [
              {
                "field": "name.\\*",
                "fieldType": "tokenized-string",
                "name": "title",
                "term": "test",
                "transformer": "-",
              }
            ],
          }
        ]
      }

      var query = '-name.\\*:test';
      var result = controller.parseModalValuesFromQuery(query);

      expect(result).toEqual(expectedResult);

    });

    it('Should parse query: calendarType NOT equal to "permanent"', function(){
        var $scope = $rootScope.$new();
        var controller = $controller('QueryEditorController', { $scope: $scope });

        var expectedResult = {
                "type": "root",
                "operator": "OR",
                "nodes": [
                  {
                    "type": "group",
                    "operator": "OR",
                    "nodes": [
                      {
                        "field": "calendarType",
                        "fieldType": "check",
                        "name": "permanent",
                        "term": "(!permanent)",
                        "transformer": "=",
                      }
                    ],
                  }
                ]
        }

       var query = 'calendarType:(!permanent)';
       var result = controller.parseModalValuesFromQuery(query);

        expect(result).toEqual(expectedResult)
    });

    it('Should parse query: municipality equals nis-21001-Z (Brussel)', function(){
        var $scope = $rootScope.$new();
        var controller = $controller('QueryEditorController', { $scope: $scope });

        var expectedResult = {
            "type": "root",
            "operator": "OR",
            "nodes": [
              {
                "type": "group",
                "operator": "OR",
                "nodes": [
                  {
                    "field": "regions",
                    "fieldType": "termNis",
                    "name": "nisRegions",
                    "term": "nis-21004-Z",
                    "transformer": "=",
                  }
                ],
              }
            ]
          }

        var query = 'regions:nis-21004-Z';
        var result = controller.parseModalValuesFromQuery(query);
   
        expect(result).toEqual(expectedResult);

    });

    it('Should parse a complex query (with OR relation)', function(){
    
        var $scope = $rootScope.$new();
        var controller = $controller('QueryEditorController', { $scope: $scope });

        var expectedResult = {
            "type": "root",
            "operator": "OR",
            "nodes": [
              {
                "type": "group",
                "operator": "OR",
                "nodes": [
                  {
                    "field": "regions",
                    "fieldType": "termNis",
                    "transformer": "=",
                    "term": "nis-21001-Z",
                    "name": "nisRegions",
                  },
                  {
                    "field": "terms.id",
                    "fieldType": "term",
                    "transformer": "=",
                    "term": "1.7.11.0.0",
                    "name": "category_theme_name",
                  },
                  {
                    "field": "attendanceMode",
                    "fieldType": "choice",
                    "transformer": "=",
                    "term": "online",
                    "name": "attendance_mode",
                  },
                  {
                    "field": "terms.id",
                    "fieldType": "term",
                    "transformer": "!",
                    "term": "3.40.0.0.0",
                    "name": "category_facility_name",
                  },
                  {
                    "field": "audienceType",
                    "fieldType": "choice",
                    "transformer": "=",
                    "term": "education",
                    "name": "category_targetaudience_name",
                  }
                ],
              }
            ],
          }

        var query = 'regions:nis-21001-Z OR (terms.id:1.7.11.0.0 OR (attendanceMode:online OR (!terms.id:3.40.0.0.0 OR audienceType:education)))';
        var result = controller.parseModalValuesFromQuery(query);

        expect(result).toEqual(expectedResult)

    });


    it('Should parse a query with a date range', function(){

        var $scope = $rootScope.$new();
        var controller = $controller('QueryEditorController', { $scope: $scope });

        var expectedResult = {
                "type": "root",
                "operator": "OR",
                "nodes": [
                  {
                    "type": "group",
                    "operator": "OR",
                    "nodes": [
                      {
                        "field": "dateRange",
                        "fieldType": "date-range",
                        "inclusive": true,
                        "name": "date",
                        "transformer": "><",
                        "lowerBound": new Date("2024-03-12T23:00:00.000Z"),
                        "upperBound": new Date("2024-03-23T22:59:59.000Z"),
                      }
                    ],
                  }
                ]
        }

        var query = 'dateRange:[2024-03-13T00:00:00+01:00 TO 2024-03-23T23:59:59+01:00]';

        var result = controller.parseModalValuesFromQuery(query);
        expect(result).toEqual(expectedResult)
    });

    it('Should parse a query with AND condtion', function(){
      var $scope = $rootScope.$new();
      var controller = $controller('QueryEditorController', { $scope: $scope });

      var expectedResult = {
        "type": "root",
        "nodes": [
          {
            "type": "group",
            "operator": "AND",
            "nodes": [
              {
                "field": "labels",
                "fieldType": "string",
                "transformer": "=",
                "term": "uitpas",
                "name": "keywords",
              },
              {
                "field": "name.\\*",
                "fieldType": "tokenized-string",
                "transformer": "+",
                "term": "monologen",
                "name": "title",
              },
              {
                "field": "terms.id",
                "fieldType": "term",
                "transformer": "=",
                "term": "0.3.1.0.0",
                "name": "category_eventtype_name",
              }
            ],
          }
        ],
        "operator": "AND"
      }

      var query = '(labels:uitpas AND name.\\*:monologen) AND terms.id:0.3.1.0.0';
      var result = controller.parseModalValuesFromQuery(query);
 
      expect(result).toEqual(expectedResult);

    });

    it ('Should parse a query with 2 groups with AND condition', function(){  
      var $scope = $rootScope.$new();
      var controller = $controller('QueryEditorController', { $scope: $scope });

      var expectedResult = {
        "type": "root",
        "nodes": [
          {
            "type": "group",
            "operator": "AND",
            "nodes": [
              {
                "field": "labels",
                "fieldType": "string",
                "transformer": "=",
                "term": "uitpas",
                "name": "keywords",
              },
              {
                "field": "name.\\*",
                "fieldType": "tokenized-string",
                "transformer": "+",
                "term": "monologen",
                "name": "title",
              }
            ],
          },
          {
            "type": "group",
            "operator": "AND",
            "nodes": [
              {
                "field": "name.\\*",
                "fieldType": "tokenized-string",
                "transformer": "+",
                "term": "test",
                "name": "title",
              },
              {
                "field": "terms.id",
                "fieldType": "term",
                "transformer": "=",
                "term": "0.50.4.0.0",
                "name": "category_eventtype_name",
              }
            ],
          }
        ],
        "operator": "OR"
      }

      var query = '(labels:uitpas AND name.\\*:monologen) OR (name.\\*:test AND terms.id:0.50.4.0.0)';
      var result = controller.parseModalValuesFromQuery(query);
      expect(result).toEqual(expectedResult);

    });

    it ('Should parse a query with NOT condition', function(){
      var $scope = $rootScope.$new();
      var controller = $controller('QueryEditorController', { $scope: $scope });

      var expectedResult = {
        "type": "root",
        "nodes": [
          {
            "type": "group",
            "operator": "NOT",
            "nodes": [
              {
                "field": "labels",
                "fieldType": "string",
                "transformer": "=",
                "term": "uitpas",
                "name": "keywords",
              }
            ],
          },
          {
            "type": "group",
            "operator": "OR",
            "nodes": [
              {
                "field": "name.\\*",
                "fieldType": "tokenized-string",
                "transformer": "+",
                "term": "monologen",
                "name": "title",
              },
              {
                "field": "terms.id",
                "fieldType": "term",
                "transformer": "=",
                "term": "0.50.4.0.0",
                "name": "category_eventtype_name",
              }
            ],
            "excluded": true,
          }
        ],
        "operator": "NOT"
      }

      var query = 'labels:uitpas NOT (name.\\*:monologen OR terms.id:0.50.4.0.0)';
      var result = controller.parseModalValuesFromQuery(query);
      expect(result).toEqual(expectedResult);

    });


    it ('Should parse a query with implicit text', function(){

    var $scope = $rootScope.$new();
    var controller = $controller('QueryEditorController', { $scope: $scope });

    var expectedResult = {
        "type": "root",
        "nodes": [
          {
            "type": "group",
            "operator": "OR",
            "nodes": [
              {
                "field": "<implicit>",
                "fieldType": "tokenized-string",
                "transformer": "+",
                "term": "test",
                "name": "text",
              }
            ],
          }
        ],
        "operator": "OR"
      }

      var query = 'test';
      var result = controller.parseModalValuesFromQuery(query);
      expect(result).toEqual(expectedResult);

    });


    it('Should parse the following query: regions:nis-70000 AND organizer.name.\*:museum', function(){

      var $scope = $rootScope.$new();
      var controller = $controller('QueryEditorController', { $scope: $scope });

      var expectedResult = {
        "type": "root",
        "nodes": [
          {
            "type": "group",
            "operator": "AND",
            "nodes": [
              {
                "field": "regions",
                "fieldType": "termNis",
                "transformer": "=",
                "term": "nis-70000",
                "name": "nisRegions",
              },
              {
                "field": "organizer.name.\\*",
                "fieldType": "tokenized-string",
                "transformer": "+",
                "term": "museum",
                "name": "organiser_label",
              }
            ],
          }
        ],
        "operator": "AND"
      }

      var query = 'regions:nis-70000 AND organizer.name.\\*:museum';
      var result = controller.parseModalValuesFromQuery(query);
      expect(result).toEqual(expectedResult);

    });


    it('Should parse the following query: address.\*.postalCode:2840 AND (dateRange:[2018-09-30T00:00:00%2B02:00 TO 2018-12-31T23:59:59%2B01:00] AND calendarType:(!permanent))', function(){

      var $scope = $rootScope.$new();
      var controller = $controller('QueryEditorController', { $scope: $scope });

      var expectedResult =  {
          "type": "root",
          "nodes": [
            {
              "type": "group",
              "operator": "AND",
              "nodes": [
                {
                  "field": "address.\\*.postalCode",
                  "fieldType": "string",
                  "transformer": "=",
                  "term": "2840",
                  "name": "zipcode",
                },
                {
                  "field": "dateRange",
                  "fieldType": "date-range",
                  "transformer": "><",
                  "lowerBound": new Date("2018-09-29T22:00:00.000Z"),
                  "upperBound": new Date("2018-12-31T22:59:59.000Z"),
                  "inclusive": true,
                  "name": "date",
                },
                {
                  "field": "calendarType",
                  "fieldType": "check",
                  "transformer": "=",
                  "term": "(!permanent)",
                  "name": "permanent",
                }
              ],
            }
          ],
          "operator": "AND"
        }

        var query = 'address.\\*.postalCode:2840 AND (dateRange:[2018-09-30T00:00:00+02:00 TO 2018-12-31T23:59:59+01:00] AND calendarType:(!permanent))'
        var result = controller.parseModalValuesFromQuery(query);
        expect(result).toEqual(expectedResult);

    });

    it('Should parse the following query: address.\*.postalCode:3680 AND (calendarType:(!permanent) AND dateRange:[2020-11-01T00:00:00%2B01:00 TO 2020-12-06T23:59:59%2B01:00])', function(){

      var $scope = $rootScope.$new();
      var controller = $controller('QueryEditorController', { $scope: $scope });

      var expectedResult = {
        "type": "root",
        "nodes": [
          {
            "type": "group",
            "operator": "AND",
            "nodes": [
              {
                "field": "address.\\*.postalCode",
                "fieldType": "string",
                "transformer": "=",
                "term": "3680",
                "name": "zipcode",
              },
              {
                "field": "calendarType",
                "fieldType": "check",
                "transformer": "=",
                "term": "(!permanent)",
                "name": "permanent",
              },
              {
                "field": "dateRange",
                "fieldType": "date-range",
                "transformer": "><",
                "lowerBound": new Date("2020-10-31T23:00:00.000Z"),
                "upperBound": new Date("2020-12-06T22:59:59.000Z"),
                "inclusive": true,
                "name": "date",
              }
            ],
          }
        ],
        "operator": "AND"
      }

      var query = 'address.\\*.postalCode:3680 AND (calendarType:(!permanent) AND dateRange:[2020-11-01T00:00:00+01:00 TO 2020-12-06T23:59:59+01:00])';
      var result = controller.parseModalValuesFromQuery(query);
      expect(result).toEqual(expectedResult);
      
    });


    it('Should parse the following query labels:"Digitale week" AND (dateRange:[2016-10-07T22\:00\:00%2B00\:00 TO 2016-10-16T21\:59\:59%2B00\:00] OR (dateRange:[2016-10-07T22\:00\:00%2B00\:00 TO 2016-10-16T21\:59\:59%2B00\:00] OR calendarType:permanent))', function() {
 
      var $scope = $rootScope.$new();
      var controller = $controller('QueryEditorController', { $scope: $scope });

      var expectedResult = {
          "type": "root",
          "nodes": [
            {
              "type": "group",
              "operator": "AND",
              "nodes": [
                {
                  "field": "labels",
                  "fieldType": "string",
                  "transformer": "=",
                  "term": "Digitale week",
                  "name": "keywords",
                },
                {
                  "field": "dateRange",
                  "fieldType": "date-range",
                  "transformer": "><",
                  "lowerBound": new Date("2016-10-07T22:00:00.000Z"),
                  "upperBound": new Date("2016-10-16T21:59:59.000Z"),
                  "inclusive": true,
                  "name": "date",
                }
              ],
            },
            {
              "type": "group",
              "operator": "OR",
              "nodes": [
                {
                  "field": "dateRange",
                  "fieldType": "date-range",
                  "transformer": "><",
                  "lowerBound": new Date("2016-10-07T22:00:00.000Z"),
                  "upperBound": new Date("2016-10-16T21:59:59.000Z"),
                  "inclusive": true,
                  "name": "date",
                },
                {
                  "field": "calendarType",
                  "fieldType": "check",
                  "transformer": "=",
                  "term": "permanent",
                  "name": "permanent",
                }
              ],
            }
          ],
          "operator": "AND"
      }

      var query = 'labels:"Digitale week" AND (dateRange:[2016-10-07T22\:00\:00+00\:00 TO 2016-10-16T21\:59\:59+00\:00] OR (dateRange:[2016-10-07T22\:00\:00+00\:00 TO 2016-10-16T21\:59\:59+00\:00] OR calendarType:permanent))';
      var result = controller.parseModalValuesFromQuery(query);
      expect(result).toEqual(expectedResult);

    })

});