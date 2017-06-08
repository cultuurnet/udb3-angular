'use strict';

/**
 * @ngdoc service
 * @name udb.search.queryFields
 * @description
 * Query field types:
 * - string
 * - string
 * - choice
 * - check
 * - date-range
 * - term
 *
 * When displayed in the editor, the first occurrence of a group name will determine its order in relation to the other
 * groups.
 */
angular
  .module('udb.search')
  .value('queryFields', [
    {name: 'cdbid', field:'id', type: 'string', group: 'what', editable: true},
    {name: 'offertype', field:'_type', type: 'choice', group: 'what', editable: true, options: ['event', 'place']},
    {name: 'keywords', field: 'labels', type: 'string', group: 'what', editable: true},
    {name: 'title', field: 'name.*', type: 'tokenized-string', group: 'what', editable: true},
    {name: 'category_eventtype_name', field:'terms.label', type: 'term', group: 'what', editable: true},
    {name: 'locationtype', field:'location.terms.label', type: 'term', group: 'what', editable: true},
    {name: 'category_theme_name', field:'terms.label', type: 'term', group: 'what', editable: true},

    {name: 'city', field:'addressLocality', type: 'string', group:'where', editable: true},
    {name: 'zipcode', field:'postalCode', type: 'string', group:'where', editable: true},
    {name: 'location_id', field:'location.id', type: 'string', group:'where', editable: true},
    {name: 'country', field: 'addressCountry', type: 'choice', group:'where', editable: false, options: ['AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM']},
    {name: 'location_label', field: 'location.name.*', type: 'tokenized-string', group:'where', editable: true},
    {name: 'category_flandersregion_name', field:'regions', type: 'term' , group:'where', editable: true},

    {name: 'startdate', field:'dateRange', type: 'date-range', group:'when', editable: true},
    {name: 'enddate', field:'dateRange', type: 'date-range', group:'when', editable: true},
    {name: 'permanent', field:'calendarType', type:'check', group:'when', editable: true},

    {name: 'lastupdated', field: 'modifiedRange', type: 'date-range', group:'input-information', editable: true},
    {name: 'creationdate', field: 'createdRange', type: 'date-range', group:'input-information', editable: true},
    {name: 'createdby', field: 'creator', type: 'string', group:'input-information', editable: true},
    {name: 'availablefrom', field: 'availableRange', type: 'date-range', group:'input-information', editable: true},

    {name: 'detail_lang', field: 'languages', type: 'choice', group:'translations', editable: true, options: ['nl', 'fr', 'en', 'de']},

    {name: 'organiser_keywords', field: 'organizer.labels', type: 'string', group: 'other', editable: true},
    {name: 'organiser_id', field: 'organizer.id', type: 'string', group: 'other', editable: true},
    {name: 'agefrom', field:'typicalAgeRange', type: 'number', group: 'other', editable: true},
    {name: 'price', field: 'price', type: 'number' , group: 'other', editable: true},
    {name: 'organiser_label', field: 'organizer.name.*', type: 'tokenized-string', group: 'other', editable: true},
    {name: 'category_facility_name', field:'location.terms.label', type: 'term', group: 'other', editable: true},
    {name: 'category_targetaudience_name', field: 'audienceType', type: 'choice', group: 'other', editable: true, options: ['everyone', 'members', 'education']},

    // The following fields are supported but not named and do not show up in the builder
    // https://github.com/cultuurnet/udb3-search-docs/blob/master/advanced-queries.md#supported-fields
    {field: 'calendarType', type: 'string'},
    {field: 'workflowStatus', type: 'choice', options: ['DRAFT', 'READY_FOR_VALIDATION', 'APPROVED', 'REJECTED', 'DELETED']},
    {field: 'name.nl', type: 'string'},
    {field: 'name.fr', type: 'string'},
    {field: 'name.de', type: 'string'},
    {field: 'name.en', type: 'string'},
    {field: 'description.nl', type: 'string'},
    {field: 'description.fr', type: 'string'},
    {field: 'description.de', type: 'string'},
    {field: 'description.en', type: 'string'},
    {field: 'terms.id', type: 'string'},
    {field: 'mediaObjectsCount', type: 'number'},
    {field: 'streetAddress', type: 'string'},
    {field: 'location.id', type: 'string'},
    {field: 'location.name.nl', type: 'string'},
    {field: 'location.name.fr', type: 'string'},
    {field: 'location.name.de', type: 'string'},
    {field: 'location.name.en', type: 'string'},
    {field: 'location.terms.id', type: 'string'},
    {field: 'organizer.id', type: 'string'},
    {field: 'organizer.name.nl', type: 'string'},
    {field: 'organizer.name.fr', type: 'string'},
    {field: 'organizer.name.de', type: 'string'},
    {field: 'organizer.name.en', type: 'string'}
  ]);
