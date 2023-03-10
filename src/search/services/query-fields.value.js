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

    // Start- and end-date have been dropped in favor of a single date field. Keep these around to map SAPI2 translations.
    {name: 'startdate', field:'dateRange', type: 'date-range'},
    {name: 'enddate', field:'dateRange', type: 'date-range'}
  ]);
