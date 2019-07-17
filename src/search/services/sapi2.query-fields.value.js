'use strict';

/**
 * @ngdoc service
 * @name udb.search.sapi2QueryFields
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
  .value('sapi2QueryFields', [
    {name: 'cdbid', type: 'string', group: 'what', editable: true},
    {name: 'keywords', type: 'string', group: 'what', editable: true},
    {name: 'title', type: 'tokenized-string', group: 'what', editable: true},
    {name: 'category_eventtype_name', type: 'term', group: 'what', editable: true},
    {name: 'category_theme_name', type: 'term', group: 'what', editable: true},

    {name: 'city', type: 'string', group:'where', editable: true},
    {name: 'zipcode', type: 'string', group:'where', editable: true},
    {name: 'country', type: 'choice', group:'where', editable: false, options: ['AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM']},
    {name: 'location_name', type: 'tokenized-string', group:'where', editable: true},
    {name: 'location_labels', type: 'string', group:'where', editable: true},
    {name: 'category_flandersregion_name', type: 'term' , group:'where', editable: true},

    {name: 'startdate', type: 'date-range', group:'when', editable: true},
    {name: 'enddate', type: 'date-range', group:'when', editable: true},
    {name: 'permanent', type: 'check', group:'when', editable: true},

    {name: 'lastupdated', type: 'date-range', group:'input-information', editable: true},
    {name: 'lastupdatedby', type: 'string', group:'input-information', editable: true},
    {name: 'creationdate', type: 'date-range', group:'input-information', editable: true},
    {name: 'createdby', type: 'string', group:'input-information', editable: true},
    {name: 'availablefrom', type: 'date-range', group:'input-information', editable: true},

    {name: 'detail_lang', type: 'choice', group:'translations', editable: true, options: ['nl', 'fr', 'en', 'de']},

    {name: 'organiser_keywords', type: 'string', group: 'other', editable: true},
    {name: 'agefrom', type: 'number', group: 'other', editable: true},
    {name: 'price', type: 'number' , group: 'other', editable: true},
    {name: 'organiser_label', type: 'tokenized-string', group: 'other', editable: true},
    {name: 'category_facility_name', type: 'term', group: 'other', editable: true},
    {name: 'category_targetaudience_name', type: 'term', group: 'other', editable: true},
    {name: 'category_publicscope_name', type: 'term', group: 'other', editable: true},

    {name: 'like_count', type: 'number'},
    {name: 'recommend_count', type: 'number'},
    {name: 'attend_count', type: 'number'},
    {name: 'comment_count', type: 'number'},
    {name: 'category_name', type: 'term'},
    {name: 'externalid', type: 'string'},
    {name: 'private', type: 'check'},
    {name: 'physical_gis', type: 'string'}
  ]);
