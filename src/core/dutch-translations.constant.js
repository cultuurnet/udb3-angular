'use strict';
// jscs:disable maximumLineLength

/**
 * @ngdoc service
 * @name udbApp.dutchTranslations
 * @description
 * # dutchTranslations
 * Constant in the udbApp.
 */
angular.module('udb.core')
  .constant('dutchTranslations',
  {
    'EN_ADJECTIVE': 'Engelse',
    'FR_ADJECTIVE': 'Franse',
    'DE_ADJECTIVE': 'Duitse',
    'NL_ADJECTIVE': 'Nederlandse',
    'datepicker': {
      'CURRENT': 'Vandaag',
      'CLEAR': 'Verwijder',
      'CLOSE': 'Sluiten'
    },
    '=': 'is gelijk aan',
    '><': 'tussen',
    '+': 'is gelijk aan',
    '!': 'is niet gelijk aan',
    '-': 'is niet gelijk aan',
    '>': 'is groter of gelijk aan',
    '<': 'is kleiner of gelijk aan',
    '>_DATE': 'later dan',
    '<_DATE': 'vroeger dan',
    '=_DATE': 'is gelijk aan',
    '><_DATE': 'tussen',
    'choice': {
      'asc': 'oplopend',
      'desc': 'aflopend',
      'today': 'vandaag',
      'tomorrow': 'morgen',
      'thisweekend': 'dit weekend',
      'nextweekend': 'volgend weekend',
      'next7days': 'volgende 7 dagen',
      'next14days': 'volgende 14 dagen',
      'next30days': 'volgende 30 dagen',
      'next3months': 'volgende 3 maanden',
      'next6months': 'volgende 6 maanden',
      'next12months': 'volgende 12 maanden',
      'permanent': 'permanent',
      'event': 'event',
      'actor': 'actor',
      'production': 'productie',
      'nl': 'Nederlands',
      'fr': 'Frans',
      'en': 'Engels',
      'de': 'Duits',
      'AF': 'Afghanistan',
      'AX': 'Alandeilanden',
      'AL': 'Albanië',
      'DZ': 'Algerije',
      'AS': 'Amerikaans Samoa',
      'VI': 'Amerikaanse Maagdeneilanden',
      'UM': 'Amerikaanse kleinere afgelegen eilanden',
      'AD': 'Andorra',
      'AO': 'Angola',
      'AI': 'Anguilla',
      'AQ': 'Antarctica',
      'AG': 'Antigua en Barbuda',
      'AR': 'Argentinië',
      'AM': 'Armenië',
      'AW': 'Aruba',
      'AU': 'Australië',
      'AZ': 'Azerbeidzjan',
      'BS': 'Bahama’s',
      'BH': 'Bahrein',
      'BD': 'Bangladesh',
      'BB': 'Barbados',
      'BE': 'België',
      'BZ': 'Belize',
      'BJ': 'Benin',
      'BM': 'Bermuda',
      'BT': 'Bhutan',
      'BO': 'Bolivia',
      'BA': 'Bosnië en Herzegovina',
      'BW': 'Botswana',
      'BV': 'Bouveteiland',
      'BR': 'Brazilië',
      'IO': 'Britse Gebieden in de Indische Oceaan',
      'VG': 'Britse Maagdeneilanden',
      'BN': 'Brunei',
      'BG': 'Bulgarije',
      'BF': 'Burkina Faso',
      'BI': 'Burundi',
      'KH': 'Cambodja',
      'CA': 'Canada',
      'KY': 'Caymaneilanden',
      'CF': 'Centraal-Afrikaanse Republiek',
      'CL': 'Chili',
      'CN': 'China',
      'CX': 'Christmaseiland',
      'CC': 'Cocoseilanden',
      'CO': 'Colombia',
      'KM': 'Comoren',
      'CG': 'Congo',
      'CD': 'Congo-Kinshasa',
      'CK': 'Cookeilanden',
      'CR': 'Costa Rica',
      'CU': 'Cuba',
      'CY': 'Cyprus',
      'DK': 'Denemarken',
      'DJ': 'Djibouti',
      'DM': 'Dominica',
      'DO': 'Dominicaanse Republiek',
      'DE': 'Duitsland',
      'EC': 'Ecuador',
      'EG': 'Egypte',
      'SV': 'El Salvador',
      'GQ': 'Equatoriaal-Guinea',
      'ER': 'Eritrea',
      'EE': 'Estland',
      'ET': 'Ethiopië',
      'FO': 'Faeröer',
      'FK': 'Falklandeilanden',
      'FJ': 'Fiji',
      'PH': 'Filipijnen',
      'FI': 'Finland',
      'FR': 'Frankrijk',
      'GF': 'Frans-Guyana',
      'PF': 'Frans-Polynesië',
      'TF': 'Franse Gebieden in de zuidelijke Indische Oceaan',
      'GA': 'Gabon',
      'GM': 'Gambia',
      'GE': 'Georgië',
      'GH': 'Ghana',
      'GI': 'Gibraltar',
      'GD': 'Grenada',
      'GR': 'Griekenland',
      'GL': 'Groenland',
      'GP': 'Guadeloupe',
      'GU': 'Guam',
      'GT': 'Guatemala',
      'GG': 'Guernsey',
      'GN': 'Guinee',
      'GW': 'Guinee-Bissau',
      'GY': 'Guyana',
      'HT': 'Haïti',
      'HM': 'Heard- en McDonaldeilanden',
      'IM': 'Het Eiland Man',
      'HN': 'Honduras',
      'HU': 'Hongarije',
      'HK': 'Hongkong SAR van China',
      'IS': 'IJsland',
      'IE': 'Ierland',
      'IN': 'India',
      'ID': 'Indonesië',
      'IQ': 'Irak',
      'IR': 'Iran',
      'IL': 'Israël',
      'IT': 'Italië',
      'CI': 'Ivoorkust',
      'JM': 'Jamaica',
      'JP': 'Japan',
      'YE': 'Jemen',
      'JE': 'Jersey',
      'JO': 'Jordanië',
      'CV': 'Kaapverdië',
      'CM': 'Kameroen',
      'KZ': 'Kazachstan',
      'KE': 'Kenia',
      'KG': 'Kirgizië',
      'KI': 'Kiribati',
      'KW': 'Koeweit',
      'HR': 'Kroatië',
      'LA': 'Laos',
      'LS': 'Lesotho',
      'LV': 'Letland',
      'LB': 'Libanon',
      'LR': 'Liberia',
      'LY': 'Libië',
      'LI': 'Liechtenstein',
      'LT': 'Litouwen',
      'LU': 'Luxemburg',
      'MO': 'Macao SAR van China',
      'MK': 'Macedonië',
      'MG': 'Madagaskar',
      'MW': 'Malawi',
      'MV': 'Malediven',
      'MY': 'Maleisië',
      'ML': 'Mali',
      'MT': 'Malta',
      'MA': 'Marokko',
      'MH': 'Marshalleilanden',
      'MQ': 'Martinique',
      'MR': 'Mauritanië',
      'MU': 'Mauritius',
      'YT': 'Mayotte',
      'MX': 'Mexico',
      'FM': 'Micronesië',
      'MD': 'Moldavië',
      'MC': 'Monaco',
      'MN': 'Mongolië',
      'ME': 'Montenegro',
      'MS': 'Montserrat',
      'MZ': 'Mozambique',
      'MM': 'Myanmar',
      'NA': 'Namibië',
      'NR': 'Nauru',
      'NL': 'Nederland',
      'AN': 'Nederlandse Antillen',
      'NP': 'Nepal',
      'NI': 'Nicaragua',
      'NC': 'Nieuw-Caledonië',
      'NZ': 'Nieuw-Zeeland',
      'NE': 'Niger',
      'NG': 'Nigeria',
      'NU': 'Niue',
      'KP': 'Noord-Korea',
      'MP': 'Noordelijke Marianeneilanden',
      'NO': 'Noorwegen',
      'NF': 'Norfolkeiland',
      'UG': 'Oeganda',
      'UA': 'Oekraïne',
      'UZ': 'Oezbekistan',
      'OM': 'Oman',
      'ZZ': 'Onbekend of onjuist gebied',
      'TL': 'Oost-Timor',
      'AT': 'Oostenrijk',
      'PK': 'Pakistan',
      'PW': 'Palau',
      'PS': 'Palestijns Gebied',
      'PA': 'Panama',
      'PG': 'Papoea-Nieuw-Guinea',
      'PY': 'Paraguay',
      'PE': 'Peru',
      'PN': 'Pitcairn',
      'PL': 'Polen',
      'PT': 'Portugal',
      'PR': 'Puerto Rico',
      'QA': 'Qatar',
      'RO': 'Roemenië',
      'RU': 'Rusland',
      'RW': 'Rwanda',
      'RE': 'Réunion',
      'BL': 'Saint Barthélemy',
      'KN': 'Saint Kitts en Nevis',
      'LC': 'Saint Lucia',
      'PM': 'Saint Pierre en Miquelon',
      'VC': 'Saint Vincent en de Grenadines',
      'SB': 'Salomoneilanden',
      'WS': 'Samoa',
      'SM': 'San Marino',
      'ST': 'Sao Tomé en Principe',
      'SA': 'Saoedi-Arabië',
      'SN': 'Senegal',
      'RS': 'Servië',
      'CS': 'Servië en Montenegro',
      'SC': 'Seychellen',
      'SL': 'Sierra Leone',
      'SG': 'Singapore',
      'SH': 'Sint-Helena',
      'MF': 'Sint-Maarten',
      'SI': 'Slovenië',
      'SK': 'Slowakije',
      'SD': 'Soedan',
      'SO': 'Somalië',
      'ES': 'Spanje',
      'LK': 'Sri Lanka',
      'SR': 'Suriname',
      'SJ': 'Svalbard en Jan Mayen',
      'SZ': 'Swaziland',
      'SY': 'Syrië',
      'TJ': 'Tadzjikistan',
      'TW': 'Taiwan',
      'TZ': 'Tanzania',
      'TH': 'Thailand',
      'TG': 'Togo',
      'TK': 'Tokelau',
      'TO': 'Tonga',
      'TT': 'Trinidad en Tobago',
      'TD': 'Tsjaad',
      'CZ': 'Tsjechië',
      'TN': 'Tunesië',
      'TR': 'Turkije',
      'TM': 'Turkmenistan',
      'TC': 'Turks- en Caicoseilanden',
      'TV': 'Tuvalu',
      'UY': 'Uruguay',
      'VU': 'Vanuatu',
      'VA': 'Vaticaanstad',
      'VE': 'Venezuela',
      'GB': 'Verenigd Koninkrijk',
      'AE': 'Verenigde Arabische Emiraten',
      'US': 'Verenigde Staten',
      'VN': 'Vietnam',
      'WF': 'Wallis en Futuna',
      'EH': 'Westelijke Sahara',
      'BY': 'Wit-Rusland',
      'ZM': 'Zambia',
      'ZW': 'Zimbabwe',
      'ZA': 'Zuid-Afrika',
      'GS': 'Zuid-Georgië en Zuidelijke Sandwicheilanden',
      'KR': 'Zuid-Korea',
      'SE': 'Zweden',
      'CH': 'Zwitserland'
    },
    property: {
      'name': 'Titel',
      'description': 'Beschrijving',
      'labels': 'Labels',
      'calendarSummary': 'Kalendersamenvatting',
      'image': 'Afbeelding',
      'location': 'Locatie',
      'address': 'Adres',
      'organizer': 'Organisator',
      'priceInfo': 'Prijsinformatie',
      'kansentarief': 'Kansentarief',
      'bookingInfo': 'Reservatie-info',
      'contactPoint': 'Contactinfo',
      'creator': 'Auteur',
      'terms.theme': 'Thema',
      'terms.eventtype': 'Type',
      'created': 'Datum aangemaakt',
      'modified': 'Datum laatste aanpassing',
      'publisher': 'Auteur',
      'available': 'Embargodatum',
      'endDate': 'Einddatum',
      'startDate': 'Begindatum',
      'calendarType': 'Tijd type',
      'sameAs': 'Externe IDs',
      'typicalAgeRange': 'Leeftijd',
      'language': 'Taal',
      'audience': 'Toegang'
    },
    audience: {
      'everyone': 'Voor iedereen',
      'members': 'Enkel voor leden',
      'education': 'Specifiek voor scholen',
    },
    workflowStatus: {
      'DRAFT': 'Niet gepubliceerd',
      'READY_FOR_VALIDATION': 'Gepubliceerd',
      'APPROVED': 'Gepubliceerd',
      'REJECTED': 'Niet gepubliceerd',
      'DELETED': 'Niet gepubliceerd'
    },
    queryFieldGroup: {
      'what': 'Wat',
      'where': 'Waar',
      'when': 'Wanneer',
      'input-information': 'Invoerdersinformatie',
      'translations': 'Vertalingen',
      'other': 'Andere'
    },
    'EVENT-EXPORT': {
      'QUERY-IS-MISSING': 'Een export is pas mogelijk nadat je een zoekopdracht hebt uitgevoerd'
    },
    'AANBOD_INVOEREN': 'Aanbod invoeren',
    'AANBOD_BEWERKEN': 'Aanbod bewerken',
    'AANBOD_MODEREREN': 'Aanbod modereren',
    'AANBOD_VERWIJDEREN': 'Aanbod verwijderen',
    'ORGANISATIES_BEHEREN': 'Organisaties beheren',
    'GEBRUIKERS_BEHEREN': 'Gebruikers beheren',
    'LABELS_BEHEREN': 'Labels beheren',
    'event type missing': 'Koos je een type in <a href="#wat" class="alert-link">stap 1</a>?',
    'timestamp missing': 'Koos je een datum in <a href="#wanneer" class="alert-link">stap 2</a>?',
    'start or end date missing': 'Koos je een begin- en einddatum in <a href="#wanneer" class="alert-link">stap 2</a>?',
    'when missing': 'Maakte je een keuze in <a href="#wanneer" class="alert-link">stap 2</a>?',
    'place missing for event': 'Koos je een plaats in <a href="#waar" class="alert-link">stap 3</a>?',
    'location missing for place': 'Koos je een locatie in <a href="#waar" class="alert-link">stap 3</a>?',
    'UNIQUE_ORGANIZER_NOTICE': 'Om organisaties in de UiTdatabank uniek bij te houden, vragen we elke organisatie een unieke & geldige hyperlink.',
    'OPENING_HOURS_ERROR': {
      'openAndClose': 'Vul alle openings- en sluitingstijden in.',
      'dayOfWeek': 'Er is minstens 1 openingsdag verplicht voor elke set van openingsuren.',
      'openIsBeforeClose': 'Gelieve een sluitingstijd in te geven die later is dan de openingstijd.'
    }
  }
);
