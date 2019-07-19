// Source: src/core/authorization-service.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.core.authorizationService
 * @description
 * # authorizationService
 * Service in the udb.core.
 */
angular
  .module('udb.core')
  .constant('authorization', {
    'editOffer': 'AANBOD_BEWERKEN',
    'moderateOffer': 'AANBOD_MODEREREN',
    'removeOffer': 'AANBOD_VERWIJDEREN',
    'manageOrganisations': 'ORGANISATIES_BEHEREN',
    'manageUsers': 'GEBRUIKERS_BEHEREN',
    'manageLabels': 'LABELS_BEHEREN',
    'editFacilities': 'VOORZIENINGEN_BEWERKEN'
  })
  .service('authorizationService', AuthorizationService);

/* @ngInject */
function AuthorizationService($q, uitidAuth, udbApi, $location, $rootScope, $translate) {
  this.isLoggedIn = function () {
    var deferred = $q.defer();

    var deferredUser = udbApi.getMe();
    deferredUser.then(
      function (user) {
        $rootScope.$emit('userLoggedIn', user);
        deferred.resolve(user);
      },
      function () {
        uitidAuth.login();

        // We are redirecting away from the current page, so no need to
        // resolve or reject the deferred.
      }
    );

    return deferred.promise;
  };

  /**
   * @param {string} path
   * @return {Promise.<boolean>}
   *  Resolves to TRUE when no user is logged in and no redirect has occurred.
   */
  this.redirectIfLoggedIn = function (path) {
    var deferredRedirect = $q.defer();

    function redirect() {
      $location.path(path);
      deferredRedirect.resolve(false);
    }

    if (uitidAuth.getToken()) {
      udbApi
        .getMe()
        .then(redirect, deferredRedirect.reject)
        // Send an emit u
        .finally(function () {
          $rootScope.$emit('$changeLocales', $translate.use());
        });
    } else {
      deferredRedirect.resolve(true);
    }

    return deferredRedirect.promise;
  };

  /**
   * @param {string} permission - One of the authorization constants
   */
  this.hasPermission = function (permission) {
    var deferredHasPermission = $q.defer();

    function findPermission(permissionList) {
      var foundPermission = _.find(permissionList, function(p) { return p === permission; });
      deferredHasPermission.resolve(foundPermission ? true : false);
    }

    udbApi
      .getMyPermissions()
      .then(findPermission, deferredHasPermission.reject);

    return deferredHasPermission.promise;
  };

  /**
   * @return RolePermission[]
   */
  this.getPermissions = function () {
    return udbApi.getMyPermissions();
  };

  this.isGodUser = function () {
    return this.hasPermission('GEBRUIKERS_BEHEREN');
  };
}
AuthorizationService.$inject = ["$q", "uitidAuth", "udbApi", "$location", "$rootScope", "$translate"];
})();

// Source: src/core/city-autocomplete.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.core.CityAutocomplete
 * @description
 * Service for city autocompletes.
 */
angular
  .module('udb.core')
  .service('cityAutocomplete', CityAutocomplete);

/* @ngInject */
function CityAutocomplete($q, $http, appConfig, UdbPlace, jsonLDLangFilter) {
  /**
   *
   * Get the places for a city
   *
   * @param {string} zipcode
   * @param {string} country
   * @returns {Promise}
   */
  this.getPlacesByZipcode = function(zipcode, country) {

    var deferredPlaces = $q.defer();
    var url = appConfig.baseUrl + 'places/';
    var config = {
      headers: {
        'X-Api-Key': _.get(appConfig, 'apiKey')
      },
      params: {
        'postalCode': zipcode,
        'addressCountry': country,
        'workflowStatus': 'DRAFT,READY_FOR_VALIDATION,APPROVED',
        'disableDefaultFilters': true,
        'embed': true,
        'limit': 1000,
        'sort[created]': 'asc'
      }
    };

    var parsePagedCollection = function (response) {
      var locations = _.map(response.data.member, function (placeJson) {
        var place = new UdbPlace(placeJson);
        return jsonLDLangFilter(place, 'nl');
      });

      deferredPlaces.resolve(locations);
    };

    var failed = function () {
      deferredPlaces.reject('something went wrong while getting places for city with zipcode: ' + zipcode);
    };

    $http.get(url, config).then(parsePagedCollection, failed);

    return deferredPlaces.promise;
  };

  /**
   *
   * Get the places for a city
   *
   * @param {string} city
   * @param {string} country
   * @returns {Promise}
   */
  this.getPlacesByCity = function(city, country) {

    var deferredPlaces = $q.defer();
    var url = appConfig.baseUrl + 'places/';
    var config = {
      headers: {
        'X-Api-Key': _.get(appConfig, 'apiKey')
      },
      params: {
        'q': 'address.\\*.addressLocality:' + city,
        'addressCountry': country,
        'workflowStatus': 'DRAFT,READY_FOR_VALIDATION,APPROVED',
        'disableDefaultFilters': true,
        'embed': true,
        'limit': 1000,
        'sort[created]': 'asc'
      }
    };

    var parsePagedCollection = function (response) {
      var locations = _.map(response.data.member, function (placeJson) {
        var place = new UdbPlace(placeJson);
        return jsonLDLangFilter(place, 'nl');
      });

      deferredPlaces.resolve(locations);
    };

    var failed = function () {
      deferredPlaces.reject('something went wrong while getting places for city with city: ' + city);
    };

    $http.get(url, config).then(parsePagedCollection, failed);

    return deferredPlaces.promise;
  };

}
CityAutocomplete.$inject = ["$q", "$http", "appConfig", "UdbPlace", "jsonLDLangFilter"];
})();

// Source: src/core/components/calendar-summary/calendar-summary.controller.js
(function () {
'use strict';

angular
  .module('udb.core')
  .controller('CalendarSummaryController', calendarSummaryController);

function calendarSummaryController($scope) {
  $scope.getOpeningHoursCount = function(offer) {
    if (offer.calendarType === 'single' && offer.startDate !== offer.endDate) {
      offer.openingHours = [{
        startDate: offer.startDate,
        endDate: offer.endDate
      }];
    }
    return offer.openingHours.length;
  };
}
calendarSummaryController.$inject = ["$scope"];
})();

// Source: src/core/components/calendar-summary/calendar-summary.directive.js
(function () {
'use strict';

angular
  .module('udb.core')
  .directive('udbCalendarSummary', udbCalendarSummary);

function udbCalendarSummary() {
  return {
    restrict: 'E',
    scope: {
      offer: '=',
      showOpeningHours: '='
    },
    templateUrl: 'templates/calendar-summary.directive.html',
    controller: 'CalendarSummaryController'
  };
}
})();

// Source: src/core/components/image-detail/image-detail.directive.js
(function () {
'use strict';

/**
 * @ngdoc component
 * @name udb.image-detail.directive:Image-detail
 * @description
 * # Image-detail
 */
angular
  .module('udb.core')
  .directive('udbImageDetail', function () {
    return {
      templateUrl: 'templates/image-detail.directive.html',
      controller: ImageDetailController,
      restrict: 'A',
      scope: {
        images: '<udbImageDetail',
        main : '<image'
      }
    };
  });

/* @ngInject */
function ImageDetailController($scope, $translate) {
  $scope.language = $translate.use() || 'nl';

  angular.forEach($scope.images, function(image) {
    if (image.contentUrl === $scope.main) {
      image.main = true;
      var reindexedMedia = _.without($scope.images, image);
      reindexedMedia.unshift(image);
      $scope.images = reindexedMedia;
    }
  });

  $scope.translateImageDetail = function (label, translationData) {
    translationData = (translationData !== undefined) ? translationData : {};
    return $translate.instant('imageDetail.' + label, translationData);
  };
}
ImageDetailController.$inject = ["$scope", "$translate"];
})();

// Source: src/core/components/multiselect/multiselect.directive.js
(function () {
(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name udb.core.directive:udbMultiselect
   * @description
   * # directive for bootstrap-multiselect integration
   */
  angular
  .module('udb.core')
  .directive('udbMultiselect', udbMultiselectDirective);

  function udbMultiselectDirective() {

    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, elem, attrs, ngModel) {

        elem.multiselect({
          buttonText: function(options, select) {
            if (options.length > 0) {
              var labels = [];
              options.each(function() {
                labels.push(angular.element(this).html().substring(0, 2));
              });
              return labels.join(', ') + ' ';
            }
            else {
              return attrs.startLabel;
            }
          }
        });

        // Watch for any changes from outside the directive and refresh
        scope.$watch(attrs.ngModel, function () {
          elem.multiselect('refresh');
        });

      }

    };
  }

})();
})();

// Source: src/core/components/time/time.directive.js
(function () {
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.core.directive:udbTime
 * @description
 * # udbTime
 */
angular
  .module('udb.core')
  .directive('udbTime', udbTimeDirective);

function udbTimeDirective() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: link
  };

  function link (scope, elem, attr, ngModel) {

    if (!ngModel) {
      return;
    }

    if (attr.type !== 'time') {
      return;
    }

    ngModel.$formatters.unshift(function(value) {
      return value.replace(/:\d{2}[.,]\d{3}$/, '');
    });

    /*elem.bind('blur', function() {
      elem.toggleClass('has-error', elem.$invalid);
    });*/
  }
}
})();
})();

// Source: src/core/components/workflow-status/udb.workflow-status.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.core.directive: udbWorkflowStatus
 * @description
 * # udbWorkflowStatus
 */
angular
  .module('udb.core')
  .directive('udbWorkflowStatus', function () {
    return {
      templateUrl: 'templates/udb.workflow-status.directive.html',
      controller: WorkflowStatusDirectiveController,
      controllerAs: 'cm',
      restrict: 'A',
      scope: {
        event: '<udbWorkflowStatus'
      }
    };
  });

/* @ngInject */
function WorkflowStatusDirectiveController($scope, appConfig) {
  var cm = this;
  cm.event = $scope.event;
  cm.sameAsRelations = sameAsRelations;
  cm.isUrl = isUrl;
  cm.getPublicUrl = getPublicUrl;

  cm.publicationRulesLink = appConfig.publicationRulesLink;
  cm.publicationBrand = appConfig.publicationUrl.brand;

  function sameAsRelations (event) {
    var sameAsRelationsWithoutUIV = _.reject(event.sameAs, function(sameAs) {
      return sameAs.contains('uitinvlaanderen');
    });
    return sameAsRelationsWithoutUIV;
  }

  function isUrl (potentialUrl) {
    return /^(https?)/.test(potentialUrl);
  }

  function getPublicUrl (id) {
    if (isPlace()) {
      if (appConfig.publicationUrl.place) {
        return appConfig.publicationUrl.place + id;
      } else {
        return false;
      }
    } else {
      if (appConfig.publicationUrl.event) {
        return appConfig.publicationUrl.event + id;
      } else {
        return false;
      }
    }
  }

  function isPlace() {
    if (_.includes(cm.event.url, 'place')) {
      return true;
    }
    else {
      return false;
    }
  }
}
WorkflowStatusDirectiveController.$inject = ["$scope", "appConfig"];
})();

// Source: src/core/error-handling/unexpected-error-modal.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.core.controller:UnexpectedErrorModalController
 * @description
 * # UnexpectedErrorModalController
 * Controller of the udb.core
 */
angular
  .module('udb.core')
  .controller('UnexpectedErrorModalController', UnexpectedErrorModalController);

/* @ngInject */
function UnexpectedErrorModalController($scope, $uibModalInstance, errorMessage) {

  var dismiss = function () {
    $uibModalInstance.dismiss('closed');
  };

  $scope.dismiss = dismiss;
  $scope.errorMessage = errorMessage;
}
UnexpectedErrorModalController.$inject = ["$scope", "$uibModalInstance", "errorMessage"];
})();

// Source: src/core/translations/dutch-translations.constant.js
(function () {
'use strict';
// jscs:disable maximumLineLength

/**
 * @ngdoc service
 * @name udbApp.udbDutchTranslations
 * @description
 * # udbDutchTranslations
 * Constant in the udbApp.
 */
angular.module('udb.core')
  .constant('udbDutchTranslations',
  {
    'BE': 'België',
    'NL': 'Nederland',
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
      'everyone': 'iedereen',
      'members': 'leden',
      'education': 'onderwijs',
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
      'place': 'locatie',
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
    preview: {
      tabs: {
        'data': 'Gegevens',
        'history': 'Historiek',
        'publication': 'Publicatie'
      },
      'not_found': 'Pagina niet gevonden',
      'not_found_help': 'Deze pagina kon niet gevonden worden.',
      'loading': 'Aan het laden...',
      'edit': 'Bewerken',
      'duplicate': 'Kopiëren en aanpassen',
      'delete': 'Verwijderen',
      'title': 'Titel',
      'type': 'Type',
      'entrance': 'Toegang',
      'description': 'Beschrijving',
      'no_description': 'Geen beschrijving',
      'where': 'Waar',
      'when': 'Wanneer',
      'labels': 'Labels',
      'labels_error': 'Het toevoegen van het label \'{{labelName}}\' is niet gelukt.',
      'labels_success': 'Het label \'{{addedLabel}}\' werd succesvol toegevoegd.',
      'organizer': 'Organisatie',
      'no_organizer': 'Geen organisatie-informatie',
      'price': 'Prijs',
      'free': 'Gratis',
      'currency': 'euro',
      'no_price': 'Geen prijsinformatie',
      'age_label': 'Geschikt voor',
      'all_ages': 'Alle leeftijden',
      'no_age': 'Geen leeftijdsinformatie',
      'publiq_url': 'Bekijk op {{publicationBrand}}',
      'translate': 'Vertalen'
    },
    translate: {
      'ready': 'Klaar met vertalen',
      'translate': 'vertalen',
      'original': 'origineel',
      'edit': 'Bewerk',
      'translation': 'Vertaling',
      'description': 'Beschrijving',
      'title': 'Titel',
      'tariff': 'Prijstarief',
      'address': 'Adres',
      'street': 'Straat en nummer'
    },
    labels: {
      'what': 'Met een label voeg je korte, specifieke trefwoorden toe.',
      'invalid': 'Dit lijkt een ongeldig label. Een label',
      'chars': 'bestaat enkel uit letters of cijfers',
      'excluded': 'bevat enkel \'-\' en \'_\', maar mag niet met deze tekens beginnen',
      'length': 'telt 2 tot 50 karakters'
    },
    calendarSummary: {
      'openinghours': 'meerdere tijdstippen',
      'from': 'Van',
      'till': 'tot',
      'permanent': 'Permanent'
    },
    moderate: {
      'validate': 'Valideren',
      'approve': 'Goedkeuren',
      'approved': 'Goedgekeurd',
      'reject': 'Afkeuren',
      'rejected': 'Afgekeurd',
      'continue_validation': 'Verder valideren'
    },
    cultuurkuur: {
      'info': 'Dit evenement bevat <a target=\"_blank\" href=\"{{previewLink}}\">extra informatie</a> voor scholen en leerkrachten.',
      'subject': 'Onderwerp',
      'target_group': 'Doelgroep',
      'levels': 'Geschikt voor',
      'grades': 'onderwijsgraden',
      'edit_link': 'Wijzig op cultuurkuur.be',
      'incomplete_help': 'Vervolledig dit evenement op cultuurkuur.be met extra informatie voor scholen en leerkrachten.',
      'continue': 'Doorgaan'
    },
    booking: {
      'label': 'Reservatie',
      'no_booking': 'Geen reservatie-informatie'
    },
    contact: {
      'label': 'Contact',
      'or': 'of',
      'no_contact': 'Geen contactinformatie'
    },
    imageDetail: {
      'label': 'Afbeeldingen',
      'alt_image': 'Afbeelding {{index}}',
      'main_image': 'Hoofdafbeelding',
      'no_images': 'Geen afbeeldingen'
    },
    prices: {
      'title': 'Prijzen toevoegen',
      'base': 'Basistarief',
      'target_group': 'Doelgroep',
      'free': 'Gratis',
      'currency': 'euro',
      'add_price': 'Prijs invoeren',
      'add_tarriff': 'Tarief toevoegen',
      'error': 'Er ging iets fout bij het opslaan van de prijs.',
      'invalid': 'Deze prijsinformatie lijkt ongeldig en kan je daarom niet bewaren.',
      'invalid_tip1': 'Noteer decimalen met een komma.',
      'invalid_tip2': 'Laat geen enkel rij leeg, vul steeds een doelgroep en een bedrag in.',
      'invalid_tip3': 'Geef maximum twee cijfers na de komma.',
      'close': 'Sluiten',
      'save': 'Bewaren'
    },
    location: {
      'title': 'Nieuwe locatie toevoegen',
      'name': 'Naam locatie',
      'name_validation': 'De naam van de locatie is een verplicht veld.',
      'street': 'Straat en nummer',
      'street_validation': 'Straat is een verplicht veld.',
      'city': 'Gemeente',
      'category': 'Categorie',
      'category_help': 'Kies een categorie die deze locatie het best omschrijft.',
      'category_validation': 'Categorie is een verplicht veld.',
      'error': 'Er ging iets fout tijdens het opslaan van je locatie.',
      'invalid_street': 'Dit lijkt een ongeldig adres. Wanneer je spaties gebruikt in het adres, mogen er na de laatste spatie niet meer dan 15 karakters staan.',
      'cancel': 'Annuleren',
      'add': 'Toevoegen',
      'zip': 'Postcode',
      'nlPostalCode_validation': 'Postcode is een verplicht veld.',
      'invalid_PostalCode': 'Dit lijkt een ongeldige postcode. Een postcode bestaat uit 4 cijfers en 2 letters, zonder een spatie ertussen.'
    },
    eventForm: {
      'langWarning': 'Opgelet, je (be)werkt in een andere taal: {{language}}. Is dit niet de bedoeling, neem dan contact op met vragen@uitdatabank.be.',
      step1: {
        'title': 'Wat wil je toevoegen?',
        'label_event': 'Een evenement',
        'show_everything': 'Toon alles',
        'or': 'of',
        'location_label': 'Een locatie',
        'change': 'Wijzigen',
        'refine': 'Verfijn'
      },
      step2: {
        'date_help_event': 'Wanneer vindt dit evenement of deze activiteit plaats?',
        'date_help_place': 'Wanneer is deze plaats of locatie open?',
      },
      step3: {
        'title_event': 'Waar vindt dit evenement of deze activiteit plaats?',
        'title_place': 'Waar is deze plaats of locatie?',
        'choose_city': 'Kies een gemeente',
        'choose_city_helper': 'bv. Gent of 9000',
        'choose_residence': 'Kies een woonplaats',
        'choose_residence_helper': 'bv. Groningen of Amsterdam',
        'placeholder_city': 'Gemeente of postcode',
        'problem_city': 'Er was een probleem tijdens het ophalen van de steden',
        'change': 'Wijzigen',
        'choose_location': 'Kies een locatie',
        'placeholder_location': 'Naam of adres',
        'location_not_found': 'Locatie niet gevonden?',
        'add_location': 'Een locatie toevoegen',
        'location_error': 'Er was een probleem tijdens het ophalen van de locaties',
        'street': 'Straat en nummer',
        'placeholder_street': 'Kerkstraat 1',
        'street_validate': 'Straat en nummer is een verplicht veld.',
        'street_validate_long': 'Dit lijkt een ongeldig adres. Wanneer je spaties gebruikt in het adres, mogen er na de laatste spatie niet meer dan 15 karakters staan.',
        'ok': 'OK',
        'zip': 'Postcode',
        'zip_validate': 'Postcode is een verplicht veld.',
        'invalid_zip': 'Dit lijkt een ongeldige postcode. Een postcode bestaat uit 4 cijfers en 2 letters, zonder een spatie ertussen.'
      },
      step4: {
        'basic_data': 'Basisgegevens',
        'name_event': 'Naam van het evenement',
        'name_place': 'Naam van de locatie',
        'help_event': 'Gebruik een <strong>sprekende titel</strong>, bv. \"Fietsen langs kapelletjes\", \"De Sage van de Eenhoorn\".',
        'help_place': 'Gebruik de <strong>officiële benaming</strong>, bv. \"Gravensteen\", \"Abdijsite Herkenrode\", \"Cultuurcentrum De Werf\".',
        'help_description': 'Een <strong>uitgebreide beschrijving</strong> kan je in stap 5 toevoegen.',
        'info_missing': 'Je vulde niet alle verplichte informatie in:',
        'save_error': 'Er ging iets fout tijdens het opslaan van je activiteit. Gelieve later opnieuw te proberen.',
        'continue': 'Doorgaan',
        'doubles_title': 'Vermijd dubbel werk',
        'doubles_help': 'We vonden gelijkaardige items. Controleer deze eerder ingevoerde items.',
        'sure': 'Ben je zeker dat je \"{{name}}\" wil toevoegen?',
        'return_dashboard': 'Nee, keer terug naar dashboard',
        'yes_continue': 'Ja, doorgaan met invoeren',
        suggestions: {
          'from': 'Van',
          'till': 'tot',
          'permanent': 'Permanent'
        }
      },
      step5: {
        'expose_event': 'Laat je evenement extra opvallen',
        'expose_place': 'Laat deze locatie extra opvallen',
        'title': 'Titel',
        'description': 'Beschrijving',
        'add_text': 'Tekst toevoegen',
        'required_200': 'De eerste 200 tekens zijn het belangrijkst om een nieuw publiek aan te spreken.',
        'required_still': 'Nog',
        'required_signs': 'tekens.',
        'required_200_help': 'Plaats de belangrijkste boodschap in de eerste 200 tekens. Je kan nog verder aanvullen met achtergrondinformatie.',
        'empty': 'Leegmaken',
        'tip_route': 'Geef hier een wervende omschrijving van de route. Vermeld in deze tekst <strong>hoe</strong> de route wordt afgelegd (per fiets, per boot, ...), de mogelijke tussenstops, de <strong>duur</strong>, <strong>afstand</strong> en hoe de route <strong>begeleid</strong> is (met gids, brochure of wegwijzers).',
        'tip_rondleiding': 'Geef hier een wervende omschrijving van de rondleiding. Vermeld het <strong>max. aantal personen</strong> per groepje, <strong>hoe</strong> de rondleiding wordt georganiseerd (doorlopend, met intervallen of op vaste tijdstippen) en of er <strong>speciale aandachtspunten</strong> zijn (vb. laarzen aangewezen).',
        'tip_monument': 'Geef hier een wervende omschrijving van het monument. Geef ook aan indien het monument slechts beperkt opengesteld is (vb. enkel salons).',
        'description_error': 'Er ging iets fout bij het opslaan van de beschrijving.',
        'organizer': 'Organisatie',
        'add_organizer': 'Organisatie toevoegen',
        'choose_organizer': 'Kies een organisatie',
        'organizer_not_found': 'Organisatie niet gevonden?',
        'add_new_organizer': 'Nieuwe organisator toevoegen',
        'organizer_error': 'Er ging iets fout bij het opslaan van de organisator.',
        'contact': 'Contact & reservatie',
        'add_contact': 'Contactinformatie toevoegen',
        'website': 'Website',
        'phone': 'Telefoonnummer',
        'e-mail': 'E-mailadres',
        'use_booking': 'Gebruik voor reservatie',
        'booking_exposure': 'Hoe mag deze link verschijnen?',
        'buy_tickets': 'Koop tickets',
        'reserve_places': 'Reserveer plaatsen',
        'check_availability': 'Controleer beschikbaarheid',
        'subscribe': 'Schrijf je in',
        'add_more_contact': 'Meer contactgegevens toevoegen',
        'contact_error': 'Er ging iets fout bij het opslaan van de contact info.',
        'facilities': 'Toegankelijkheid',
        'add_facility': 'Voorzieningen toevoegen',
        'facility_inapplicable': 'Niet van toepassing',
        'change': 'Wijzigen',
        'image_help': 'Voeg een afbeelding toe zodat je bezoekers je activiteit beter herkennen.',
        'images': 'Afbeeldingen',
        'copyright': 'Copyright',
        'delete': 'Verwijderen',
        'main_image': 'Maak hoofdafbeelding',
        'add_image': 'Afbeelding toevoegen',
        age: {
          'age_label': 'Geschikt voor',
          'All ages': 'Alle leeftijden',
          'Toddlers': 'Peuters',
          'Preschoolers': 'Kleuters',
          'Kids': 'Kinderen',
          'Teenagers': 'Tieners',
          'Youngsters': 'Jongeren',
          'Adults': 'Volwassenen',
          'Seniors': 'Senioren',
          'Custom': 'Andere',
          'from': 'Van',
          'till': 'tot',
          'age': 'jaar',
          'error_max_lower_than_min': 'De maximumleeftijd kan niet lager zijn dan de minimumleeftijd.'
        },
        priceInfo: {
          'price_label': 'Prijs',
          'add_prices': 'Prijzen toevoegen',
          'free': 'Gratis',
          'prices': 'Prijzen',
          'change': 'Wijzigen',
          'currency': 'euro'
        },
        reservationPeriod: {
          'add_reservation_period': 'Reservatieperiode toevoegen',
          'reservation_period': 'Reservatie periode',
          'from': 'Van',
          'till': 'Tot'
        }
      },
      publish: {
        'publish_now': 'Meteen publiceren',
        'publish_later': 'Later publiceren',
        'edit_done': 'Klaar met bewerken',
        'online_from': 'Online vanaf'
      },
      timeTracker: {
        'automatic_saved': 'Automatisch bewaard om',
        'hour': 'uur',
      },
      embargo: {
        'title': 'Kies een publicatiedatum',
        'help': 'Vanaf wanneer mag dit online verschijnen? <em class="text-info"><i class="fa fa-exclamation-circle" aria-hidden="true"></i> Opgelet, deze datum kan je maar één keer instellen.</em>',
        'error_past': 'Een publicatiedatum kan niet in het verleden liggen.',
        'error_empty': 'Kies een publicatiedatum.',
        'cancel': 'Annuleren',
        'ready': 'Klaar met bewerken'
      },
      imageUpload: {
        'modalTitle': 'Afbeelding toevoegen',
        'defaultError': 'Het geselecteerde bestand voldoet niet aan onze voorwaarden.',
        'noFileSelectedError': 'Er is geen bestand geselecteerd',
        'somethingWentWrongError': 'Er ging iets mis bij het opslaan van de afbeelding.',
        'maxSize': 'Het bestand dat je probeert te uploaden is te groot. De maximum grootte is ',
        'formatNotValidError': 'Het geüpload bestand is geen geldige afbeelding.',
        'extensionsAllowed': 'Enkel bestanden met de extenties .jpeg, .gif of .png zijn toegelaten.',
        'sizeError': 'Het geüpload bestand is te groot.'
      }
    },
    calendar: {
      'one_more_days': 'Eén of meerdere dagen',
      'or': 'of',
      'default_days': 'Vaste dagen per week',
      'start_label': 'Start',
      'end_label': 'Einde',
      'whole_day_label': 'Hele dag',
      'start_hour_label': 'Beginuur',
      'end_hour_label': 'Einduur',
      'add_days': 'Dag(en) toevoegen',
      period: {
        'title': 'Start- en einddatum',
        'from': 'Van',
        'till': 'Tot',
        'alert': 'Geef zowel een begin- als einddatum in. De einddatum kan niet voor de begindatum vallen.'
      },
      openingHours: {
        'permanent_title': '24/24, 7/7',
        'permanent_subtitle': 'Elke dag, ieder uur',
        'add_hours': 'Uren toevoegen',
        'opening_hours': 'Openingsuren',
        'change': 'Wijzigen',
        'days': 'Dagen',
        'from': 'Van',
        'till': 'Tot',
        'more_hours': 'Meer openingstijden toevoegen',
        'cancel': 'Annuleren',
        'save': 'Opslaan'
      }
    },
    'facilityLabel': {
      'motor': 'Voorzieningen voor personen met een motorische beperking',
      'visual': 'Voorzieningen voor personen met een visuele beperking',
      'hearing': 'Voorzieningen voor personen met een auditieve beperking',
      'other': 'Andere voorzieningen',
      'place': 'Voorzieningen op deze locatie',
      'mental': 'Voorzieningen voor personen met een verstandelijke beperking'
    },
    audience: {
      'entrance': 'Toegang',
      'everyone': 'Voor iedereen',
      'members': 'Enkel voor leden',
      'members_help': 'Je item wordt enkel gepubliceerd op kanalen voor verenigingen en hun leden.',
      'education': 'Specifiek voor scholen',
      'education_help': 'Je item wordt enkel gepubliceerd op cultuureducatieve kanalen zoals cultuurkuur.be. Na het publiceren kan je nog specifieke informatie voor scholen toevoegen.'
    },
    workflowStatus: {
      'label': 'Publicatiestatus',
      'id': 'ID',
      'DRAFT': 'Niet gepubliceerd',
      'READY_FOR_VALIDATION': 'Gepubliceerd',
      'APPROVED': 'Online vanaf',
      'REJECTED': 'Publicatie afgewezen',
      'DELETED': 'Niet gepubliceerd',
      'rules': 'Bekijk de regels',
      'rejected_full': 'Dit item werd afgewezen voor publicatie.'
    },
    queryFieldGroup: {
      'what': 'Wat',
      'where': 'Waar',
      'when': 'Wanneer',
      'input-information': 'Invoerdersinformatie',
      'translations': 'Vertalingen',
      'other': 'Andere'
    },
    'queryFieldLabel': {
      'cdbid': 'identificatiecode (CDBID)',
      'offertype': 'type (aanbod)',
      'keywords': 'label',
      'title': 'titel',
      'category_eventtype_name': 'type (activiteit)',
      'locationtype': 'type (locatie)',
      'category_theme_name': 'thema',
      'text': 'tekst',
      'city': 'gemeente (naam)',
      'zipcode': 'postcode',
      'location_id': 'locatie (id)',
      'country': 'land',
      'location_label': 'locatie (naam)',
      'category_flandersregion_name': 'regio / gemeente',
      'nisRegions': 'regio / gemeente',
      'date': 'datum',
      'permanent': 'permanent',
      'lastupdated': 'laatst aangepast',
      'creationdate': 'gecreëerd',
      'createdby': 'gecreëerd door',
      'availablefrom': 'datum beschikbaar',
      'detail_lang': 'vertaling',
      'organiser_keywords': 'label organisatie',
      'organiser_id': 'organisatie (id)',
      'agefrom': 'leeftijd',
      'price': 'prijs',
      'organiser_label': 'organisatie (naam)',
      'category_facility_name': 'voorzieningen',
      'category_targetaudience_name': 'doelgroep',
      'startdate': 'startdatum',
      'enddate': 'einddatum',
      'lastupdatedby': 'laatst aangepast door',
      'category_publicscope_name': 'publieksbereik'
    },
    'EVENT-EXPORT': {
      'QUERY-IS-MISSING': 'Een export is pas mogelijk nadat je een zoekopdracht hebt uitgevoerd',
      'TOO-MANY-ITEMS': 'Een manuele export met meer dan {{limit}} items is niet mogelijk. Contacteer vragen@uitdatabank.be voor een oplossing op maat.'
    },
    'AANBOD_INVOEREN': 'Aanbod invoeren',
    'AANBOD_BEWERKEN': 'Aanbod bewerken',
    'AANBOD_MODEREREN': 'Aanbod modereren',
    'AANBOD_VERWIJDEREN': 'Aanbod verwijderen',
    'ORGANISATIES_BEHEREN': 'Organisaties beheren',
    'GEBRUIKERS_BEHEREN': 'Gebruikers beheren',
    'LABELS_BEHEREN': 'Labels beheren',
    'VOORZIENINGEN_BEWERKEN': 'Voorzieningen bewerken',
    'ORGANISATIES_BEWERKEN': 'Organisaties bewerken',
    'event type missing': 'Koos je een type in <a href="#wat" class="alert-link">stap 1</a>?',
    'timestamp missing': 'Koos je een datum in <a href="#wanneer" class="alert-link">stap 2</a>?',
    'start or end date missing': 'Koos je een begin- en einddatum in <a href="#wanneer" class="alert-link">stap 2</a>?',
    'when missing': 'Maakte je een keuze in <a href="#wanneer" class="alert-link">stap 2</a>?',
    'place missing for event': 'Koos je een plaats in <a href="#waar" class="alert-link">stap 3</a>?',
    'location missing for place': 'Koos je een locatie in <a href="#waar" class="alert-link">stap 3</a>?',
    'title is missing': 'Gaf je je aanbod een titel in <a href="#titel" class="alert-link">stap 4</a>?',
    'UNIQUE_ORGANIZER_NOTICE': 'Om organisaties in de UiTdatabank uniek bij te houden, vragen we elke organisatie een unieke & geldige hyperlink.',
    'OPENING_HOURS_ERROR': {
      'openAndClose': 'Vul alle openings- en sluitingstijden in.',
      'dayOfWeek': 'Kies minstens één dag in elke rij die je toevoegde.',
      'openIsBeforeClose': 'Gelieve een sluitingstijd in te geven die later is dan de openingstijd.'
    },
    'TIME_SPAN_REQUIREMENTS': {
      'timedWhenNotAllDay': 'Een eind- en beginuur zijn verplicht wanneer een evenement niet de hele dag duurt.',
      'startBeforeEndDay': 'De einddatum kan niet voor de begindatum vallen.',
      'startBeforeEnd': 'Het einduur kan niet voor het beginuur vallen.',
      'tooFarInFuture': 'De gekozen einddatum en startdatum mogen niet verder dan 10 jaar in de toekomst liggen.'
    },
    uitpas: {
      uitpasInfo: {
        'uitpas': 'UiTPAS',
        'uitpas_alert': 'Dit is een UiTPAS organisator. Selecteer een prijs om specifieke UiTPAS-informatie toe te voegen.',
        'uitpas_info': 'Dit is een UiTPAS activiteit.',
        'cantChangePrice': 'Voor dit evenement zijn al UiTPAS-tickets verkocht met de bestaande prijsinformatie. Je kan de prijsinformatie niet meer wijzigen.',
        'cantChangeOrganiser': 'Voor dit evenement zijn al UiTPAS-tickets verkocht. Je kan de organisatie niet meer wijzigen.',
        'unavailable': 'UiTPAS kan momenteel niet bereikt worden, probeer het later opnieuw of contacteer de helpdesk (vragen@uitdatabank.be).'
      },
      cardSystems: {
        'card_systems': 'Kaartsystemen',
        'choose': '--Selecteer een verdeelsleutel--',
        'retry': 'Opnieuw registreren',
        'unavailable': 'kan UiTPAS momenteel niet bereiken, probeer het later opnieuw of contacteer de helpdesk (vragen@uitdatabank.be)'
      }
    },
    images: {
      'agreement': 'Je staat op het punt (een) afbeelding(en) toe te voegen en openbaar te verspreiden. Je dient daartoe alle geldende auteurs- en portretrechten te respecteren, alsook alle andere toepasselijke wetgeving. Je kan daarvoor aansprakelijk worden gehouden, zoals vastgelegd in de',
      'conditions': 'algemene voorwaarden',
      'conditions_url': 'https://www.publiq.be/nl/gebruikersovereenkomst-uitdatabank',
      'copyright_info': 'Meer informatie over copyright',
      'description': 'Beschrijving',
      'description_help': 'Maximum 250 karakters',
      'copyright': 'Copyright',
      'copyright_help': 'Vermeld de naam van de rechtenhoudende fotograaf. Vul alleen de naam van je eigen vereniging of organisatie in als je zelf de rechten bezit (minimum 3 karakters).',
      'cancel': 'Annuleren',
      'agree': 'Akkoord',
      upload: {
        'select_image': 'Selecteer je foto',
        'choose_file': 'Kies bestand',
        'max_filesize': 'De maximale grootte van je afbeelding is {{maxFileSize}} en heeft als type .jpeg, .gif of .png',
        'upload': 'Opladen'
      },
      edit: {
        'title': 'Afbeelding info bewerken',
        'description_help': 'Een goede beschrijving van je afbeelding wordt gelezen door zoekmachines en gebruikers met een visuele beperking. (max. 250 karakters)',
        'save_error': 'Er ging iets mis bij het opslaan van de afbeelding.',
        'update': 'Bijwerken'
      },
      remove: {
        'title': 'Afbeeldingen verwijderen',
        'sure': 'Ben je zeker dat je deze afbeelding wil verwijderen?',
        'save_error': 'Er ging iets mis bij het verwijderen van de afbeelding.',
      }
    },
    organizer: {
      modal: {
        'title': 'Nieuwe organisatie toevoegen',
        'avoid_doubles': 'Vermijd dubbel werk',
        'unique_notice': 'Om organisaties in de UiTdatabank uniek bij te houden, vragen we elke organisatie een unieke & geldige hyperlink.',
        'website': 'Website',
        'alert_warning': 'Dit adres is al gebruikt door de organisatie \'{{organizerName}}\'. Geef een unieke website of',
        'alert_button': 'gebruik {{organizerName}} als organisatie',
        'name_help': 'De officiële publieke naam van de organisatie.',
        'name_required': 'Gelieve een naam in te vullen',
        'add_confirm': 'Ben je zeker dat je \"{{newOrganizerName}}\" wil toevoegen als organisatie? Dubbele invoer van organisaties is niet toegelaten.',
        'doubles': 'We vonden deze gelijkaardige items:',
        'select': 'Selecteren',
        'your_input': 'Jij voerde in:',
        'still_enter': 'Toch invoeren',
        'save_error': 'Er ging iets fout tijdens het opslaan van je organisatie.',
        'address_error': 'Gelieve een geldig adres in te vullen.',
        'contact_error': 'Gelieve alle contactinfo correct in te vullen.',
        'close': 'Sluiten',
        'save': 'Bewaren',
        'label_name': 'Naam'
      },
      address: {
        'label_street': 'Straat en nummer',
        'help_street': 'Gelieve straat en nummer in te geven.',
        'help_zip': 'Gelieve een postcode in te geven.',
        'validate_zip': 'Dit lijkt een ongeldige postcode. Een postcode bestaat uit 4 cijfers en 2 letters, zonder een spatie ertussen.',
        'label_city': 'Gemeente',
        'label_residence': 'Woonplaats',
        'help_city': 'Er was een probleem tijdens het ophalen van de steden.',
        'error_city': 'Gelieve een gemeente in te geven.',
        'change': 'Wijzigen',
        'zip': 'Postcode'
      },
      contact: {
        'title': 'Contact',
        'enter_url': 'Geef een URL in',
        'enter_email': 'Geef een e-mailadres in',
        'enter_phone': 'Geef een telefoonnummer in<small class="text-muted">, bv. 011 32 43 54</small>',
        'required': 'Gelieve dit veld niet leeg te laten.',
        'valid_url': 'Gelieve een geldige url in te vullen.',
        'valid_email': 'Gelieve een geldig e-mailadres in te vullen.',
        'valid_phone': 'Gelieve een geldig telefoonnummer in te vullen.',
        'cancel': 'Annuleren',
        'add': 'Toevoegen',
        'add_phone': 'Telefoonnummer toevoegen',
        'add_email': 'E-mailadres toevoegen',
        'add_url': 'Andere website toevoegen'
      },
      manage: {
        'edit': 'Bewerken',
        'delete': 'Verwijderen',
        'overview': 'Terug naar overzicht',
        'dashboard': 'Terug naar dashboard',
        'name': 'Naam',
        'address': 'Adres',
        'website': 'Website',
        'phone': 'Telefoonnummer',
        'email': 'E-mailadres',
        'labels': 'Labels',
        'removed': 'Deze organisatie is verwijderd.'
      }
    },
    duplicate: {
      title: 'Kopiëren en aanpassen',
      description: 'Je staat op het punt een evenement te kopiëren. Kies een tijdstip voor dit evenement.',
      error: 'Er ging iets mis tijdens het aanmaken van een kopie!'
    },
    dashboard: {
      'welcome': 'Welkom,',
      'no_items': 'Je hebt nog geen items toegevoegd.',
      'add_activity': 'Een activiteit of locatie toevoegen?',
      'my_activities': 'Mijn activiteiten en locaties',
      'my_organizers': 'Mijn organisaties',
      'add': 'Toevoegen',
      'add_organizer': 'Organisatie toevoegen',
      directive: {
        'no_publish': 'Niet gepubliceerd!',
        'online': 'Online op',
        'edit': 'Bewerken',
        'example': 'Voorbeeld',
        'delete': 'Verwijderen',
        'expired_event': 'Afgelopen evenement'
      },
      delete: {
        'sure': 'Ben je zeker dat je \"{{name}}\" wil verwijderen?',
        'error_location': 'De locatie \"{{name}}\" kan niet verwijderd worden omdat er activiteiten gepland zijn.',
        'error': 'Er ging iets fout bij het verwijderen van de activiteit.',
        'cancel': 'Annuleren',
        'delete': 'Verwijderen'
      }
    },
    entry: {
      'exported_documents': 'Geëxporteerde documenten',
      'notifications': 'Meldingen',
      'in_progress': 'Bezig'
    },
    offerTypes: {
      'Concert': 'Concert',
      'Theatervoorstelling': 'Theatervoorstelling',
      'Lezing of congres': 'Lezing of congres',
      'Dansvoorstelling': 'Dansvoorstelling',
      'Festival': 'Festival',
      'Film': 'Film',
      'Sportwedstrijd bekijken': 'Sportwedstrijd bekijken',
      'Cursus of workshop': 'Cursus of workshop',
      'Sport en beweging': 'Sport en beweging',
      'Kamp of vakantie': 'Kamp of vakantie',
      'Begeleide rondleiding': 'Begeleide  rondleiding',
      'Route': 'Route',
      'Spel of quiz': 'Spel of quiz',
      'Party of fuif': 'Party of fuif',
      'Kermis of feestelijkheid': 'Kermis of feestelijkheid',
      'Congres of studiedag': 'Congres of studiedag',
      'Eten en drinken': 'Eten en drinken',
      'Thema of pretpark': 'Thema of pretpark',
      'Theater': 'Theater',
      'Jeugdhuis of jeugdcentrum': 'Jeugdhuis of jeugdcentrum',
      'Cultuur- of ontmoetingscentrum': 'Cultuur- of ontmoetingscentrum',
      'Discotheek': 'Discotheek',
      'Bibliotheek of documentatiecentrum': 'Bibliotheek of documentatiecentrum',
      'Bioscoop': 'Bioscoop',
      'Horeca': 'Horeca',
      'Openbare ruimte': 'Openbare ruimte',
      'Tentoonstelling': 'Tentoonstelling',
      'Markt of braderie': 'Markt of braderie',
      'Natuur, park of tuin': 'Natuur, park of tuin',
      'Beurs': 'Beurs',
      'Monument': 'Monument',
      'Opendeurdag': 'Opendeurdag',
      'Recreatiedomein of centrum': 'Recreatiedomein of centrum',
      'Park of tuin': 'Park of tuin',
      'Archeologische Site': 'Archeologische Site',
      'School of onderwijscentrum': 'School of onderwijscentrum',
      'Sportcentrum': 'Sportcentrum',
      'Winkel': 'Winkel',
      'Museum of galerij': 'Museum of galerij',
      'Zaal of expohal': 'Zaal of expohal'
    },
    offerThemes: {
      'Antiek en brocante': 'Antiek en brocante',
      'Architectuur': 'Architectuur',
      'Audiovisuele kunst': 'Audiovisuele kunst',
      'Beeldhouwkunst': 'Beeldhouwkunst',
      'Fotografie': 'Fotografie',
      'Grafiek': 'Grafiek',
      'Installatiekunst': 'Installatiekunst',
      'Schilderkunst': 'Schilderkunst',
      'Decoratieve kunst': 'Decoratieve kunst',
      'Design': 'Design',
      'Mode': 'Mode',
      'Meerdere kunstvormen': 'Meerdere kunstvormen',
      'Ballet en klassieke dans': 'Ballet en klassieke dans',
      'Volksdans en werelddans': 'Volksdans en werelddans',
      'Stijl en salondansen': 'Stijl en salondansen',
      'Moderne dans': 'Moderne dans',
      'Erfgoed': 'Erfgoed',
      'Actie en avontuur': 'Actie en avontuur',
      'Animatie en kinderfilms': 'Animatie en kinderfilms',
      'Documentaires en reportages': 'Documentaires en reportages',
      'Griezelfilm of horror': 'Griezelfilm of horror',
      'Historische film': 'Historische film',
      'Komedie': 'Komedie',
      'Kortfilm': 'Kortfilm',
      'Filmmusical': 'Filmmusical',
      'Drama': 'Drama',
      'Science fiction': 'Science fiction',
      'Cinefiel': 'Cinefiel',
      'Thriller': 'Thriller',
      'Meerdere filmgenres': 'Meerdere filmgenres',
      'Geschiedenis': 'Geschiedenis',
      'Gezondheid en wellness': 'Gezondheid en wellness',
      'Landbouw en platteland': 'Landbouw en platteland',
      'Milieu en natuur': 'Milieu en natuur',
      'Literatuur': 'Literatuur',
      'Poëzie': 'Poëzie',
      'Fictie': 'Fictie',
      'Non fictie': 'Non fictie',
      'Strips': 'Strips',
      'Klassieke muziek': 'Klassieke muziek',
      'Jazz en blues': 'Jazz en blues',
      'Pop en rock': 'Pop en rock',
      'Hiphop, r&b en rap': 'Hiphop, r&b en rap',
      'Dance': 'Dance',
      'Folk en wereldmuziek': 'Folk en wereldmuziek',
      'Amusementsmuziek': 'Amusementsmuziek',
      'Politiek en maatschappij': 'Politiek en maatschappij',
      'Creativiteit': 'Creativiteit',
      'Computer en techniek': 'Computer en techniek',
      'Opvoeding': 'Opvoeding',
      'Persoon en relaties': 'Persoon en relaties',
      'Interculturele vorming': 'Interculturele vorming',
      'Kunst en kunsteducatie': 'Kunst en kunsteducatie',
      'Gezondheid en zorg': 'Gezondheid en zorg',
      'Samenleving': 'Samenleving',
      'Bal en racketsport': 'Bal en racketsport',
      'Atletiek, wandelen en fietsen': 'Atletiek, wandelen en fietsen',
      'Zwemmen en watersport': 'Zwemmen en watersport',
      'Fitness, gymnastiek, dans en vechtsport': 'Fitness, gymnastiek, dans en vechtsport',
      'Outdoor en adventure': 'Outdoor en adventure',
      'Lucht en motorsport': 'Lucht en motorsport',
      'Volkssporten': 'Volkssporten',
      'Omnisport en andere': 'Omnisport en andere',
      'Tekst- en muziektheater': 'Tekst- en muziektheater',
      'Humor en comedy': 'Humor en comedy',
      'Musical': 'Musical',
      'Figuren en poppentheater': 'Figuren en poppentheater',
      'Opera en operette': 'Opera en operette',
      'Mime en bewegingstheater': 'Mime en bewegingstheater',
      'Wetenschap': 'Wetenschap',
      'Zingeving, filosofie en religie': 'Zingeving, filosofie en religie',
      'Thema onbepaald': 'Thema onbepaald',
      'Circus': 'Circus',
      'Voeding': 'Voeding',
      'Economie': 'Economie',
      'Avontuur': 'Avontuur',
      'Natuur': 'Natuur',
      'Sport': 'Sport',
      'Technologie': 'Technologie',
      'Koken': 'Koken',
      'Themakamp': 'Themakamp',
      'Taal en communicatie': 'Taal'
    },
    offerThemesGroups: {
      'Dans': 'Dans',
      'Kunst en erfgoed': 'Kunst en erfgoed',
      'Muziek': 'Muziek',
      'Sport': 'Sport',
      'Varia': 'Varia'
    },
    weekdays: {
      monday: {
        label: 'Ma',
        name: 'Maandag'
      },
      tuesday: {
        label: 'Di',
        name: 'Dinsdag'
      },
      wednesday: {
        label: 'Wo',
        name: 'Woensdag'
      },
      thursday: {
        label: 'Do',
        name: 'Donderdag'
      },
      friday: {
        label: 'Vr',
        name: 'Vrijdag'
      },
      saturday: {
        label: 'Za',
        name: 'Zaterdag'
      },
      sunday: {
        label: 'Zo',
        name: 'Zondag'
      }
    },
    search: {
      exportButton: 'Activiteiten exporteren',
      modal: 'Je selectie bevat geen activiteiten, probeer een andere zoekopdracht te exporteren.'
    }
  }
);
})();

// Source: src/core/translations/french-translations.constant.js
(function () {
'use strict';
// jscs:disable maximumLineLength

/**
 * @ngdoc service
 * @name udbApp.udbFrenchTranslations
 * @description
 * # udbFrenchTranslations
 * Constant in the udbApp.
 */
angular.module('udb.core')
  .constant('udbFrenchTranslations',
  {
    'BE': 'Belgique',
    'NL': 'Pays-Bas',
    'EN_ADJECTIVE': 'Anglais',
    'FR_ADJECTIVE': 'Français',
    'DE_ADJECTIVE': 'Duitse',
    'NL_ADJECTIVE': 'Nederlandse',
    'datepicker': {
      'CURRENT': 'Aujourd\'hui',
      'CLEAR': 'Supprimer',
      'CLOSE': 'Fermer'
    },
    '=': 'égale',
    '><': 'entre',
    '+': 'égale',
    '!': 'n\'égale pas',
    '-': 'n\'égale pas',
    '>': 'est plus grand ou égal',
    '<': 'est plus petit ou égal',
    '>_DATE': 'plus tard que',
    '<_DATE': 'plus tôt que',
    '=_DATE': 'égale',
    '><_DATE': 'entre',
    'choix': {
      'everyone': 'tout le monde',
      'members': 'membres',
      'education': 'éducation',
      'asc': 'ascendant',
      'desc': 'descendant',
      'today': 'aujourd\'hui',
      'tomorrow': 'demain',
      'thisweekend': 'ce week-end',
      'nextweekend': 'le week-end prochain',
      'next7days': 'les 7 jours suivants',
      'next14days': 'les 14 jours suivants',
      'next30days': 'les 30 jours suivants',
      'next3months': 'les 3 mois suivants',
      'next6months': 'les 6 mois suivants',
      'next12months': 'les 12 mois suivants',
      'permanent': 'permanent',
      'event': 'événement',
      'place': 'lieu',
      'actor': 'acteur',
      'production': 'production',
      'nl': 'néerlandais',
      'fr': 'français',
      'en': 'anglais',
      'de': 'allemand',
      'AF': 'Afghanistan',
      'AX': 'Îles Åland',
      'AL': 'Albanie',
      'DZ': 'Algérie',
      'AS': 'Samoa américaines',
      'VI': 'Îles Vierges des États-Unis',
      'UM': 'Îles mineures éloignées des États-Unis',
      'AD': 'Andorre',
      'AO': 'Angola',
      'AI': 'Anguilla',
      'AQ': 'Antarctique',
      'AG': 'Antigua-et-Barbuda',
      'AR': 'Argentine',
      'AM': 'Arménie',
      'AW': 'Aruba',
      'AU': 'Australie',
      'AZ': 'Azerbaïdjan',
      'BS': 'Bahamas',
      'BH': 'Bahreïn',
      'BD': 'Bangladesh',
      'BB': 'Barbade',
      'BE': 'Belgique',
      'BZ': 'Belize',
      'BJ': 'Bénin',
      'BM': 'Bermudes',
      'BT': 'Bhoutan',
      'BO': 'Bolivie',
      'BA': 'Bosnie-Herzégovine',
      'BW': 'Botswana',
      'BV': 'Île Bouvet',
      'BR': 'Brésil',
      'IO': 'Territoire britannique de l\'océan Indien',
      'VG': 'Îles Vierges britanniques',
      'BN': 'Brunei',
      'BG': 'Bulgarie',
      'BF': 'Burkina Faso',
      'BI': 'Burundi',
      'KH': 'Cambodge',
      'CA': 'Canada',
      'KY': 'Îles Caïmans',
      'CF': 'République centrafricaine',
      'CL': 'Chili',
      'CN': 'Chine',
      'CX': 'Île Christmas',
      'CC': 'Îles Cocos',
      'CO': 'Colombie',
      'KM': 'Comores',
      'CG': 'République du Congo',
      'CD': 'République démocratique du Congo',
      'CK': 'Îles Cook',
      'CR': 'Costa Rica',
      'CU': 'Cuba',
      'CY': 'Chypre',
      'DK': 'Danemark',
      'DJ': 'Djibouti',
      'DM': 'Dominique',
      'DO': 'République dominicaine',
      'DE': 'Allemagne',
      'EC': 'Équateur',
      'EG': 'Égypte',
      'SV': 'Salvador',
      'GQ': 'Guinée équatoriale',
      'ER': 'Érythrée',
      'EE': 'Estonie',
      'ET': 'Éthiopie',
      'FO': 'Îles Féroé',
      'FK': 'Malouines',
      'FJ': 'Fidji',
      'PH': 'Philippines',
      'FI': 'Finlande',
      'FR': 'France',
      'GF': 'Guyane',
      'PF': 'Polynésie française',
      'TF': 'Terres australes et antarctiques françaises',
      'GA': 'Gabon',
      'GM': 'Gambie',
      'GE': 'Géorgie',
      'GH': 'Ghana',
      'GI': 'Gibraltar',
      'GD': 'Grenade',
      'GR': 'Grèce',
      'GL': 'Groenland',
      'GP': 'Guadeloupe',
      'GU': 'Guam',
      'GT': 'Guatemala',
      'GG': 'Guernesey',
      'GN': 'Guinée',
      'GW': 'Guinée-Bissau',
      'GY': 'Guyana',
      'HT': 'Haïti',
      'HM': 'Îles Heard-et-MacDonald',
      'IM': 'Île de Man',
      'HN': 'Honduras',
      'HU': 'Hongrie',
      'HK': 'Hong Kong',
      'IS': 'Islande',
      'IE': 'Irlande ',
      'IN': 'Inde',
      'ID': 'Indonésie',
      'IQ': 'Irak',
      'IR': 'Iran',
      'IL': 'Israël',
      'IT': 'Italie',
      'CI': 'Côte d\'Ivoire',
      'JM': 'Jamaïque',
      'JP': 'Japon',
      'YE': 'Yémen',
      'JE': 'Jersey',
      'JO': 'Jordanie',
      'CV': 'Cap-Vert',
      'CM': 'Cameroun',
      'KZ': 'Kazakhstan',
      'KE': 'Kenya',
      'KG': 'Kirghizistan',
      'KI': 'Kiribati',
      'KW': 'Koweït',
      'HR': 'Croatie',
      'LA': 'Laos',
      'LS': 'Lesotho',
      'LV': 'Lettonie',
      'LB': 'Liban',
      'LR': 'Liberia',
      'LY': 'Libye',
      'LI': 'Liechtenstein',
      'LT': 'Lituanie',
      'LU': 'Luxembourg',
      'MO': 'Macao',
      'MK': 'République de Macédoine',
      'MG': 'Madagascar',
      'MW': 'Malawi',
      'MV': 'Maldives',
      'MY': 'Malaisie',
      'ML': 'Mali',
      'MT': 'Malte',
      'MA': 'Maroc',
      'MH': 'Îles Marshall',
      'MQ': 'Martinique',
      'MR': 'Mauritanie',
      'MU': 'Maurice',
      'YT': 'Mayotte',
      'MX': 'Mexique',
      'FM': 'Micronésie',
      'MD': 'Moldavie',
      'MC': 'Monaco',
      'MN': 'Mongolie',
      'ME': 'Monténégro',
      'MS': 'Montserrat',
      'MZ': 'Mozambique',
      'MM': 'Birmanie',
      'NA': 'Namibie',
      'NR': 'Nauru',
      'NL': 'Pays-Bas',
      'AN': 'Antilles néerlandaises',
      'NP': 'Népal',
      'NI': 'Nicaragua',
      'NC': 'Nouvelle-Calédonie',
      'NZ': 'Nouvelle-Zélande',
      'NE': 'Niger',
      'NG': 'Nigeria',
      'NU': 'Niue',
      'KP': 'Corée du Nord',
      'MP': 'Îles Mariannes du Nord',
      'NO': 'Norvège',
      'NF': 'Île Norfolk',
      'UG': 'Ouganda',
      'UA': 'Ukraine',
      'UZ': 'Ouzbékistan',
      'OM': 'Oman',
      'ZZ': 'Inconnu',
      'TL': 'Timor oriental',
      'AT': 'Autriche',
      'PK': 'Pakistan',
      'PW': 'Palaos',
      'PS': 'Palestine',
      'PA': 'Panama',
      'PG': 'Papouasie-Nouvelle-Guinée',
      'PY': 'Paraguay',
      'PE': 'Pérou',
      'PN': 'Îles Pitcairn',
      'PL': 'Pologne',
      'PT': 'Portugal',
      'PR': 'Porto Rico',
      'QA': 'Qatar',
      'RO': 'Roumanie',
      'RU': 'Russie',
      'RW': 'Rwanda',
      'RE': 'La Réunion',
      'BL': 'Saint-Barthélemy',
      'KN': 'Saint-Christophe-et-Niévès',
      'LC': 'Sainte-Lucie',
      'PM': 'Saint-Pierre-et-Miquelon',
      'VC': 'Saint-Vincent-et-les Grenadines',
      'SB': 'Salomon',
      'WS': 'Samoa',
      'SM': 'Saint-Marin',
      'ST': 'Sao Tomé-et-Principe',
      'SA': 'Arabie saoudite',
      'SN': 'Sénégal',
      'RS': 'Serbie',
      'CS': 'Serbie-et-Monténégro, ',
      'SC': 'Seychelles',
      'SL': 'Sierra Leone',
      'SG': 'Singapour',
      'SH': 'Sainte-Hélène, Ascension et Tristan da Cunha',
      'MF': 'Saint-Martin',
      'SI': 'Slovénie',
      'SK': 'Slovaquie',
      'SD': 'Soudan',
      'SO': 'Somalie',
      'ES': 'Espagne',
      'LK': 'Sri Lanka',
      'SR': 'Suriname',
      'SJ': 'Svalbard et ile Jan Mayen',
      'SZ': 'Swaziland',
      'SY': 'Syrie',
      'TJ': 'Tadjikistan',
      'TW': 'Taïwan / (République de Chine (Taïwan))',
      'TZ': 'Tanzanie',
      'TH': 'Thaïlande',
      'TG': 'Togo',
      'TK': 'Tokelau',
      'TO': 'Tonga',
      'TT': 'Trinité-et-Tobago',
      'TD': 'Tchad',
      'CZ': 'Tchéquie',
      'TN': 'Tunisie',
      'TR': 'Turquie',
      'TM': 'Turkménistan',
      'TC': 'Îles Turques-et-Caïques',
      'TV': 'Tuvalu',
      'UY': 'Uruguay',
      'VU': 'Vanuatu',
      'VA': 'Saint-Siège(État de la Cité du Vatican)',
      'VE': 'Venezuela',
      'GB': 'Royaume-Uni',
      'AE': 'Émirats arabes unis',
      'US': 'États-Unis',
      'VN': 'Viêt Nam',
      'WF': 'Wallis-et-Futuna',
      'EH': 'République arabe sahraouie démocratique',
      'BY': 'Biélorussie',
      'ZM': 'Zambie',
      'ZW': 'Zimbabwe',
      'ZA': 'Afrique du Sud',
      'GS': 'Géorgie du Sud-et-les Îles Sandwich du Sud',
      'KR': 'Corée du Sud',
      'SE': 'Suède',
      'CH': 'Suisse'
    },
    property: {
      'name': 'Titre',
      'description': 'Description',
      'labels': 'Labels',
      'calendarSummary': 'Aperçu du calendre',
      'image': 'Image',
      'location': 'Lieu',
      'address': 'Adresse',
      'organizer': 'Organisateur',
      'priceInfo': 'Information du prix',
      'kansentarief': 'Allocataires sociaux',
      'bookingInfo': 'Info réservation',
      'contactPoint': 'Info contact',
      'creator': 'Auteur',
      'terms.theme': 'Thème',
      'terms.eventtype': 'Type',
      'created': 'Date début',
      'modified': 'Date dernière modification',
      'publisher': 'Auteur',
      'available': 'Disponible',
      'endDate': 'Date fin',
      'startDate': 'Date départ',
      'calendarType': 'Type temps',
      'sameAs': 'IDs externes',
      'typicalAgeRange': ' ge',
      'language': 'Langue',
      'audience': 'Accès'
    },
    preview: {
      tabs: {
        'data': 'Données',
        'history': 'Historique',
        'publication': 'Publication'
      },
      'not_found': 'Page introuvable',
      'not_found_help': 'Cette page n\'a pas pu être trouvée.',
      'loading': 'Chargement...',
      'edit': 'Modifier',
      'duplicate': 'Copier et modifier',
      'delete': 'Supprimer',
      'title': 'Titre',
      'type': 'Type',
      'entrance': 'Entrée',
      'description': 'Description',
      'no_description': 'Aucune description',
      'where': 'Où',
      'when': 'Quand',
      'labels': 'Labels',
      'labels_error': 'Le label \'{{labelName}}\' n\'a pas pu être ajouté.',
      'labels_success': 'Le label \'{{addedLabel}}\' a été ajouté avec succès.',
      'organizer': 'Organisation',
      'no_organizer': 'Pas d\'information de l\'organisation',
      'price': 'Prix',
      'free': 'Gratis',
      'currency': 'euro',
      'no_price': 'Pas d\'information du prix',
      'age_label': 'Adapté à',
      'all_ages': 'Tous les âges',
      'no_age': 'Pas d\'information de l\'âge',
      'publiq_url': 'Voir sur {{publicationBrand}}',
      'translate': 'Traduire'
    },
    translate: {
      'ready': 'Prêt à traduire',
      'translate': 'traduire',
      'original': 'l\'original',
      'edit': 'Modifier',
      'translation': 'Traduction',
      'description': 'Description',
      'title': 'Titre',
      'tariff': 'Prix',
      'address': 'Adresse',
      'street': 'Rue et numéro'
    },
    labels: {
      'what': 'Ajoutez des mots clés courts et spécifiques.',
      'invalid': 'Ce label ne semble pas valable. Un label ',
      'chars': 'Ne comporte que des lettres ou des chiffres',
      'excluded': 'Ne comporte que \'-\' ou \'_\' mais ne peut commencer avec ces caractêres',
      'length': 'Comporte de 2 à 50 caractères'
    },
    calendarSummary: {
      'openinghours': 'plusieurs moments',
      'from': 'Du',
      'till': 'au',
      'permanent': 'Permanent'
    },
    moderate: {
      'validate': 'Valider',
      'approve': 'Approuver',
      'approved': 'Approuvé',
      'reject': 'Rejeter',
      'rejected': 'Rejeté',
      'continue_validation': 'Continuer la validation'
    },
    cultuurkuur: {
      'info': 'Cet événement contient <a target=\"_blank\" href=\"{{previewLink}}\">de l\'information extra</a> pour les écoles et les enseignants.',
      'subject': 'Sujet',
      'target_group': 'Public cible',
      'levels': 'Adapté à',
      'grades': 'degrés d\'éducation',
      'edit_link': 'Modifier sur cultuurkuur.be',
      'incomplete_help': 'Introduisez cet événement sur cultuurkuur.be avec de l\'information extra pour les écoles et les enseignants.',
      'continue': 'Continuer'
    },
    booking: {
      'label': 'Réservation',
      'no_booking': 'Pas d\'information de réservation'
    },
    contact: {
      'label': 'Contact',
      'or': 'ou',
      'no_contact': 'Pas d\'information du contact'
    },
    imageDetail: {
      'label': 'Images',
      'alt_image': 'Image {{index}}',
      'main_image': 'Image principale',
      'no_images': 'Pas d\'images'
    },
    prices: {
      'title': 'Ajouter des prix',
      'base': 'Tarif de base',
      'target_group': 'Public cible',
      'free': 'Gratuit',
      'currency': 'euro',
      'add_price': 'Ajouter prix',
      'add_tarriff': 'Ajouter tarif',
      'error': 'Il y a eu une erreur dans l\'enregistrement du prix.',
      'invalid': 'Cette information du prix semble invalide et ne peut pas être enregistrée.',
      'invalid_tip1': 'Notez les décimales avec une virgule.',
      'invalid_tip2': 'Ne laissez aucune ligne vide, remplissez toujours un public cible et un montant.',
      'invalid_tip3': 'Donnez au maximum deux chiffres après la virgule.',
      'close': 'Fermer',
      'save': 'Sauver'
    },
    location: {
      'title': 'Ajouter un nouveau lieu',
      'name': 'Nom de lieu',
      'name_validation': 'Le nom du lieu est un domaine obligatoire.',
      'street': 'Rue et numéro',
      'street_validation': 'Rue est un domaine obligatoire.',
      'city': 'Commune',
      'category': 'Catégorie',
      'category_help': 'Choisissez la catégorie qui décrit le mieux ce lieu.',
      'category_validation': 'Catégorie est un domaine obligatoire.',
      'error': 'Il s\'est produit une erreur lors de l\'enregistrement du lieu.',
      'invalid_street': 'Cela semble une adresse invalide. Si vous utilisez des espaces dans l\'adresse, vous ne pouvez pas avoir plus de 15 caractères après le dernier espace.',
      'cancel': 'Annuler',
      'add': 'Ajouter',
      'zip': 'Code postal',
      'nlPostalCode_validation': 'Code postal est un domaine obligatoire.',
      'invalid_PostalCode': 'Il semble que le code postale n\'est pas valable. Un code postal comporte 4 chiffres et 2 lettres sans espace.'
    },
    eventForm: {
      'langWarning': 'Attention, vous éditez dans une autre langue: {{language}}. Si ce n\'est pas votre intention, contactez-nous à vragen@uitdatabank.be.',
      step1: {
        'title': 'Qu\'est-ce que vous voulez ajouter?',
        'label_event': 'Un événement',
        'show_everything': 'Montrez tout',
        'or': 'ou',
        'location_label': 'Un lieu',
        'change': 'Modifier',
        'refine': 'Raffiner'
      },
      step2: {
        'date_help_event': 'L\'événement ou l\'activité a lieu quand?',
        'date_help_place': 'Cet endroit ou ce lieu est ouvert(e) quand?',
      },
      step3: {
        'title_event': 'Où L\'événement ou l\'activité a-t-elle lieu?',
        'title_place': 'Où se trouve cet endroit ou ce lieu?',
        'choose_city': 'Choisissez une commune',
        'choose_city_helper': 'p. ex Mons ou 7000',
        'choose_residence': 'Choisir le lieu de résidence',
        'choose_residence_helper': 'par ex. Groningue ou Amsterdam',
        'placeholder_city': 'Commune ou code postal',
        'problem_city': 'Il y a eu un problème durant la collection des villes',
        'change': 'Modifier',
        'choose_location': 'Choisissez un lieu',
        'placeholder_location': 'Nom ou adresse',
        'location_not_found': 'Le lieu n\'a pas été trouvée?',
        'add_location': 'Ajouter un lieu',
        'location_error': 'Il y a eu un problème dans la collection des lieux',
        'street': 'Rue et numéro',
        'placeholder_street': 'Rue de l\'église 1',
        'straat_validate': 'Rue et numéro sont des domaines obligatoires.',
        'street_validate_long': 'Cela semble une adresse invalide. Si vous utilisez des espaces dans l\'adresse, vous ne pouvez pas avoir plus de 15 caractères après le dernier espace.',
        'ok': 'OK',
        'zip': 'Code postal'
      },
      step4: {
        'basic_data': 'Données de base',
        'name_event': 'Nom de l\'événement',
        'name_place': 'Nom du lieu',
        'help_event': 'Choisissez un <strong>bon titre</strong>, p.ex. \"Rouler à vélo le long des chapelles\", \"La Saga de la Licorne\".',
        'help_place': 'Utilisez la <strong>dénomination officielle</strong>, p.ex. \"Argos, centre pour l\'art et les médias\", \"Site de l\'abbaye Herkenrode\", \"Centre culturel De Werf\".',
        'help_description': 'Vous pouvez ajouter une <strong>description détaillée</strong> dans l\'étape 5.',
        'info_missing': 'Vous n\'avez pas rempli tous les champs d\'informations obligatoires:',
        'save_error': 'Une erreur s\'est produite lors de l\'enregistrement de votre activité. Merci de réessayer un peu plus tard.',
        'continue': 'Continuer',
        'doubles_title': 'Évitez les doubles emplois',
        'doubles_help': 'Nous avons trouvé des éléments similaires. Controlez les éléments importés auparavant.',
        'sure': 'Vous êtes sûr que vous voulez ajouter \"{{name}}\" ?',
        'return_dashboard': 'Non, retourner au tableau de bord',
        'yes_continue': 'Oui, procéder l\'importation',
        suggestions: {
          'from': 'Du',
          'till': 'au',
          'permanent': 'Permanent'
        }
      },
      step5: {
        'expose_event': 'Augmentez la visibilité de votre évènement',
        'expose_place': 'Augmentez la visibilité de votre lieu',
        'title': 'Titre',
        'description': 'Description',
        'add_text': 'Ajouter texte',
        'required_200': 'Pour attirer un nouveau public, les 200 premiers symboles sont les plus importants.',
        'required_still': 'Encore',
        'required_signs': 'symboles.',
        'required_200_help': 'Intégrez le message le plus important dans les 200 premiers symboles. Vous pouvez ensuite ajouter des informations générales.',
        'empty': 'Vider',
        'tip_route': 'Donnez ici une description saillante de la route. Mentionnez dans ce texte <strong>comment</strong> la route est parcourue (à vélo, en bateau, ...), les escales possibles, la <strong>durée</strong>, <strong>distance</strong> et comment la route est <strong>accompagnée</strong> (avec guide, brochure ou panneaux).',
        'tip_rondleiding': 'Donnez ici une description saillante du tour. Mentionnez le <strong>nombre max. de personnes</strong> par groupe, <strong>comment</strong> le tour est organisé (de manière permanente, avec intervalles ou à des temps fixes) et s\'il y a des <strong>préoccupations spéciales</strong> (p.ex. bottes recommandées).',
        'tip_monument': 'Donnez ici une description saillante du monument. Indiquez également si l\'ouverture du monument est limitée (p.ex. seulement des salons).',
        'description_error': 'Il y a eu une erreur dans l\'enregistrement de la description.',
        'organizer': 'Organisation',
        'add_organizer': 'Ajouter l\'organisation',
        'choose_organizer': 'Choisissez une organisation',
        'organizer_not_found': 'L\'organisation n\'a pas été trouvée?',
        'add_new_organizer': 'Ajouter un nouvel organisateur',
        'organizer_error': 'Il y a eu une erreur dans l\'enregistrement de l\'organisateur.',
        'contact': 'Contact & réservation',
        'add_contact': 'Ajouter plus de coordonnées',
        'website': 'Site web',
        'phone': 'Numéro de téléphone',
        'e-mail': 'Adresse mail',
        'use_booking': 'Utiliser pour la réservation',
        'booking_exposure': 'Comment ce lien peut-il apparaître?',
        'buy_tickets': 'Achetez des tickets',
        'reserve_places': 'Réservez des places',
        'check_availability': 'Controlez la disponibilité',
        'subscribe': 'Inscrivez-vous',
        'add_more_contact': 'Ajouter plus de coordonnées',
        'contact_error': 'Il y a eu une erreur dans l\'enregistrement de l\'information du contact.',
        'facilities': 'Accessibilité',
        'add_facility': 'Ajouter des dispositions',
        'facility_inapplicable': 'Pas d\'application',
        'change': 'Modifier',
        'image_help': 'Ajoutez une image de sorte que les visiteurs reconnaissent mieux votre activité.',
        'images': 'Images',
        'copyright': 'Copyright',
        'delete': 'Supprimer',
        'main_image': 'Créer image principale',
        'add_image': 'Ajouter une image',
        age: {
          'age_label': 'Adapté à',
          'All ages': 'De tous âges',
          'Toddlers': 'Tout-petits',
          'Preschoolers': 'Enfants d\'âge préscolaire',
          'Kids': 'Enfants',
          'Teenagers': 'Adolescents',
          'Youngsters': 'Jeunes',
          'Adults': 'Adultes',
          'Seniors': 'Seniors',
          'Custom': 'Autres',
          'from': 'Du',
          'till': 'au',
          'age': 'ans',
          'error_max_lower_than_min': 'L\'âge maximum ne peut être inférieur à l\'âge minimum.'
        },
        priceInfo: {
          'price_label': 'Prix',
          'add_prices': 'Ajouter prix',
          'free': 'Gratuit',
          'prices': 'Prix',
          'change': 'Modifier',
          'currency': 'euro'
        },
        reservationPeriod: {
          'add_reservation_period': 'Ajouter une période de réservation',
          'reservation_period': 'Période de réservation',
          'from': 'De',
          'till': 'À'
        }
      },
      publish: {
        'publish_now': 'Publier immédiatement',
        'publish_later': 'Publier plus tard',
        'edit_done': 'Modification terminée',
        'online_from': 'Publié le'
      },
      timeTracker: {
        'automatic_saved': 'Sauvegardé automatiquement à',
        'hour': 'heures',
      },
      embargo: {
        'title': 'Choisissez une date de publication',
        'help': 'A partir de quand l\'activité peut-elle apparaître en ligne? <em class="text-info"><i class="fa fa-exclamation-circle" aria-hidden="true"></i> Attention, vous ne pouvez définir cette date qu\'une seule fois.</em>',
        'error_past': 'Une date de publication ne peut pas être antérieure.',
        'error_empty': 'Choisissez une date de publication.',
        'cancel': 'Annuler',
        'ready': 'Prêt à modifier'
      },
      imageUpload: {
        'modalTitle': 'Ajouter une image',
        'defaultError': 'Le fichier sélectionné ne répond pas à nos critères.',
        'noFileSelectedError': 'Il n\'y a pas de fichier sélectionné',
        'somethingWentWrongError': 'Une erreur s\'est produite lors de l\'enregistrement de l\'image.',
        'maxSize': 'Le fichier que vous souhaitez télécharger est trop gros. La taille maximale est ',
        'formatNotValidError': 'Le fichier téléchargé n\'est pas une image valable.',
        'extensionsAllowed': 'Seuls les fichiers avec les extensions .jpeg, .gif ou .png sont autorisés.',
        'sizeError': 'Le fichier téléchargé est trop grand.'
      }
    },
    calendar: {
      'one_more_days': 'Une ou plusieurs journées',
      'or': 'ou',
      'default_days': 'Schéma fixe',
      'start_label': 'Début',
      'end_label': 'Fin',
      'whole_day_label': 'Toute la journée',
      'start_hour_label': 'Heure de début',
      'end_hour_label': 'Heure de fin',
      'add_days': 'Ajouter des jours',
      period: {
        'title': 'Date de début et de fin',
        'from': 'Du',
        'till': 'au',
        'alert': 'Introduisez la date de début ainsi que la date de fin. La date de fin ne peut pas tomber avant la date de début.'
      },
      openingHours: {
        'permanent_title': '24/24, 7/7',
        'permanent_subtitle': 'Chaque jour, chaque heure',
        'add_hours': 'Ajouter des heures',
        'opening_hours': 'Heures d\'ouverture',
        'change': 'Modifier',
        'days': 'Jours',
        'from': 'De',
        'till': 'À',
        'more_hours': 'Ajouter plus d\'heures d\'ouverture',
        'cancel': 'Annuler',
        'save': 'Sauver'
      }
    },
    'facilityLabel': {
      'motor': 'Dispositions pour des personnes de motricité réduite',
      'visual': 'Dispositions pour des malvoyants',
      'hearing': 'Dispositions pour des personnes d\'une limitation auditive',
      'other': 'Autres dispositions',
      'place': 'Dispositions de cette location'
    },
    audience: {
      'entrance': 'Accès',
      'everyone': 'Pour tout le monde',
      'members': 'Seulement pour des membres',
      'members_help': 'Ton item est seulement publié sur des chaînes pour des associations et leurs membres.',
      'education': 'Spécifiquement pour des écoles',
      'education_help': 'Ton item est seulement publié sur des chaînes d\'éducation culturelle. Après la publication tu peux encore ajouter de l\'information spécifique pour des écoles.'
    },
    workflowStatus: {
      'label': 'État de publication',
      'id': 'ID',
      'DRAFT': 'Pas publié',
      'READY_FOR_VALIDATION': 'Prêt à être publié',
      'APPROVED': 'Publié le',
      'REJECTED': 'Publication rejetée',
      'DELETED': 'Pas publié',
      'rules': 'Regardez les règles',
      'rejected_full': 'Cet item a été rejeté.'
    },
    queryFieldGroup: {
      'what': 'Quoi',
      'where': 'Où',
      'when': 'Quand',
      'input-information': 'Information input',
      'translations': 'Traductions',
      'other': 'Autres'
    },
    'queryFieldLabel': {
      'cdbid': 'code d\'identification (CDBID)',
      'offertype': 'type (offre)',
      'keywords': 'label',
      'title': 'titre',
      'category_eventtype_name': 'type (activité)',
      'locationtype': 'type (location)',
      'category_theme_name': 'thème',
      'text': 'texte',
      'city': 'commune (nom)',
      'zipcode': 'code postal',
      'location_id': 'location (id)',
      'country': 'pays',
      'location_label': 'location (nom)',
      'category_flandersregion_name': 'région / commune',
      'nisRegions': 'région / commune',
      'date': 'date',
      'permanent': 'permanent',
      'lastupdated': 'modifié dernièrement',
      'creationdate': 'créé',
      'createdby': 'créé par',
      'availablefrom': 'disponible le',
      'detail_lang': 'traduction',
      'organiser_keywords': 'label organisation',
      'organiser_id': 'organisation (id)',
      'agefrom': 'âge',
      'price': 'prix',
      'organiser_label': 'organisation (nom)',
      'category_facility_name': 'dispositions',
      'category_targetaudience_name': 'public cible',
      'startdate': 'date de début',
      'enddate': 'date de fin',
      'lastupdatedby': 'modifié dernièrement par',
      'category_publicscope_name': 'portée de public'
    },
    'EVENT-EXPORT': {
      'QUERY-IS-MISSING': 'Une exportation est seulement possible après avoir exécuté une recherche',
      'TOO-MANY-ITEMS': 'Une exportation manuelle contenant plus de {{limit}} items n\'est pas possible. Contactez vragen@uitdatabank.be pour une solution sur mesure.'
    },
    'AANBOD_INVOEREN': 'Importer l\'offre',
    'AANBOD_BEWERKEN': 'Modifier l\'offre',
    'AANBOD_MODEREREN': 'Modérer l\'offre',
    'AANBOD_VERWIJDEREN': 'Supprimer l\'offre',
    'ORGANISATIES_BEHEREN': 'Gérer les organisations',
    'GEBRUIKERS_BEHEREN': 'Gérer les utilisateurs',
    'LABELS_BEHEREN': 'Gérer les labels',
    'VOORZIENINGEN_BEWERKEN': 'Modifier les dispositions',
    'ORGANISATIES_BEWERKEN': 'Modifier les organisations',
    'event type missing': 'Choisissez un type à <a href="#quoi" class="alert-link">l\'étape 1</a>?',
    'timestamp missing': 'Avez-vous choisi une date en <a href="#quand" class="alert-link">étape 2</a>?',
    'start or end date missing': 'Avez-vous choisi une date de début et de fin en <a href="#quand" class="alert-link">étape 2</a>?',
    'when missing': 'Avez-vous fait un choix en <a href="#quand" class="alert-link">étape 2</a>?',
    'place missing for event': 'Avez-vous choisi un lieu en <a href="#où" class="alert-link">étape 3</a>?',
    'location missing for place': 'Avez-vous choisi un lieu en <a href="#où" class="alert-link">étape 3</a>?',
    'title is missing': 'Avez-vous choisi une titre en <a href="#titel" class="alert-link">étape 4</a>?',
    'UNIQUE_ORGANIZER_NOTICE': 'Pour préserver à chaque organisation une identité unique dans UiTdatabank, nous demandons à chaque organisation de fournir un hyperlien unique et valide.',
    'OPENING_HOURS_ERROR': {
      'openAndClose': 'Introduisez toutes les heures d\'ouverture et de fermeture.',
      'dayOfWeek': 'Choisissez au moins un jour dans chaque ligne ajoutée.',
      'openIsBeforeClose': 'L\'heure de fermeture doit être postérieure à l\'heure d’ouverture.'
    },
    'TIME_SPAN_REQUIREMENTS': {
      'timedWhenNotAllDay': 'L\'heure de début et de fin est obligatoire quand un événement ne dure pas toute la journée.',
      'startBeforeEndDay': 'La date de fin ne peut pas tomber avant la date de début.',
      'startBeforeEnd': 'L\'heure de fin ne peut pas tomber avant l\'heure de début.',
      'tooFarInFuture': 'La date de fin et la date de début choisies ne peuvent pas dépasser 10 ans.'
    },
    uitpas: {
      uitpasInfo: {
        'uitpas': 'UiTPAS',
        'uitpas_alert': 'Ceci est un organisateur UiTPAS. Sélectionnez le prix afin d\'ajouter de l\'information spécifique concernant UiTPAS.',
        'uitpas_info': 'Ceci est une activité UiTPAS.',
        'cantChangePrice': 'Pour cet événement des tickets ont été vendus dont l\'information du prix existe déjà. Vous ne pouvez plus modifier l\'information du prix.',
        'cantChangeOrganiser': 'Pour cet événement des tickets UiTPAS ont déjà été vendus. Vous ne pouvez plus modifier l\'organisation.',
        'unavailable': 'UiTPAS n\'est pas disponible pour l\'instant, essayez plus tard ou contactez le helpdesk (vragen@uitdatabank.be).'
      },
      cardSystems: {
        'card_systems': '<Systèmes des cartes',
        'choose': '--Sélectionnez une clé de répartition--',
        'retry': 'Enregistrer à nouveau',
        'unavailable': 'ne peut pas joindre UiTPAS, essayez plus tard ou contactez le helpdesk (vragen@uitdatabank.be)'
      }
    },
    images: {
      'agreement': 'Vous êtes sur le point d\'ajouter une ou plusieurs images et de les diffuser publiquement. Pour ceci il faut respecter tous les droits d\'auteur et de portrait applicables, ainsi que d\'autres législations en vigueur. Dans le cas contraire, vous pouvez en être tenu responsable, comme précisé dans les',
      'conditions': 'conditions générales',
      'conditions_url': 'https://www.publiq.be/fr/accord-utilisation-uitdatabank',
      'copyright_info': 'Plus d\'informations sur le copyright',
      'description': 'Description',
      'description_help': 'Maximum 250 caractères',
      'copyright': 'Copyright',
      'copyright_help': 'Mentionnez le nom de photographe légitime. Mentionnez le nom de votre association ou organisation uniquement si vous êtes propriétaire des droits (au moins 3 caractères).',
      'cancel': 'Annuler',
      'agree': 'Accepter',
      upload: {
        'select_image': 'Sélectionnez votre photo',
        'choose_file': 'Choisissez un fichier',
        'max_filesize': 'La dimension maximale de votre image est {{maxFileSize}} et a comme type .jpeg, .gif of .png',
        'upload': 'Télécharger'
      },
      edit: {
        'title': 'Modifier l\'information de l\'image',
        'description_help': 'Une bonne description de l\'image est lue par les moteurs de recherche et des utilisateurs malvoyants. (max. 250 caractères)',
        'save_error': 'Il y a eu une erreur dans l\'enregistrement de l\'image.',
        'update': 'actualiser'
      },
      remove: {
        'title': 'Supprimer l\'image',
        'sure': 'Vous êtes sûr de vouloir supprimer cette image?',
        'save_error': 'Il y a eu une erreur dans la suppression de l\'image.',
      }
    },
    organizer: {
      modal: {
        'title': 'Ajouter une nouvelle organisation',
        'avoid_doubles': 'Évitez les doubles emplois',
        'unique_notice': 'Pour préserver à chaque organisation une identité unique dans UiTdatabank, nous demandons à chaque organisation de fournir un hyperlien unique et valide.',
        'website': 'Site web',
        'alert_warning': 'Cette adresse est déjà utilisée par l\'organisation \'{{organizerName}}\'. Donnez un site web unique ou',
        'alert_button': 'utilisez {{organizerName}} comme organisation',
        'name_help': 'Le nom public officiel de l\'organisation.',
        'name_required': 'Veuillez introduire un nom',
        'add_confirm': 'Vous êtes sûr d\'ajouter \"{{newOrganizerName}}\" comme organisation? La  double importation d\'organisations n\'est pas permise.',
        'doubles': 'Nous avons trouvé des items similaires:',
        'select': 'Sélectionner',
        'your_input': 'Vous avez importé:',
        'still_enter': 'Importer quand même',
        'save_error': 'Il y a eu une erreur dans l\'enregistrement de l\'organisation.',
        'address_error': 'Veuillez introduire une adresse valable.',
        'contact_error': 'Veuillez introduire l\'information du contact correctement.',
        'close': 'Fermer',
        'save': 'Sauver',
        'label_name': 'Nom'
      },
      address: {
        'label_street': 'Rue et numéro',
        'help_street': 'Veuillez introduire la rue et le numéro.',
        'label_city': 'Commune',
        'placeholder_city': 'Commune of code postal',
        'help_city': 'Il y a eu un problème dans la collection des villes.',
        'error_city': 'Veuillez introduire une commune.',
        'change': 'Modifier'
      },
      contact: {
        'title': 'Contact',
        'enter_url': 'Entrez un lien hypertexte',
        'enter_email': 'Introduisez une adresse mail',
        'enter_phone': 'Introduisez un numéro de téléphone<small class="text-muted">, p.ex. 011 32 43 54</small>',
        'required': 'Veuillez compléter ce domaine.',
        'valid_url': 'Cette url n\'est pas valable.',
        'valid_email': 'Cette adresse e-mail n\'est pas valable.',
        'valid_phone': 'Ce numéro de téléphone n\'est pas valable.',
        'cancel': 'Annuler',
        'add': 'Ajouter',
        'add_phone': 'Ajouter un numéro de téléphone',
        'add_email': 'Ajouter une adresse mail',
        'add_url': 'Ajouter un autre site web'
      },
      manage: {
        'edit': 'Modifier',
        'delete': 'Supprimer',
        'overview': 'Retourner à l\'aperçu',
        'dashboard': 'Retourner au tableau de bord',
        'name': 'Nom',
        'address': 'Adresse',
        'website': 'Site Internet',
        'phone': 'Numéro de téléphone',
        'email': 'Adresse e-mail',
        'labels': 'Labels',
        'removed': 'Cette organisation a été supprimée.'
      }
    },
    duplicate: {
      title: 'Copier et modifier',
      description: 'Vous êtes sur le point de copier un événement. Choisissez une date pour cet événement.',
      error: 'Il y a eu une erreur dans la création d\'une copie!'
    },
    dashboard: {
      'welcome': 'Bienvenue,',
      'no_items': 'Vous n\'avez pas encore ajouté des items.',
      'add_activity': 'Ajouter une activité ou une location?',
      'my_activities': 'Mes activitées et lieux',
      'my_organizers': 'Mes organisations',
      'add': 'Ajouter',
      'add_organizer': 'Ajouter une organisation',
      directive: {
        'no_publish': 'Pas publié!',
        'online': 'En ligne le',
        'edit': 'Modifier',
        'example': 'Exemple',
        'delete': 'Supprimer',
        'expired_event': 'Événement terminé'
      },
      delete: {
        'sure': 'Vous êtes sûr de vouloir supprimer \"{{name}}\"?',
        'error_location': 'Le lieu \"{{name}}\" ne peut pas être supprimée car des activités y ont encore lieu.',
        'error': 'Il y a eu une erreur dans la suppression de l\'activité.',
        'cancel': 'Annuler',
        'delete': 'Supprimer'
      }
    },
    entry: {
      'exported_documents': 'Documents exportés',
      'notifications': 'Notifications',
      'in_progress': 'Occupé'
    },
    offerTypes: {
      'Concert': 'Concert',
      'Theatervoorstelling': 'Théâtre',
      'Lezing of congres': 'Conférence ou congrès',
      'Dansvoorstelling': 'Spectacle de danse',
      'Festival': 'Festival',
      'Toeristisch evenement': 'Événement touristique',
      'Film': 'Cinéma',
      'Sportwedstrijd bekijken': 'Assister à une compétition sportive',
      'Cursus of workshop': 'Cours ou atelier',
      'Sportactiviteit': 'Activité sportive',
      'Kamp of vakantie': 'Camp de vacances',
      'Begeleide rondleiding': 'Visite guidé',
      'Route': 'Itinéraire',
      'Spel of quiz': 'Jeu ou quiz',
      'Party of fuif': 'Soirée',
      'Kermis of feestelijkheid': 'Kermesse ou festivité',
      'Congres of studiedag': 'Congrès ou journée d\'étude',
      'Eten en drinken': 'Manger et boire',
      'Thema of pretpark': 'Parc à thème ou parc d\'attractions',
      'Theater': 'Théâtre',
      'Jeugdhuis of jeugdcentrum': 'Maison de jeunes ou centre de jeunesse',
      'Cultuur- of ontmoetingscentrum': 'Centre culturel ou centre de réunion',
      'Discotheek': 'Discothèque',
      'Bibliotheek of documentatiecentrum': 'Bibliothèque ou centre de documentation',
      'Bioscoop': 'Cinéma',
      'Horeca': 'Horeca',
      'Openbare ruimte': 'Espace public',
      'Tentoonstelling': 'Exposition',
      'Markt of braderie': 'Marché ou braderie',
      'Natuurgebied of park': 'Zone naturelle ou parc',
      'Natuur, park of tuin': 'Zone naturelle ou parc',
      'Beurs': 'Foire / exposition',
      'Monument': 'Monument',
      'Opendeurdag': 'Journée portes ouvertes',
      'Recreatiedomein of centrum': 'Centre de loisirs ou centre de récréation',
      'Park of tuin': 'Jardin ou parc',
      'Archeologische Site': 'Site Archéologique',
      'School of onderwijscentrum': 'École ou centre éducatif',
      'Sportcentrum': 'Centre sportif',
      'Winkel': 'Magasin',
      'Museum of galerij': 'Musée ou galerie',
      'Zaal of expohal': 'Hall ou salle d\'expo'
    },
    offerThemes: {
      'Antiek en brocante': 'Antiquités ou brocantes',
      'Architectuur': 'Architecture',
      'Audiovisuele kunst': 'Arts graphiques',
      'Beeldhouwkunst': 'Sculpture',
      'Fotografie': 'Photographie',
      'Grafiek': 'Art grafique',
      'Installatiekunst': 'Art d\'installation',
      'Schilderkunst': 'Peinture',
      'Decoratieve kunst': 'Arts décoratifs',
      'Design': 'Design',
      'Mode': 'Mode',
      'Meerdere kunstvormen': 'Arts pluridisciplinaires',
      'Ballet en klassieke dans': 'Ballet et danse classique',
      'Volksdans en werelddans': 'Danse folklorique et mondiale',
      'Stijl en salondansen': 'Danse de salon et stylée',
      'Moderne dans': 'Danse moderne',
      'Erfgoed': 'Patrimoine',
      'Avontuur': 'Aventure',
      'Natuur': 'Nature',
      'Sport': 'Sport',
      'Technologie': 'La technologie',
      'Koken': 'La cuisine',
      'Actie en avontuur': 'Action et aventure',
      'Animatie en kinderfilms': 'Films animés et films pour enfants',
      'Documentaires en reportages': 'Documentaires et reportages',
      'Griezelfilm of horror': 'Films d\'épouvantes ou orreurs',
      'Historische film': 'Films historiques',
      'Komedie': 'Comédie',
      'Kortfilm': 'Court métrage',
      'Filmmusical': 'Comédie musicale',
      'Drama': 'Films dramatiques',
      'Science fiction': 'Science fiction',
      'Cinefiel': 'Cinéphile',
      'Thriller': 'Films à suspense',
      'Meerdere filmgenres': 'Films de tous genres',
      'Geschiedenis': 'Histoire',
      'Gezondheid en wellness': 'Santé et bien-être',
      'Landbouw en platteland': 'Agriculture et campagne',
      'Milieu en natuur': 'Environnement et nature',
      'Literatuur': 'Littérature',
      'Poezie': 'Poésie',
      'Fictie': 'Fiction',
      'Non fictie': 'Non fiction',
      'Strips': 'Bandes dessinées',
      'Klassieke muziek': 'Musique classique',
      'Jazz en blues': 'Jazz et blues',
      'Pop en rock': 'Pop et rock',
      'Hiphop, r&b en rap': 'Hiphop, r&b et rap',
      'Dance': 'Dance',
      'Folk en wereldmuziek': 'Musique folklorique et mondiale',
      'Amusementsmuziek': 'Cabaret',
      'Politiek en maatschappij': 'Politique et société',
      'Creativiteit': 'Créativité',
      'Computer en techniek': 'Ordinateurs et technologie',
      'Opvoeding': 'Éducation',
      'Persoon en relaties': 'Hommes et relations',
      'Interculturele vorming': 'Formation interculturelle',
      'Kunst en kunsteducatie': 'Arts et formation artistique',
      'Gezondheid en zorg': 'Santé et soins',
      'Samenleving': 'Vivre en société',
      'Bal en racketsport': 'Sports de balles et raquettes',
      'Atletiek, wandelen en fietsen': 'Athlétisme, marche et cyclisme',
      'Zwemmen en watersport': 'Natation et sports nautiques',
      'Fitness, gymnastiek, dans en vechtsport': 'Fitness, gymnastique, danse et arts martiaux',
      'Outdoor en adventure': 'Plein air et aventure',
      'Lucht en motorsport': 'Sports aero et moteurs',
      'Volkssporten': 'Sports folkloriques',
      'Omnisport en andere': 'Omnisports et autres',
      'Tekst en muziektheater': 'Théâtre dramatique et musical',
      'Humor en comedy': 'Comédie',
      'Musical': 'Comédie musicale',
      'Figuren en poppentheater': 'Théâtre de marionnettes',
      'Opera en operette': 'Opéra et opérette',
      'Mime en bewegingstheater': 'Mime et theéâtre de mouvements',
      'Wetenschap': 'Science',
      'Zingeving, filosofie en religie': 'Sens de la vie, philosophie et religion',
      'Thema onbepaald': 'Thème non défini',
      'Circus': 'Cirque',
      'Voeding': 'Nutrition',
      'Economie': 'Économie',
      'Themakamp': 'Camp thématique',
      'Taal en communicatie': 'Langue'
    },
    offerThemesGroups: {
      'Dans': 'Danse',
      'Kunst en erfgoed': 'Art et Patrimoine',
      'Muziek': 'Musique',
      'Sport': 'Sport',
      'Varia': 'Divers'
    },
    weekdays: {
      monday: {
        label: 'lun.',
        name: 'Lundi'
      },
      tuesday: {
        label: 'mar.',
        name: 'Mardi'
      },
      wednesday: {
        label: 'mer.',
        name: 'Mercredi'
      },
      thursday: {
        label: 'jeu.',
        name: 'Jeudi'
      },
      friday: {
        label: 'ven.',
        name: 'Vendredi'
      },
      saturday: {
        label: 'sam.',
        name: 'Samedi'
      },
      sunday: {
        label: 'dim.',
        name: 'Dimanche'
      }
    },
    search: {
      exportButton: 'Activités d\'exportation',
      modal: 'Votre sélection ne contient aucune activité, veuillez essayer d’exporter une autre recherche.'
    }
  }
);
})();

// Source: src/core/udb-api.service.js
(function () {
'use strict';

/**
 * @typedef {Object} UiTIDUser
 * @property {string} id        The UiTID of the user.
 * @property {string} nick      A user nickname.
 */

/**
 * @typedef {Object} PagedCollection
 * @property {string} @context
 * @property {string} @type
 * @property {int} itemsPerPage
 * @property {int} totalItems
 * @property {Object[]} member
 */

/**
 * @typedef {Object} OfferIdentifier
 * @property {string} @id
 * @property {string} @type
 */

/**
 * @typedef {Object} Permission
 * @property {string} @key
 * @property {string} @name
 */

/**
 * @typedef {Object} ApiProblem
 * @property {URL} type
 * @property {string} title
 * @property {string} detail
 * @property {URL} instance
 * @property {Number} status
 */

/**
 * @typedef {Object} CommandInfo
 * @property {string} commandId
 */

/**
 * @readonly
 * @enum {string}
 */
var OfferTypes = {
  EVENT: 'event',
  PLACE: 'place'
};

/**
 * @ngdoc service
 * @name udb.core.udbApi
 * @description
 * # udbApi
 * udb api service
 */
angular
  .module('udb.core')
  .service('udbApi', UdbApi);

/* @ngInject */
function UdbApi(
  $q,
  $http,
  appConfig,
  $cookies,
  uitidAuth,
  $cacheFactory,
  UdbEvent,
  UdbPlace,
  UdbOrganizer,
  Upload,
  $translate
) {
  var apiUrl = appConfig.baseApiUrl;
  var defaultApiConfig = {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + uitidAuth.getToken(),
      'X-Api-Key': _.get(appConfig, 'apiKey')
    },
    params: {}
  };
  var offerCache = $cacheFactory('offerCache');

  function withoutAuthorization(apiConfig) {
    var config = _.cloneDeep(apiConfig);
    config.withCredentials = false;
    /**
     * @todo: use _.unset when lodash is updated to v4: https://lodash.com/docs/4.17.4#unset
     */
    delete config.headers.Authorization;

    return config;
  }

  this.mainLanguage = $translate.use() || 'nl';

  /**
   * Removes an item from the offerCache.
   * @param {string} id - The uuid of the offer.
   */
  this.removeItemFromCache = function (id) {
    var offer = offerCache.get(id);

    if (offer) {
      offerCache.remove(id);
    }
  };

  this.createSavedSearch = function (sapiVersion, name, queryString) {
    var post = {
      name: name,
      query: queryString
    };
    return $http
      .post(appConfig.baseUrl + 'saved-searches/' + sapiVersion, post, defaultApiConfig)
      .then(returnUnwrappedData);
  };

  this.getSavedSearches = function (sapiVersion) {
    return $http
      .get(appConfig.baseUrl + 'saved-searches/' + sapiVersion, defaultApiConfig)
      .then(returnUnwrappedData);
  };

  this.deleteSavedSearch = function (sapiVersion, searchId) {
    return $http
      .delete(appConfig.baseUrl + 'saved-searches/' + sapiVersion + '/' + searchId, defaultApiConfig)
      .then(returnUnwrappedData);
  };

  /**
   * @param {string} queryString - The query used to find offers.
   * @param {number} [start] - From which offset the result set should start.
   * @returns {Promise.<PagedCollection>} A promise that signals a successful retrieval of
   *  search results or a failure.
   */
  this.findOffers = function (queryString, start) {
    var offset = start || 0,
        searchParams = {
          start: offset,
          disableDefaultFilters: true,
          workflowStatus: 'READY_FOR_VALIDATION,APPROVED',
        };
    var requestOptions = _.cloneDeep(defaultApiConfig);
    requestOptions.params = searchParams;

    if (queryString.length) {
      searchParams.q = queryString;
    }

    return $http
      .get(appConfig.baseUrl + 'offers/', withoutAuthorization(requestOptions))
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} queryString - The query used to find events.
   * @param {number} [start] - From which event offset the result set should start.
   * @returns {Promise.<PagedCollection>} A promise that signals a successful retrieval of
   *  search results or a failure.
   */
  this.findEvents = function (queryString, start) {
    var offset = start || 0,
        searchParams = {
          start: offset
        };
    var requestOptions = _.cloneDeep(defaultApiConfig);
    requestOptions.params = searchParams;

    if (queryString.length) {
      searchParams.query = queryString;
    }

    return $http
      .get(apiUrl + 'search', requestOptions)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} queryString - The query used to find offer to moderate.
   * @param {number} [start] - From which offset the result set should start.
   * @param {number} [itemsPerPage] - How many items should be in the result set.
   * @returns {Promise.<PagedCollection>} A promise that signals a successful retrieval of
   *  search results or a failure.
   */
  this.findToModerate = function (queryString, start, itemsPerPage) {
    return find(appConfig.baseUrl + 'moderation', queryString, start, itemsPerPage);
  };

  /**
   * @param {URL} offerLocation
   * @return {UdbPlace|UdbEvent|UdbOrganizer}
   */
  this.getOffer = function(offerLocation) {
    var deferredOffer = $q.defer();
    var offer = offerCache.get(offerLocation);

    function cacheAndResolveOffer(jsonOffer) {
      var type = jsonOffer['@id'].split('/').reverse()[1];

      var offer = {};
      if (type === 'event') {
        offer = new UdbEvent();
      }
      else if (type === 'place') {
        offer = new UdbPlace();
      }
      else {
        offer = new UdbOrganizer();
      }
      offer.parseJson(jsonOffer);
      offerCache.put(offerLocation, offer);
      deferredOffer.resolve(offer);
    }

    if (offer) {
      deferredOffer.resolve(offer);
    } else {
      $http
        .get(offerLocation.toString(), defaultApiConfig)
        .success(cacheAndResolveOffer)
        .error(deferredOffer.reject);
    }

    return deferredOffer.promise;
  };

  this.getOrganizerByLDId = function(organizerLDId) {
    var organizerId = organizerLDId.split('/').pop();
    return this.getOrganizerById(organizerId);
  };

  // TODO: Give organizers their own cache instead of using offer?
  this.getOrganizerById = function(organizerId) {
    var deferredOrganizer = $q.defer();

    var organizer = offerCache.get(organizerId);

    if (organizer) {
      deferredOrganizer.resolve(organizer);
    } else {
      var organizerRequest  = $http.get(
        appConfig.baseUrl + 'organizers/' + organizerId, defaultApiConfig
      );

      organizerRequest.success(function(jsonOrganizer) {
        var organizer = new UdbOrganizer();
        organizer.parseJson(jsonOrganizer);
        offerCache.put(organizerId, organizer);
        deferredOrganizer.resolve(organizer);
      });
    }
    return deferredOrganizer.promise;
  };

  /**
   * @param {number} start
   * @param {number} limit
   * @param {string|null} website
   * @param {string|null} name
   *
   * @return {Promise.<PagedCollection>}
   */
  this.findOrganisations = function(start, limit, website, name) {
    var params = {
      limit: limit ? limit : 10,
      start: start ? start : 0,
      embed: true
    };
    if (website) { params.website = website; }
    if (name) { params.name = name; }

    var configWithQueryParams = _.set(withoutAuthorization(defaultApiConfig), 'params', params);

    return $http
      .get(appConfig.baseUrl + 'organizers/', configWithQueryParams)
      .then(returnUnwrappedData);
  };

  /**
   * @param {string} organizerId
   * @param {string} labelName
   * @returns {Promise.<CommandInfo|ApiProblem>}
   */
  this.addLabelToOrganizer = function(organizerId, labelName) {
    return $http
      .put(appConfig.baseUrl + 'organizers/' + organizerId + '/labels/' + labelName, {}, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} organizerId
   * @param {string} labelName
   * @returns {Promise.<CommandInfo|ApiProblem>}
   */
  this.deleteLabelFromOrganizer = function(organizerId, labelName) {
    return $http
        .delete(appConfig.baseUrl + 'organizers/' + organizerId + '/labels/' + labelName, defaultApiConfig)
        .then(returnUnwrappedData, returnApiProblem);
  };
  /**
   * @param {string} organizerId
   * @param {string} website
   * @returns {Promise.<CommandInfo|ApiProblem>}
   */
  this.updateOrganizerWebsite = function(organizerId, website) {
    var params = {
      url: website
    };

    return $http
        .put(appConfig.baseUrl + 'organizers/' + organizerId + '/url', params, defaultApiConfig)
        .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} organizerId
   * @param {string} name
   * @param {string} language
   * @returns {Promise.<CommandInfo|ApiProblem>}
   */
  this.updateOrganizerName = function(organizerId, name, language) {
    var params = {
      name: name
    };

    return $http
        .put(appConfig.baseUrl + 'organizers/' + organizerId + '/name/' + language, params, defaultApiConfig)
        .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} organizerId
   * @param {Object} address
   * @param {string} language
   * @returns {Promise.<CommandInfo|ApiProblem>}
   */
  this.updateOrganizerAddress = function(organizerId, address, language) {

    return $http
        .put(appConfig.baseUrl + 'organizers/' + organizerId + '/address/' + language, address, defaultApiConfig)
        .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} organizerId
   * @param {Array} contact
   * @returns {Promise.<CommandInfo|ApiProblem>}
   */
  this.updateOrganizerContact = function(organizerId, contact) {

    return $http
        .put(appConfig.baseUrl + 'organizers/' + organizerId + '/contactPoint', contact, defaultApiConfig)
        .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {URL} eventId
   * @return {*}
   */
  this.getHistory = function (eventId) {
    return $http
      .get(eventId + '/history', defaultApiConfig)
      .then(returnUnwrappedData);
  };

  /**
   * @returns {Promise.<UiTIDUser>}
   *   A promise with the credentials of the currently logged in user.
   */
  this.getMe = function () {
    var deferredUser = $q.defer();
    var activeUser = uitidAuth.getUser();

    function storeAndResolveUser (userData) {
      var user = {
        id: userData.id,
        nick: userData.nick
      };

      $cookies.putObject('user', user);
      deferredUser.resolve(user);
    }

    if (activeUser) {
      deferredUser.resolve(activeUser);
    } else if (uitidAuth.getToken()) {
      // set the freshest, newest token
      defaultApiConfig.headers.Authorization = 'Bearer ' + uitidAuth.getToken();

      $http
        .get(appConfig.baseUrl + 'user', defaultApiConfig)
        .success(storeAndResolveUser)
        .error(deferredUser.reject);
    } else {
      deferredUser.reject();
    }

    return deferredUser.promise;
  };

  /**
   * Get my user permissions
   */
  this.getMyPermissions = function () {
    var deferredPermissions = $q.defer();
    var token = uitidAuth.getToken();

    // cache the permissions with user token
    // == will need to fetch permissions for each login
    function storeAndResolvePermissions (permissionsList) {
      offerCache.put(token, permissionsList);
      deferredPermissions.resolve(permissionsList);
    }

    if (token) {
      var permissions = offerCache.get(token);
      if (!permissions) {
        $http
          .get(appConfig.baseUrl + 'user/permissions/', defaultApiConfig)
          .success(storeAndResolvePermissions)
          .error(deferredPermissions.reject);
      } else {
        deferredPermissions.resolve(permissions);
      }
    } else {
      deferredPermissions.reject();
    }

    return deferredPermissions.promise;
  };

  /**
   * Get the editing permission for an offer.

   * @param {URL} offerLocation
   */
  this.hasPermission = function(offerLocation) {
    return $http.get(
      offerLocation + '/permission',
      defaultApiConfig
    ).then(function (response) {
      return response.data.hasPermission ? $q.resolve() : $q.reject();
    });
  };

  /**
   * @param {OfferIdentifier[]} offers
   * @param {string} label
   * @return {Promise}
   */
  this.labelOffers = function (offers, label) {
    return $http.post(appConfig.baseUrl + 'offers/labels',
      {
        'label': label,
        'offers': offers
      },
      defaultApiConfig
    );
  };

  /**
   * @param {string} query
   * @param {string} label
   * @return {Promise}
   */
  this.labelQuery = function (query, label) {
    return $http.post(appConfig.baseUrl + 'query/labels',
      {
        'label': label,
        'query': query
      },
      defaultApiConfig
    );
  };

  /**
   * @param {string} sapiVersion
   * @param {string} query
   * @param {string} [email]
   * @param {string} format
   * @param {string[]} properties
   * @param {boolean} perDay
   * @param {URL[]} selection
   * @param {Object} [customizations]
   * @return {*}
   */
  this.exportEvents = function (sapiVersion, query, email, format, properties, perDay, selection, customizations) {

    var exportData = {
      sapiVersion: sapiVersion,
      query: query,
      selection: _.map(selection, function (url) {
        return url.toString();
      }),
      order: {},
      include: properties,
      perDay: perDay,
      customizations: customizations || {}
    };

    if (email) {
      exportData.email = email;
    }

    return $http.post(appConfig.baseUrl + 'events/export/' + format, exportData, defaultApiConfig);
  };

  /**
   * @param {URL} offerLocation
   * @param {string} propertyName
   *  'title' or 'description'
   * @param {string} language
   *  ISO 639-1 language code: https://en.wikipedia.org/wiki/ISO_639-1
   *  Languages known to be supported: nl, en, fr, de.
   * @param {string} translation
   *
   * @return {Promise}
   */
  this.translateProperty = function (offerLocation, propertyName, language, translation) {
    var translationData = {};
    translationData[propertyName] = translation;

    if (propertyName === 'name') {
      propertyName = 'title';
    }

    return $http.post(
      offerLocation + '/' + language + '/' + propertyName,
      translationData,
      defaultApiConfig
    );
  };

  this.translateAddress = function (offerId, language, translation) {
    return $http.put(
        appConfig.baseUrl + 'places/' + offerId + '/address/' + language,
        {
          addressCountry: translation.addressCountry,
          addressLocality: translation.addressLocality,
          postalCode: translation.postalCode,
          streetAddress: translation.streetAddress
        },
        defaultApiConfig
    );
  };

  var offerPropertyPaths = {
    typicalAgeRange: 'typical-age-range'
  };

  /**
   * Update the property for a given id.
   *
   * @param {URL} offerLocation
   *   The location of the offer to update
   * @param {string} property
   *   Property to update
   * @param {string} value
   *   Value to save
   */
  this.updateProperty = function(offerLocation, property, value) {
    // TODO: having both in path and updateData is duplicate
    var updateData = {};
    updateData[property] = value;
    var path = offerPropertyPaths[property] ? offerPropertyPaths[property] : property;

    return $http.post(
      offerLocation +  '/' + path,
      updateData,
      defaultApiConfig
    );
  };

  this.updatePriceInfo = function(offerLocation, price) {
    return $http.put(
      offerLocation + '/priceInfo',
      price,
      defaultApiConfig
    );
  };

  /**
   * @param {URL} offerLocation
   *   The location of the offer to update
   * @param {string[]} facilities
   *   A list of facility ids
   */
  this.updateOfferFacilities = function (offerLocation, facilities) {
    return $http.put(
      offerLocation + '/facilities/',
      {facilities: facilities},
      defaultApiConfig
    );
  };

  /**
   * @param {URL} offerLocation
   * @param {string} label
   *
   * @return {Promise}
   */
  this.labelOffer = function (offerLocation, label) {
    return $http.post(
      offerLocation + '/labels',
      {'label': label},
      defaultApiConfig
    );
  };

  /**
   * @param {URL} offerLocation
   * @param {string} label
   *
   * @return {Promise}
   */
  this.unlabelOffer = function (offerLocation, label) {
    // @see https://stackoverflow.com/questions/332872/encode-url-in-javascript
    return $http
      .delete(offerLocation + '/labels/' + encodeURIComponent(label), defaultApiConfig)
      .catch(returnApiProblem);
  };

  /**
   * @param {EventFormData} offer
   *
   * @return {Promise.<URL>}
   */
  this.deleteOffer = function (offer) {
    return $http['delete'](
      offer['@id'],
      defaultApiConfig
    );
  };

  /**
   * @param {udbOrganizer} organization
   *
   * @return {Promise.<Object|ApiProblem>}
   */
  this.deleteOrganization = function (organization) {
    return $http
      .delete(organization['@id'], defaultApiConfig)
      .then(returnJobData, returnApiProblem);
  };

  /**
   * @param {string} type   either 'place' or 'event'
   * @param {EventFormData} offer
   *
   * @return {Promise.<URL>}
   */
  this.createOffer = function (type, offer) {
    return $http.post(
      appConfig.baseUrl + type,
      offer,
      defaultApiConfig
    ).then(function(response) {
      return new URL(response.data.url);
    });
  };

  /**
   * @param {URL} offerLocation
   * @param {string} description
   * @param {string} purpose
   */
  this.createVariation = function (offerLocation, description, purpose) {
    var activeUser = uitidAuth.getUser(),
        requestData = {
          'owner': activeUser.id,
          'purpose': purpose,
          'same_as': offerLocation.toString(),
          'description': description
        };

    return $http.post(
      appConfig.baseUrl + 'variations/',
      requestData,
      defaultApiConfig
    );
  };

  /**
   * @param {string} variationId
   * @param {string} description
   */
  this.editDescription = function (variationId, description) {
    return $http.patch(
      appConfig.baseUrl + 'variations/' + variationId,
      {'description': description},
      defaultApiConfig
    );
  };

  /**
   * @param {URL} placeLocation
   * @returns {OfferIdentifier[]}
   */
  this.findEventsAtPlace = function(placeLocation) {
    function unwrapEvents(wrappedEvents) {
      var eventIdentifiers = _.map(wrappedEvents.events, function(event) {
        return {'@id': appConfig.baseUrl + 'event/' + event['@id']};
      });
      return $q.resolve(eventIdentifiers);
    }

    return $http
      .get(placeLocation + '/events', defaultApiConfig)
      .then(function (response) {
        return returnUnwrappedData(response)
          .then(unwrapEvents);
      });
  };

  /**
   * Create a new organizer.
   */
  this.createOrganizer = function(organizer) {
    return $http.post(
      appConfig.baseUrl + 'organizers/',
      organizer,
      defaultApiConfig
    );
  };

  /**
   * Update the major info of an offer.
   * @param {URL} offerLocation
   * @param {EventFormData} info
   */
  this.updateMajorInfo = function(offerLocation, info) {
    return $http.post(
      offerLocation + '/major-info',
      info,
      defaultApiConfig
    );
  };

  /**
   * Delete the typical age range for an offer.
   * @param {URL} offerLocation
   */
  this.deleteTypicalAgeRange = function(offerLocation) {

    return $http.delete(
      offerLocation + '/typical-age-range',
      defaultApiConfig
    );
  };

  /**
   * Delete the organizer for an offer.
   * @param {URL} offerLocation
   * @param {string} organizerId
   */
  this.deleteOfferOrganizer = function(offerLocation, organizerId) {

    return $http.delete(
      offerLocation + '/organizer/' + organizerId,
      defaultApiConfig
    );
  };

  /**
   * @param {string} variationId
   */
  this.deleteVariation = function (variationId) {
    return $http.delete(
      appConfig.baseUrl + 'variations/' + variationId,
      defaultApiConfig
    );
  };

  /**
   * Add a new image.
   * @param {URL} itemLocation
   * @param {string} imageId
   * @return {Promise}
   */
  this.addImage = function(itemLocation, imageId) {

    var postData = {
      mediaObjectId: imageId
    };

    return $http
      .post(
        itemLocation + '/images',
        postData,
        defaultApiConfig
      )
      .then(returnJobData);
  };

  /**
   * Update the image info of an item.
   * @param {URL} itemLocation
   * @param {string} imageId
   * @param {string} description
   * @param {string} copyrightHolder
   * @return {Promise}
   *
   */
  this.updateImage = function(itemLocation, imageId, description, copyrightHolder) {
    var postData = {
      description: description,
      copyrightHolder: copyrightHolder
    };

    return $http
      .post(
        itemLocation + '/images/' + imageId,
        postData,
        defaultApiConfig
      )
      .then(returnJobData);
  };

  /**
   * Remove an image from an item.
   *
   * @param {URL} itemLocation
   * @param {string} imageId
   *
   * @return {Promise}
   */
  this.removeImage = function(itemLocation, imageId) {
    return $http.delete(
      itemLocation + '/images/' + imageId,
      defaultApiConfig
    ).then(returnJobData);
  };

  /**
   * Select the main image for an item.
   *
   * @param {URL} itemLocation
   * @param {string} imageId
   *
   * @return {Promise.<Object>}
   */
  this.selectMainImage = function(itemLocation, imageId) {
    var postData = {
      mediaObjectId: imageId
    };

    return $http
      .post(
        itemLocation + '/images/main',
        postData,
        defaultApiConfig
      )
      .then(returnJobData);
  };

  /**
   * @param {URL} itemLocation
   * @param {('everyone'|'members'|'education')} audienceType
   *
   * @returns {Promise.<CommandInfo|ApiProblem>}
   */
  this.setAudienceType = function (itemLocation, audienceType) {
    return $http
      .put(itemLocation.toString() + '/audience', {'audienceType': audienceType}, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {object} response
   *  The response that is returned when creating a job.
   *
   * @return {Promise.<Object>}
   *  The object containing the job data
   */
  function returnJobData(response) {
    return $q.resolve(response.data);
  }

  this.getOfferVariations = function (ownerId, purpose, offerUrl) {
    var parameters = {
      'owner': ownerId,
      'purpose': purpose,
      'same_as': offerUrl
    };

    var config = _.cloneDeep(defaultApiConfig);
    config.params = _.pick(parameters, _.isString);

    return $http.get(
      appConfig.baseUrl + 'variations/',
      config
    );
  };

  this.getVariation = function (variationId) {
    var deferredVariation = $q.defer();

    var variationRequest = $http.get(
      appConfig.baseUrl + 'variations/' + variationId, defaultApiConfig);

    variationRequest.success(function (jsonEvent) {
      var event = new UdbEvent(jsonEvent);
      deferredVariation.resolve(event);
    });

    variationRequest.error(function () {
      deferredVariation.reject();
    });

    return deferredVariation.promise;
  };

  function returnUnwrappedData(response) {
    return $q.resolve(response.data);
  }

  /**
   * @param {int} page
   * @return {Promise.<PagedCollection>}
   */
  this.getDashboardItems = function(page) {
    var params = {
      'disableDefaultFilters': true,
      'sort[modified]': 'desc',
      'sort[created]': 'asc',
      'limit': 50,
      'start': (page - 1) * 50
    };

    var createdByQueryMode = _.get(appConfig, 'created_by_query_mode', 'uuid');

    var tokenData = uitidAuth.getTokenData();
    var userId = tokenData.uid;
    var userEmail = tokenData.email;

    if (createdByQueryMode === 'uuid') {
      params.creator = userId;
    } else if (createdByQueryMode === 'email') {
      params.creator = userEmail;
    } else if (createdByQueryMode === 'mixed') {
      params.q = 'creator:(' + userId + ' OR ' + userEmail + ')';
    }

    var requestConfig = _.cloneDeep(defaultApiConfig);
    requestConfig.params = params;

    return $http
      .get(appConfig.baseUrl + 'offers/', requestConfig)
      .then(returnUnwrappedData);
  };

  /**
   * @param {int} page
   * @return {Promise.<PagedCollection>}
   */
  this.getDashboardOrganizers = function(page) {
    var requestConfig = _.cloneDeep(defaultApiConfig);
    if (page > 1) {
      requestConfig.params.page = page;
    }

    return $http
        .get(appConfig.baseUrl + 'user/organizers/', requestConfig)
        .then(returnUnwrappedData);
  };

  this.uploadMedia = function (imageFile, description, copyrightHolder, language) {
    var uploadOptions = {
      url: appConfig.baseUrl + 'images/',
      fields: {
        description: description,
        copyrightHolder: copyrightHolder,
        language: language
      },
      file: imageFile
    };
    var config = _.assign(defaultApiConfig, uploadOptions);

    return Upload.upload(config);
  };

  this.getMedia = function (imageId) {
    return $http
      .get(
        appConfig.baseUrl + 'media/' + imageId,
        defaultApiConfig
      )
      .then(returnUnwrappedData);
  };

  /**
   * @param {string}  name
   * @param {boolean} isVisible
   * @param {boolean} isPrivate
   * @param {string}  [parentId]
   * @return {Promise.<Object|ApiProblem>}
   */
  this.createLabel = function (name, isVisible, isPrivate, parentId) {
    var labelData = {
      name: name,
      visibility: isVisible ? 'visible' : 'invisible',
      privacy: isPrivate ? 'private' : 'public'
    };

    if (parentId) {
      labelData.parentId = parentId;
    }

    return $http
      .post(appConfig.baseUrl + 'labels/', labelData, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} labelId
   * @param {string} command
   * @return {Promise.<Object|ApiProblem>}
   */
  this.updateLabel = function (labelId, command) {
    return $http.patch(
      appConfig.baseUrl + 'labels/' + labelId,
      {'command': command},
      defaultApiConfig
    ).then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {uuid} labelId
   * @return {Promise.<Object|ApiProblem>}
   */
  this.deleteLabel = function (labelId) {
    return $http
      .delete(appConfig.baseUrl + 'labels/' + labelId, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {uuid} labelId
   * @return {Promise.<Label>}
   */
  this.getLabelById = function (labelId) {
    return $http
      .get(appConfig.baseUrl + 'labels/' + labelId, defaultApiConfig)
      .then(returnUnwrappedData);
  };

  /**
   * @param {string} query
   *  Matches case-insensitive and any part of a label.
   * @param {Number} [limit]
   *  The limit of results per page.
   * @param {Number} [start]
   * @return {Promise.<PagedCollection>}
   */
  this.findLabels = function (query, limit, start) {
    var requestConfig = _.cloneDeep(defaultApiConfig);
    requestConfig.params = {
      query: query,
      limit: limit ? limit : 30,
      start: start ? start : 0
    };

    return $http
      .get(appConfig.baseUrl + 'labels/', requestConfig)
      .then(returnUnwrappedData);
  };

  /**
   * @param {uuid} roleId
   * @return {Promise.<Role>}
   */
  this.getRoleById = function (roleId) {
    return $http
      .get(appConfig.baseUrl + 'roles/' + roleId, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} query
   *  Matches case-insensitive and any part of a label.
   * @param {Number} [limit]
   *  The limit of results per page.
   * @param {Number} [start]
   * @return {Promise.<PagedCollection>}
   */
  this.findRoles = function (query, limit, start) {
    var requestConfig = _.cloneDeep(defaultApiConfig);
    requestConfig.params = {
      query: query,
      limit: limit ? limit : 30,
      start: start ? start : 0
    };

    return $http
      .get(appConfig.baseUrl + 'roles/', requestConfig)
      .then(returnUnwrappedData);
  };

  /**
   * @param {string}  name
   * @return {Promise.<Object|ApiProblem>} Object containing created roleId
   */
  this.createRole = function (name) {
    var roleData = {
      name: name
    };

    return $http
      .post(appConfig.baseUrl + 'roles/', roleData, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {uuid}    roleId
   * @param {string}  name
   * @return {Promise.<Object|ApiProblem>} Object containing created roleId
   */
  this.updateRoleName = function (roleId, name) {
    var requestOptions = _.cloneDeep(defaultApiConfig);
    requestOptions.headers['Content-Type'] = 'application/ld+json;domain-model=RenameRole';

    var updateData = {
      'name': name
    };

    return $http
      .patch(appConfig.baseUrl + 'roles/' + roleId, updateData, requestOptions)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   *
   * @param {uuid}    roleId
   * @param {string}  version
   * @param {string}  constraint
   * @return {Promise.<Object|ApiProblem>} Object containing created constraint.
   */
  this.createRoleConstraint = function (roleId, version, constraint) {
    var requestOptions = _.cloneDeep(defaultApiConfig);
    requestOptions.headers['Content-Type'] = 'application/ld+json;domain-model=addConstraint';

    var constraintData = {
      query: constraint
    };

    return $http
        .post(appConfig.baseUrl + 'roles/' + roleId + /constraints/ + version, constraintData, requestOptions)
        .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   *
   * @param {uuid}    roleId
   * @param {string}  version
   * @param {string}  constraint
   * @return {Promise.<Object|ApiProblem>} Object containing updated constraint.
   */
  this.updateRoleConstraint = function (roleId, version, constraint) {
    var requestOptions = _.cloneDeep(defaultApiConfig);
    requestOptions.headers['Content-Type'] = 'application/ld+json;domain-model=updateConstraint';

    var updateData = {
      query: constraint
    };

    return $http
        .put(appConfig.baseUrl + 'roles/' + roleId + /constraints/ + version, updateData, requestOptions)
        .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   *
   * @param {uuid}    roleId
   * @param {string}  version
   * @return {Promise.<Object|ApiProblem>} Object containing updated constraint.
   */
  this.removeRoleConstraint = function (roleId, version) {
    var requestOptions = _.cloneDeep(defaultApiConfig);
    requestOptions.headers['Content-Type'] = 'application/ld+json;domain-model=removeConstraint';

    return $http
        .delete(appConfig.baseUrl + 'roles/' + roleId + /constraints/ + version, requestOptions)
        .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @return {Promise.Array<Permission>}
   */
  this.getPermissions = function () {
    var requestConfig = defaultApiConfig;

    return $http
      .get(appConfig.baseUrl + 'permissions/', requestConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} roleId
   *  roleId for the role to retrieve permissions for
   * @return {Promise.Array<Permission>}
   */
  this.getRolePermissions = function (roleId) {
    var requestConfig = defaultApiConfig;
    return $http
      .get(appConfig.baseUrl + 'roles/' + roleId + '/permissions/', requestConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} roleId
   *  roleId for the role to retrieve users for
   * @return {Promise.Array<User>}
   */
  this.getRoleUsers = function (roleId) {
    var requestConfig = defaultApiConfig;
    return $http
      .get(appConfig.baseUrl + 'roles/' + roleId + '/users/', requestConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} permissionKey
   *  The key for the permission
   * @param {string} roleId
   *  roleId for the role
   * @return {Promise}
   */
  this.addPermissionToRole = function (permissionKey, roleId) {
    var requestConfig = defaultApiConfig;

    return $http
      .put(appConfig.baseUrl + 'roles/' + roleId + '/permissions/' + permissionKey, {}, requestConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} permissionKey
   *  The key for the permission
   * @param {string} roleId
   *  roleId for the role
   * @return {Promise}
   */
  this.removePermissionFromRole = function (permissionKey, roleId) {
    var requestConfig = defaultApiConfig;

    return $http
      .delete(appConfig.baseUrl + 'roles/' + roleId + '/permissions/' + permissionKey, requestConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} userId
   *  The id of the user
   * @param {string} roleId
   *  roleId for the role
   * @return {Promise}
   */
  this.addUserToRole = function (userId, roleId) {
    var requestConfig = defaultApiConfig;

    return $http
      .put(appConfig.baseUrl + 'roles/' + roleId + '/users/' + userId, {}, requestConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} email
   *  A valid email address with a specific domain. The wildcard '*' can be used in the local part.
   * @param {Number} [limit]
   *  The limit of results per page.
   * @param {Number} [start]
   * @return {Promise.<PagedCollection>}
   */
  this.findUsersByEmail = function (email, limit, start) {
    var requestConfig = _.cloneDeep(defaultApiConfig);
    requestConfig.params = {
      email: email ? email : '',
      limit: limit ? limit : 30,
      start: start ? start : 0
    };

    return $http
      .get(appConfig.baseUrl + 'users/', requestConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} email
   *  The e-mailaddress of a user.
   * @return {Promise}
   */
  this.findUserWithEmail = function(email) {
    var requestConfig = _.cloneDeep(defaultApiConfig);

    return $http
      .get(appConfig.baseUrl + 'users/emails/' + email, requestConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {uuid} roleId
   *  The uuid of the role to be removed.
   * @return {Promise}
   */
  this.removeRole = function (roleId) {
    return $http
      .delete(appConfig.baseUrl + 'roles/' + roleId, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} roleId
   *  roleId for the role to retrieve labels for
   * @return {Promise.Array<Permission>}
   */
  this.getRoleLabels = function (roleId) {
    return $http
      .get(appConfig.baseUrl + 'roles/' + roleId + '/labels/', defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} roleId
   *  roleId for the role
   * @param {string} labelId
   *  The id of the label to be added
   * @return {Promise}
   */
  this.addLabelToRole = function (roleId, labelId) {
    return $http
      .put(appConfig.baseUrl + 'roles/' + roleId + '/labels/' + labelId, {}, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} roleId
   *  roleId for the role
   * @param {string} labelId
   *  The id of the label to be removed
   * @return {Promise}
   */
  this.removeLabelFromRole = function (roleId, labelId) {
    return $http
      .delete(appConfig.baseUrl + 'roles/' + roleId + '/labels/' + labelId, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} roleId
   *  roleId for the role
   * @param {string} userId
   *  The id of the user to be removed
   * @return {Promise}
   */
  this.removeUserFromRole = function (roleId, userId) {
    return $http
      .delete(appConfig.baseUrl + 'roles/' + roleId + '/users/' + userId, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} userId
   *
   * @returns {Promise.<User>}
   */
  this.getUser = function(userId) {
    return $http
      .get(appConfig.baseUrl + 'users/' + userId, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} userId
   *
   * @return {Promise.<Object[]>}
   */
  this.getUserRoles = function (userId) {
    return $http
      .get(appConfig.baseUrl + 'users/' + userId + '/roles/', defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @return {Promise.<Object[]>}
   */
  this.getMyRoles = function () {
    return $http
      .get(appConfig.baseUrl + 'user/roles/', defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {URL} offerUrl
   * @param {string} domainModel
   * @param {string} reason (optional)
   */
  this.patchOffer = function (offerUrl, domainModel, reason) {
    var requestOptions = _.cloneDeep(defaultApiConfig);
    requestOptions.headers['Content-Type'] = 'application/ld+json;domain-model=' + domainModel;

    var updateData = {
      'reason': reason
    };

    return $http
      .patch(offerUrl, (reason ? updateData : {}), requestOptions)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {URL} offerUrl
   * @param {Date} [publicationDate]
   * @returns {Promise.<Object|ApiProblem>}
   */
  this.publishOffer = function (offerUrl, publicationDate) {
    var requestOptions = _.cloneDeep(defaultApiConfig);
    requestOptions.headers['Content-Type'] = 'application/ld+json;domain-model=Publish';
    var data = publicationDate instanceof Date ? {publicationDate: publicationDate} : {};

    return $http
      .patch(offerUrl.toString(), data, requestOptions)
      .then(returnUnwrappedData, returnApiProblem);
  };

  this.getCalendarSummary = function(offerId, format, language) {
    var plainConfig = _.cloneDeep(defaultApiConfig);
    var offerUrl = appConfig.baseUrl + 'events/' + offerId;
    var langCode = language + '_BE';
    plainConfig.headers.Accept = 'text/html';

    return $http
      .get(offerUrl + '/calsum?format=' + format + '&langCode=' + langCode, plainConfig)
      .then(returnUnwrappedData);
  };

  /**
   * @param {URL} eventUrl
   * @param {Object} newCalendarData
   * @return {Promise.<Object|ApiProblem>} Object containing the duplicate info
   */
  this.duplicateEvent = function(eventUrl, newCalendarData) {
    return $http
      .post(eventUrl + '/copies/', newCalendarData, defaultApiConfig)
      .then(returnUnwrappedData, returnApiProblem);
  };

  /**
   * @param {string} path - The path to direct the HTTP request to.
   * @param {string} queryString - The query used to find events.
   * @param {number} [start] - From which event offset the result set should start.
   * @param {number} [itemsPerPage] - How many items should be in the result set.
   * @returns {Promise.<PagedCollection>} A promise that signals a successful retrieval of
   *  search results or a failure.
   */
  function find(path, queryString, start, itemsPerPage) {
    var offset = start || 0,
      limit = itemsPerPage || 30,
      searchParams = {
        start: offset,
        limit: limit
      };
    var requestOptions = _.cloneDeep(defaultApiConfig);
    requestOptions.params = searchParams;

    if (queryString.length) {
      searchParams.query = queryString;
    }

    return $http
      .get(path, requestOptions)
      .then(returnUnwrappedData, returnApiProblem);
  }

  /**
   * @param {Object} errorResponse
   * @return {Promise.<ApiProblem>}
   */
  function returnApiProblem(errorResponse) {
    if (errorResponse) {
      var problem = {
        type: new URL(_.get(errorResponse, 'data.type', appConfig.baseUrl + 'problem')),
        title: _.get(errorResponse, 'data.title', 'Something went wrong.'),
        detail: _.get(errorResponse, 'data.detail', 'We failed to perform the requested action!'),
        status: errorResponse.status
      };

      return $q.reject(problem);
    }
  }
}
UdbApi.$inject = ["$q", "$http", "appConfig", "$cookies", "uitidAuth", "$cacheFactory", "UdbEvent", "UdbPlace", "UdbOrganizer", "Upload", "$translate"];
})();

// Source: src/core/udb-event.factory.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.core.UdbEvent
 * @description
 * # UdbEvent
 * UdbEvent factory
 */
angular
  .module('udb.core')
  .factory('UdbEvent', UdbEventFactory);

/* @ngInject */
function UdbEventFactory(EventTranslationState, UdbPlace, UdbOrganizer) {

  var EventPricing = {
    FREE: 'free',
    UNKNOWN: 'unknown',
    PAYED: 'payed'
  };

  function getCategoryLabel(jsonEvent, domain) {
    var label;
    var category = _.find(jsonEvent.terms, function (category) {
      return category.domain === domain;
    });

    if (category) {
      label = category.label;
    }

    return category;
  }

  function getPricing(jsonEvent) {
    var pricing = EventPricing.UNKNOWN;

    if (jsonEvent.bookingInfo && jsonEvent.bookingInfo.length > 0) {
      var price = parseFloat(jsonEvent.bookingInfo[0].price);
      if (price > 0) {
        pricing = EventPricing.PAYED;
      } else {
        pricing = EventPricing.FREE;
      }
    }

    return pricing;
  }

  function updateTranslationState(event) {

    var languages = {'en': false, 'fr': false, 'de': false},
        properties = ['name', 'description'];

    _.forEach(languages, function (language, languageKey) {
      var translationCount = 0,
          state;

      _.forEach(properties, function (property) {
        if (event[property] && event[property][languageKey]) {
          ++translationCount;
        }
      });

      if (translationCount) {
        if (translationCount === properties.length) {
          state = EventTranslationState.ALL;
        } else {
          state = EventTranslationState.SOME;
        }
      } else {
        state = EventTranslationState.NONE;
      }

      languages[languageKey] = state;
    });

    event.translationState = languages;
  }

  /**
   * Get the images that exist for this event.
   */
  function getImages(jsonEvent) {
    var images = [];
    if (jsonEvent.mediaObject) {
      for (var i = 0; i < jsonEvent.mediaObject.length; i++) {
        if (jsonEvent.mediaObject[i]['@type'] === 'schema:ImageObject') {
          images.push(jsonEvent.mediaObject[i]);
        }
      }
    }
    return images;

  }

  /**
   * @class UdbEvent
   * @constructor
   * @param {object}  jsonEvent
   */
  var UdbEvent = function (jsonEvent) {
    this.id = '';
    this.name = {};
    this.place = {};
    this.type = {};
    this.theme = {};
    /** @type {OpeningHoursData[]} **/
    this.openingHours = [];

    if (jsonEvent) {
      this.parseJson(jsonEvent);
    }
  };

  UdbEvent.prototype = {
    parseJson: function (jsonEvent) {
      this.id = jsonEvent['@id'].split('/').pop();
      this['@id'] = jsonEvent['@id'];
      this['@type'] = jsonEvent['@type'];
      this.apiUrl = new URL(jsonEvent['@id']);
      this.name = jsonEvent.name || {};
      this.description = angular.copy(jsonEvent.description) || {};
      this.calendarSummary = jsonEvent.calendarSummary;
      this.location = new UdbPlace(jsonEvent.location);
      // @todo Use getImages() later on.
      this.image = jsonEvent.image;
      this.images = _.reject(getImages(jsonEvent), 'contentUrl', jsonEvent.image);
      this.labels = _.union(jsonEvent.labels, jsonEvent.hiddenLabels);
      if (jsonEvent.organizer) {
        // if it's a full organizer object, parse it as one
        if (jsonEvent.organizer['@id']) {
          this.organizer = new UdbOrganizer(jsonEvent.organizer);
        } else {
          // just create an object
          this.organizer = {
            name: jsonEvent.organizer.name,
            email: jsonEvent.organizer.email ? (jsonEvent.organizer.email[0] || '-') : '-',
            phone: jsonEvent.organizer.phone ? (jsonEvent.organizer.phone[0] || '-') : '-'
          };
        }
      }
      if (jsonEvent.bookingInfo && jsonEvent.bookingInfo.length > 0) {
        this.price = parseFloat(jsonEvent.bookingInfo[0].price);
      }
      this.pricing = getPricing(jsonEvent);
      this.priceInfo = jsonEvent.priceInfo || [];
      this.publisher = jsonEvent.publisher || '';
      this.created = new Date(jsonEvent.created);
      this.modified = new Date(jsonEvent.modified);
      this.creator = jsonEvent.creator || '';
      this.type = getCategoryLabel(jsonEvent, 'eventtype') || '';
      this.theme = getCategoryLabel(jsonEvent, 'theme') || '';
      this.calendarType = jsonEvent.calendarType || '';
      this.startDate = jsonEvent.startDate;
      this.endDate = jsonEvent.endDate;
      this.subEvent = jsonEvent.subEvent || [];
      this.openingHours = jsonEvent.openingHours || [];
      this.mediaObject = jsonEvent.mediaObject || [];
      this.typicalAgeRange = jsonEvent.typicalAgeRange || '';
      this.bookingInfo = jsonEvent.bookingInfo || {};
      if (this.bookingInfo.urlLabel) {
        this.bookingInfo.urlLabel = _.get(
          jsonEvent.bookingInfo.urlLabel,
          jsonEvent.mainLanguage,
          jsonEvent.bookingInfo.urlLabel
        );
      }
      this.contactPoint = jsonEvent.contactPoint || {
        'url': [],
        'phone': [],
        'email': []
      };
      this.url = 'event/' + this.id;
      this.sameAs = jsonEvent.sameAs;
      this.additionalData = jsonEvent.additionalData || {};
      if (jsonEvent.typicalAgeRange) {
        this.typicalAgeRange = jsonEvent.typicalAgeRange;
      }
      if (jsonEvent.available) {
        this.available = jsonEvent.available;
      }
      if (jsonEvent.workflowStatus) {
        this.workflowStatus = jsonEvent.workflowStatus;
      }
      this.availableFrom = jsonEvent.availableFrom;
      this.uitpasData = {};

      this.audience = {
        audienceType: _.get(jsonEvent, 'audience.audienceType', 'everyone')
      };

      this.educationFields = [];
      this.educationLevels = [];
      this.educationTargetAudience = [];

      if (jsonEvent.terms) {
        this.educationFields = _.filter(jsonEvent.terms, 'domain', 'educationfield');
        this.educationLevels = _.filter(jsonEvent.terms, 'domain', 'educationlevel');
        this.educationTargetAudience = _.filter(jsonEvent.terms, function(term) {
          var leerlingenId = '2.1.14.0.0';
          var leerkrachtenId = '2.1.13.0.0';
          return (term.domain === 'targetaudience' && (term.id === leerlingenId || term.id === leerkrachtenId));
        });
      }

      this.facilities = _.filter(_.get(jsonEvent, 'terms', []), {domain: 'facility'});
      this.mainLanguage = jsonEvent.mainLanguage || 'nl';
      this.languages = jsonEvent.languages || [];
    },

    /**
     * Set the name of the event for a given langcode.
     */
    setName: function(name, langcode) {
      this.name[langcode] = name;
    },

    /**
     * Get the name of the event for a given langcode.
     */
    getName: function(langcode) {
      return this.name[langcode];
    },

    /**
     * Set the event type for this event.
     */
    setEventType: function(id, label) {
      this.type = {
        'id' : id,
        'label' : label,
        'domain' : 'eventtype',
      };
    },

    /**
     * Get the event type for this event.
     */
    getEventType: function() {
      return this.type;
    },

    /**
     * Get the label for the event type.
     */
    getEventTypeLabel: function() {
      return this.type.label ? this.type.label : '';
    },

    /**
     * Set the event type for this event.
     */
    setTheme: function(id, label) {
      this.theme = {
        'id' : id,
        'label' : label,
        'domain' : 'thema',
      };
    },

    /**
     * Get the event type for this event.
     */
    getTheme: function() {
      return this.theme;
    },

    /**
     * Get the label for the theme.
     */
    getThemeLabel: function() {
      return this.theme.label ? this.theme.label : '';
    },

    /**
     * Reset the opening hours.
     */
    resetOpeningHours: function() {
      this.openingHours = [];
    },

    /**
     * Get the opening hours for this event.
     *
     * @returns {OpeningHoursData[]}
     */
    getOpeningHours: function() {
      return this.openingHours;
    },

    /**
     * Set the location of this event.
     */
    setLocation: function(location) {
      this.location = location;
    },

    /**
     * Get the calendar for this event.
     */
    getLocation: function() {
      return this.location;
    },

    /**
     * Label the event with a label or a list of labels
     * @param {string|string[]} label
     */
    label: function (label) {
      var newLabels = [];
      var existingLabels = this.labels;

      if (_.isArray(label)) {
        newLabels = label;
      }

      if (_.isString(label)) {
        newLabels = [label];
      }

      newLabels = _.filter(newLabels, function (newLabel) {
        var similarLabel = _.find(existingLabels, function (existingLabel) {
          return existingLabel.toUpperCase() === newLabel.toUpperCase();
        });

        return !similarLabel;
      });

      this.labels = _.union(this.labels, newLabels);
    },

    /**
     * Unlabel a label from an event
     * @param {string} labelName
     */
    unlabel: function (labelName) {
      _.remove(this.labels, function (label) {
        return label === labelName;
      });
    },
    updateTranslationState: function (event) {
      event = event || this;
      updateTranslationState(event);
    },
    isExpired: function () {
      return this.calendarType !== 'permanent' && (new Date(this.endDate) < new Date());
    },
    hasFutureAvailableFrom: function() {
      var tomorrow = moment(new Date()).add(1, 'days');
      tomorrow.hours(0);
      tomorrow.minutes(0);
      tomorrow.seconds(0);
      if (this.availableFrom || this.availableFrom !== '') {
        var publicationDate = new Date(this.availableFrom);
        if (tomorrow < publicationDate) {
          return true;
        }
        else {
          return false;
        }
      } else {
        return false;
      }
    }
  };

  return (UdbEvent);
}
UdbEventFactory.$inject = ["EventTranslationState", "UdbPlace", "UdbOrganizer"];
})();

// Source: src/core/udb-organizer.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.core.directive:udbOrganizer
 * @description
 * # udbOrganizer
 */
angular
  .module('udb.core')
  .directive('udbOrganizer', udbOrganizer);

/* @ngInject */
function udbOrganizer(udbApi) {
  var event = {
    restrict: 'A',
    link: function postLink(scope, iElement, iAttrs) {

      // The organizer object that's returned from the server
      var organizer;

      if (!scope.organizer.title) {
        scope.fetching = true;
        var promise = udbApi.getOrganizerByLDId(scope.organizer.id);

        promise.then(function (organizerObject) {
          scope.organizer = organizerObject;
          scope.fetching = false;
        });
      } else {
        scope.fetching = false;
      }

    }
  };

  return event;
}
udbOrganizer.$inject = ["udbApi"];
})();

// Source: src/core/udb-organizer.factory.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.core.UdbOrganizer
 * @description
 * # UdbOrganizer
 * UdbOrganizer factory
 */
angular
  .module('udb.core')
  .factory('UdbOrganizer', UdbOrganizerFactory);

/* @ngInject */
function UdbOrganizerFactory(UitpasLabels, EventTranslationState) {

  function isUitpas(organizer) {
    return hasUitpasLabel(organizer.labels) ||
      hasUitpasLabel(organizer.hiddenLabels);
  }

  function hasUitpasLabel(labels) {
    return arrayToLowerCase(labels) &&
        !_.isEmpty(_.intersection(arrayToLowerCase(labels), _.values(arrayToLowerCase(UitpasLabels))));
  }

  function arrayToLowerCase(array) {
    var lowerCaseArray = [];
    _.each(array, function(element, key) {
      lowerCaseArray[key] = element.toLowerCase();
    });

    return lowerCaseArray;
  }

  function getFirst(jsonOrganizer, path) {
    return _
      .chain(jsonOrganizer)
      .get(path, [])
      .first()
      .value();
  }

  function updateTranslationState(organizer) {

    var languages = {'en': false, 'fr': false, 'de': false},
        properties = ['name'];

    _.forEach(languages, function (language, languageKey) {
      var translationCount = 0,
          state;

      _.forEach(properties, function (property) {
        if (organizer[property] && organizer[property][languageKey]) {
          ++translationCount;
        }
      });

      if (translationCount) {
        if (translationCount === properties.length) {
          state = EventTranslationState.ALL;
        } else {
          state = EventTranslationState.SOME;
        }
      } else {
        state = EventTranslationState.NONE;
      }

      languages[languageKey] = state;
    });

    organizer.translationState = languages;
  }

  /**
   * @class UdbOrganizer
   * @constructor
   */
  var UdbOrganizer = function (jsonOrganizer) {
    this.id = '';
    this.name = '';

    if (jsonOrganizer) {
      this.parseJson(jsonOrganizer);
    }
  };

  UdbOrganizer.prototype = {
    parseJson: function (jsonOrganizer) {
      this['@id'] = jsonOrganizer['@id'];
      this.id = jsonOrganizer['@id'].split('/').pop();
      // 1. Main language is now a required property.
      // Organizers can be created in a given main language.
      // 2. Previous projections had a default main language of nl.
      // 3. Even older projections had a non-translated name.
      // @todo @mainLanguage after a full replay only case 1 needs to be supported.
      this.name = _.get(jsonOrganizer.name, jsonOrganizer.mainLanguage, null) ||
          _.get(jsonOrganizer.name, 'nl', null) ||
        _.get(jsonOrganizer, 'name', '');
      this.address = _.get(jsonOrganizer.address, jsonOrganizer.mainLanguage, null) ||
          _.get(jsonOrganizer.address, 'nl', null) || jsonOrganizer.address || [];
      this.email = getFirst(jsonOrganizer, 'contactPoint.email');
      this.phone = getFirst(jsonOrganizer, 'contactPoint.phone');
      //this.url = jsonOrganizer.url;
      this.website = jsonOrganizer.url;
      this.contactPoint = jsonOrganizer.contactPoint;
      this.labels = _.union(jsonOrganizer.labels, jsonOrganizer.hiddenLabels);
      this.hiddenLabels = jsonOrganizer.hiddenLabels || [];
      this.isUitpas = isUitpas(jsonOrganizer);
      this.created = new Date(jsonOrganizer.created);
      this.deleted = Boolean(jsonOrganizer.workflowStatus === 'DELETED');
      this.detailUrl = '/organizer/' + this.id;
    },
    updateTranslationState: function (organizer) {
      organizer = organizer || this;
      updateTranslationState(organizer);
    }
  };

  return (UdbOrganizer);
}
UdbOrganizerFactory.$inject = ["UitpasLabels", "EventTranslationState"];
})();

// Source: src/core/udb-organizers.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.core.organizers
 * @description
 * Service for organizers.
 */
angular
  .module('udb.core')
  .service('udbOrganizers', UdbOrganizers);

/* @ngInject */
function UdbOrganizers($q, udbApi, udbUitpasApi, UdbOrganizer) {

  /**
   * @param {string} name
   *  The name of the organizer to fuzzy search against.
   *
   * @return {Promise.<UdbOrganizer[]>}
   */
  this.suggestOrganizers = function(name) {
    var deferredOrganizer = $q.defer();

    function returnOrganizerSuggestions(pagedOrganizers) {
      var organizers = _.map(pagedOrganizers.member, function (jsonOrganizer) {
        return new UdbOrganizer(jsonOrganizer);
      });

      deferredOrganizer.resolve(organizers);
    }

    udbApi
      .findOrganisations(0, 10, null, name)
      .then(returnOrganizerSuggestions);

    return deferredOrganizer.promise;
  };

  this.findOrganizersWebsite = function(website) {
    return udbApi
        .findOrganisations(0, 10, website, null);
  };

  this.findOrganizersCardsystem = function(organizerId) {
    return udbUitpasApi
        .findOrganisationsCardSystems(organizerId);
  };

}
UdbOrganizers.$inject = ["$q", "udbApi", "udbUitpasApi", "UdbOrganizer"];
})();

// Source: src/core/udb-place.factory.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.core.UdbTimestamps
 * @description
 * # UdbTimestamps
 * Contains timestamps info for the calendar
 */
angular
  .module('udb.core')
  .factory('UdbPlace', UdbPlaceFactory);

/* @ngInject */
function UdbPlaceFactory(EventTranslationState, placeCategories, UdbOrganizer) {

  function getCategoryByType(jsonPlace, domain) {
    var category = _.find(jsonPlace.terms, function (category) {
      return category.domain === domain;
    });

    if (category) {
      return category;
    }

    return;
  }

  /**
   * Return all categories for a given type.
   */
  function getCategoriesByType(jsonPlace, domain) {
    var categories = [];

    if (jsonPlace.terms) {
      for (var i = 0; i < jsonPlace.terms.length; i++) {
        if (jsonPlace.terms[i].domain === domain) {
          categories.push(jsonPlace.terms[i]);
        }
      }
    }

    return categories;
  }

  function updateTranslationState(place) {
    var languages = {'en': false, 'fr': false, 'de': false},
        properties = ['name', 'description'];

    _.forEach(languages, function (language, languageKey) {
      var translationCount = 0,
          state;

      _.forEach(properties, function (property) {
        if (place[property] && place[property][languageKey]) {
          ++translationCount;
        }
      });

      if (translationCount) {
        if (translationCount === properties.length) {
          state = EventTranslationState.ALL;
        } else {
          state = EventTranslationState.SOME;
        }
      } else {
        state = EventTranslationState.NONE;
      }

      languages[languageKey] = state;
    });

    place.translationState = languages;
  }

  /**
   * Get the images that exist for this event.
   */
  function getImages(jsonPlace) {

    var images = [];
    if (jsonPlace.mediaObject) {
      for (var i = 0; i < jsonPlace.mediaObject.length; i++) {
        if (jsonPlace.mediaObject[i]['@type'] === 'schema:ImageObject') {
          images.push(jsonPlace.mediaObject[i]);
        }
      }
    }

    return images;

  }

  /**
   * @class UdbPlace
   * @constructor
   */
  var UdbPlace = function (placeJson) {
    this.id = '';
    this.name = {};
    this.type = '';
    this.theme = {};
    this.calendar = {};
    this.address = {};
    /*this.address = {
      'addressCountry' : 'BE',
      'addressLocality' : '',
      'postalCode' : '',
      'streetAddress' : ''
    };*/

    if (placeJson) {
      this.parseJson(placeJson);
    }
  };

  UdbPlace.prototype = {
    parseJson: function (jsonPlace) {

      this.id = jsonPlace['@id'] ? jsonPlace['@id'].split('/').pop() : '';
      this['@id'] = jsonPlace['@id'];
      this['@type'] = jsonPlace['@type'];
      if (jsonPlace['@id']) {
        this.apiUrl = new URL(jsonPlace['@id']);
      }
      this.name = jsonPlace.name || {};
      //this.address = (jsonPlace.address && jsonPlace.address.nl) || jsonPlace.address || this.address;
      this.address = jsonPlace.address || {};
      this.theme = getCategoryByType(jsonPlace, 'theme') || {};
      this.description = angular.copy(jsonPlace.description) || {};
      this.calendarType = jsonPlace.calendarType || '';
      this.startDate = jsonPlace.startDate;
      this.endDate = jsonPlace.endDate;
      this.openingHours = jsonPlace.openingHours || [];
      this.typicalAgeRange = jsonPlace.typicalAgeRange || '';
      this.priceInfo = jsonPlace.priceInfo || [];
      this.bookingInfo = jsonPlace.bookingInfo || {};
      if (this.bookingInfo.urlLabel) {
        this.bookingInfo.urlLabel = _.get(
          jsonPlace.bookingInfo.urlLabel,
          jsonPlace.mainLanguage,
          jsonPlace.bookingInfo.urlLabel
        );
      }
      this.contactPoint = jsonPlace.contactPoint || {
        'url': [],
        'phone': [],
        'email': []
      };
      if (jsonPlace.organizer) {
        // if it's a full organizer object, parse it as one
        if (jsonPlace.organizer['@id']) {
          this.organizer = new UdbOrganizer(jsonPlace.organizer);
        } else {
          // just create an object
          this.organizer = {
            name: jsonPlace.organizer.name,
            email: jsonPlace.organizer.email ? (jsonPlace.organizer.email[0] || '-') : '-',
            phone: jsonPlace.organizer.phone ? (jsonPlace.organizer.phone[0] || '-') : '-'
          };
        }
      }
      this.image = jsonPlace.image;
      this.images = _.reject(getImages(jsonPlace), 'contentUrl', jsonPlace.image);
      this.labels = _.union(jsonPlace.labels, jsonPlace.hiddenLabels);
      this.mediaObject = jsonPlace.mediaObject || [];
      this.facilities = getCategoriesByType(jsonPlace, 'facility') || [];
      this.additionalData = jsonPlace.additionalData || {};
      if (jsonPlace['@id']) {
        this.url = 'place/' + this.id;
      }
      this.creator = jsonPlace.creator;
      if (jsonPlace.created) {
        this.created = new Date(jsonPlace.created);
      }
      this.modified = jsonPlace.modified;

      if (jsonPlace.terms) {
        var place = this;

        // Only add terms related to locations.
        angular.forEach(jsonPlace.terms, function (term) {
          angular.forEach(placeCategories, function(category) {
            if (term.id === category.id) {
              place.type = term;
              return;
            }
          });
        });
      }

      if (jsonPlace.workflowStatus) {
        this.workflowStatus = jsonPlace.workflowStatus;
      }

      if (jsonPlace.availableFrom) {
        this.availableFrom = jsonPlace.availableFrom;
      }

      this.facilities = _.filter(_.get(jsonPlace, 'terms', []), {domain: 'facility'});
      this.mainLanguage = jsonPlace.mainLanguage || 'nl';
      this.languages = jsonPlace.languages || [];
    },

    /**
     * Set the name of the event for a given langcode.
     */
    setName: function(name, langcode) {
      this.name[langcode] = name;
    },

    /**
     * Get the name of the event for a given langcode.
     */
    getName: function(langcode) {
      return this.name[langcode];
    },

    /**
     * Set the event type for this event.
     */
    setEventType: function(id, label) {
      this.type = {
        'id' : id,
        'label' : label,
        'domain' : 'eventtype',
      };
    },

    /**
     * Get the event type for this event.
     */
    getEventType: function() {
      return this.type;
    },

    /**
     * Get the label for the event type.
     */
    getEventTypeLabel: function() {
      return this.type.label ? this.type.label : '';
    },

    /**
     * Set the event type for this event.
     */
    setTheme: function(id, label) {
      this.theme = {
        'id' : id,
        'label' : label,
        'domain' : 'thema',
      };
    },

    /**
     * Get the event type for this event.
     */
    getTheme: function() {
      return this.theme;
    },

    /**
     * Get the label for the theme.
     */
    getThemeLabel: function() {
      return this.theme.label ? this.theme.label : '';
    },

    /**
     * Reset the opening hours.
     */
    resetOpeningHours: function() {
      this.openinghours = [];
    },

    /**
     * Get the opening hours for this event.
     *
     * @returns {OpeningHoursData[]}
     */
    getOpeningHours: function() {
      return this.openinghours;
    },

    setCountry: function(country) {
      this.address.country = country;
    },

    setLocality: function(locality) {
      this.address.addressLocality = locality;
    },

    setPostal: function(postalCode) {
      this.address.postalCode = postalCode;
    },

    setStreet: function(street) {
      this.address.streetAddress = street;
    },

    getCountry: function() {
      return this.address.country;
    },

    getLocality: function() {
      return this.address.addressLocality;
    },

    getPostal: function() {
      return this.address.postalCode;
    },

    getStreet: function(street) {
      return this.address.streetAddress;
    },

    /**
     * Label the event with a label or a list of labels
     * @param {string|string[]} label
     */
    label: function (label) {
      var newLabels = [];
      var existingLabels = this.labels;

      if (_.isArray(label)) {
        newLabels = label;
      }

      if (_.isString(label)) {
        newLabels = [label];
      }

      newLabels = _.filter(newLabels, function (newLabel) {
        var similarLabel = _.find(existingLabels, function (existingLabel) {
          return existingLabel.toUpperCase() === newLabel.toUpperCase();
        });

        return !similarLabel;
      });

      this.labels = _.union(this.labels, newLabels);
    },

    /**
     * Unlabel a label from an event
     * @param {string} labelName
     */
    unlabel: function (labelName) {
      _.remove(this.labels, function (label) {
        return label === labelName;
      });
    },

    updateTranslationState: function (event) {
      event = event || this;
      updateTranslationState(event);
    },

    hasFutureAvailableFrom: function() {
      var tomorrow = moment(new Date()).add(1, 'days');
      tomorrow.hours(0);
      tomorrow.minutes(0);
      tomorrow.seconds(0);
      if (this.availableFrom || this.availableFrom !== '') {
        var publicationDate = new Date(this.availableFrom);
        if (tomorrow < publicationDate) {
          return true;
        }
        else {
          return false;
        }
      } else {
        return false;
      }
    }

  };

  return (UdbPlace);
}
UdbPlaceFactory.$inject = ["EventTranslationState", "placeCategories", "UdbOrganizer"];
})();

// Source: src/core/udb3-content.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.core.Udb3Content
 * @description
 * Service to get udb3 content.
 */
angular
  .module('udb.core')
  .service('udb3Content', Udb3Content);

/* @ngInject */
function Udb3Content($q, $http, appConfig) {

  /**
   * Get the udb3 content for the current user.
   */

  this.getUdb3ContentForCurrentUser = function() {

    return $http.get(appConfig.baseApiUrl + 'udb3_content_current_user');

  };

}
Udb3Content.$inject = ["$q", "$http", "appConfig"];
})();

// Source: src/core/uitid-auth.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.core.uitidAuth
 * @description
 * # uitidAuth
 * Service in the udb.core.
 */
angular
  .module('udb.core')
  .service('uitidAuth', UitidAuth);

/* @ngInject */
function UitidAuth($window, $location, appConfig, $cookies, jwtHelper) {

  function removeCookies () {
    $cookies.remove('token');
    $cookies.remove('user');
  }

  function buildBaseUrl() {
    var baseUrl = $location.protocol() + '://' + $location.host();
    var port = $location.port();

    return (port === 80) ? baseUrl : baseUrl + ':' + port;
  }

  /**
   * Log the active user out.
   */
  this.logout = function () {
    var destination = buildBaseUrl(),
      logoutUrl = appConfig.authUrl + 'logout';

    removeCookies();

    // redirect to login page
    logoutUrl += '?destination=' + encodeURIComponent(destination);
    $window.location.href = logoutUrl;
  };

  /**
   * Login by redirecting to UiTiD
   */
  this.login = function (language) {
    var currentLocation = $location.absUrl(),
        loginUrl = appConfig.authUrl + 'connect';

    removeCookies();

    // redirect to login page
    loginUrl += '?destination=' + encodeURIComponent(currentLocation) + '&lang=' + language;
    $window.location.href = loginUrl;
  };

  this.register = function (language) {
    var currentLocation = $location.absUrl(),
        registrationUrl = appConfig.authUrl + 'register';

    removeCookies();

    // redirect to login page
    registrationUrl += '?destination=' + encodeURIComponent(currentLocation) + '&lang=' + language;
    $window.location.href = registrationUrl;
  };

  this.setToken = function (token) {
    $cookies.put('token', token);
  };

  /**
   * @return {string|undefined}
   *  The JWToken of the currently logged in user or undefined.
   */
  this.getToken = function () {
    var service = this;
    var currentToken = $cookies.get('token');

    // check if a new JWT is set in the search parameters and parse it
    var queryParameters = $location.search();
    var newToken = queryParameters.jwt;

    if (newToken && newToken !== currentToken) {
      currentToken = newToken;
      service.setToken(newToken);
      $location.search('jwt', null);
    }

    return currentToken;
  };

  this.getTokenData = function () {
    return jwtHelper.decodeToken(this.getToken());
  };

  // TODO: Have this method return a promise, an event can be broadcast to keep other components updated.
  /**
   * Returns the currently logged in user
   */
  this.getUser = function () {
    return $cookies.getObject('user');
  };
}
UitidAuth.$inject = ["$window", "$location", "appConfig", "$cookies", "jwtHelper"];
})();

// Source: src/cultuurkuur/event-cultuurkuur.component.js
(function () {
'use strict';

angular
  .module('udb.cultuurkuur')
  .component('udbEventCultuurkuurComponent', {
    bindings: {
      event: '<',
      permission: '<'
    },
    templateUrl: 'templates/event-cultuurkuur.html',
    controller: EventCultuurKuurComponentController
  });

/**
 * @ngInject
 */

function EventCultuurKuurComponentController(appConfig, uitidAuth) {
  var cm = this;
  cm.cultuurkuurMaintenance = _.get(appConfig, 'cultuurkuur.maintenance');

  if (!cm.cultuurkuurMaintenance) {
    var cultuurkuurUrl = _.get(appConfig, 'cultuurkuur.cultuurkuurUrl');
    cm.user = uitidAuth.getUser();
    cm.previewLink = cultuurkuurUrl + 'agenda/e//' + cm.event.id + getUTMParameters('preview1.0');
    cm.editLink = cultuurkuurUrl + 'event/' + cm.event.id + '/edit' + getUTMParameters('edit1.0');
    cm.continueLink = cultuurkuurUrl + 'event/' + cm.event.id + '/edit' + getUTMParameters('continue1.0');
    cm.isIncomplete = (cm.event.educationFields.length === 0 && cm.event.educationLevels.length === 0);

    cm.cultuurKuurInfo = {
      levels : _.pluck(cm.event.educationLevels, 'label'),
      fields : _.pluck(cm.event.educationFields, 'label'),
      targetAudience : _.pluck(cm.event.educationTargetAudience, 'label')
    };

    cm.forSchools = cm.event.audience.audienceType === 'education';
  }
  else {
    cm.cultuurkuurMessage = _.get(appConfig, 'cultuurkuur.cultuurkuurMessage');
  }

  function getUTMParameters(type) {
    return '?utm_source=uitdatabank.be' +
    '&utm_medium=referral' +
    '&utm_campaign=udb3' +
    '&utm_content=' + type +
    '&uid=' + cm.user.id;
  }
}
EventCultuurKuurComponentController.$inject = ["appConfig", "uitidAuth"];
})();

// Source: src/dashboard/components/dashboard-event-item.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.dashboard.directive:udbDashboardEventItem
 * @description
 *  Renders a dashboard item for place
 */
angular
  .module('udb.dashboard')
  .directive('udbDashboardEventItem', udbDashboardEventItem);

/* @ngInject */
function udbDashboardEventItem() {
  var dashboardEventItemDirective = {
    restrict: 'AE',
    controller: 'OfferController',
    controllerAs: 'offerCtrl',
    templateUrl: 'templates/dashboard-item.directive.html'
  };

  return dashboardEventItemDirective;
}
})();

// Source: src/dashboard/components/dashboard-organizer-item.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.dashboard.directive:udbDashboardEventItem
 * @description
 *  Renders a dashboard item for place
 */
angular
  .module('udb.dashboard')
  .directive('udbDashboardOrganizerItem', udbDashboardOrganizerItem);

/* @ngInject */
function udbDashboardOrganizerItem() {
  var dashboardOrganizerItemDirective = {
    restrict: 'AE',
    controller: 'OrganizerController',
    controllerAs: 'organizerCtrl',
    templateUrl: 'templates/dashboard-organizer-item.directive.html'
  };

  return dashboardOrganizerItemDirective;
}
})();

// Source: src/dashboard/components/dashboard-place-item.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.dashboard.directive:udbDashboardPlaceItem
 * @description
 *  Renders a dashboard item for place.
 */
angular
  .module('udb.dashboard')
  .directive('udbDashboardPlaceItem', udbDashboardPlaceItem);

/* @ngInject */
function udbDashboardPlaceItem() {
  var dashboardPlaceItemDirective = {
    restrict: 'AE',
    controller: 'OfferController',
    controllerAs: 'offerCtrl',
    templateUrl: 'templates/dashboard-item.directive.html'
  };

  return dashboardPlaceItemDirective;
}
})();

// Source: src/dashboard/components/event-delete-confirm-modal.controller.js
(function () {

'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventDeleteConfirmModalCtrl
 * @description
 * # EventDeleteConfirmModalCtrl
 * Modal to delete an event.
 */
angular
  .module('udb.dashboard')
  .controller('EventDeleteConfirmModalCtrl', EventDeleteConfirmModalController);

/* @ngInject */
function EventDeleteConfirmModalController($scope, $uibModalInstance, eventCrud, item) {

  $scope.item = item;
  $scope.saving = false;
  $scope.error = false;

  $scope.cancelRemoval = cancelRemoval;
  $scope.deleteEvent = deleteEvent;

  /**
   * Delete the event.
   */
  function deleteEvent() {
    $scope.error = false;
    $scope.saving = true;

    function showError() {
      $scope.saving = false;
      $scope.error = true;
    }

    eventCrud
      .deleteOffer(item)
      .then($uibModalInstance.close)
      .catch(showError);
  }

  /**
   * Cancel, modal dismiss.
   */
  function cancelRemoval() {
    $uibModalInstance.dismiss();
  }

}
EventDeleteConfirmModalController.$inject = ["$scope", "$uibModalInstance", "eventCrud", "item"];
})();

// Source: src/dashboard/components/organizer.controller.js
(function () {
'use strict';

/**
 * @ngdoc controller
 * @name udb.dashboard.controller:OrganizerController
 * @description
 * # OrganizerController
 */
angular
    .module('udb.dashboard')
    .controller('OrganizerController', OrganizerController);

/* @ngInject */
function OrganizerController(
    udbApi,
    $scope,
    jsonLDLangFilter,
    EventTranslationState,
    offerTranslator,
    offerLabeller,
    $window,
    offerEditor,
    variationRepository,
    $q,
    appConfig,
    $uibModal,
    $translate
) {
  var controller = this;
  var cachedOrganizer;
  var defaultLanguage = $translate.use() || 'nl';

  controller.translation = false;
  controller.activeLanguage = defaultLanguage;
  controller.languageSelector = [
    {'lang': 'fr'},
    {'lang': 'en'},
    {'lang': 'de'}
  ];
  controller.labelRemoved = labelRemoved;

  controller.init = function () {
    if (!$scope.event.title) {
      controller.fetching = true;

      return udbApi
          .getOffer($scope.event['@id'])
          .then(function (offerObject) {

            cachedOrganizer = offerObject;
            cachedOrganizer.updateTranslationState();

            $scope.event = jsonLDLangFilter(cachedOrganizer, defaultLanguage, true);
            $scope.offerType = 'organizer';

            controller.fetching = false;
            watchLabels();
            return cachedOrganizer;
          });
    } else {
      controller.fetching = false;
    }
  };

  // initialize controller and take optional event actions
  $q.when(controller.init())
  // translate location before fetching the maybe non-existant variation
  // a variation does not change the location
      .finally(function () {
        controller.editable = true;
      });

  function watchLabels() {
    $scope.$watch(function () {
      return cachedOrganizer.labels;
    }, function (labels) {
      $scope.event.labels = angular.copy(labels);
    });
  }

  controller.hasActiveTranslation = function () {
    var organizer = cachedOrganizer;
    return organizer && organizer.translationState[controller.activeLanguage] !== EventTranslationState.NONE;
  };

  controller.getLanguageTranslationIcon = function (lang) {
    var icon = EventTranslationState.NONE.icon;

    if (cachedOrganizer && lang) {
      icon = cachedOrganizer.translationState[lang].icon;
    }

    return icon;
  };

  controller.translate = function () {
    controller.applyPropertyChanges('name');
  };

  /**
   * Sets the provided language as active or toggles it off when already active
   *
   * @param {String} lang
   */
  controller.toggleLanguage = function (lang) {
    if (lang === controller.activeLanguage) {
      controller.stopTranslating();
    } else {
      controller.activeLanguage = lang;
      controller.translation = jsonLDLangFilter(cachedOrganizer, controller.activeLanguage);
    }
  };

  controller.hasPropertyChanged = function (propertyName) {
    var lang = controller.activeLanguage,
        translation = controller.translation;

    return controller.translation && cachedOrganizer[propertyName][lang] !== translation[propertyName];
  };

  controller.undoPropertyChanges = function (propertyName) {
    var lang = controller.activeLanguage,
        translation = controller.translation;

    if (translation) {
      translation[propertyName] = cachedOrganizer[propertyName][lang];
    }
  };

  controller.applyPropertyChanges = function (propertyName) {
    var translation = controller.translation[propertyName];
    translateEventProperty(propertyName, translation, propertyName);
  };

  controller.stopTranslating = function () {
    controller.translation = undefined;
    controller.activeLanguage = defaultLanguage;
  };

  function translateEventProperty(property, translation, apiProperty) {
    var language = controller.activeLanguage,
        udbProperty = apiProperty || property;

    if (translation && translation !== cachedOrganizer[property][language]) {
      offerTranslator
          .translateProperty(cachedOrganizer, udbProperty, language, translation)
          .then(cachedOrganizer.updateTranslationState(cachedOrganizer));
    }
  }

  // Labelling
  /**
   * @param {Label} newLabel
   */
  controller.labelAdded = function (newLabel) {
    var similarLabel = _.find(cachedOrganizer.labels, function (label) {
      return newLabel.name.toUpperCase() === label.toUpperCase();
    });
    if (similarLabel) {
      $scope.$apply(function () {
        $scope.event.labels = angular.copy(cachedOrganizer.labels);
      });
      $window.alert('Het label "' + newLabel.name + '" is reeds toegevoegd als "' + similarLabel + '".');
    } else {
      offerLabeller.label(cachedOrganizer, newLabel.name)
          .then(function(response) {
            if (response.success) {
              controller.labelResponse = 'success';
              controller.addedLabel = response.name;
            }
            else {
              controller.labelResponse = 'error';
              controller.labelsError = response;
            }
            $scope.event.labels = angular.copy(cachedOrganizer.labels);
          });
    }
  };

  function clearLabelsError() {
    controller.labelResponse = '';
    controller.labelsError = '';
  }

  /**
   * @param {ApiProblem} problem
   */
  function showUnlabelProblem(problem) {
    $scope.event.labels = angular.copy(cachedOrganizer.labels);
    controller.labelResponse = 'unlabelError';
    controller.labelsError = problem.title;
  }

  /**
   * @param {Label} label
   */
  function labelRemoved(label) {
    clearLabelsError();

    offerLabeller
        .unlabel(cachedOrganizer, label.name)
        .catch(showUnlabelProblem);
  }
}
OrganizerController.$inject = ["udbApi", "$scope", "jsonLDLangFilter", "EventTranslationState", "offerTranslator", "offerLabeller", "$window", "offerEditor", "variationRepository", "$q", "appConfig", "$uibModal", "$translate"];
})();

// Source: src/dashboard/components/place-delete-confirm-modal.controller.js
(function () {

'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:PlaceDeleteConfirmModalCtrl
 * @description
 * # PlaceDeleteConfirmModalCtrl
 * Modal to delete an event.
 */
angular
  .module('udb.dashboard')
  .controller('PlaceDeleteConfirmModalCtrl', PlaceDeleteConfirmModalController);

/* @ngInject */
function PlaceDeleteConfirmModalController(
  $scope,
  $uibModalInstance,
  eventCrud,
  place,
  events,
  appConfig
) {
  $scope.place = place;
  $scope.saving = false;
  $scope.events = events ? events : [];
  $scope.hasEvents = $scope.events.length > 0;
  $scope.baseUrl = appConfig.udb3BaseUrl;
  $scope.cancelRemoval = cancelRemoval;
  $scope.deletePlace = deletePlace;

  function deletePlace() {
    $scope.saving = true;
    $scope.error = false;

    function showError() {
      $scope.saving = false;
      $scope.error = true;
    }

    eventCrud
      .deleteOffer(place)
      .then($uibModalInstance.close)
      .catch(showError);
  }

  /**
   * Cancel, modal dismiss.
   */
  function cancelRemoval() {
    $uibModalInstance.dismiss();
  }

}
PlaceDeleteConfirmModalController.$inject = ["$scope", "$uibModalInstance", "eventCrud", "place", "events", "appConfig"];
})();

// Source: src/dashboard/dashboard.controller.js
(function () {
(function () {
  'use strict';

  /**
   * @ngdoc function
   * @name udbApp.controller:DashboardCtrl
   * @description
   * # DashboardCtrl
   * dashboard
   */
  angular
    .module('udb.dashboard')
    .controller('DashboardController', DashboardController);

  /* @ngInject */
  function DashboardController(
      $document,
      $uibModal,
      udbApi,
      eventCrud,
      offerLocator,
      SearchResultViewer,
      appConfig,
      moment,
      $state
  ) {

    var dash = this;

    dash.pagedItemViewer = new SearchResultViewer(50, 1);
    dash.pagedItemViewerOrganizers = new SearchResultViewer(50, 1);
    dash.openDeleteConfirmModal = openDeleteConfirmModal;
    dash.updateItemViewer = updateItemViewer;
    dash.openCreateOrganizerModal = openCreateOrganizerModal;
    dash.updateOrganizerViewer = updateOrganizerViewer;
    dash.username = '';
    dash.hideOnlineDate = false;

    if (typeof(appConfig.addOffer) !== 'undefined') {
      if (typeof(appConfig.addOffer.toggle) !== 'undefined') {
        dash.toggleAddOffer = appConfig.addOffer.toggle;

        if (appConfig.addOffer.toggle) {
          if (typeof(appConfig.addOffer.expirationDate) !== 'undefined' ||
              appConfig.addOffer.expirationDate !== '') {
            if (moment().isAfter(moment(appConfig.addOffer.expirationDate))) {
              dash.toggleAddOffer = false;
            }
            else {
              dash.toggleAddOffer = true;
            }
          }
        }
      }
      else {
        dash.toggleAddOffer = true;
      }

      if (typeof(appConfig.addOffer.expirationMessage) !== 'undefined' ||
          appConfig.addOffer.expirationMessage !== '') {
        dash.addOfferExpirationMessage = appConfig.addOffer.expirationMessage;
      }
      else {
        dash.addOfferExpirationMessage = '';
      }
    }
    else {
      dash.toggleAddOffer = true;
    }

    if (typeof(appConfig.offerEditor.defaultPublicationDate) !== 'undefined') {
      var defaultPublicationDate = appConfig.offerEditor.defaultPublicationDate;
      if (defaultPublicationDate !== '') {
        dash.hideOnlineDate = true;
      }
    }

    if (typeof(appConfig.publicationRulesLink) !== 'undefined') {
      var publicationRulesLink = appConfig.publicationRulesLink;
      if (publicationRulesLink !== '') {
        dash.publicationRulesLink = publicationRulesLink;
      }
    }

    if (typeof(appConfig.enableMyOrganizers) !== 'undefined') {
      var enableMyOrganizers = appConfig.enableMyOrganizers;
      if (enableMyOrganizers !== '') {
        dash.enableMyOrganizers = enableMyOrganizers;
      }
    }

    udbApi
      .getMe()
      .then(greetUser);

    function greetUser(user) {
      dash.username = user.nick;
    }

    /**
     * @param {PagedCollection} results
     */
    function setItemViewerResults(results) {
      offerLocator.addPagedCollection(results);
      dash.pagedItemViewer.setResults(results);
      $document.scrollTop(0);
    }

    function updateItemViewer() {
      udbApi
        .getDashboardItems(dash.pagedItemViewer.currentPage)
        .then(setItemViewerResults);
    }
    updateItemViewer();

    /**
     * @param {PagedCollection} results
     */
    function setOrganizerViewerResults(results) {
      offerLocator.addPagedCollection(results);
      dash.pagedItemViewerOrganizers.setResults(results);
      $document.scrollTop(0);
    }

    function updateOrganizerViewer() {
      udbApi
          .getDashboardOrganizers(dash.pagedItemViewer.currentPage)
          .then(setOrganizerViewerResults);
    }
    updateOrganizerViewer();

    function openEventDeleteConfirmModal(item) {
      var modalInstance = $uibModal.open({
        templateUrl: 'templates/event-delete-confirm-modal.html',
        controller: 'EventDeleteConfirmModalCtrl',
        resolve: {
          item: function () {
            return item;
          }
        }
      });
      modalInstance.result.then(function () {
        item.showDeleted = true;
      });
    }

    function openPlaceDeleteConfirmModal(place) {

      function displayModal(place, events) {
        var modalInstance = $uibModal.open({
          templateUrl: 'templates/place-delete-confirm-modal.html',
          controller: 'PlaceDeleteConfirmModalCtrl',
          resolve: {
            place: function () {
              return place;
            },
            events: function () {
              return events;
            }
          }
        });

        modalInstance.result.then(function () {
          place.showDeleted = true;
        });
      }

      function showModalWithEvents(events) {
        displayModal(place, events);
      }

      // Check if this place has planned events.
      eventCrud
        .findEventsAtPlace(place.apiUrl)
        .then(showModalWithEvents);
    }

    /**
     * Open the confirmation modal to delete an event/place.
     *
     * @param {Object} item
     */
    function openDeleteConfirmModal(item) {
      var itemType = item['@id'].indexOf('place') === -1 ? 'event' : 'place';

      // Fix for III-2625. Escaping single quotes won't work here.
      item.name = item.name.replace(/'/g, '');

      if (itemType === 'event') {
        openEventDeleteConfirmModal(item);
      }
      else {
        openPlaceDeleteConfirmModal(item);
      }
    }

    function openCreateOrganizerModal() {
      var modalInstance = $uibModal.open({
        templateUrl: 'templates/event-form-organizer-modal.html',
        controller: 'EventFormOrganizerModalController',
        resolve: {
          organizerName: function () {
            return '';
          }
        }
      });

      modalInstance.result.then(function(organization) {
        $state.go('management.organizers.detail', {id: organization.id});
      });
    }
  }
  DashboardController.$inject = ["$document", "$uibModal", "udbApi", "eventCrud", "offerLocator", "SearchResultViewer", "appConfig", "moment", "$state"];

})();
})();

// Source: src/dashboard/dashboard.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.dashboard.directive:dashboard.html
 * @description
 * # udb dashboard directive
 */
angular
  .module('udb.dashboard')
  .directive('udbDashboard', udbDashboardDirective);

/* @ngInject */
function udbDashboardDirective() {
  return {
    templateUrl: 'templates/dashboard.html',
    controller: 'DashboardController',
    controllerAs: 'dash',
    restrict: 'EA'
  };
}
})();

// Source: src/duplication/event-duplication-calendar.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:DuplicationCalendarController
 * @description
 * # Duplication Calendar Controller
 */
angular
  .module('udb.duplication')
  .controller('DuplicationCalendarController', DuplicationCalendarController);

/* @ngInject */
function DuplicationCalendarController(EventFormData, OpeningHoursCollection, $rootScope, $controller, $scope) {
  var calendar = this;
  var duplicateFormData = EventFormData.clone();

  function duplicateTimingChanged(formData) {
    $rootScope.$emit('duplicateTimingChanged', formData);
  }

  $controller('BaseCalendarController', {calendar: calendar, $scope: $scope});

  calendar.init(duplicateFormData, _.cloneDeep(OpeningHoursCollection));

  calendar.formData
    .timingChanged$
    .subscribe(duplicateTimingChanged);
}
DuplicationCalendarController.$inject = ["EventFormData", "OpeningHoursCollection", "$rootScope", "$controller", "$scope"];
})();

// Source: src/duplication/event-duplication-calendar.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.duplication.directive:udbEventDuplicationCalendar
 * @description
 *  Shows the calendar when you try to create a duplicate event.
 */
angular
  .module('udb.duplication')
  .directive('udbEventDuplicationCalendar', udbEventDuplicationCalendar);

/* @ngInject */
function udbEventDuplicationCalendar() {
  return {
    restrict: 'AE',
    controller: 'DuplicationCalendarController',
    controllerAs: 'calendar',
    templateUrl: 'templates/form-event-calendar.component.html'
  };
}
})();

// Source: src/duplication/event-duplication-footer.component.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.duplication.component:udbEventDuplicationFooter
 * @description
 * # Event Duplication Footer
 * Footer component for migrating events
 */
angular
  .module('udb.duplication')
  .component('udbEventDuplicationFooter', {
    templateUrl: 'templates/event-duplication-footer.component.html',
    controller: EventDuplicationFooterController,
    controllerAs: 'duplication'
  });

function pickFirstEventArgument(event) {
  return event[1];
}

/* @ngInject */
function EventDuplicationFooterController($rootScope, eventDuplicator, $state, rx) {
  var controller = this;
  var duplicateTimingChanged$ = $rootScope
    .$eventToObservable('duplicateTimingChanged')
    .map(pickFirstEventArgument);
  var createDuplicate$ = rx.createObservableFunction(controller, 'createDuplicate');

  var duplicateFormData$ = duplicateTimingChanged$.startWith(false);

  duplicateFormData$
    .subscribe(function (duplicateFormData) {
      controller.readyForDuplication = !!duplicateFormData;
    });

  createDuplicate$
    .withLatestFrom(duplicateFormData$, function (createDuplicate, duplicateFormData) {
      if (duplicateFormData) {
        showAsyncDuplication();
        eventDuplicator
          .duplicate(duplicateFormData)
          .then(showDuplicate, showAsyncError);
      }
    })
    .subscribe();

  /**
   * @param {string} duplicateId
   */
  function showDuplicate(duplicateId) {
    $state.go('split.eventEdit', {id: duplicateId});
  }

  function showAsyncError() {
    controller.asyncError = true;
    controller.duplicating = false;
  }

  function showAsyncDuplication() {
    controller.asyncError = false;
    controller.duplicating = true;
  }
}
EventDuplicationFooterController.$inject = ["$rootScope", "eventDuplicator", "$state", "rx"];
})();

// Source: src/duplication/event-duplication-step.component.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.duplication.component:udbEventDuplicationStep
 * @description
 * # Event Duplication Step
 * Step component for migrating events
 */
angular
  .module('udb.duplication')
  .component('udbEventDuplicationStep', {
    templateUrl: 'templates/event-duplication-step.component.html',
    controller: EventDuplicationStepController,
    controllerAs: 'duplication'
  });

/* @ngInject */
function EventDuplicationStepController(EventFormData) {
  var controller = this;

  controller.eventId = EventFormData.id;

  controller.readyToDuplicate = function () {
    return false;
  };
}
EventDuplicationStepController.$inject = ["EventFormData"];
})();

// Source: src/duplication/event-duplicator.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.duplication.eventDuplicator
 * @description
 * Event Duplicator Service
 */
angular
  .module('udb.duplication')
  .service('eventDuplicator', EventDuplicatorService);

/* @ngInject */
function EventDuplicatorService(udbApi, offerLocator) {
  var calendarDataProperties = [
    'calendar'
  ];

  /**
   * @param {object} duplicateInfo
   * @return {string}
   */
  function rememberDuplicateLocationAndReturnId(duplicateInfo) {
    offerLocator.add(duplicateInfo.eventId, duplicateInfo.url);

    return duplicateInfo.eventId;
  }

  /**
   * Duplicate an event using form date with the new timing info
   * @param {EventFormData} formData
   * @return {Promise.<string>}
   *  promises the duplicate id
   */
  this.duplicate = function(formData) {
    var calendarData = _.pick(formData, calendarDataProperties);

    return udbApi
      .duplicateEvent(formData.apiUrl, calendarData.calendar)
      .then(rememberDuplicateLocationAndReturnId);
  };
}
EventDuplicatorService.$inject = ["udbApi", "offerLocator"];
})();

// Source: src/entry/components/job-logo-states.constant.js
(function () {
'use strict';

/* jshint sub: true */

/**
 * @ngdoc service
 * @name udb.entry.JobLogoStates
 * @description
 * # JobLogoStates
 * All the possible job logo states defined as a constant
 */
angular
  .module('udb.entry')
  .constant('JobLogoStates',
  /**
   * Enum for job logo states
   * @readonly
   * @enum {string}
   */
  {
    WARNING: 'warning',
    COMPLETE: 'complete',
    BUSY: 'busy',
    IDLE: 'idle'
  });
})();

// Source: src/entry/components/job-logo.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.entry.controller:JobLogoController
 * @description
 * # Job logo controller
 * Controller of the udb.entry
 */
angular
  .module('udb.entry')
  .controller('JobLogoController', JobLogoController);

/* @ngInject */
function JobLogoController(JobLogoStates, jobLogger, $rootScope) {
  var jl = this;

  /**
   * Calculate the current state the logo should be in
   * @return {boolean} current state
   */
  jl.updateCurrentState = function () {
    var stateChecks = [
      {
        state: JobLogoStates.WARNING,
        check: !_.isEmpty(jobLogger.getFailedJobs())
      },
      {
        state: JobLogoStates.COMPLETE,
        check: !_.isEmpty(jobLogger.getFinishedExportJobs())
      },
      {
        state: JobLogoStates.BUSY,
        check: jobLogger.hasActiveJobs()
      },
      {
        state: JobLogoStates.IDLE,
        // if you get this far there are no visible jobs
        check: true
      }
    ];

    var currentState = _.find(stateChecks, function (stateCheck) {
      return stateCheck.check;
    }).state;

    jl.state = currentState;
  };

  jl.getState = function () {
    return jl.state;
  };

  // set the initial state
  jl.updateCurrentState();

  $rootScope.$on('jobListsUpdated', jl.updateCurrentState);
}
JobLogoController.$inject = ["JobLogoStates", "jobLogger", "$rootScope"];
})();

// Source: src/entry/components/job-logo.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.entry.directive:jobLogo
 * @description
 * # udbJobLogo
 */
angular
  .module('udb.entry')
  .directive('udbJobLogo', udbJobLogo);

/* @ngInject */
function udbJobLogo() {
  var directive = {
    templateUrl: 'templates/job-logo.directive.html',
    restrict: 'EA',
    link: link,
    controllerAs: 'jl',
    controller: 'JobLogoController'
  };
  return directive;

  function link(scope, element, attrs) {
  }
}
})();

// Source: src/entry/crud/event-crud.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.entry.eventCrud
 * @description
 * Service for creating / updating events.
 */
angular
  .module('udb.entry')
  .service('eventCrud', EventCrud);

/* @ngInject */
function EventCrud(
  udbApi,
  udbUitpasApi,
  DeleteOfferJob,
  $rootScope,
  $q,
  offerLocator
) {

  var service = this;

  /**
   * @param {EventFormData} formData
   */
  function pickMajorInfoFromFormData(formData) {
    var majorInfo = _.pick(formData, function(property, name) {
      var isStream = name.charAt(name.length - 1) === '$';
      return (_.isDate(property) || !_.isEmpty(property)) && !isStream;
    });

    return majorInfo;
  }

  /**
   * Creates a new offer and add the job to the logger.
   *
   * @param {EventFormData}  eventFormData
   *  The form data required to create an offer.
   *
   * @return {Promise.<EventFormData>}
   */
  service.createOffer = function (eventFormData) {

    var type = eventFormData.isEvent ? 'event' : 'place';

    var updateEventFormData = function(url) {
      eventFormData.apiUrl = url;
      eventFormData.id = url.toString().split('/').pop();

      offerLocator.add(eventFormData.id, eventFormData.apiUrl);
      $rootScope.$emit('eventFormSaved', eventFormData);

      udbApi
        .getOffer(url)
        .then(function(offer) {
          $rootScope.$emit('offerCreated', offer);
        });

      return eventFormData;
    };

    var majorInfo = pickMajorInfoFromFormData(eventFormData);

    return udbApi
      .createOffer(type, majorInfo)
      .then(updateEventFormData);
  };

  /**
   * Find all the events that take place here.
   *
   * @param {URL} url
   *
   * @return {Promise.<OfferIdentifier[]>}
   */
  service.findEventsAtPlace = function(url) {
    return udbApi.findEventsAtPlace(url);
  };

  /**
   * Delete an offer.
   *
   * @param {UdbPlace|UdbEvent} offer
   *
   * @return {Promise}
   */
  service.deleteOffer = function (offer) {
    function flagAsDeleted() {
      offer.showDeleted = true;
    }

    return udbApi
      .deleteOffer(offer)
      .then(flagAsDeleted);
  };

  /**
   * Update the major info of an event / place.
   * @param {EventFormData} eventFormData
   */
  service.updateMajorInfo = function(eventFormData) {
    var majorInfo = pickMajorInfoFromFormData(eventFormData);

    udbApi
      .updateMajorInfo(eventFormData.apiUrl, majorInfo)
      .then(responseHandlerFactory(eventFormData));
  };

  /**
   * Creates a new organizer.
   */
  service.createOrganizer = function(organizer) {
    return udbApi.createOrganizer(organizer);
  };

  /**
   * Update the main language description and add it to the job logger.
   *
   * @param {EventFormData} item
   * @returns {Promise}
   */
  service.updateDescription = function(item) {
    return udbApi
      .translateProperty(item.apiUrl, 'description', item.mainLanguage, item.description[item.mainLanguage])
      .then(responseHandlerFactory(item));
  };

  /**
   * Update the adress of a place and add it to the job logger.
   *
   * @param {EventFormData} item
   * @returns {Promise}
   */
  service.translateAddress = function(item) {
    return updateOfferProperty(item, 'typicalAgeRange', 'updateTypicalAgeRange');
  };

  /**
   * Update the typical age range and add it to the job logger.
   *
   * @param {EventFormData} item
   * @returns {Promise}
   */
  service.updateTypicalAgeRange = function(item) {
    return updateOfferProperty(item, 'typicalAgeRange', 'updateTypicalAgeRange');
  };

  /**
   * Update the typical age range and add it to the job logger.
   *
   * @param {EventFormData} item
   * @returns {Promise}
   */
  service.deleteTypicalAgeRange = function(item) {
    return udbApi
      .deleteTypicalAgeRange(item.apiUrl)
      .then(responseHandlerFactory(item));
  };

  /**
   * Update the connected organizer and it to the job logger.
   *
   * @param {EventFormData} item
   * @returns {Promise}
   */
  service.updateOrganizer = function(item) {
    return udbApi
      .updateProperty(item.apiUrl, 'organizer', item.organizer.id)
      .then(responseHandlerFactory(item));
  };

  /**
   * Delete the organizer for the event / place.
   *
   * @param {EventFormData} item
   * @returns {Promise}
   */
  service.deleteOfferOrganizer = function(item) {
    return udbApi
      .deleteOfferOrganizer(item.apiUrl, item.organizer.id)
      .then(responseHandlerFactory(item));
  };

  /**
   * Update UiTPAS info for the event.
   *
   * @param {EventFormData} item
   * @returns {Promise}
   */
  service.updateEventUitpasData = function(item) {
    return udbUitpasApi
        .updateEventUitpasData(item.usedDistributionKeys, item.id)
        .then(responseHandlerFactory(item));
  };

  /**
   * Get the Uitpas data from an event.
   * @param {string} cdbid
   * @returns {Promise}
   */
  service.getEventUitpasData = function(cdbid) {
    return udbUitpasApi.getEventUitpasData(cdbid);
  };

  /**
   * Update the price info and add it to the job logger.
   *
   * @param {EventFormData} item
   * @returns {Promise}
   */
  service.updatePriceInfo = function(item) {
    return udbApi
      .updatePriceInfo(item.apiUrl, item.priceInfo)
      .then(responseHandlerFactory(item));
  };

  /**
   * Update the contact point and add it to the job logger.
   *
   * @param {EventFormData} item
   * @returns {Promise}
   */
  service.updateContactPoint = function(item) {
    return updateOfferProperty(item, 'contactPoint', 'updateContactInfo');
  };

  /**
   * Update the booking info and add it to the job logger.
   *
   * @param {EventFormData} item
   *
   * @returns {Promise}
   */
  service.updateBookingInfo = function(item) {
    var allowedProperties = [
      'url',
      'urlLabel',
      'email',
      'phone',
      'availabilityStarts',
      'availabilityEnds'
    ];

    var bookingInfo =  _.pick(item.bookingInfo, function(property, propertyName) {
      return _.includes(allowedProperties, propertyName) && (_.isDate(property) || !_.isEmpty(property));
    });

    if (!_.has(bookingInfo, 'url')) {
      bookingInfo = _.omit(bookingInfo, 'urlLabel');
    }

    if (_.intersection(_.keysIn(bookingInfo), ['url', 'phone', 'email']).length === 0) {
      bookingInfo = {};
    }

    return udbApi
      .updateProperty(item.apiUrl, 'bookingInfo', bookingInfo)
      .then(responseHandlerFactory(item));
  };

  /**
   * @param {EventFormData} offer
   * @param {string} propertyName
   * @param {string} jobName
   *
   * @return {Promise}
   */
  function updateOfferProperty(offer, propertyName, jobName) {
    return udbApi
      .updateProperty(offer.apiUrl, propertyName, offer[propertyName])
      .then(responseHandlerFactory(offer));
  }

  /**
   * @param {udbEvent|udbPlace} item
   * @param {Object[]} facilities
   *
   * @return {Promise}
   */
  service.updateFacilities = function(item, facilities) {
    return udbApi
      .updateOfferFacilities(item.apiUrl, _.map(facilities, 'id'))
      .then(responseHandlerFactory(item));
  };

  /**
   * Add a new image to the item.
   *
   * @param {EventFormData} item
   * @param {MediaObject} image
   * @returns {Promise}
   */
  service.addImage = function(item, image) {
    var imageId = image.id || image['@id'].split('/').pop();

    return udbApi
      .addImage(item.apiUrl, imageId)
      .then(responseHandlerFactory(item));
  };

  /**
   * Update an image of the item.
   *
   * @param {EventFormData} item
   * @param {MediaObject} image
   * @param {string} description
   * @param {string} copyrightHolder
   * @returns {Promise}
   */
  service.updateImage = function(item, image, description, copyrightHolder) {
    var imageId = image['@id'].split('/').pop();

    return udbApi
      .updateImage(item.apiUrl, imageId, description, copyrightHolder)
      .then(responseHandlerFactory(item));
  };

  /**
   * Remove an image from an item.
   *
   * @param {EventFormData} item
   * @param {image} image
   * @returns {Promise}
   */
  service.removeImage = function(item, image) {
    var imageId = image['@id'].split('/').pop();

    return udbApi
      .removeImage(item.apiUrl, imageId)
      .then(responseHandlerFactory(item));
  };

  /**
   * Select the main image for an item.
   *
   * @param {EventFormData} item
   * @param {image} image
   * @returns {Promise}
   */
  service.selectMainImage = function (item, image) {
    var imageId = image['@id'].split('/').pop();

    return udbApi
      .selectMainImage(item.apiUrl, imageId)
      .then(responseHandlerFactory(item));
  };

  /**
   * Select the main image for an item.
   *
   * @param {EventFormData} item
   * @param {string} audienceType
   * @returns {Promise}
   */
  service.setAudienceType = function (item, audienceType) {
    return udbApi
      .setAudienceType(item.apiUrl, audienceType)
      .then(responseHandlerFactory(item));
  };

  /**
   * @param {EventFormData} offer
   * @param {Date} [publicationDate]
   *
   * @return {Promise}
   */
  service.publishOffer = function(offer, publicationDate) {
    return udbApi
      .publishOffer(offer.apiUrl, publicationDate)
      .then(responseHandlerFactory(offer));
  };

  /**
   * @param {Object} event Angular event object
   * @param {EventFormData} eventFormData
   */
  function updateMajorInfo(event, eventFormData) {
    service.updateMajorInfo(eventFormData);
  }

  function responseHandlerFactory(offer) {
    function responseHandler(response) {
      udbApi.removeItemFromCache(offer.apiUrl.toString());
    }

    return responseHandler;
  }

  $rootScope.$on('eventTypeChanged', updateMajorInfo);
  $rootScope.$on('eventThemeChanged', updateMajorInfo);
  $rootScope.$on('eventTimingChanged', updateMajorInfo);
  $rootScope.$on('eventTitleChanged', updateMajorInfo);
}
EventCrud.$inject = ["udbApi", "udbUitpasApi", "DeleteOfferJob", "$rootScope", "$q", "offerLocator"];
})();

// Source: src/entry/delete/delete-offer-job.factory.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.entry.DeleteOfferJob
 * @description
 * This is the factory that creates jobs to delete events and places.
 */
angular
  .module('udb.entry')
  .factory('DeleteOfferJob', DeleteOfferJobFactory);

/* @ngInject */
function DeleteOfferJobFactory(BaseJob, $q, JobStates) {

  /**
   * @class DeleteOfferJob
   * @constructor
   * @param {string} commandId
   * @param {UdbEvent|UdbPlace} item
   */
  var DeleteOfferJob = function (commandId, item) {
    BaseJob.call(this, commandId);

    this.item = item;
    this.task = $q.defer();
  };

  DeleteOfferJob.prototype = Object.create(BaseJob.prototype);
  DeleteOfferJob.prototype.constructor = DeleteOfferJob;

  DeleteOfferJob.prototype.finish = function () {
    BaseJob.prototype.finish.call(this);

    if (this.state !== JobStates.FAILED) {
      this.task.resolve();
    }
  };

  DeleteOfferJob.prototype.fail = function () {
    BaseJob.prototype.fail.call(this);

    this.task.reject();
  };

  DeleteOfferJob.prototype.getDescription = function() {
    return 'Item verwijderen: "' +  this.item.name + '".';
  };

  return (DeleteOfferJob);
}
DeleteOfferJobFactory.$inject = ["BaseJob", "$q", "JobStates"];
})();

// Source: src/entry/editing/offer-editor.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.entry.offerEditor
 * @description
 * # offerEditor
 * Service in the udb.entry.
 */
angular
  .module('udb.entry')
  .service('offerEditor', OfferEditor);

/* @ngInject */
function OfferEditor(jobLogger, udbApi, VariationCreationJob, BaseJob, $q, variationRepository) {
  var editor = this;
  /**
   * Edit the description of an offer. We never edit the original offer but use a variation instead.
   *
   * @param {UdbEvent|UdbPlace} offer        The original offer
   * @param {string}   description           The new description text
   * @param {string}   [purpose=personal]    The purpose of the variation that will be edited
   */
  this.editDescription = function (offer, description, purpose) {
    var deferredUpdate = $q.defer();
    var variationPromise = variationRepository.getPersonalVariation(offer);

    var removeDescription = function (variation) {
      editor
        .deleteVariation(offer, variation.id)
        .then(revertToOriginal, rejectUpdate);
    };

    function rejectUpdate(errorResponse) {
      deferredUpdate.reject(errorResponse.data);
    }

    function revertToOriginal() {
      deferredUpdate.resolve(false);
    }

    var handleCreationJob = function (jobData) {
      var variation = angular.copy(offer);
      variation.description.nl = description;
      var variationCreationJob = new VariationCreationJob(jobData.data.commandId, offer.id);
      jobLogger.addJob(variationCreationJob);

      variationCreationJob.task.promise.then(function (jobInfo) {
        variation.id = jobInfo['offer_variation_id']; // jshint ignore:line
        variationRepository.save(offer['@id'], variation);
        deferredUpdate.resolve();
      }, rejectUpdate);
    };

    var createVariation = function () {
      purpose = purpose || 'personal';

      udbApi
        .createVariation(offer.apiUrl, description, purpose)
        .then(handleCreationJob, rejectUpdate);
    };

    var editDescription = function (variation) {
      var editRequest = udbApi.editDescription(variation.id, description);

      editRequest.success(function (jobData) {
        variation.description.nl = description;
        jobLogger.addJob(new BaseJob(jobData.commandId));
        deferredUpdate.resolve();
      });

      editRequest.error(rejectUpdate);
    };

    if (description) {
      variationPromise.then(editDescription, createVariation);
    } else {
      variationPromise.then(removeDescription, revertToOriginal);
    }

    return deferredUpdate.promise;
  };

  this.deleteVariation = function (offer, variationId) {
    var deletePromise = udbApi.deleteVariation(variationId);

    deletePromise.success(function (jobData) {
      jobLogger.addJob(new BaseJob(jobData.commandId));
      variationRepository.remove(offer['@id']);
    });

    return deletePromise;
  };
}
OfferEditor.$inject = ["jobLogger", "udbApi", "VariationCreationJob", "BaseJob", "$q", "variationRepository"];
})();

// Source: src/entry/editing/variation-creation-job.factory.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.entry.VariationCreationJob
 * @description
 * # Variation Creation Job
 * This Is the factory that creates a variation creation job
 */
angular
  .module('udb.entry')
  .factory('VariationCreationJob', VariationCreationJobFactory);

/* @ngInject */
function VariationCreationJobFactory(BaseJob, JobStates, $q) {

  /**
   * @class VariationCreationJob
   * @constructor
   * @param {string} commandId
   * @param {string} offerId
   */
  var VariationCreationJob = function (commandId, offerId) {
    BaseJob.call(this, commandId);
    this.task = $q.defer();
    this.offerId = offerId;
  };

  VariationCreationJob.prototype = Object.create(BaseJob.prototype);
  VariationCreationJob.prototype.constructor = VariationCreationJob;

  VariationCreationJob.prototype.finish = function () {
    if (this.state !== JobStates.FAILED) {
      this.state = JobStates.FINISHED;
      this.finished = new Date();
    }
    this.progress = 100;
  };

  VariationCreationJob.prototype.info = function (jobInfo) {
    this.task.resolve(jobInfo);
  };

  VariationCreationJob.prototype.fail = function () {
    this.finished = new Date();
    this.state = JobStates.FAILED;
    this.progress = 100;
    this.task.reject('Failed to create a variation for offer with id: ' + this.offerId);
  };

  return (VariationCreationJob);
}
VariationCreationJobFactory.$inject = ["BaseJob", "JobStates", "$q"];
})();

// Source: src/entry/labelling/offer-label-batch-job.factory.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.entry.OfferLabelBatchJob
 * @description
 * # BaseJob
 * This Is the factory that creates an event export job
 */
angular
  .module('udb.entry')
  .factory('OfferLabelBatchJob', OfferLabelBatchJobFactory);

/* @ngInject */
function OfferLabelBatchJobFactory(BaseJob, JobStates) {

  /**
   * @class OfferLabelBatchJob
   * @constructor
   * @param {string} commandId
   * @param {string[]} offers
   * @param {string} label
   */
  var OfferLabelBatchJob = function (commandId, offers, label) {
    BaseJob.call(this, commandId);
    this.events = offers;
    this.addEventsAsTask(offers);
    this.label = label;
  };

  OfferLabelBatchJob.prototype = Object.create(BaseJob.prototype);
  OfferLabelBatchJob.prototype.constructor = OfferLabelBatchJob;

  OfferLabelBatchJob.prototype.addEventsAsTask = function (offers) {
    var job = this;
    _.forEach(offers, function (offer) {
      job.addTask({id: offer});
    });
  };

  OfferLabelBatchJob.prototype.getDescription = function () {
    var job = this,
        description;

    if (this.state === JobStates.FAILED) {
      description = 'Labelen van evenementen mislukt';
    } else {
      description = 'Label ' + job.events.length + ' items met "' + job.label + '"';
    }

    return description;
  };

  return (OfferLabelBatchJob);
}
OfferLabelBatchJobFactory.$inject = ["BaseJob", "JobStates"];
})();

// Source: src/entry/labelling/offer-label-job.factory.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.entry.OfferLabelJob
 * @description
 * # Event Label Job
 * This Is the factory that creates an event label job
 */
angular
  .module('udb.entry')
  .factory('OfferLabelJob', OfferLabelJobFactory);

/* @ngInject */
function OfferLabelJobFactory(BaseJob, JobStates) {

  /**
   * @class OfferLabelJob
   * @constructor
   * @param {string} commandId
   * @param {UdbEvent|UdbPlace} offer
   * @param {string} label
   * @param {boolean} unlabel set to true when unlabeling
   */
  var OfferLabelJob = function (commandId, offer, label, unlabel) {
    BaseJob.call(this, commandId);
    this.offer = offer;
    this.label = label;
    this.unlabel = !!unlabel || false;
  };

  OfferLabelJob.prototype = Object.create(BaseJob.prototype);
  OfferLabelJob.prototype.constructor = OfferLabelJob;

  OfferLabelJob.prototype.getDescription = function () {
    var job = this,
        description;

    if (job.state === JobStates.FAILED) {
      description = 'Labelen van evenement mislukt';
    } else {
      if (job.unlabel) {
        description = 'Verwijder label "' + job.label + '" van "' + job.offer.name.nl + '"';
      } else {
        description = 'Label "' + job.offer.name.nl + '" met "' + job.label + '"';
      }
    }

    return description;
  };

  return (OfferLabelJob);
}
OfferLabelJobFactory.$inject = ["BaseJob", "JobStates"];
})();

// Source: src/entry/labelling/offer-label-modal.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.entry.controller:OfferLabelModalCtrl
 * @description
 * # OfferLabelModalCtrl
 * Controller of the udb.entry
 */
angular
  .module('udb.entry')
  .controller('OfferLabelModalCtrl', OfferLabelModalCtrl);

/* @ngInject */
function OfferLabelModalCtrl($uibModalInstance) {
  var lmc = this;
  // ui-select can't get to this scope variable unless you reference it from the $parent scope.
  // seems to be 1.3 specific issue, see: https://github.com/angular-ui/ui-select/issues/243
  lmc.labels = [];
  lmc.close = close;
  lmc.ok = ok;
  lmc.labelNames = '';
  /**
   * This label-selection list used to contain labels that were last used by the user.
   * The endpoint to get these labels has been removed so we can no longer fetch them.
   * @see {@link https://jira.uitdatabank.be/browse/III-1708} for further information.
   */
  lmc.labelSelection = [];
  lmc.alert = false;
  lmc.minimumInputLength = 2;
  lmc.maxInputLength = 255;

  function ok() {
    // reset error msg
    lmc.alert = false;

    // Get the labels selected by checkbox
    var checkedLabels = lmc.labelSelection.filter(function (label) {
      return label.selected;
    }).map(function (label) {
      return label.name;
    });

    //add the labels
    var inputLabels = parseLabelInput(lmc.labelNames);

    if (lmc.alert) {
      return;
    }

    // join arrays and remove doubles
    var labels = _.union(checkedLabels, inputLabels);

    $uibModalInstance.close(labels);
  }

  function close() {
    $uibModalInstance.dismiss('cancel');
  }

  function areLengthCriteriaMet(length) {
    return (length >= lmc.minimumInputLength && length <= lmc.maxInputLength);
  }

  function parseLabelInput(stringWithLabels) {
    //split sting into array of labels
    var labels = stringWithLabels.split(';');

    // trim whitespaces
    labels = _.each(labels, function (label, index) {
      labels[index] = label.trim();
    });

    // remove empty strings
    labels = _.without(labels, '');

    var i;
    for (i = 0; i < labels.length; i++) {
      if (!areLengthCriteriaMet(labels[i].length)) {
        lmc.alert = 'Een label mag minimum 2 en maximum 255 karakters bevatten.';
        break;
      }
    }

    return labels;
  }
}
OfferLabelModalCtrl.$inject = ["$uibModalInstance"];
})();

// Source: src/entry/labelling/offer-labeller.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.entry.evenLabeller
 * @description
 * # offerLabeller
 * Service in the udb.entry.
 */
angular
  .module('udb.entry')
  .service('offerLabeller', OfferLabeller);

/* @ngInject */
function OfferLabeller(jobLogger, udbApi, OfferLabelJob, OfferLabelBatchJob, QueryLabelJob, $q, $uibModal) {
  var offerLabeller = this;

  /**
   * A helper function to create and log jobs
   *
   * This partial function takes a constructor for a specific job type and passes on the arguments.
   *
   * @param {BaseJob} jobType
   *  A job type that's based on BaseJob.
   */
  function jobCreatorFactory(jobType) {
    var args =  Array.prototype.slice.call(arguments);
    var info = args.shift(); // contains a function with argument info etc.

    function jobCreator(response) {
      args.unshift(response.data.commandId);
      args.unshift(info); // needs to be the first element
      var job = new (Function.prototype.bind.apply(jobType, args))();

      jobLogger.addJob(job);

      return $q.resolve(job);
    }

    return jobCreator;
  }

  /**
   * Label an event with a label
   * @param {UdbEvent|UdbPlace} offer
   * @param {string} labelName
   */
  this.label = function (offer, labelName) {
    var result = {
      success: false,
      name: labelName
    };

    return udbApi
      .labelOffer(offer.apiUrl, labelName)
      .then(jobCreatorFactory(OfferLabelJob, offer, labelName))
      .then(function(response) {
        offer.label(labelName);
        result.success = true;
        result.message = response.id;
        return result;
      })
      .catch(function(error) {
        result.message = error.data.title;
        return result;
      });
  };

  /**
   * Unlabel a label from an event
   * @param {UdbEvent|UdbPlace} offer
   * @param {string} labelName
   *
   * @return {Promise.<OfferLabelJob|ApiProblem>}
   */
  this.unlabel = function (offer, labelName) {
    function eagerlyUnlabelAndPassOnResponse(response) {
      offer.unlabel(labelName);
      return response;
    }

    return udbApi
      .unlabelOffer(offer.apiUrl, labelName)
      .then(eagerlyUnlabelAndPassOnResponse)
      .then(jobCreatorFactory(OfferLabelJob, offer, labelName, true));
  };

  /**
   * @param {OfferIdentifier[]} offers
   * @param {string} labelName
   */
  this.labelOffersById = function (offers, labelName) {
    return udbApi
      .labelOffers(offers, labelName)
      .then(jobCreatorFactory(OfferLabelBatchJob, offers, labelName));
  };

  /**
   *
   * @param {string} query
   * @param {string} labelName
   * @param {Number} eventCount
   */
  this.labelQuery = function (query, labelName, eventCount) {
    eventCount = eventCount || 0;

    return udbApi
      .labelQuery(query, labelName)
      .then(jobCreatorFactory(QueryLabelJob, eventCount, labelName));
  };

  /**
   * @param {string} labelName
   * @param {Number} [maxItems]
   * @return {Promise.<Label[]>}
   */
  offerLabeller.getSuggestions = function (labelName, maxItems) {
    var max = typeof maxItems !== 'undefined' ?  maxItems : 5;
    /** @param {PagedCollection} pagedSearchResults */
    function returnSimilarLabels(pagedSearchResults) {
      return pagedSearchResults.member;
    }

    return udbApi
      .findLabels(labelName, max)
      .then(returnSimilarLabels);
  };
}
OfferLabeller.$inject = ["jobLogger", "udbApi", "OfferLabelJob", "OfferLabelBatchJob", "QueryLabelJob", "$q", "$uibModal"];
})();

// Source: src/entry/labelling/query-label-job.factory.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.entry.QueryLabelJob
 * @description
 * # BaseJob
 * This Is the factory that creates an event export job
 */
angular
  .module('udb.entry')
  .factory('QueryLabelJob', QueryLabelJobFactory);

/* @ngInject */
function QueryLabelJobFactory(BaseJob) {

  /**
   * @class QueryLabelJob
   * @constructor
   * @param {string} commandId
   * @param {number} eventCount
   * @param {string} label
   */
  var QueryLabelJob = function (commandId, eventCount, label) {
    BaseJob.call(this, commandId);
    this.eventCount = eventCount;
    this.label = label;
  };

  QueryLabelJob.prototype = Object.create(BaseJob.prototype);
  QueryLabelJob.prototype.constructor = QueryLabelJob;

  QueryLabelJob.prototype.getTaskCount = function () {
    return this.eventCount;
  };

  QueryLabelJob.prototype.getDescription = function() {
    var job = this;
    return 'Label ' + job.eventCount + ' evenementen met label "' + job.label + '".';
  };

  return (QueryLabelJob);
}
QueryLabelJobFactory.$inject = ["BaseJob"];
})();

// Source: src/entry/logging/base-job.factory.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.entry.BaseJob
 * @description
 * # BaseJob
 * This Is the factory that creates base jobs
 */
angular
  .module('udb.entry')
  .factory('BaseJob', BaseJobFactory);

/* @ngInject */
function BaseJobFactory(JobStates) {

  /**
   * @class BaseJob
   * @constructor
   * @param {string}        commandId       - The commandId assigned to this job by the server
   *
   * @property {object[]}   tasks           - A list of tasks
   * @property {string}     id              - The command ID that uniquely identifies this job
   * @property {number}     progress        - Percentage based progress (0-100)
   * @property {Date}       created         - The date this job was returned by the server and created
   * @property {string}     state           - One of the job states defined in JobStates
   * @property {number} completedTaskCount  - Keeps count of the completed tasks to render the view
   */
  var BaseJob = function (commandId) {
    this.id = commandId;
    this.state = JobStates.CREATED;
    this.progress = 0;
    this.created = new Date();
    this.finished = null;
    this.tasks = [];
    this.completedTaskCount = 0;
  };

  /**
   * Always define the constructor, also when you use this class' prototype to prevent any weird stuff.
   * @type {Function}
   */
  BaseJob.prototype.constructor = BaseJob;

  // The following functions are used to update the job state based on feedback of the server.

  BaseJob.prototype.fail = function () {
    this.finished = new Date();
    this.state = JobStates.FAILED;
    this.progress = 100;
  };

  BaseJob.prototype.start = function () {
    this.state = JobStates.STARTED;
  };

  BaseJob.prototype.finish = function () {
    if (this.state !== JobStates.FAILED) {
      this.state = JobStates.FINISHED;
      this.finished = new Date();
    }
    this.progress = 100;
  };

  /**
   * Update the event with additional job data. This method does nothing by default but can be used by more specific
   * job types.
   *
   * @param {object}  jobData
   */
  BaseJob.prototype.info = function (jobData) {
  };

  /**
   * Renders the job description based on its details.
   * Overwrite this function if you want to show a more customized message.
   *
   * @return {string}
   */
  BaseJob.prototype.getDescription = function () {
    return 'Job with id: ' + this.id;
  };

  /**
   * Returns a date string to use for the job log based on job state.
   *
   * @return {string}
   */
  BaseJob.prototype.getLogDateByState = function () {
    if (_.contains([JobStates.FAILED, JobStates.FINISHED], this.state) && this.finished !== null) {
      return this.finished;
    }
    return this.created;
  };

  /**
   * This name is used by the job directive to find the right template.
   * The name will prepended with 'templates/' and a appended with '.template.html'.
   * A Grunt task is set up to automatically include the templates following this format when exporting the project.
   *
   * @return {string}
   */
  BaseJob.prototype.getTemplateName = function () {
    var templateName;

    if (this.state === JobStates.FAILED) {
      templateName = 'failed-job';
    } else {
      templateName = 'base-job';
    }

    return templateName;
  };

  /**
   * Adds a simple task with a unique id property to the job.
   *
   * @param {object} task
   */
  BaseJob.prototype.addTask = function (task) {

    var duplicateTask = _.find(this.tasks, {id: task.id});

    if (!duplicateTask) {
      this.tasks.push(task);
    }
  };

  BaseJob.prototype.getTaskCount = function () {
    return this.tasks.length;
  };

  /**
   * Find a task based on the task data received from the server.
   * Currently all tasks are identifiable by an event_id property.
   *
   * @param {object} taskData
   * @return {object}
   */
  BaseJob.prototype.findTask = function (taskData) {
    var taskId = taskData['event_id'], // jshint ignore:line
        task = _.find(this.tasks, {id: taskId});

    if (!task) {
      task = {id: taskId};
      this.addTask(task);
    }

    return task;
  };

  // These functions are used to update this job's task state based on feedback from the server.

  BaseJob.prototype.failTask = function (taskData) {
    var task = this.findTask(taskData);

    if (task) {
      task.state = 'failed';
      this.updateProgress();
    }
  };

  BaseJob.prototype.finishTask = function (taskData) {
    var task = this.findTask(taskData);

    if (task) {
      task.state = 'finished';
      this.updateProgress();
    }
  };

  /**
   * Update job progress and completed task count.
   * This information is used to render the view of batch jobs.
   */
  BaseJob.prototype.updateProgress = function () {
    var job = this;

    ++job.completedTaskCount;
    job.progress = (job.completedTaskCount / job.getTaskCount()) * 100;
  };

  return (BaseJob);
}
BaseJobFactory.$inject = ["JobStates"];
})();

// Source: src/entry/logging/job-log.component.js
(function () {
'use strict';

/**
 * @ngdoc component
 * @name udb.entry.component:udbJobLog
 * @description
 * # udbJobLog
 */
angular
  .module('udb.entry')
  .component('udbJobLog', {
    controller: JobLogController,
    controllerAs: 'logger',
    templateUrl: 'templates/job-log.component.html'
  });

/* @ngInject */
function JobLogController(jobLogger, $scope) {
  var controller = this;

  controller.getQueuedJobs = jobLogger.getQueuedJobs;
  controller.getFinishedExportJobs = jobLogger.getFinishedExportJobs;
  controller.getFailedJobs = jobLogger.getFailedJobs;
  controller.hideJobLog = jobLogger.toggleJobLog;
  controller.isVisible = jobLogger.isVisible;

  $scope.hideJob = jobLogger.hideJob;
}
JobLogController.$inject = ["jobLogger", "$scope"];
})();

// Source: src/entry/logging/job-logger.service.js
(function () {
'use strict';

/* jshint sub: true */

/**
 * @ngdoc service
 * @name udb.entry.jobLogger
 * @description
 * # jobLogger
 * Service in the udb.entry.
 */
angular
  .module('udb.entry')
  .service('jobLogger', JobLogger);

/* @ngInject */
function JobLogger(udbSocket, JobStates, EventExportJob, $rootScope) {
  var logger = this,
      jobs = [],
      queuedJobs = [],
      failedJobs = [],
      finishedExportJobs = [],
      startedExportJobs = [],
      hiddenJobs = [];

  /**
   * Finds a job  by id
   * @param {string}  jobId
   * @returns {BaseJob|undefined}
   */
  function findJob(jobId) {
    return _.find(jobs, {id: jobId});
  }

  function jobStarted(data) {
    var job = findJob(data['job_id']);

    if (job) {
      job.start(data);
      console.log('job with id: ' + job.id + ' started');
      updateJobLists();
    }
  }

  function jobInfo(data) {
    var job = findJob(data['job_id']);

    if (job) {
      job.info(data);
      console.log('job with id: ' + job.id + ' received some info.');
    }
  }

  function jobFinished(data) {
    var job = findJob(data['job_id']);

    if (job) {
      job.finish(data);
      console.log('job with id: ' + job.id + ' finished');
      updateJobLists();
    }
  }

  function jobFailed(data) {
    var job = findJob(data['job_id']);

    if (job) {
      job.fail(data);
      console.log('job with id: ' + job.id + ' failed');
      updateJobLists();
    }
  }

  function taskFinished(data) {
    var job = findJob(data['job_id']);

    if (job) {
      job.finishTask(data);
      console.log('Task of job with id: ' + job.id + ' finished.');
    }
  }

  function taskFailed(data) {
    var job = findJob(data['job_id']);

    if (job) {
      job.failTask(data);
      console.log('Task of job with id: ' + job.id + ' failed. Error message: ' + data.error);
    }
  }

  function updateJobLists() {
    var visibleJobs = _.difference(jobs, hiddenJobs),
        newJobs = _.filter(visibleJobs, {state: JobStates.CREATED}),
        activeJobs = _.filter(visibleJobs, {state: JobStates.STARTED});

    failedJobs = _.filter(visibleJobs, {state: JobStates.FAILED});
    startedExportJobs = _.filter(visibleJobs, function (job) {
      return job instanceof EventExportJob && job.state === JobStates.STARTED;
    });
    finishedExportJobs = _.filter(visibleJobs, function (job) {
      return job instanceof EventExportJob && job.state === JobStates.FINISHED;
    });
    queuedJobs = activeJobs.concat(newJobs);
    $rootScope.$emit('jobListsUpdated');
  }

  /**
   * Mark a job as hidden
   * @param {BaseJob} job
   */
  function hideJob(job) {
    hiddenJobs = _.union(hiddenJobs, [job]);
    updateJobLists();
  }

  udbSocket.on('event_was_labelled', taskFinished);
  udbSocket.on('event_was_not_labelled', taskFailed);
  udbSocket.on('task_completed', taskFinished);
  udbSocket.on('job_started', jobStarted);
  udbSocket.on('job_info', jobInfo);
  udbSocket.on('job_finished', jobFinished);
  udbSocket.on('job_failed', jobFailed);

  this.hasActiveJobs = function () {
    return !!queuedJobs.length;
  };

  this.addJob = function (job) {
    jobs.unshift(job);
    console.log('job with id: ' + job.id + ' created');
    updateJobLists();
  };

  this.getQueuedJobs = function () {
    return queuedJobs;
  };

  this.getFailedJobs = function () {
    return failedJobs;
  };

  this.getFinishedExportJobs = function () {
    return finishedExportJobs;
  };

  this.getStartedExportJobs = function () {
    return startedExportJobs;
  };

  this.hideJob = hideJob;

  this.toggleJobLog = function() {
    logger.visible = !logger.visible;
  };

  /**
   * @return {boolean}
   */
  this.isVisible = function () {
    return logger.visible;
  };
}
JobLogger.$inject = ["udbSocket", "JobStates", "EventExportJob", "$rootScope"];
})();

// Source: src/entry/logging/job-states.constant.js
(function () {
'use strict';

/* jshint sub: true */

/**
 * @ngdoc service
 * @name udb.entry.JobStates
 * @description
 * # JobStates
 * All the possible job states defined as a constant
 */
angular
  .module('udb.entry')
  .constant('JobStates',
  /**
   * Enum for job states
   * @readonly
   * @enum {string}
   */
  {
    CREATED: 'created',
    STARTED: 'started',
    FAILED: 'failed',
    FINISHED: 'finished'
  });
})();

// Source: src/entry/logging/job.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.entry.directive:udbJob
 * @description
 * # udb search directive
 */
angular
  .module('udb.entry')
  .directive('udbJob', jobDirective);

/* @ngInject */
function jobDirective() {
  var job = {
    template: '<div ng-include="jobTemplateUrl"></div>',
    restrict: 'E',
    link: function(scope, element, attrs) {
      scope.jobTemplateUrl = 'templates/' + scope.job.getTemplateName() + '.template.html';

      // batch job info
      scope.taskCount = 0;
      scope.completedTaskCount = 0;

    }
  };

  return job;
}
})();

// Source: src/entry/logging/udb-socket.factory.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.entry.udbSocket
 * @description
 * # udbSocket
 * Factory in the udb.entry.
 */
angular
  .module('udb.entry')
  .factory('udbSocket', UdbSocketFactory);

/* @ngInject */
function UdbSocketFactory (socketFactory, appConfig) {
  var udbSocket = io.connect(appConfig.socketUrl);

  var socket = socketFactory({
    ioSocket: udbSocket
  });

  return socket;
}
UdbSocketFactory.$inject = ["socketFactory", "appConfig"];
})();

// Source: src/entry/logging/work-indicator.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.entry.directive:udbWorkIndicator
 * @description
 * # udbWorkIndicator
 */
angular
  .module('udb.entry')
  .directive('udbWorkIndicator', udbWorkIndicator);

/* @ngInject */
function udbWorkIndicator ($window, jobLogger) {
  return {
    restrict: 'C',
    link: function postLink(scope, element, attrs) {
      scope.working = false;

      $window.setInterval(function () {
        scope.working = jobLogger.hasActiveJobs();
        element.toggleClass('working', scope.working);
      }, 2000);
    }
  };
}
udbWorkIndicator.$inject = ["$window", "jobLogger"];
})();

// Source: src/entry/translation/offer-translation-job.factory.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.entry.OfferTranslationJob
 * @description
 * # Offer Label Job
 * This Is the factory that creates an offer label job
 */
angular
  .module('udb.entry')
  .factory('OfferTranslationJob', OfferTranslationJobFactory);

/* @ngInject */
function OfferTranslationJobFactory(BaseJob, JobStates) {

  /**
   * @class OfferTranslationJob
   * @constructor
   * @param {string} commandId
   * @param {UdbEvent|UdbPlace} offer
   * @param {string} property
   * @param {string} language
   * @param {string} translation
   */
  var OfferTranslationJob = function (commandId, offer, property, language, translation) {
    BaseJob.call(this, commandId);
    this.offer = offer;
    this.property = property;
    this.language = language;
    this.translation = translation;
  };

  OfferTranslationJob.prototype = Object.create(BaseJob.prototype);
  OfferTranslationJob.prototype.constructor = OfferTranslationJob;

  OfferTranslationJob.prototype.getDescription = function () {
    var job = this,
        description;

    if (this.state === JobStates.FAILED) {
      description = 'Vertalen van aanbod mislukt';
    } else {
      var propertyName;

      switch (job.property) {
        case 'name':
          propertyName = 'titel';
          break;
        case 'description':
          propertyName = 'omschrijving';
          break;
        default:
          propertyName = job.property;
      }

      description = 'Vertaal ' + propertyName + ' van "' + job.offer.name.nl + '"';
    }

    return description;
  };

  return (OfferTranslationJob);
}
OfferTranslationJobFactory.$inject = ["BaseJob", "JobStates"];
})();

// Source: src/entry/translation/offer-translator.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.entry.offerTranslator
 * @description
 * # offerTranslator
 * Service in the udb.entry.
 */
angular
  .module('udb.entry')
  .service('offerTranslator', OfferTranslator);

/* @ngInject */
function OfferTranslator(jobLogger, udbApi, OfferTranslationJob) {

  /**
   * Translates an offer property to a given language and adds the job to the logger
   *
   * @param {UdbEvent|UdbPlace} offer The offer that needs translating
   * @param {string}  property  The name of the property to translate
   * @param {string}  language  The abbreviation of the translation language
   * @param {string}  translation Translation to save
   */
  this.translateProperty = function (offer, property, language, translation) {
    function logTranslationJob(response) {
      var jobData = response.data;

      if (property === 'title') {
        property = 'name';
      }

      offer[property][language] = translation;
      var job = new OfferTranslationJob(jobData.commandId, offer, property, language, translation);
      jobLogger.addJob(job);
    }

    return udbApi
      .translateProperty(offer.apiUrl, property, language, translation)
      .then(logTranslationJob);
  };

  this.translateAddress = function (offer, language, translation) {
    function logTranslationJob(response) {
      var jobData = response.data;

      offer.address[language] = translation;
      var job = new OfferTranslationJob(jobData.commandId, offer, 'address', language, translation);
      jobLogger.addJob(job);
    }

    return udbApi
        .translateAddress(offer.id, language, translation)
        .then(logTranslationJob);
  };
}
OfferTranslator.$inject = ["jobLogger", "udbApi", "OfferTranslationJob"];
})();

// Source: src/event-detail/event-detail.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.event-detail.directive:event-detail.html
 * @description
 * # udb event-detail directive
 */
angular
  .module('udb.event-detail')
  .directive('udbEventDetail', udbEventDetailDirective);

/* @ngInject */
function udbEventDetailDirective() {
  return {
    templateUrl: 'templates/event-detail.html',
    restrict: 'EA',
    controller: EventDetail // jshint ignore:line
  };
}
})();

// Source: src/event-detail/ui/booking-info-detail.directive.js
(function () {
'use strict';

/**
 * @ngdoc component
 * @name udb.event-detail.component:BookingInfoDetail
 * @description
 * # udbBookingInfoDetail
 */
angular
  .module('udb.event-detail')
  .directive('udbBookingInfoDetail', function () {
    return {
      templateUrl: 'templates/booking-info-detail.directive.html',
      controller: BookingInfoDetailController,
      restrict: 'A',
      scope: {
        bookingInfo: '<udbBookingInfoDetail'
      }
    };
  });

/* @ngInject */
function BookingInfoDetailController($scope) {
  $scope.isEmpty = _.isEmpty;
  $scope.hasAtLeastOneContactPoint = function() {
    return $scope.bookingInfo.phone || $scope.bookingInfo.url || $scope.bookingInfo.email;
  };
}
BookingInfoDetailController.$inject = ["$scope"];
})();

// Source: src/event-detail/ui/contact-point-detail.directive.js
(function () {
'use strict';

/**
 * @ngdoc component
 * @name udb.event-detail.component:ContactPointDetail
 * @description
 * # udbContactPointDetail
 */
angular
  .module('udb.event-detail')
  .directive('udbContactPointDetail', function () {
    return {
      templateUrl: 'templates/contact-point-detail.directive.html',
      controller: ContactPointDetailController,
      restrict: 'A',
      scope: {
        contactPoint: '<udbContactPointDetail'
      }
    };
  });

/* @ngInject */
function ContactPointDetailController($scope) {
  $scope.isEmpty = function (contactPoint) {
    return _(contactPoint).values().flatten().isEmpty();
  };
}
ContactPointDetailController.$inject = ["$scope"];
})();

// Source: src/event-detail/ui/event-detail.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.event-detail.controller:EventDetailController
 * @description
 * # EventDetailController
 * Event Detail controller
 */
angular
    .module('udb.event-detail')
    .controller('EventDetailController', EventDetail);

/* @ngInject */
function EventDetail(
  $scope,
  eventId,
  udbApi,
  jsonLDLangFilter,
  variationRepository,
  offerEditor,
  $state,
  $uibModal,
  $q,
  $window,
  offerLabeller,
  $translate,
  appConfig,
  ModerationService,
  RolePermission,
  authorizationService
) {
  var activeTabId = 'data';
  var controller = this;
  var disableVariations = _.get(appConfig, 'disableVariations');
  $scope.cultuurkuurEnabled = _.get(appConfig, 'cultuurkuur.enabled');
  $scope.apiVersion = appConfig.roleConstraintsMode;

  $q.when(eventId, function(offerLocation) {
    $scope.eventId = offerLocation;

    var offer = udbApi.getOffer(offerLocation);
    var permission = udbApi.hasPermission(offerLocation);

    offer.then(showOffer, failedToLoad);

    $q.all([permission, offer])
      .then(grantPermissions, denyAllPermissions);

    permission.catch(denyAllPermissions);
  });

  /**
   * Grant permissions based on permission-data.
   * @param {Array} permissionsData
   *  The first array-item is assumed to be true, if the user is not owner the permission check rejects.
   *  The second value holds the offer itself.
   */
  function grantPermissions(permissionsData) {
    var event = permissionsData[1];

    authorizationService
        .getPermissions()
        .then(function(userPermissions) {
          var mayAlwaysDelete = _.filter(userPermissions, function(permission) {
            return permission === RolePermission.GEBRUIKERS_BEHEREN;
          });

          if (mayAlwaysDelete.length) {
            $scope.mayAlwaysDelete = true;
          }
        })
        .finally(function() {
          if ($scope.mayAlwaysDelete) {
            $scope.permissions = {editing: true, duplication: true};
          }
          else {
            $scope.permissions = {editing: !event.isExpired(), duplication: true};
          }
          setTabs();
        });
  }

  function denyAllPermissions() {
    $scope.permissions = {editing: false, duplication: false};
  }

  function getModerationItems(roles) {
    var query = '';

    _.forEach(roles, function(role) {
      if (_.contains(role.permissions, 'AANBOD_MODEREREN') && role.constraints && role.constraints[$scope.apiVersion]) {
        query += (query ? ' OR ' : '') + '(' + role.constraints[$scope.apiVersion] + ')';
      }
    });
    query = (query ? '(' + query + ')' : '');
    var idField = 'id';
    if ($scope.apiVersion === 'v2') {
      idField = 'cdbid';
    }

    query = '(' + query + ' AND ' + idField + ':' + $scope.event.id + ')';

    return ModerationService
      .find(query, 10, 0)
      .then(function(searchResult) {
        return searchResult;
      });
  }

  $scope.eventIdIsInvalid = false;
  $scope.labelAdded = labelAdded;
  $scope.labelRemoved = labelRemoved;
  $scope.eventHistory = undefined;
  $scope.calendarSummary = undefined;

  function setTabs() {
    if ($scope.mayAlwaysDelete) {
      $scope.tabs = [
        {
          id: 'data'
        },
        {
          id: 'history'
        },
        {
          id: 'publication'
        }
      ];
    } else {
      $scope.tabs = [
        {
          id: 'data'
        },
        {
          id: 'publication'
        }
      ];
    }
  }

  $scope.deleteEvent = function () {
    openEventDeleteConfirmModal($scope.event);
  };
  $scope.isEmpty = _.isEmpty;

  var language = $translate.use() || 'nl';
  $scope.language = language;
  var cachedEvent;

  function showHistory(eventHistory) {
    $scope.eventHistory = eventHistory;
  }

  function showCalendarSummary(calendarSummary) {
    $scope.calendarSummary = calendarSummary;
  }

  function notifyCalendarSummaryIsUnavailable() {
    $scope.calendarSummary = false;
  }

  function showOffer(event) {
    cachedEvent = event;

    if (cachedEvent.calendarType === 'permanent') {
      showCalendarSummary('Altijd open');
    } else {
      udbApi
        .getCalendarSummary(event.id, 'lg', $scope.language)
        .then(showCalendarSummary, notifyCalendarSummaryIsUnavailable);
    }

    $scope.event = jsonLDLangFilter(event, language, true);
    $scope.allAges =  !(/\d/.test(event.typicalAgeRange));
    $scope.noAgeInfo = event.typicalAgeRange === '';

    if (event.typicalAgeRange.indexOf('-') === event.typicalAgeRange.length - 1) {
      $scope.ageRange = event.typicalAgeRange.slice(0, -1) + '+';
    }
    else {
      $scope.ageRange = event.typicalAgeRange;
    }

    $scope.eventIdIsInvalid = false;

    if (!disableVariations) {
      variationRepository
        .getPersonalVariation(event)
        .then(showVariation);
    }

    hasContactPoint();
    hasBookingInfo();

    ModerationService
      .getMyRoles()
      .then(function(roles) {
        var filteredRoles = _.filter(roles, function(role) {
          var canModerate = _.filter(role.permissions, function(permission) {
            return permission === RolePermission.AANBOD_MODEREREN;
          });
          return canModerate.length > 0;
        });

        if (filteredRoles.length) {
          getModerationItems(roles).then(function(result) {
            angular.forEach(result.member, function(member) {
              if (member['@id'] === $scope.eventId) {
                $scope.moderationPermission = true;
              }
            });
          });
        }
      });
  }

  function showVariation(variation) {
    $scope.event.description = variation.description[language];
  }

  function failedToLoad() {
    $scope.eventIdIsInvalid = true;
  }

  $scope.eventLocation = function (event) {
    var location = jsonLDLangFilter(event.location, language, true);

    var eventLocation = [
      location.name
    ];

    if (event.location.type) {
      eventLocation.push($scope.translateType(event.location.type.label));
    }

    if (event.location.address.streetAddress) {
      eventLocation.push(event.location.address.streetAddress);
    }

    if (event.location.address.addressLocality) {
      eventLocation.push(event.location.address.addressLocality);
    }

    return eventLocation.join(', ');
  };

  $scope.eventIds = function (event) {
    return _.union([event.id], event.sameAs);
  };

  $scope.isUrl = function (potentialUrl) {
    return /^(https?)/.test(potentialUrl);
  };

  $scope.isTabActive = function (tabId) {
    return tabId === activeTabId;
  };

  $scope.updateDescription = function(description) {
    if ($scope.event.description !== description) {
      var updatePromise = offerEditor.editDescription(cachedEvent, description);

      updatePromise.finally(function () {
        if (!description) {
          $scope.event.description = cachedEvent.description[language];
        }
      });

      return updatePromise;
    }
  };

  $scope.makeTabActive = function (tabId) {
    activeTabId = tabId;

    if (tabId === 'history' && !$scope.eventHistory) {
      udbApi.getHistory($scope.eventId).then(showHistory);
    }
  };

  $scope.openEditPage = function() {
    var eventLocation = $scope.eventId.toString();
    var id = eventLocation.split('/').pop();

    $state.go('split.eventEdit', {id: id});
  };

  $scope.openTranslatePage = function() {
    var eventLocation = $scope.eventId.toString();
    var id = eventLocation.split('/').pop();
    $state.go('split.eventTranslate', {id: id});
  };

  function goToDashboard() {
    $state.go('split.footer.dashboard');
  }

  /**
   * @param {EventCrudJob} job
   */
  controller.goToDashboardOnJobCompletion = function(job) {
    job.task.promise
      .then(goToDashboard);
  };

  function openEventDeleteConfirmModal(item) {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/event-delete-confirm-modal.html',
      controller: 'EventDeleteConfirmModalCtrl',
      resolve: {
        item: function () {
          return item;
        }
      }
    });

    modalInstance.result
      .then(controller.goToDashboardOnJobCompletion);
  }

  /**
   * @param {Label} newLabel
   */
  function labelAdded(newLabel) {
    var similarLabel = _.find(cachedEvent.labels, function (label) {
      return newLabel.name.toUpperCase() === label.toUpperCase();
    });

    if (similarLabel) {
      $window.alert('Het label "' + newLabel.name + '" is reeds toegevoegd als "' + similarLabel + '".');
    }
    else {
      offerLabeller.label(cachedEvent, newLabel.name)
        .then(function(response) {
          if (response.success) {
            $scope.labelResponse = 'success';
            $scope.addedLabel = response.name;
          }
          else {
            $scope.labelResponse = 'error';
            $scope.labelsError = response;
          }
          $scope.event.labels = angular.copy(cachedEvent.labels);
        });
    }
  }

  function clearLabelsError() {
    $scope.labelResponse = '';
    $scope.labelsError = '';
  }

  /**
   * @param {ApiProblem} problem
   */
  function showUnlabelProblem(problem) {
    $scope.event.labels = angular.copy(cachedEvent.labels);
    $scope.labelResponse = 'unlabelError';
    $scope.labelsError = problem.title;
  }

  /**
   * @param {Label} label
   */
  function labelRemoved(label) {
    clearLabelsError();

    offerLabeller
      .unlabel(cachedEvent, label.name)
      .catch(showUnlabelProblem);
  }

  function hasContactPoint() {
    var nonEmptyContactTypes = _.filter(
      $scope.event.contactPoint,
      function(value) {
        return value.length > 0;
      }
    );

    $scope.hasContactPointResults = (nonEmptyContactTypes.length > 0);
  }

  function hasBookingInfo() {
    var bookingInfo = $scope.event.bookingInfo;
    $scope.hasBookingInfoResults = !(bookingInfo.phone === '' && bookingInfo.email === '' && bookingInfo.url === '');
  }

  $scope.translateAudience = function (type) {
    return $translate.instant('audience.' + type);
  };

  $scope.translateType = function (type) {
    // Work around for III-2695
    var translatedString = $translate.instant('offerTypes.' + type);
    if (_.includes(translatedString, 'offerTypes.')) {
      return type;
    }
    else {
      return translatedString;
    }
  };

  $scope.finishedLoading = function() {
    return ($scope.event && $scope.permissions);
  };
}
EventDetail.$inject = ["$scope", "eventId", "udbApi", "jsonLDLangFilter", "variationRepository", "offerEditor", "$state", "$uibModal", "$q", "$window", "offerLabeller", "$translate", "appConfig", "ModerationService", "RolePermission", "authorizationService"];
})();

// Source: src/event_form/calendar-labels.constant.js
(function () {
'use strict';

/* jshint sub: true */

/**
 * @ngdoc constant
 * @name udb.event-form.calendarLabels
 * @description
 * # calendarLabels
 * Form calendar labels
 */
angular
  .module('udb.event-form')
  .constant('calendarLabels',
    /**
     * list of calendar labels
     * @readonly
     */
    [
      {'label': 'Eén of meerdere dagen', 'id' : 'single', 'eventOnly' : true},
      {'label': 'Van ... tot ... ', 'id' : 'periodic', 'eventOnly' : true},
      {'label' : 'Permanent', 'id' : 'permanent', 'eventOnly' : false}
    ]);
})();

// Source: src/event_form/components/age/age-input.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.event-form.directive:udbAgeInput
 * @description
 * # Age input parsing and formatting
 */
angular
  .module('udb.event-form')
  .directive('udbAgeInput', AgeInputDirective);

/* @ngInject */
function AgeInputDirective() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, controller) {
      function ensureAge(value) {
        var number = parseInt(value);

        if (isNaN(number)) {
          controller.$setViewValue(undefined);
          controller.$render();
          return undefined;
        }

        var age = Math.abs(number);

        if (age.toString() !== value) {
          controller.$setViewValue(age.toString());
          controller.$render();
        }

        return age;
      }

      controller.$formatters.push(ensureAge);
      controller.$parsers.splice(0, 0, ensureAge);
    }
  };
}
})();

// Source: src/event_form/components/age/form-age.controller.js
(function () {
'use strict';

/**
 * @ngdoc controller
 * @name udb.event-form:FormAgeController
 * @var FormAgeController fagec
 * @description
 * # FormAgeController
 * Controller for the form age component
 */
angular
  .module('udb.event-form')
  .controller('FormAgeController', FormAgeController);

/* @ngInject */
function FormAgeController($scope, EventFormData, eventCrud, $translate) {
  var controller = this;
  /**
   * Enum for age ranges.
   * @readonly
   * @enum {Object}
   */
  var AgeRangeEnum = Object.freeze({
    'ALL': {label: 'All ages'},
    'TODDLERS': {label: 'Toddlers', min: 0, max: 2},
    'PRESCHOOLERS': {label: 'Preschoolers', min: 3, max: 5},
    'KIDS': {label: 'Kids', min: 6, max: 11},
    'TEENAGERS': {label: 'Teenagers', min: 12, max: 15},
    'YOUNGSTERS': {label: 'Youngsters', min: 16, max: 26},
    'ADULTS': {label: 'Adults', min: 18},
    'SENIORS': {label: 'Seniors', min: 65},
    'CUSTOM': {label: 'Custom'}
  });

  controller.ageRanges = angular.copy(AgeRangeEnum);
  controller.activeAgeRange = undefined;
  controller.minAge = undefined;
  controller.maxAge = undefined;
  controller.setAgeRangeByType = setAgeRangeByType;
  controller.delayedSaveAgeRange = _.debounce(digestSaveAgeRange, 1000);
  controller.instantSaveAgeRange = instantSaveAgeRange;
  controller.error = '';
  controller.formData = undefined;

  init(EventFormData);

  /**
   * Save the age range based on current controller min and max values.
   *
   * If the controller values do not change the old form data, no update will happen.
   */
  function saveAgeRange() {
    clearError();
    var min = controller.minAge;
    var max = controller.maxAge;
    var oldAgeRange = controller.formData.getTypicalAgeRange();

    if (oldAgeRange && oldAgeRange.min === min && oldAgeRange.max === max) {
      return;
    }

    if (_.isNumber(min) && _.isNumber(max) && min > max) {
      controller.hasError = true;
      showError($translate.instant('eventForm.step5.age.error_max_lower_than_min')); return;
    }

    controller.formData.setTypicalAgeRange(min, max);
    eventCrud.updateTypicalAgeRange(controller.formData);
  }

  function digestSaveAgeRange() {
    $scope.$apply(saveAgeRange);
  }

  function instantSaveAgeRange() {
    controller.delayedSaveAgeRange.cancel();
    saveAgeRange();
  }

  function showError(errorMessage) {
    controller.error = errorMessage;
  }

  function clearError() {
    controller.error = '';
    controller.hasError = false;
  }

  /**
   * Create a matcher with a min and max age that takes an age range object.
   *
   * @param {number} min
   * @param {number} max
   * @returns {Function}
   */
  function rangeMatcher(min, max) {
    return function (ageRange) {
      var fixedRange = (ageRange.min === min && ageRange.max === max);
      var customRange = !(isNaN(min) && isNaN(max)) && ageRange === AgeRangeEnum.CUSTOM;

      return fixedRange ? fixedRange : customRange;
    };
  }

  /**
   * @param {EventFormData} formData
   */
  function init(formData) {
    controller.formData = formData;
    var ageRange = formData.getTypicalAgeRange();

    if (ageRange) {
      showRange(ageRange.min, ageRange.max);
    }
  }

  /**
   * @param {number} min
   * @param {number} max
   */
  function showRange(min, max) {
    var activeAgeRangeType = _.findKey(AgeRangeEnum, rangeMatcher(min, max));
    controller.minAge = min;
    controller.maxAge = max;
    controller.rangeInputEnabled = activeAgeRangeType && activeAgeRangeType !== 'ALL';
    controller.activeAgeRange = activeAgeRangeType;
  }

  /**
   * @param {string} type
   */
  function setAgeRangeByType(type) {
    var ageRange = AgeRangeEnum[type];

    if (ageRange) {
      if (type !== 'CUSTOM') {
        controller.minAge = ageRange.min;
        controller.maxAge = ageRange.max;
      }

      controller.rangeInputEnabled = type !== 'ALL';
      controller.activeAgeRange = type;

      saveAgeRange();
    }
  }

  $scope.translateAgeRange = function (ageRange) {
    return $translate.instant('eventForm.step5.age.' + ageRange);
  };
}
FormAgeController.$inject = ["$scope", "EventFormData", "eventCrud", "$translate"];
})();

// Source: src/event_form/components/age/form-age.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.event-form.directive:udbFormAge
 * @description
 * # Target age component for offer forms
 */
angular
  .module('udb.event-form')
  .directive('udbFormAge', FormAgeDirective);

/* @ngInject */
function FormAgeDirective() {
  return {
    templateUrl: 'templates/form-age.html',
    restrict: 'EA',
    controller: 'FormAgeController',
    controllerAs: 'fagec'
  };
}
})();

// Source: src/event_form/components/audience/form-audience.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.event-form:FormAudienceController
 * @description
 * # FormAudienceController
 * Controller for the form audience component
 */
angular
  .module('udb.event-form')
  .controller('FormAudienceController', FormAudienceController);

/* @ngInject */
function FormAudienceController(EventFormData, eventCrud, appConfig) {
  var controller = this;
  var componentDisabled = _.get(appConfig, 'offerEditor.disableAudience');

  controller.enabled = !componentDisabled && EventFormData.isEvent;
  controller.audienceType = EventFormData.audienceType;
  controller.setAudienceType = setAudienceType;

  function setAudienceType(audienceType) {
    eventCrud.setAudienceType(EventFormData, audienceType);
  }
}
FormAudienceController.$inject = ["EventFormData", "eventCrud", "appConfig"];
})();

// Source: src/event_form/components/audience/form-audience.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.event-form.directive:udbFormAudience
 * @description
 * # Target audience component for event forms
 */
angular
  .module('udb.event-form')
  .directive('udbFormAudience', FormAudienceDirective);

/* @ngInject */
function FormAudienceDirective() {
  return {
    templateUrl: 'templates/form-audience.html',
    restrict: 'EA',
    controller: 'FormAudienceController',
    controllerAs: 'fac'
  };
}
})();

// Source: src/event_form/components/auto-scroll.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.event-form.directive:udbAutoScroll
 * @description
 * auto scrolls to the attached element when focused.
 */
angular
  .module('udb.event-form')
  .directive('udbAutoScroll', AutoScroll);

/* @ngInject */
function AutoScroll($document) {
  return {
    restrict: 'A',
    link: link
  };

  function link(scope, element) {
    var scrollDuration = 1000;
    var easeInOutQuad = function (t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };

    element.on('click focusin', scrollToTarget);

    function scrollToTarget(event) {
      $document.scrollTo(event.target, 100, scrollDuration, easeInOutQuad);
    }
  }
}
AutoScroll.$inject = ["$document"];
})();

// Source: src/event_form/components/calendar/base-calendar.controller.js
(function () {
'use strict';

/**
 * @typedef {Object} TimeSpan
 * @property {Date} start
 * @property {Date} end
 * @property {boolean} allDay
 */

/**
 * @ngdoc function
 * @name udbApp.controller:BaseCalendarController
 * @description
 * # Base Calendar Controller
 */
angular
  .module('udb.event-form')
  .controller('BaseCalendarController', BaseCalendarController);

/* @ngInject */
function BaseCalendarController(calendar, $scope, appConfig) {
  calendar.type = '';
  calendar.setType = setType;
  calendar.createTimeSpan = createTimeSpan;
  calendar.timeSpans = [];
  calendar.timeSpanRequirements = [];
  calendar.removeTimeSpan = removeTimeSpan;
  calendar.weeklyRecurring = false;
  calendar.delayedTimeSpanChanged = _.debounce(digestTimeSpanChanged, 1000);
  calendar.instantTimeSpanChanged = instantTimeSpanChanged;
  calendar.toggleAllDay = toggleAllDay;
  calendar.init = init;
  calendar.maxYearTimeSpan = _.get(appConfig, 'offerEditor.calendar.maxYearTimeSpan', 10);

  /**
   * @param {EventFormData} formData
   * @param {OpeningHoursCollection} openingHoursCollection
   */
  function init(formData, openingHoursCollection) {
    calendar.formData = formData;
    calendar.timeSpans = !_.isEmpty(formData.calendar.timeSpans) ? formData.calendar.timeSpans : [];
    calendar.setType(formData.calendar.calendarType ? formData.calendar.calendarType : 'single');
    calendar.openingHoursCollection = openingHoursCollection;
  }

  function isTypeWeeklyRecurring(type) {
    return type === 'permanent' || type === 'periodic';
  }

  /**
   * @param {string} calendarType
   */
  function setType(calendarType) {
    calendar.formData.setCalendarType(calendarType);
    calendar.type = calendarType;
    calendar.weeklyRecurring = isTypeWeeklyRecurring(calendarType);

    if (calendarType === 'single' && _.isEmpty(calendar.timeSpans)) {
      initTimeSpans();
    }
  }

  function initTimeSpans() {
    calendar.timeSpans = [
      {
        allDay: true,
        start: moment().startOf('day').toDate(),
        end: moment().endOf('day').toDate(),
        endTouched: false
      }
    ];
  }

  function createTimeSpan() {
    if (_.isEmpty(calendar.timeSpans)) {
      initTimeSpans();
      calendar.instantTimeSpanChanged();
    } else {
      calendar.timeSpans.push(_.cloneDeep(_.last(calendar.timeSpans)));
      // Do not trigger timeSpanChanged to prevent saving duplicates.
    }
  }

  /**
   * @param {Object} timeSpan
   */
  function removeTimeSpan(timeSpan) {
    if (calendar.timeSpans.length > 1) {
      calendar.timeSpans = _.without(calendar.timeSpans, timeSpan);
      calendar.instantTimeSpanChanged();
    }
  }

  function digestTimeSpanChanged(whichDate) {
    $scope.$apply(timeSpanChanged(whichDate));
  }

  function instantTimeSpanChanged() {
    calendar.delayedTimeSpanChanged.cancel();
    timeSpanChanged();
  }

  function toggleAllDay(timeSpan) {
    if (timeSpan.allDay) {
      timeSpan.start = moment(timeSpan.start).set({'hour': 0, 'minute': 0, 'millisecond': 0}).toDate();
      timeSpan.end = moment(timeSpan.end).endOf('day').toDate();
    }
    else {
      timeSpan.start = moment(timeSpan.start).set({'hour': moment().startOf('hour').format('H'), 'minute': 0}).toDate();
      timeSpan.end = moment(timeSpan.end).set(
          {'hour': moment().startOf('hour').add(4, 'h').format('H') , 'minute': 0, 'second': 0}
      ).toDate();
    }
    instantTimeSpanChanged();
  }

  function timeSpanChanged(whichDate) {

    var unmetRequirements = _.map(calendar.timeSpans, validateTimeSpan);

    if (!_.isEmpty(_.flatten(unmetRequirements))) {
      showTimeSpanRequirements(unmetRequirements);
    } else {
      if (calendar.timeSpans.length > 1) {
        if (calendar.type !== 'multiple') {
          setType('multiple');
        }
      } else if (calendar.type !== 'single') {
        setType('single');
      }
      clearTimeSpanRequirements();
      _.each(calendar.timeSpans, function(timeSpan) {
        if (whichDate === 'end' && !timeSpan.endTouched) {
          timeSpan.endTouched = true;
        }
        if (timeSpan.allDay) {
          timeSpan.start = moment(timeSpan.start).startOf('day').toDate();
          timeSpan.end = moment(timeSpan.end).endOf('day').toDate();
        }
        if (whichDate === 'start' && !timeSpan.endTouched) {
          if (timeSpan.start > timeSpan.end) {
            timeSpan.end = moment(timeSpan.start).endOf('day').toDate();
          }
        }
      });
      calendar.formData.saveTimeSpans(calendar.timeSpans);
    }
  }

  function clearTimeSpanRequirements() {
    calendar.timeSpanRequirements = [];
  }

  function showTimeSpanRequirements(unmetRequirements) {
    calendar.timeSpanRequirements = unmetRequirements;
  }

  /**
   * Validates a time-span and returns a list of unmet requirements.
   *
   * @param {TimeSpan} timeSpan
   * @return {string[]}
   */
  function validateTimeSpan(timeSpan) {
    var requirements = {
      'timedWhenNotAllDay': function (timeSpan) {
        return !timeSpan.allDay && (!timeSpan.start || !timeSpan.end);
      },
      'startBeforeEndDay': function (timeSpan) {
        return timeSpan.endTouched &&
            timeSpan.start &&
            timeSpan.end &&
            moment(timeSpan.start).isAfter(timeSpan.end, 'day');
      },
      'startBeforeEnd': function (timeSpan) {
        return !timeSpan.allDay &&
            (timeSpan.start && timeSpan.end) &&
            moment(timeSpan.start).isSame(timeSpan.end, 'day') &&
            moment(timeSpan.start).isAfter(timeSpan.end);
      },
      'tooFarInFuture': function (timespan) {
        var maxDate = moment().add(calendar.maxYearTimeSpan, 'y');
        return moment(timeSpan.end).isAfter(maxDate);
      }
    };

    var unmetRequirements = _.pick(requirements, function (check) {
      return check(timeSpan);
    });

    return _.keys(unmetRequirements);
  }
}
BaseCalendarController.$inject = ["calendar", "$scope", "appConfig"];
})();

// Source: src/event_form/components/calendar/form-calendar-datepicker.component.js
(function () {
'use strict';

angular
  .module('udb.event-form')
  .component('udbFormCalendarDatepicker', {
    templateUrl: 'templates/form-calendar-datepicker.component.html',
    controller: FormCalendarDatepickerController,
    require: {
      ngModel: '^ngModel'
    },
    bindings: {
      disabled: '=ngDisabled'
    },
    controllerAs: 'datepicker'
  });

/** @inject */
function FormCalendarDatepickerController(appConfig) {
  var datepicker = this;
  var options = {
    minDate: new Date(),
    showWeeks: false,
    customClass: getDayClass
  };

  datepicker.$onInit = function() {
    datepicker.isOpen = false;
    datepicker.options = options;
    datepicker.ngModel.$render = function () {
      datepicker.date = new Date(datepicker.ngModel.$viewValue);
    };
  };

  datepicker.open = function() {
    datepicker.isOpen = true;
  };

  datepicker.changed = function() {
    if (datepicker.date) {
      var time = moment(datepicker.ngModel.$viewValue);
      var day = moment(datepicker.date).hour(time.hour()).minute(time.minute());
      datepicker.ngModel.$setViewValue(day.toDate());
    }
  };

  function getDayClass(data) {
    if (appConfig.calendarHighlight.date !== '') {
      var dayToCheck = moment(data.date);
      var highlightDate = moment(appConfig.calendarHighlight.date);

      if (dayToCheck.isSame(highlightDate, data.mode)) {
        return appConfig.calendarHighlight.extraClass;
      }
    }
  }
}

FormCalendarDatepickerController.$inject = ['appConfig'];
})();

// Source: src/event_form/components/calendar/form-calendar-period.component.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:FormCalendarPeriod
 * @description
 * # Form Calendar Period
 */
angular
  .module('udb.event-form')
  .component('udbFormCalendarPeriod', {
    templateUrl: 'templates/form-calendar-period.component.html',
    controller: FormCalendarPeriodComponentController,
    bindings: {
      formData: '='
    }
  });

function FormCalendarPeriodComponentController() {
  var controller = this;
  controller.calendarType = controller.formData.calendar.calendarType;
}
})();

// Source: src/event_form/components/calendar/form-calendar-timepicker.component.js
(function () {
'use strict';

angular
  .module('udb.event-form')
  .component('udbFormCalendarTimepicker', {
    templateUrl: 'templates/form-calendar-timepicker.component.html',
    controller: FormCalendarTimepickerController,
    require: {
      ngModel: '^ngModel'
    },
    controllerAs: 'timepicker'
  });

/** @inject */
function FormCalendarTimepickerController() {
  var timepicker = this;

  timepicker.$onInit = function() {
    timepicker.ngModel.$render = function () {
      timepicker.time = new Date(timepicker.ngModel.$viewValue);
    };
  };

  timepicker.changed = function() {
    if (timepicker.time) {
      timepicker.ngModel.$setViewValue(timepicker.time);
    }
  };
}
})();

// Source: src/event_form/components/calendar/form-calendar.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:FormCalendarController
 * @description
 * # Form Calendar Controller
 */
angular
  .module('udb.event-form')
  .controller('FormCalendarController', FormCalendarController);

/* @ngInject */
function FormCalendarController(EventFormData, OpeningHoursCollection, $scope, $controller) {
  var calendar = this;

  $controller('BaseCalendarController', {calendar: calendar, $scope: $scope});

  calendar.init(EventFormData, OpeningHoursCollection);
}
FormCalendarController.$inject = ["EventFormData", "OpeningHoursCollection", "$scope", "$controller"];
})();

// Source: src/event_form/components/calendar/form-event-calendar.component.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.event-form.component:udbFormEventCalendar
 * @description
 * # Form Calendar
 * The form calendar component for events.
 */
angular
  .module('udb.event-form')
  .component('udbFormEventCalendar', {
    templateUrl: 'templates/form-event-calendar.component.html',
    controller: 'FormCalendarController',
    controllerAs: 'calendar'
  });
})();

// Source: src/event_form/components/calendar/form-place-calendar.component.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.event-form.component:udbFormPlaceCalendar
 * @description
 * # Form Place Calendar
 * The form calendar component for places.
 */
angular
  .module('udb.event-form')
  .component('udbFormPlaceCalendar', {
    templateUrl: 'templates/form-place-calendar.component.html',
    controller: 'FormCalendarController',
    controllerAs: 'calendar'
  });
})();

// Source: src/event_form/components/image-edit/event-form-image-edit.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormImageEditController
 * @description
 * # EventFormImageEditController
 * Modal for uploading images.
 */
angular
  .module('udb.event-form')
  .controller('EventFormImageEditController', EventFormImageEditController);

/* @ngInject */
function EventFormImageEditController(
  $scope,
  $uibModalInstance,
  EventFormData,
  eventCrud,
  /** @type {MediaObject} **/
  mediaObject
) {

  // Scope vars.
  $scope.saving = false;
  $scope.error = false;
  $scope.description = mediaObject.description || '';
  $scope.copyrightHolder = mediaObject.copyrightHolder || '';

  // Scope functions.
  $scope.cancel = cancel;
  $scope.updateImageInfo = updateImageInfo;
  $scope.allFieldsValid = allFieldsValid;

  /**
   * Cancel the modal.
   */
  function cancel() {
    $uibModalInstance.dismiss('cancel');
  }

  /**
   * Update the
   */
  function updateImageInfo() {
    var description = $scope.description,
        copyrightHolder = $scope.copyrightHolder;

    function displayErrors() {
      $scope.saving = false;
      $scope.error = true;
    }

    function updateEventFormDataAndClose() {
      var updatedMediaObject = angular.copy(mediaObject);
      updatedMediaObject.description = description;
      updatedMediaObject.copyrightHolder = copyrightHolder;

      EventFormData.updateMediaObject(updatedMediaObject);
      $uibModalInstance.close(updatedMediaObject);
    }

    eventCrud
      .updateImage(EventFormData, mediaObject, description, copyrightHolder)
      .then(updateEventFormDataAndClose, displayErrors);
  }

  function allFieldsValid() {
    return $scope.description && $scope.copyrightHolder &&
        $scope.description.length <= 250 && $scope.copyrightHolder.length >= 3;
  }
}
EventFormImageEditController.$inject = ["$scope", "$uibModalInstance", "EventFormData", "eventCrud", "mediaObject"];
})();

// Source: src/event_form/components/image-remove/event-form-image-remove.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormImageRemoveController
 * @description
 * # EventFormImageRemoveController
 * Modal for removing images from an offer.
 */
angular
  .module('udb.event-form')
  .controller('EventFormImageRemoveController', EventFormImageRemoveController);

/* @ngInject */
function EventFormImageRemoveController($scope, $uibModalInstance, EventFormData, eventCrud, image) {

  // Scope vars.
  $scope.saving = false;
  $scope.error = false;

  // Scope functions.
  $scope.cancel = cancel;
  $scope.removeImage = removeImage;

  /**
   * Cancel the modal.
   */
  function cancel() {
    $uibModalInstance.dismiss('cancel');
  }

  function showError() {
    $scope.error = true;
    $scope.saving = false;
  }

  function triggerLoadingState() {
    $scope.saving = true;
    $scope.error = false;
  }

  function removeImage() {
    triggerLoadingState();

    function updateEventFormDataAndCloseModal() {
      EventFormData.removeMediaObject(image);
      $scope.saving = false;
      $uibModalInstance.close();
    }

    eventCrud
      .removeImage(EventFormData, image)
      .then(updateEventFormDataAndCloseModal, showError);
  }
}
EventFormImageRemoveController.$inject = ["$scope", "$uibModalInstance", "EventFormData", "eventCrud", "image"];
})();

// Source: src/event_form/components/image-upload/event-form-image-upload.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormImageUploadController
 * @description
 * # EventFormImageUploadController
 * Modal for uploading images.
 */
angular
  .module('udb.event-form')
  .controller('EventFormImageUploadController', EventFormImageUploadController);

/* @ngInject */
function EventFormImageUploadController(
  $scope,
  $uibModalInstance,
  EventFormData,
  eventCrud,
  appConfig,
  MediaManager,
  $q,
  copyrightNegotiator,
  $translate,
  $filter
) {

  // Scope vars.
  $scope.userAgreementUrl = $filter('translate')('images.conditions_url');
  $scope.copyrightUrl = '/' + $translate.use() + _.get(appConfig, 'media.copyrightUrl', '/copyright');
  $scope.saving = false;
  $scope.error = false;
  $scope.showAgreements = !copyrightNegotiator.confirmed();
  $scope.modalTitle = $translate.instant('eventForm.imageUpload.modalTitle');
  $scope.description = '';
  $scope.copyright = '';
  $scope.maxFileSize = _.get(appConfig, 'media.fileSizeLimit', '1MB');

  // Scope functions.
  $scope.acceptAgreements = acceptAgreements;
  $scope.cancel = cancel;
  $scope.addImage = uploadAndAddImage;
  $scope.clearError = clearError;
  $scope.selectFile = selectFile;
  $scope.allFieldsValid = allFieldsValid;

  var invalidFileErrors = {
    'default': $translate.instant('eventForm.imageUpload.defaultError'),
    'maxSize': $translate.instant('eventForm.imageUpload.maxSize') + $scope.maxFileSize + '.'
  };

  /**
   * Accept the agreements.
   */
  function acceptAgreements() {
    $scope.modalTitle = $translate.instant('eventForm.imageUpload.modalTitle');
    $scope.showAgreements = false;
    copyrightNegotiator.confirm();
  }

  /**
   * Cancel the modal.
   */
  function cancel() {
    $uibModalInstance.dismiss('cancel');
  }

  function clearError() {
    $scope.error = false;
  }

  function selectFile(file, invalidFiles) {
    $scope.selectedFile = file ? file : null;

    // Check if the selected file is invalid and show an error else clear any existing error messages.
    if (invalidFiles.length) {
      var knownError = invalidFileErrors[invalidFiles[0].$error];
      $scope.error = knownError ? knownError : invalidFileErrors.default;
    } else {
      clearError();
    }
  }

  function uploadAndAddImage() {
    // Abort if no valid file is selected.
    if (!$scope.selectedFile) {
      $scope.error = $translate.instant('eventForm.imageUpload.noFileSelectedError');
      return;
    }

    $scope.saving = true;

    var description = $scope.description,
        copyrightHolder = $scope.copyright,
        deferredAddition = $q.defer(),
        language = EventFormData.mainLanguage ? EventFormData.mainLanguage : 'nl';

    function displayError(errorResponse) {
      var errorMessage = errorResponse.data.title;
      var error = $translate.instant('eventForm.imageUpload.somethingWentWrongError');

      switch (errorMessage) {
        case 'The uploaded file is not an image.':
          error = $translate.instant('eventForm.imageUpload.formatNotValidError') +
            $translate.instant('eventForm.imageUpload.extensionsAllowed');
          break;
        case 'The file size of the uploaded image is too big.':
          error = $translate.instant('eventForm.imageUpload.sizeError');
          break;
      }

      $scope.saving = false;
      $scope.error = error;
    }

    /**
     * @param {MediaObject} mediaObject
     */
    function addImageToEvent(mediaObject) {
      function updateEventFormAndResolve() {
        $scope.saving = false;
        EventFormData.addImage(mediaObject);
        deferredAddition.resolve(mediaObject);
        $uibModalInstance.close(mediaObject);
      }

      eventCrud
        .addImage(EventFormData, mediaObject)
        .then(updateEventFormAndResolve, displayError);
    }

    MediaManager
      .createImage($scope.selectedFile, description, copyrightHolder, language)
      .then(addImageToEvent, displayError);

    return deferredAddition.promise;
  }

  function allFieldsValid() {
    return $scope.description && $scope.copyright && $scope.selectedFile &&
        $scope.description.length <= 250 && $scope.copyright.length >= 3;
  }
}
EventFormImageUploadController.$inject = ["$scope", "$uibModalInstance", "EventFormData", "eventCrud", "appConfig", "MediaManager", "$q", "copyrightNegotiator", "$translate", "$filter"];
})();

// Source: src/event_form/components/opening-hours-editor/opening-hours-editor.modal.controller.js
(function () {
'use strict';

/**
 * @ngdoc controller
 * @name udb.event-form.controller:OpeningHoursEditorModalController
 * @description
 * # OpeningHoursEditorModalController
 * Controller for editing opening hours
 */
angular
  .module('udb.event-form')
  .controller('OpeningHoursEditorModalController', OpeningHoursEditorModalController);

/* @ngInject */
function OpeningHoursEditorModalController($uibModalInstance, openingHoursCollection) {
  var controller = this;
  var originalOpeningHoursList;

  init(openingHoursCollection);
  controller.saveOpeningHours = saveOpeningHours;
  controller.createNewOpeningHours = createNewOpeningHours;
  controller.removeOpeningHours = removeOpeningHours;
  controller.errors = {};

  function init(openingHoursCollection) {
    originalOpeningHoursList = _.cloneDeep(openingHoursCollection.getOpeningHours());

    if (originalOpeningHoursList.length === 0) {
      openingHoursCollection.createNewOpeningHours();
    }

    controller.openingHoursCollection = openingHoursCollection;
  }

  function saveOpeningHours() {
    clearErrors();
    var errors = controller.openingHoursCollection.validate();

    if (_.isEmpty(errors)) {
      $uibModalInstance.close(controller.openingHoursCollection.serialize());
    } else {
      showErrors(errors);
    }
  }

  /**
   * @param {string[]} errorList
   */
  function showErrors(errorList) {
    controller.errors = errorList;
  }

  function clearErrors() {
    controller.errors = {};
  }

  function createNewOpeningHours() {
    controller.openingHoursCollection.createNewOpeningHours();
  }

  function removeOpeningHours(openingHours) {
    controller.openingHoursCollection.removeOpeningHours(openingHours);
    clearErrors();
  }
}
OpeningHoursEditorModalController.$inject = ["$uibModalInstance", "openingHoursCollection"];
})();

// Source: src/event_form/components/openinghours/opening-hours-data-collection.factory.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.event-form.service:OpeningHoursCollection
 * @description
 * Contains data needed for opening hours.
 */
angular
  .module('udb.event-form')
  .factory('OpeningHoursCollection', OpeningHoursCollectionFactory);

/* @ngInject */
function OpeningHoursCollectionFactory(moment, $translate) {

  var validationRequirements = {
    'openAndClose': opensAndCloses,
    'dayOfWeek': hasDayOfWeek,
    'openIsBeforeClose': openIsBeforeClose
  };

  var weekdays = {
    'monday': {label: translateWeekdayLabel('monday'), name: translateWeekdayName('monday'), open: false},
    'tuesday': {label: translateWeekdayLabel('tuesday'), name: translateWeekdayName('tuesday'), open: false},
    'wednesday': {label: translateWeekdayLabel('wednesday'), name: translateWeekdayName('wednesday'), open: false},
    'thursday': {label: translateWeekdayLabel('thursday'), name: translateWeekdayName('thursday'), open: false},
    'friday': {label: translateWeekdayLabel('friday'), name: translateWeekdayName('friday'), open: false},
    'saturday': {label: translateWeekdayLabel('saturday'), name: translateWeekdayName('saturday'), open: false},
    'sunday': {label: translateWeekdayLabel('sunday'), name: translateWeekdayName('sunday'), open: false}
  };

  function translateWeekdayLabel(day) {
    return $translate.instant('weekdays.' + day + '.label');
  }

  function translateWeekdayName(day) {
    return $translate.instant('weekdays.' + day + '.name');
  }

  /**
   * @param {OpeningHours[]} openingHoursList
   * @returns {boolean}
   */
  function opensAndCloses(openingHoursList) {
    return _.all(_.map(openingHoursList, function (openingHours) {
      return openingHours.opensAsDate instanceof Date && openingHours.closesAsDate instanceof Date;
    }));
  }

  /**
   * @param {OpeningHours[]} openingHoursList
   * @returns {boolean}
   */
  function openIsBeforeClose(openingHoursList) {
    return _.all(_.map(openingHoursList, function (openingHours) {
      return moment(openingHours.opensAsDate).isBefore(openingHours.closesAsDate);
    }));
  }

  /**
   * @param {OpeningHours[]} openingHoursList
   * @returns {boolean}
   */
  function hasDayOfWeek(openingHoursList) {
    return _.all(_.map(openingHoursList, function (openingHours) {
      return !_.isUndefined(_.find(openingHours.dayOfWeek, 'open'));
    }));
  }

  /**
   * @param {OpeningHours[]} openingHoursList
   *
   * @returns {OpeningHours[]}
   */
  function prepareOpeningHoursForDisplay(openingHoursList) {
    angular.forEach (openingHoursList, function(openingHour, key) {
      openingHour.opens = moment(openingHour.opensAsDate).format('HH:mm');
      openingHour.closes = moment(openingHour.closesAsDate).format('HH:mm');
      openingHour.label = _.pluck(_.filter(openingHour.dayOfWeek, 'open'), 'name').join(', ');
    });

    return openingHoursList;
  }

  /**
   * @class OpeningHoursCollection
   */
  var openingHoursCollection = {
    openingHours: [],

    /**
     * Get the opening hours.
     */
    getOpeningHours: function() {
      return this.openingHours;
    },

    /**
     * Set the opening hours.
     */
    setOpeningHours: function(openingHours) {
      this.openingHours = prepareOpeningHoursForDisplay(openingHours);
    },

    /**
     * @param {OpeningHours} openingHours
     */
    removeOpeningHours: function (openingHours) {
      var openingHoursList = this.openingHours;

      this.setOpeningHours(_.without(openingHoursList, openingHours));
    },

    /**
     * Create new opening hours and append them to the list of existing hours.
     */
    createNewOpeningHours: function () {
      var openingHoursList = this.openingHours || [];
      var openingHours = {
        'dayOfWeek': _.cloneDeep(weekdays),
        'opens': '00:00',
        'opensAsDate': new Date(1970, 0, 1),
        'closes': '00:00',
        'closesAsDate': new Date(1970, 0, 1)
      };

      openingHoursList.push(openingHours);

      this.setOpeningHours(openingHoursList);
    },

    /**
     * {object[]} jsonOpeningHoursList
     */
    deserialize: function (jsonOpeningHoursList) {
      this.setOpeningHours(_.map(jsonOpeningHoursList, function (jsonOpeningHours) {
        return {
          'dayOfWeek': _.mapValues(weekdays, function (weekday, day) {
            var dayOfWeek = _.cloneDeep(weekday);
            dayOfWeek.open = _.includes(jsonOpeningHours.dayOfWeek, day);

            return dayOfWeek;
          }),
          'opens': jsonOpeningHours.opens || '00:00',
          'opensAsDate':
            jsonOpeningHours.opens ?
              resetDay(moment(jsonOpeningHours.opens, 'HH:mm')).toDate() :
              new Date(1970, 0, 1),
          'closes': jsonOpeningHours.closes || '00:00',
          'closesAsDate':
            jsonOpeningHours.closes ?
              resetDay(moment(jsonOpeningHours.closes, 'HH:mm')).toDate() :
              new Date(1970, 0, 1)
        };
      }));

      return this;
    },

    serialize: function () {
      return _.map(this.openingHours, function (openingHours) {
        return {
          dayOfWeek: _.keys(omitClosedDays(openingHours.dayOfWeek)),
          opens: moment(openingHours.opensAsDate).format('HH:mm'),
          closes: moment(openingHours.closesAsDate).format('HH:mm')
        };
      });
    },

    /**
     * returns a list of errors
     *
     * @returns {string[]}
     */
    validate: function () {
      var openingHours = this.openingHours;

      return _(validationRequirements)
        .pick(function (requirementCheck) {
          return !requirementCheck(openingHours);
        })
        .keys()
        .value();
    }
  };

  /**
   * Takes a moment object and returns a new one with the day reset to the beginning of unix time.
   *
   * @param {object} moment
   *  a moment object
   * @returns {object}
   */
  function resetDay(moment) {
    return moment.clone().year(1970).dayOfYear(1);
  }

  function omitClosedDays(dayOfWeek) {
    return _.pick(dayOfWeek, function(weekday) {
      return weekday.open;
    });
  }

  return openingHoursCollection;
}
OpeningHoursCollectionFactory.$inject = ["moment", "$translate"];
})();

// Source: src/event_form/components/openinghours/openinghours.component.js
(function () {
'use strict';

/**
 * @typedef {Object} OpeningHours
 * @property {Date} opensAsDate
 * @property {Date} closesAsDate
 * @property {string} opens
 * @property {string} closes
 * @property {string[]} dayOfWeek
 */

angular
  .module('udb.event-form')
  .component('udbEventFormOpeningHours', {
    bindings: {
      openingHoursCollection: '=openingHours',
      formData: '='
    },
    templateUrl: 'templates/event-form-openinghours.html',
    controller: OpeningHourComponentController,
    controllerAs: 'cm'
  });

/**
 * @ngInject
 */
function OpeningHourComponentController($uibModal) {
  var cm = this;

  cm.edit = openEditorModal;

  function openEditorModal() {
    var editorModal = $uibModal.open({
      templateUrl: 'templates/opening-hours-editor.modal.html',
      controller: 'OpeningHoursEditorModalController',
      controllerAs: 'ohemc',
      size: 'lg',
      resolve: {
        openingHoursCollection: function () {
          return angular.copy(cm.openingHoursCollection);
        }
      }
    });

    editorModal.result.then(saveOpeningHours);
  }

  /**
   *
   * @param {OpeningHoursData[]} openingHoursList
   */
  function saveOpeningHours(openingHoursList) {
    cm.formData.saveOpeningHours(openingHoursList);
    cm.openingHoursCollection.deserialize(openingHoursList);
  }
}
OpeningHourComponentController.$inject = ["$uibModal"];
})();

// Source: src/event_form/components/organizer/event-form-organizer-modal.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormOrganizerModalController
 * @description
 * # EventFormOrganizerModalController
 * Modal for adding an organizer.
 */
angular
  .module('udb.event-form')
  .controller('EventFormOrganizerModalController', EventFormOrganizerModalController);

/* @ngInject */
function EventFormOrganizerModalController(
  $scope,
  $uibModalInstance,
  udbOrganizers,
  UdbOrganizer,
  eventCrud,
  $q,
  organizerName,
  OrganizerManager,
  appConfig,
  citiesBE,
  citiesNL
) {

  var controller = this;

  // Scope vars.
  $scope.organizer = organizerName;
  $scope.organizersWebsiteFound = false;
  $scope.organizersFound = false;
  $scope.saving = false;
  $scope.error = false;
  $scope.addressError = false;
  $scope.contactError = false;
  $scope.showWebsiteValidation = false;
  $scope.showValidation = false;
  $scope.organizers = [];
  $scope.selectedCity = '';
  $scope.disableSubmit = true;
  $scope.contactUrlRegex = new RegExp(/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i);
  $scope.newOrganizer = {
    mainLanguage: 'nl',
    website: 'http://',
    name : $scope.organizer,
    address : {
      streetAddress : '',
      addressLocality : '',
      postalCode: '',
      addressCountry : ''
    },
    contact: []
  };

  // Scope functions.
  $scope.cancel = cancel;
  $scope.validateWebsite = validateWebsite;
  $scope.updateName = updateName;
  $scope.validateAddress = validateAddress;
  $scope.validateContact = validateContact;
  $scope.validateNewOrganizer = validateNewOrganizer;
  $scope.selectOrganizer = selectOrganizer;
  $scope.saveOrganizer = saveOrganizer;

  /**
   * Cancel the modal.
   */
  function cancel() {
    $uibModalInstance.dismiss('cancel');
  }

  /**
   * Validate the website of new organizer.
   */
  function validateWebsite() {
    $scope.showWebsiteValidation = true;

    if (!$scope.organizerForm.website.$valid) {
      $scope.showWebsiteValidation = false;
      return;
    }
    udbOrganizers
        .findOrganizersWebsite($scope.newOrganizer.website)
        .then(function (data) {
          // Set the results for the duplicates modal,
          if (data.totalItems > 0) {
            $scope.organizersWebsiteFound = true;
            $scope.firstOrganizerFound = new UdbOrganizer(data.member[0]);
            $scope.showWebsiteValidation = false;
            $scope.disableSubmit = true;
          }
          else {
            $scope.showWebsiteValidation = false;
            $scope.organizersWebsiteFound = false;
            $scope.firstOrganizerFound = '';
            if ($scope.newOrganizer.name) {
              $scope.disableSubmit = false;
            }
          }
        }, function() {
          $scope.websiteError = true;
          $scope.showWebsiteValidation = false;
        });
  }

  /**
   * When the name is changed by a user, submit state needs to be updated also.
   */
  function updateName() {
    if ($scope.newOrganizer.name && !$scope.websiteError) {
      $scope.disableSubmit = false;
    } else {
      $scope.disableSubmit = true;
    }
  }

  function validateAddress(error) {
    $scope.addressError = error;
  }

  function validateContact(error) {
    $scope.contactError = error;
  }

  /**
   * Validate the new organizer.
   */
  function validateNewOrganizer() {

    $scope.showValidation = true;
    // Forms are automatically known in scope.
    if (!$scope.organizerForm.$valid) {
      return;
    }

    $scope.$broadcast('organizerAddressSubmit');
    $scope.$broadcast('organizerContactSubmit');

    // resolve for now, will re-introduce duplicate detection later on
    var promise = $q.resolve([]);

    $scope.error = false;
    $scope.saving = true;

    if ($scope.addressError || $scope.contactError) {
      $scope.error = true;
      $scope.saving = false;
      return;
    }

    promise.then(function (data) {

      // Set the results for the duplicates modal,
      if (data.length > 0) {
        $scope.organizersFound = true;
        $scope.organizers = data;
        $scope.saving = false;
      }
      // or save the event immediately if no duplicates were found.
      else {
        saveOrganizer();
      }

    }, function() {
      $scope.error = true;
      $scope.saving = false;
    });

  }

  /**
   * Select the organizer that should be used.
   */
  function selectOrganizer(organizer) {
    $uibModalInstance.close(organizer);
  }

  /**
   * Save the new organizer in db.
   */
  function saveOrganizer() {

    $scope.saving = true;
    $scope.saveError = false;

    var organizer = _.clone($scope.newOrganizer);
    // remove the address when it's empty
    if (
      !organizer.address.streetAddress &&
      !organizer.address.addressLocality &&
      !organizer.address.postalCode
    ) {
      delete organizer.address;
    }

    eventCrud
      .createOrganizer(organizer)
      .then(function(jsonResponse) {
        var defaultOrganizerLabel = _.get(appConfig, 'offerEditor.defaultOrganizerLabel');
        if (typeof(defaultOrganizerLabel) !== 'undefined' &&
            defaultOrganizerLabel !== '') {
          OrganizerManager
            .addLabelToOrganizer(jsonResponse.data.organizerId, defaultOrganizerLabel);
        }
        $scope.newOrganizer.id = jsonResponse.data.organizerId;
        selectOrganizer($scope.newOrganizer);
        $scope.saving = false;
      }, function() {
        $scope.saveError = true;
        $scope.saving = false;
      });
  }

}
EventFormOrganizerModalController.$inject = ["$scope", "$uibModalInstance", "udbOrganizers", "UdbOrganizer", "eventCrud", "$q", "organizerName", "OrganizerManager", "appConfig", "citiesBE", "citiesNL"];
})();

// Source: src/event_form/components/place/event-form-place-modal.controller.js
(function () {
(function () {
  'use strict';

  /**
   * @ngdoc function
   * @name udbApp.controller:EventFormPlaceModalController
   * @description
   * # EventFormPlaceModalController
   * Modal for adding an place.
   */
  angular
    .module('udb.event-form')
    .controller('EventFormPlaceModalController', EventFormPlaceModalController);

  /* @ngInject */
  function EventFormPlaceModalController(
      $scope,
      $uibModalInstance,
      eventCrud,
      UdbPlace,
      location,
      categories,
      title,
      $translate
  ) {

    $scope.categories = categories;
    $scope.location = location;
    $scope.title = title;

    // Scope vars.
    $scope.newPlace = getDefaultPlace();
    $scope.newPlace.eventType.id = getFirstCategoryId();
    $scope.showValidation = false;
    $scope.invalidStreet = false;
    $scope.invalidNlPostalCode = false;
    $scope.saving = false;
    $scope.error = false;

    // Scope functions.
    $scope.addLocation = addLocation;
    $scope.resetAddLocation = resetAddLocation;
    $scope.translateEventTypes = translateEventTypes;

    /**
     * Get the default Place data
     * @returns {undefined}
     */
    function getDefaultPlace() {
      return {
        name: $scope.title,
        eventType: {
          id: ''
        },
        address: {
          addressCountry: $scope.location.address.addressCountry,
          addressLocality: $scope.location.address.addressLocality,
          postalCode: $scope.location.address.postalCode,
          streetAddress: '',
          locationNumber : ''
        }
      };
    }

    /**
     * Reset the location field(s).
     * @returns {undefined}
     */
    function resetAddLocation() {

      // Clear the current place data.
      $scope.newPlace = getDefaultPlace();

      // Close the modal.
      $uibModalInstance.dismiss();

    }
    /**
     * Adds a location.
     * @returns {undefined}
     */
    function addLocation() {

      // Forms are automatically known in scope.
      $scope.showValidation = true;
      if (!$scope.placeForm.$valid) {
        return;
      }

      if (!validateAddress($scope.newPlace.address.streetAddress)) {
        $scope.error = true;
        $scope.invalidStreet = true;
        return;
      }

      if ($scope.newPlace.address.addressCountry === 'NL') {
        if (!validateNlPostalCode($scope.newPlace.address.postalCode)) {
          $scope.error = true;
          $scope.invalidNlPostalCode = true;
          return;
        }
      }

      savePlace();
    }

    /**
     * Save the new place in db.
     */
    function savePlace() {

      $scope.saving = true;
      $scope.error = false;

      // Convert this place data to a Udb-place.
      var eventTypeLabel = '';
      for (var i = 0; i < $scope.categories.length; i++) {
        if ($scope.categories[i].id === $scope.newPlace.eventType.id) {
          eventTypeLabel = $scope.categories[i].label;
          break;
        }
      }

      var udbPlace = new UdbPlace();
      udbPlace.name = $scope.newPlace.name;
      udbPlace.calendar.calendarType = 'permanent';
      udbPlace.type = {
        id : $scope.newPlace.eventType.id,
        label : eventTypeLabel,
        domain : 'eventtype'
      };
      udbPlace.address = {
        addressCountry : $scope.newPlace.address.addressCountry,
        addressLocality : $scope.newPlace.address.addressLocality,
        postalCode : $scope.newPlace.address.postalCode,
        streetAddress : $scope.newPlace.address.streetAddress
      };
      udbPlace.mainLanguage = $translate.use() || 'nl';

      function showError() {
        $scope.saving = false;
        $scope.error = true;
      }

      function passOnPlaceData(eventFormData) {
        udbPlace.id = eventFormData.id;
        selectPlace(udbPlace);
        $scope.saving = true;
        $scope.error = false;
      }

      eventCrud
        .createOffer(udbPlace)
        .then(passOnPlaceData, showError);
    }

    /**
     * Select the place that should be used.
     *
     * @param {string} place
     *   Name of the place
     */
    function selectPlace(place) {
      $uibModalInstance.close(place);
    }

    /**
     * @return {string}
     */
    function getFirstCategoryId() {
      var sortedCategories = $scope.categories.sort(
        function(a, b) {
          return a.label.localeCompare(b.label);
        });
      return sortedCategories[0].id;
    }

    function getNumberFromStreetAddress(streetAddress) {
      return streetAddress.split(' ').pop();
    }

    function validateAddress(streetAddress) {
      var maximumNumberLength = 15;
      return getNumberFromStreetAddress(streetAddress).length <= maximumNumberLength;
    }

    function validateNlPostalCode(postalCode) {
      var regex = new RegExp(/^[0-9]{4}[a-z]{2}$/i);
      return regex.test(postalCode);
    }

    function translateEventTypes(type) {
      return $translate.instant('offerTypes.' + type);
    }
  }
  EventFormPlaceModalController.$inject = ["$scope", "$uibModalInstance", "eventCrud", "UdbPlace", "location", "categories", "title", "$translate"];

})();
})();

// Source: src/event_form/components/price-form-modal/price-form-modal.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:PriceFormModalController
 * @description
 * # PriceFormModalController
 * Modal for adding and editing prices.
 */
angular
  .module('udb.event-form')
  .controller('PriceFormModalController', PriceFormModalController);

/* @ngInject */
function PriceFormModalController(
  $uibModalInstance,
  EventFormData,
  price,
  $filter,
  $scope
) {
  var pfmc = this;
  var originalPrice = [];

  pfmc.unsetPriceItemFree = unsetPriceItemFree;
  pfmc.setPriceItemFree = setPriceItemFree;
  pfmc.deletePriceItem = deletePriceItem;
  pfmc.showPriceDelete = showPriceDelete;
  pfmc.addPriceItem = addPriceItem;
  pfmc.cancelEditPrice = cancelEditPrice;
  pfmc.validatePrice = validatePrice;

  function init() {
    pfmc.mainLanguage = EventFormData.mainLanguage;
    pfmc.price = angular.copy(price);
    originalPrice = angular.copy(price);

    if (pfmc.price.length === 0) {
      var name = {};
      name[pfmc.mainLanguage] = 'Basistarief';
      var priceItem = {
        category: 'base',
        name: name,
        priceCurrency: 'EUR',
        price: ''
      };
      pfmc.price.push(priceItem);
    } else {
      angular.forEach(pfmc.price, function(info) {
        info.price = $filter('currency')(info.price, ',', 0);
      });
    }

    pfmc.priceError = false;
    pfmc.invalidPrice = false;
    pfmc.savingPrice = false;
    pfmc.formPriceSubmitted = false;
  }

  init();

  function unsetPriceItemFree(key) {
    pfmc.price[key].price = '';
  }

  function setPriceItemFree(key) {
    pfmc.price[key].price = '0,00';
    pfmc.priceForm.$setDirty();
  }

  function deletePriceItem(key) {
    pfmc.price.splice(key, 1);
    pfmc.priceForm.$setDirty();
  }

  function showPriceDelete(key) {
    return key !== 0;
  }

  function addPriceItem() {
    var priceItem = {
      category: 'tariff',
      name: {},
      priceCurrency: 'EUR',
      price: ''
    };
    priceItem.name[pfmc.mainLanguage] = '';
    pfmc.price.push(priceItem);
  }

  function cancelEditPrice() {
    pfmc.price = angular.copy(originalPrice);
    originalPrice = [];

    pfmc.invalidPrice = false;
    pfmc.priceError = false;
    pfmc.formPriceSubmitted = false;

    $uibModalInstance.dismiss('cancel');
  }

  function validatePrice() {
    pfmc.formPriceSubmitted = true;
    if (pfmc.priceForm.$valid) {
      pfmc.priceError = false;
      pfmc.invalidPrice = false;
      save();
    }
    else {
      pfmc.invalidPrice = true;
    }
  }

  function save() {
    angular.forEach(pfmc.price, function(info) {
      info.price = parseFloat(info.price.replace(',', '.'));
    });
    EventFormData.priceInfo = pfmc.price;
    $uibModalInstance.close();
  }

}
PriceFormModalController.$inject = ["$uibModalInstance", "EventFormData", "price", "$filter", "$scope"];
})();

// Source: src/event_form/components/price-info/price-info.component.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormPriceInfoController
 * @description
 * # EventFormImageUploadController
 * Modal for setting the reservation period.
 */
angular
  .module('udb.event-form')
  .component('priceInfo', {
    templateUrl: 'templates/priceInfo.html',
    controller: PriceInfoComponent,
    bindings: {
      price: '<',
      eventId: '<',
      organizer: '<'
    }
  });

/* @ngInject */
function PriceInfoComponent($uibModal, EventFormData, eventCrud, $rootScope, udbUitpasApi, $translate) {

  var controller = this;
  controller.mainLanguage = EventFormData.mainLanguage;

  controller.setPriceFree = setPriceFree;
  controller.changePrice = changePrice;
  controller.openModal = openModal;
  controller.$onInit = init;

  function setPriceFree() {

    if (controller.price.length === 0) {
      var language = controller.mainLanguage;
      var priceObjectName = {};
      $translate('prices.base').then(function (translations) {
        priceObjectName[language] = translations;
        controller.price = [
          {
            category: 'base',
            name: priceObjectName,
            priceCurrency: 'EUR',
            price: 0
          }
        ];

        EventFormData.priceInfo = controller.price;

        var promise = eventCrud.updatePriceInfo(EventFormData);
        promise.then(function() {
          $rootScope.$emit('eventFormSaved', EventFormData);
          if (!_.isEmpty(controller.price)) {
            controller.priceCssClass = 'state-complete';
          }
        });
      });
    }
  }

  function changePrice() {
    if (controller.organizer && controller.price.length > 0) {
      // check ticketsales
      udbUitpasApi.getTicketSales(controller.eventId, controller.organizer).then(function(hasTicketSales) {
        if (hasTicketSales) {
          controller.hasTicketSales = hasTicketSales;
        } else {
          openModal();
        }
      }, function() {
        controller.hasUitpasError = true;
      });
    }
    else {
      openModal();
    }
  }

  function openModal() {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/price-form-modal.html',
      controller: 'PriceFormModalController',
      controllerAs: 'pfmc',
      size: 'lg',
      resolve: {
        price: function () {
          return controller.price;
        }
      }
    });

    modalInstance.result.then(savePrice, cancelPrice);
  }

  function init() {
    controller.price = EventFormData.priceInfo;

    if (controller.price.length) {
      controller.priceCssClass = 'state-complete';
    }
    else {
      controller.priceCssClass = '';
    }
  }

  function savePrice() {
    controller.savingPrice = true;
    controller.price = EventFormData.priceInfo;

    controller.editPrice = false;

    var promise = eventCrud.updatePriceInfo(EventFormData);
    promise.then(function() {
      $rootScope.$emit('eventFormSaved', EventFormData);
      if (!_.isEmpty(controller.price)) {
        controller.priceCssClass = 'state-complete';
      }
      controller.savingPrice = false;
      controller.formPriceSubmitted = false;
    }, function () {
      controller.priceError = true;
      controller.savingPrice = false;
      controller.formPriceSubmitted = false;
    });
  }

  function cancelPrice() {
    controller.price = EventFormData.priceInfo;
  }
}
PriceInfoComponent.$inject = ["$uibModal", "EventFormData", "eventCrud", "$rootScope", "udbUitpasApi", "$translate"];
})();

// Source: src/event_form/components/publish-modal/event-form-publish-modal.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormPublishModalController
 * @description
 * # EventFormPublishModalController
 * Modal for postponing a publish.
 */
angular
  .module('udb.event-form')
  .controller('EventFormPublishModalController', EventFormPublishModalController);

/* @ngInject */
function EventFormPublishModalController($uibModalInstance, eventFormData, publishEvent) {
  var efpmc = this;
  efpmc.error = '';
  efpmc.hasPublicationDate = false;
  efpmc.publicationDate = eventFormData.availableFrom;
  efpmc.maxDate = moment(eventFormData.getFirstStartDate()).subtract(1, 'days').toDate();
  efpmc.opened = false;
  efpmc.dismiss = dismiss;
  efpmc.savePublicationDate = savePublicationDate;
  efpmc.onFocus = onFocus;
  efpmc.toggleDatePicker = toggleDatePicker;

  var tomorrow = moment()
    .add(1, 'days')
    .startOf('day')
    .toDate();

  efpmc.drp = {
    dateFormat: 'dd/MM/yyyy',
    startOpened: false,
    options: {
      minDate: tomorrow,
      maxDate: efpmc.maxDate,
      showWeeks: false
    }
  };

  function toggleDatePicker() {
    efpmc.opened = !efpmc.opened;
  }

  function dismiss() {
    $uibModalInstance.dismiss();
  }

  function onFocus() {
    efpmc.drp.startOpened = !efpmc.drp.startOpened;
  }

  function savePublicationDate() {
    if (!efpmc.publicationDate) {
      efpmc.error = 'empty';
    } else if (tomorrow <= efpmc.publicationDate) {
      eventFormData.availableFrom = new Date(efpmc.publicationDate.getFullYear(), efpmc.publicationDate.getMonth(),
      efpmc.publicationDate.getDate(), 0, 0, 0);
      publishEvent();
      $uibModalInstance.close();
    } else {
      efpmc.error = 'past';
    }
  }

}
EventFormPublishModalController.$inject = ["$uibModalInstance", "eventFormData", "publishEvent"];
})();

// Source: src/event_form/components/reservation-period/reservation-period.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:ReservationPeriodController
 * @description
 * # ReservationPeriodController
 */
angular
  .module('udb.event-form')
  .controller('ReservationPeriodController', ReservationPeriodController);

/* @ngInject */
function ReservationPeriodController($scope, EventFormData, $rootScope) {

  var controller = this;

  $scope.haveBookingPeriod = false;
  $scope.availabilityStarts = '';
  $scope.availabilityEnds = '';
  $scope.errorMessage = '';
  $scope.popup1 = {
    opened: false
  };

  $scope.popup2 = {
    opened: false
  };

  $scope.validateBookingPeriod = validateBookingPeriod;
  $scope.saveBookingPeriod = saveBookingPeriod;
  $scope.deleteBookingPeriod = deleteBookingPeriod;
  $scope.changeHaveBookingPeriod = changeHaveBookingPeriod;
  $scope.initBookingPeriodForm = initBookingPeriodForm;

  // Options for the datepicker
  $scope.dateOptions = {
    formatYear: 'yyyy',
    maxDate: new Date(2020, 5, 22),
    minDate: new Date(),
    startingDay: 1
  };

  initBookingPeriodForm();

  function validateBookingPeriod() {
    if ($scope.availabilityStarts > $scope.availabilityEnds) {
      $scope.errorMessage = 'De gekozen einddatum moet na de startdatum vallen.';
      return;
    }
    $scope.errorMessage = '';
    saveBookingPeriod();
  }

  function saveBookingPeriod() {
    if (moment($scope.availabilityStarts).isValid() && moment($scope.availabilityEnds).isValid()) {
      EventFormData.bookingInfo.availabilityStarts = moment($scope.availabilityStarts).format();
      EventFormData.bookingInfo.availabilityEnds = moment($scope.availabilityEnds).format();
    } else {
      EventFormData.bookingInfo.availabilityStarts = '';
      EventFormData.bookingInfo.availabilityEnds = '';
    }

    $scope.onBookingPeriodSaved();
  }

  function deleteBookingPeriod() {
    $scope.availabilityStarts = '';
    $scope.availabilityEnds = '';
    $scope.haveBookingPeriod = false;
    saveBookingPeriod();
  }

  function changeHaveBookingPeriod() {
    if (!$scope.haveBookingPeriod) {
      $scope.haveBookingPeriod = true;
    }
  }

  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };

  $scope.open2 = function() {
    $scope.popup2.opened = true;
  };

  function initBookingPeriodForm() {
    if (EventFormData.bookingInfo.availabilityStarts ||
      EventFormData.bookingInfo.availabilityEnds) {
      $scope.haveBookingPeriod = true;
    }

    if (EventFormData.bookingInfo.availabilityStarts) {
      $scope.availabilityStarts = new Date(EventFormData.bookingInfo.availabilityStarts);
    }
    else {
      $scope.availabilityStarts = new Date();
    }

    if (EventFormData.bookingInfo.availabilityEnds) {
      $scope.availabilityEnds = new Date(EventFormData.bookingInfo.availabilityEnds);
    }
    else {
      $scope.availabilityEnds = new Date();
    }
  }
}
ReservationPeriodController.$inject = ["$scope", "EventFormData", "$rootScope"];
})();

// Source: src/event_form/components/reservation-period/reservation-period.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.event_form.directive:udbReservationPeriod
 * @description
 * # reservation period selection for event form
 */
angular
  .module('udb.event-form')
  .directive('udbReservationPeriod', ReservationPeriodDirective);

/* @ngInject */
function ReservationPeriodDirective() {

  return {
    restrict: 'AE',
    scope: {
      onBookingPeriodSaved: '&'
    },
    controller: 'ReservationPeriodController',
    templateUrl: 'templates/reservation-period.html'
  };

}
})();

// Source: src/event_form/components/save-time-tracker/save-time-tracker.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:udbEventFormSaveTimeTracker
 * @description
 * Tracks the time of when an event form was last saved.
 */
angular
  .module('udb.event-form')
  .directive('udbEventFormSaveTimeTracker', TimeTrackerDirective);

/* @ngInject */
function TimeTrackerDirective($rootScope) {

  var template =
    '<div class="save-time-tracker small" ng-if="::timeLastSaved">' +
    '<span translate-once="eventForm.timeTracker.automatic_saved"></span> ' +
    '<span class="time-last-saved" ng-bind="timeLastSaved | date:\'HH:mm\'"></span> ' +
    '<span translate-once="eventForm.timeTracker.hour"></span>' +
    '</div>';

  return {
    template: template,
    restrict: 'EA',
    link: link
  };

  function link(scope) {
    scope.timeLastSaved = undefined;

    function refreshTimeLastSaved() {
      scope.timeLastSaved = new Date();
    }

    var eventFormSavedListener = $rootScope.$on('eventFormSaved', refreshTimeLastSaved);
    scope.$on('$destroy', eventFormSavedListener);
  }
}
TimeTrackerDirective.$inject = ["$rootScope"];
})();

// Source: src/event_form/components/suggestions/event-preview.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:udbEventPreview
 * @description
 *  Previews an event provided by a result viewer.
 */
angular
  .module('udb.event-form')
  .directive('udbEventPreview', udbEventPreview);

/* @ngInject */
function udbEventPreview() {
  var eventPreviewDirective = {
    restrict: 'AE',
    controller: 'OfferController',
    controllerAs: 'eventCtrl',
    templateUrl: 'templates/event-preview.directive.html'
  };

  return eventPreviewDirective;
}
})();

// Source: src/event_form/components/suggestions/event-suggestion.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:udbEventSuggestion
 * @description
 *  Displays the event suggestions provided by a result viewer.
 */
angular
  .module('udb.event-form')
  .directive('udbEventSuggestion', udbEventSuggestion);

/* @ngInject */
function udbEventSuggestion() {
  var eventSuggestionDirective = {
    restrict: 'AE',
    controller: 'OfferController',
    controllerAs: 'eventCtrl',
    templateUrl: 'templates/event-suggestion.directive.html'
  };

  return eventSuggestionDirective;
}
})();

// Source: src/event_form/components/suggestions/place-preview.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:udbPlacePreview
 * @description
 *  Previews a place provided by a result viewer.
 */
angular
  .module('udb.event-form')
  .directive('udbPlacePreview', udbPlacePreview);

/* @ngInject */
function udbPlacePreview() {
  var placePreviewDirective = {
    restrict: 'AE',
    controller: 'OfferController',
    controllerAs: 'placeCtrl',
    templateUrl: 'templates/place-preview.directive.html'
  };

  return placePreviewDirective;
}
})();

// Source: src/event_form/components/suggestions/place-suggestion.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:udbPlaceSuggestion
 * @description
 * # udbPlaceSuggestion
 */
angular
  .module('udb.event-form')
  .directive('udbPlaceSuggestion', udbPlaceSuggestion);

/* @ngInject */
function udbPlaceSuggestion() {
  var placeSuggestionDirective = {
    restrict: 'AE',
    controller: 'OfferController',
    controllerAs: 'placeCtrl',
    templateUrl: 'templates/place-suggestion.directive.html'
  };

  return placeSuggestionDirective;
}
})();

// Source: src/event_form/components/suggestions/suggestion-preview-modal.controller.js
(function () {
(function () {
  'use strict';

  /**
   * @ngdoc function
   * @name udbApp.controller:SuggestionPreviewModalController
   * @description
   * Provides a controller to preview suggestions
   */
  angular
    .module('udb.event-form')
    .controller('SuggestionPreviewModalController', SuggestionPreviewModalController);

  /* @ngInject */
  function SuggestionPreviewModalController(
    $scope,
    $uibModalInstance,
    selectedSuggestionId,
    resultViewer,
    suggestionType
  ) {

    /**
     * A factory that helps look for the items in a result viewer by id.
     *
     * @param {string} itemId
     *  The UUID of an UDB item.
     *
     * @return {Function}
     *  A function that can be used as a callback that looks through result viewer items
     */
    function itemIdentifier(itemId) {
      return function(item) {
        return item['@id'].indexOf(itemId) !== -1;
      };
    }

    $scope.previousSuggestion = previousSuggestion;
    $scope.nextSuggestion = nextSuggestion;
    $scope.currentSuggestionId = selectedSuggestionId;
    $scope.currentSuggestionIndex = _.findIndex(resultViewer.events, itemIdentifier(selectedSuggestionId));
    $scope.closePreview = closePreview;
    $scope.suggestionCount = resultViewer.totalItems;
    $scope.currentSuggestion = _.find(resultViewer.events, itemIdentifier(selectedSuggestionId));
    $scope.suggestions = resultViewer.events;
    $scope.suggestionType = suggestionType;

    function previousSuggestion() {
      var previousIndex = $scope.currentSuggestionIndex - 1;
      var suggestion = resultViewer.events[previousIndex.toString()];

      if (suggestion) {
        $scope.currentSuggestion = suggestion;
        $scope.currentSuggestionIndex = previousIndex;
      } else {
        closePreview();
      }
    }

    function nextSuggestion() {
      var nextIndex = $scope.currentSuggestionIndex + 1;
      var suggestion = resultViewer.events[nextIndex.toString()];

      if (suggestion) {
        $scope.currentSuggestion = suggestion;
        $scope.currentSuggestionIndex = nextIndex;
      } else {
        closePreview();
      }
    }

    function closePreview() {
      $uibModalInstance.close();
    }

  }
  SuggestionPreviewModalController.$inject = ["$scope", "$uibModalInstance", "selectedSuggestionId", "resultViewer", "suggestionType"];

})();
})();

// Source: src/event_form/components/validators/contact-info-validation.directive.js
(function () {
'use strict';

/**
* @ngdoc directive
* @name udb.event-form.directive:udbContactInfoValidation
* @description
* # directive for contact info validation
*/
angular
  .module('udb.event-form')
  .directive('udbContactInfoValidation', UdbContactInfoValidationDirective);

function UdbContactInfoValidationDirective() {

  var URL_REGEXP = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
  var EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

  return {
    restrict: 'A',
    require: 'ngModel',
    link: link
  };

  function link (scope, elem, attrs, ngModel) {
    // Scope methods.
    scope.loadInfo = loadInfo;
    scope.validateInfo = validateInfo;
    scope.clearInfo = clearInfo;
    scope.infoErrorMessage = '';

    scope.$on('organizerContactRefresh', function() {
      validateInfo();
    });

    function loadInfo() {
      if (ngModel.$modelValue.value !== '') {
        ngModel.$setValidity('contactinfo', true);
        scope.infoErrorMessage = '';
        validateInfo();
      }
    }

    /**
     * Validate the entered info.
     */
    function validateInfo() {

      if (ngModel.$modelValue.value === '' || ngModel.$modelValue.value === undefined) {
        scope.infoErrorMessage = 'Gelieve dit veld niet leeg te laten.';
        ngModel.$setValidity('contactinfo', false);
      }
      else {
        if (ngModel.$modelValue.type === 'email' && !EMAIL_REGEXP.test(ngModel.$modelValue.value)) {
          scope.infoErrorMessage = 'Gelieve een geldig e-mailadres in te vullen.';
          ngModel.$setValidity('contactinfo', false);
        }
        else if (ngModel.$modelValue.type === 'url') {
          var viewValue = ngModel.$viewValue;

          if (!URL_REGEXP.test(viewValue.value)) {
            scope.infoErrorMessage = 'Gelieve een geldige url in te vullen.';
            ngModel.$setValidity('contactinfo', false);
          }
        }
      }
    }

    /**
     * Clear the entered info when switching type.
     */
    function clearInfo() {
      ngModel.$modelValue.value = '';
      ngModel.$modelValue.booking = false;
      scope.infoErrorMessage = '';
      ngModel.$setValidity('contactinfo', true);
    }

  }
}
})();

// Source: src/event_form/copyright-negotiator.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.event-form.copyrightNegotiator
 * @description
 * # copyrightNegotiator
 * Service in the udb.event-form.
 */
angular
  .module('udb.event-form')
  .service('copyrightNegotiator', CopyrightNegotiator);

/* @ngInject */
function CopyrightNegotiator($cookies) {
  var service = this;
  var CookieKey = 'copyright-agreement-confirmed';

  service.confirm = function () {
    var expirationDate = moment().add(1, 'year').toDate();
    var agreement = {
      confirmed: true
    };

    $cookies.putObject(
      CookieKey,
      agreement,
      {
        expires: expirationDate
      }
    );
  };

  service.confirmed = function () {
    var agreement = $cookies.getObject(CookieKey);
    return agreement ? agreement.confirmed : false;
  };
}
CopyrightNegotiator.$inject = ["$cookies"];
})();

// Source: src/event_form/event-form-data.factory.js
(function () {
'use strict';

/**
 * @typedef {Object} EventType
 * @property {string} id
 * @property {string} label
 */

/**
 * @typedef {Object} EventTheme
 * @property {string} id
 * @property {string} label
 */

/**
 * @typedef {Object} MediaObject
 * @property {string} @id
 * @property {string} @type
 * @property {string} id
 * @property {string} url
 * @property {string} thumbnailUrl
 * @property {string} description
 * @property {string} copyrightHolder
 */

/**
 * @typedef {Object} BookingInfo
 * @property {string} url
 * @property {Object} urlLabel
 * @property {string} email
 * @property {string} phone
 */

/**
 * @typedef {Object} OpeningHoursData
 * @property {string} opens
 * @property {string} closes
 * @property {string[]} dayOfWeek
 */

/**
 * @ngdoc service
 * @name udb.core.EventFormData
 * @description
 * Contains data needed for the steps in the event form.
 */
angular
  .module('udb.event-form')
  .factory('EventFormData', EventFormDataFactory);

/* @ngInject */
function EventFormDataFactory(rx, calendarLabels, moment, OpeningHoursCollection, appConfig, $translate) {

  /**
   * @class EventFormData
   */
  var eventFormData = {
    /**
     * Initialize the properties with default data
     */
    init: function() {
      this.apiUrl = '';
      this.isEvent = true; // Is current item an event.
      this.isPlace = false; // Is current item a place.
      this.showStep1 = true;
      this.showStep2 = false;
      this.showStep3 = false;
      this.showStep4 = false;
      this.showStep5 = false;
      this.majorInfoChanged = false;
      // Properties that will be copied to UdbEvent / UdbPlace.
      this.id = '';
      this.mainLanguage = $translate.use() || 'nl';
      this.name = '';
      this.description = {};
      // Events have a location
      this.location = {
        'id' : null,
        'name': '',
        'address': {
          'addressCountry': 'BE',
          'addressLocality': '',
          'postalCode': '',
          'streetAddress': ''
        }
      };
      // Places only have an address
      this.address = {
        'addressCountry': 'BE',
        'addressLocality': '',
        'postalCode': '',
        'streetAddress': ''
      };
      this.place = {};
      /** @type {EventType} */
      this.type = {};
      /** @type {EventTheme} */
      this.theme = {};
      //
      this.calendar = {};
      this.calendar.calendarType = '';
      this.calendar.timeSpans = [];
      this.calendar.openingHours = [];
      //
      this.typicalAgeRange = '';
      this.organizer = {};
      this.contactPoint = {
        url : [],
        phone : [],
        email : []
      };
      this.facilities = [];
      /** @type {BookingInfo} **/
      this.bookingInfo = {};
      /** @type {MediaObject[]} **/
      this.mediaObjects = [];
      this.image = [];
      this.additionalData = {};
      this.priceInfo = [];
      this.workflowStatus = 'DRAFT';
      this.availableFrom = '';
      /**
       * @type {string[]}
       */
      this.labels = [];

      this.audienceType = 'everyone';

      this.timingChanged$ = rx.createObservableFunction(this, 'timingChangedCallback');

    },

    clone: function () {
      var clone = _.cloneDeep(this);
      clone.timingChanged$ = rx.createObservableFunction(clone, 'timingChangedCallback');

      return clone;
    },

    /**
     * Show the given step.
     * @param {number} stepNumber
     */
    showStep: function(stepNumber) {
      this['showStep' + stepNumber] = true;
    },

    /**
     * Hide the given step.
     * @param {number} stepNumber
     */
    hideStep: function (stepNumber) {
      this['showStep' + stepNumber] = false;
    },

    /**
     * Set the name of the offer for a given langcode.
     */
    setName: function(name, langcode) {
      this.name[langcode] = name;
    },

    /**
     * Get the name of the offer for a given langcode.
     */
    getName: function(langcode) {
      return this.name[langcode];
    },

    /**
     * Gets the mainLanguage for a offer.
     */
    getMainLanguage: function() {
      return this.mainLanguage;
    },

    /**
     * Sets the mainLanguage for a offer.
     */
    setMainLanguage: function(langcode) {
      this.mainLanguage = langcode;
    },

    /**
     * Set the description for a given langcode.
     */
    setDescription: function(description, langcode) {
      this.description[langcode] = description;
    },

    /**
     * Get the description for a given langcode.
     */
    getDescription: function(langcode) {
      return this.description[langcode];
    },

    /**
     * Set the event type and clear the selected theme.
     * @param {EventType} eventType
     */
    setEventType: function(eventType) {
      this.type = eventType;
      this.removeTheme();
    },

    removeType: function () {
      this.type = {};
    },

    /**
     * Get the event type.
     * @return {EventType}
     */
    getEventType: function() {
      return this.type;
    },

    /**
     * Get the label for the event type.
     */
    getEventTypeLabel: function() {
      return this.type.label ? this.type.label : '';
    },

    /**
     * Set the theme.
     * @param {EventTheme} theme
     */
    setTheme: function(theme) {
      this.theme = theme;
    },

    removeTheme: function () {
      this.theme = {};
    },

    /**
     * Get the theme.
     * @return {EventTheme}
     */
    getTheme: function() {
      return this.theme;
    },

    /**
     * Get the label for the theme.
     */
    getThemeLabel: function() {
      return this.theme.label ? this.theme.label : '';
    },

    getPeriodicStartDate : function() {
      return this.calendar.startDate;
    },

    setPeriodicStartDate: function(startDate) {
      this.calendar.startDate = startDate;
    },

    getPeriodicEndDate : function() {
      return this.calendar.endDate;
    },

    setPeriodicEndDate: function(endDate) {
      this.calendar.endDate = endDate;
    },

    /**
     * Reset the location.
     */
    resetLocation: function() {
      this.location = {
        'id' : null,
        'name': '',
        'address': {
          'addressCountry': 'BE',
          'addressLocality': '',
          'postalCode': '',
          'streetAddress': ''
        }
      };
    },

    /**
     * Set the location.
     */
    setLocation: function(location) {
      this.location = location;
    },

    /**
     * Get the location.
     */
    getLocation: function() {
      return this.location;
    },

    /**
     * @param {Date|string} start
     * @param {Date|string} end
     *  An empty string when not set.
     */
    addTimeSpan: function(start, end) {
      var allDay = moment(start).format('HH:mm') === '00:00' && moment(end).format('HH:mm') === '23:59';
      this.calendar.timeSpans.push({
        'start': moment(start).toISOString(),
        'end': moment(end).toISOString(),
        'allDay': allDay
      });
    },

    /**
     * Reset the calendar.
     */
    resetCalendar: function() {
      this.calendar.timeSpans = [];
      this.calendar.calendarType = '';
      this.calendar.activeCalendarLabel = '';
      this.calendar.activeCalendarType = '';
    },

    /**
     * Get the earliest date of an offer, or null for permanent events
     */
    getFirstStartDate: function() {
      var firstStartDate = null;
      if (this.calendar.calendarType === 'single' || this.calendar.calendarType === 'multiple') {
        firstStartDate = _.first(this.calendar.timeSpans).start;
      }

      if (eventFormData.calendar.calendarType === 'periodic') {
        firstStartDate = this.calendar.startDate;
      }
      return firstStartDate;
    },

    /**
     * Get the earliest date of an offer, or null for permanent events
     */
    getLastEndDate: function() {
      var lastEndDate = null;
      if (this.calendar.calendarType === 'single' || this.calendar.calendarType === 'multiple') {
        lastEndDate = _.last(this.calendar.timeSpans).end;
      }

      if (eventFormData.calendar.calendarType === 'periodic') {
        lastEndDate = this.calendar.endDate;
      }
      return lastEndDate;
    },

    /**
     * Get the type that will be saved.
     */
    getType: function() {
      return this.isEvent ? 'event' : 'place';
    },

    /**
     * Reset the selected organizers.
     */
    resetOrganizer: function() {
      this.organizer = {};
    },

    /**
     * Reset the contact point.
     */
    resetContactPoint: function() {
      this.contactPoint = {
        url : [],
        phone : [],
        email : []
      };
    },

    /**
     * Sets the booking info array.
     *
     * @param {BookingInfo} bookingInfo
     */
    setBookingInfo : function(bookingInfo) {
      this.bookingInfo = bookingInfo;
    },

    /**
     * Add a new image.
     *
     * @param {MediaObject} mediaObject
     */
    addImage : function(mediaObject) {
      this.mediaObjects = _.union(this.mediaObjects, [mediaObject]);
    },

    /**
     * Edit a media object.
     */
    editMediaObject : function(indexToEdit, url, thumbnailUrl, description, copyrightHolder) {
      this.image[indexToEdit] = {
        url : url,
        thumbnailUrl : thumbnailUrl,
        description : description,
        copyrightHolder : copyrightHolder
      };
      this.image[indexToEdit]['@type'] = 'ImageObject';
    },

    /**
     * Update the info of the given media object.
     * @param {MediaObject} updatedMediaObject
     */
    updateMediaObject: function (updatedMediaObject)  {
      this.mediaObjects = _.map(this.mediaObjects, function (existingMediaObject) {
        var mediaObject;

        if (existingMediaObject['@id'] === updatedMediaObject['@id']) {
          mediaObject = updatedMediaObject;
        } else {
          mediaObject = existingMediaObject;
        }

        return mediaObject;
      });
    },

    /**
     * Remove a media object from this item.
     *
     *@param {MediaObject} mediaObject
     */
    removeMediaObject: function(mediaObject) {
      this.mediaObjects = _.reject(this.mediaObjects, {'@id': mediaObject['@id']});
    },

    /**
     * Select the main image for this item.
     *
     * @param {mediaObject} image
     */
    selectMainImage: function (image) {
      var reindexedMedia = _.without(this.mediaObjects, image);
      reindexedMedia.unshift(image);

      this.mediaObjects = reindexedMedia;
    },

    /**
     * @param {number|undefined} min
     * @param {number|undefined} max
     */
    setTypicalAgeRange: function(min, max) {
      this.typicalAgeRange = (isNaN(min) ? '' : min) + '-' + (isNaN(max) ? '' : max);
    },

    /**
     * Get the typical age range as an object or undefined when no range is set.
     * When the offer is intended for all ages, you do get a range but both min and max will be undefined.
     *
     * @return {{min: number|undefined, max: number|undefined}|undefined}
     */
    getTypicalAgeRange: function () {
      if (_.isEmpty(this.typicalAgeRange)) {
        return;
      }

      var ageRange = {min: undefined, max: undefined};
      var rangeArray = this.typicalAgeRange.split('-');

      if (rangeArray[0]) {ageRange.min =  parseInt(rangeArray[0]);}
      if (rangeArray[1]) {ageRange.max =  parseInt(rangeArray[1]);}

      return ageRange;
    },

    /**
     * Check if the timing of the event is periodic and has a valid range.
     * @return {boolean}
     */
    hasValidPeriodicRange: function () {
      var startDate = this.getPeriodicStartDate();
      var endDate = this.getPeriodicEndDate();

      return this.calendar.calendarType === 'periodic' && !!startDate && !!endDate && startDate < endDate;
    },

    /**
     * Init the calendar for the current selected calendar type.
     */
    initCalendar: function () {
      var formData = this;
      var calendarType = _.findWhere(calendarLabels, {id: formData.calendar.calendarType});
      if (calendarType) {
        this.calendar.activeCalendarLabel = calendarType.label;
        this.calendar.activeCalendarType = formData.calendar.calendarType;
      }
    },

    timingChanged: function () {
      if (this.showStep2) {
        this.showStep(3);
      }
      this.timingChangedCallback(this);
    },

    initOpeningHours: function(openingHours) {
      OpeningHoursCollection.deserialize(openingHours);
    },

    /**
     * Click listener on the calendar type buttons.
     * Activate the selected calendar type.
     */
    setCalendarType: function (type) {
      var formData = this;

      // Check if previous calendar type was the same.
      // If so, we don't need to create new opening hours. Just show the previous entered data.
      if (formData.calendar.calendarType === type) {
        return;
      }

      // A type is chosen, start a complete new calendar, removing old data
      formData.resetCalendar();
      formData.calendar.calendarType = type;

      if (formData.calendar.calendarType === 'single') {
        if (appConfig.calendarHighlight.date) {
          formData.addTimeSpan(
              new Date(appConfig.calendarHighlight.date),
              appConfig.calendarHighlight.startTime || '',
              appConfig.calendarHighlight.startTime ?
                  moment(appConfig.calendarHighlight.date + ' ' +
                      appConfig.calendarHighlight.startTime, 'YYYY-MM-DD HH:mm').toDate() : '',
              appConfig.calendarHighlight.endTime || '',
              appConfig.endTime ?
                  moment(appConfig.calendarHighlight.date + ' ' +
                      appConfig.calendarHighlight.endTime, 'YYYY-MM-DD HH:mm').toDate() : ''
          );
        } else {
          formData.addTimeSpan(moment().startOf('day'), moment().endOf('day'));
        }
        formData.saveTimeSpans(formData.calendar.timeSpans);
      }

      if (formData.calendar.calendarType === 'permanent') {
        formData.calendar.startDate = undefined;
        formData.calendar.endDate = undefined;
        formData.timingChanged();
      }

      if (formData.calendar.calendarType === 'periodic') {
        formData.calendar.startDate = moment().startOf('day').toDate();
        if (appConfig.addOffer.defaultEndPeriod) {
          var defaultEndPeriod = appConfig.addOffer.defaultEndPeriod;
          formData.calendar.endDate =
              moment(formData.calendar.startDate).add(defaultEndPeriod, 'd').startOf('day').toDate();
        } else {
          formData.calendar.endDate = moment().add(1, 'y').startOf('day').toDate();
        }
        formData.timingChanged();
      }

      formData.initCalendar();

      if (formData.id) {
        formData.majorInfoChanged = true;
      }

    },

    /**
     * Check if the given timeSpan is a valid date object.
     * @param {Object} timeSpan
     * @returns {boolean}
     */
    isValidDate: function(timeSpan) {
      return timeSpan instanceof Date;
    },

    /**
     * Toggle the starthour field for given timeSpan.
     * @param {Object} timeSpan
     *   Timespan to change
     */
    toggleStartHour: function(timeSpan) {
      // If we hide the textfield, empty all other time fields.
      if (!timeSpan.showStartHour) {
        timeSpan.start.setHours(0);
        timeSpan.start.setMinutes(0);
        timeSpan.end.setHours(0);
        timeSpan.end.setMinutes(0);
        this.timingChanged();
      }
      else {
        var startHour = moment(timeSpan.date);
        var endHour = moment(timeSpan.date).endOf('day');

        timeSpan.startHour = startHour.format('HH:mm');
        timeSpan.startHourAsDate = startHour.toDate();
        timeSpan.endHour = endHour.format('HH:mm');
        timeSpan.endHourAsDate = endHour.toDate();
        timeSpan.showEndHour = false;
      }
    },

    /**
     * Toggle the endhour field for given timeSpan
     * @param {Object} timeSpan
     *   Timestamp to change
     */
    toggleEndHour: function(timeSpan) {
      var endHourAsDate = timeSpan.date;
      // If we hide the textfield, empty also the input.
      if (!timeSpan.showEndHour) {
        endHourAsDate.setHours(23);
        endHourAsDate.setMinutes(59);

        timeSpan.endHour = '23:59';
        timeSpan.endHourAsDate = endHourAsDate;
        this.timingChanged();
      }
      else {
        var nextThreeHours = moment(timeSpan.startHourAsDate).add(3, 'hours').minutes(0);
        endHourAsDate.setHours(nextThreeHours.hours());
        endHourAsDate.setMinutes(nextThreeHours.minutes());

        timeSpan.endHour = moment(endHourAsDate).format('HH:mm');
        timeSpan.endHourAsDate = endHourAsDate;
      }
    },

    hoursChanged: function (timeSpan) {
      var startHourAsDate;
      var endHourAsDate;
      if (timeSpan.showStartHour || timeSpan.showEndHour) {
        if (timeSpan.showStartHour) {
          if (timeSpan.startHourAsDate !== undefined) {
            startHourAsDate = moment(timeSpan.startHourAsDate);
          }
          else {
            startHourAsDate = moment(timeSpan.startHourAsDate);
            startHourAsDate.hours(0);
            startHourAsDate.minutes(0);
          }
          timeSpan.startHour = startHourAsDate.format('HH:mm');
        }

        if (timeSpan.showEndHour) {
          // if the endhour is invalid, send starthour to backend.
          if (timeSpan.endHourAsDate !== undefined) {
            endHourAsDate = moment(timeSpan.endHourAsDate);
          }
          else {
            endHourAsDate = startHourAsDate;
          }
          timeSpan.endHour = endHourAsDate.format('HH:mm');
        }
        this.timingChanged();
      }
    },

    saveOpeningHours: function (openingHours) {
      this.calendar.openingHours = openingHours;
      this.timingChanged();
    },

    saveTimeSpans: function (timeSpans) {
      this.calendar.timeSpans = timeSpans;
      this.calendar.startDate = this.getFirstStartDate();
      this.calendar.endDate = this.getLastEndDate();
      this.timingChanged();
    },

    periodicTimingChanged: function () {
      var formData = this;

      if (formData.id) {
        //TODO: this was wrapping the code below, not sure why...
      }

      if (formData.hasValidPeriodicRange()) {
        formData.periodicRangeError = false;
        formData.timingChanged();
      } else {
        formData.periodicRangeError = true;
      }
    }
  };

  // initialize the data
  eventFormData.init();

  return eventFormData;
}
EventFormDataFactory.$inject = ["rx", "calendarLabels", "moment", "OpeningHoursCollection", "appConfig", "$translate"];
})();

// Source: src/event_form/event-form.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormController
 * @description
 * # EventFormController
 * Init the event form
 */
angular
  .module('udb.event-form')
  .controller('EventFormController', EventFormController);

/* @ngInject */
function EventFormController(
    $scope,
    offerId,
    EventFormData,
    udbApi,
    moment,
    jsonLDLangFilter,
    $q,
    appConfig,
    $translate
) {

  // Other controllers won't load until this boolean is set to true.
  $scope.loaded = false;
  $scope.showLangWarning = false;

  // Make sure we start off with clean data every time this controller gets called
  EventFormData.init();

  $q.when(offerId)
    .then(fetchOffer, startCreating);

  function startCreating() {

    EventFormData.initOpeningHours([]);

    var calendarConfig = _.get(appConfig, 'calendarHighlight');

    if (EventFormData.isEvent && calendarConfig && calendarConfig.date) {
      preselectDate(calendarConfig);
    }

    $scope.language = EventFormData.mainLanguage;
    $scope.loaded = true;
  }

  function preselectDate(calendarConfig) {
    EventFormData.calendar.calendarType = 'single';
    EventFormData.addTimeSpan(
      calendarConfig.startTime ? moment(calendarConfig.date + ' ' + calendarConfig.startTime, 'YYYY-MM-DD HH:mm') : '',
      calendarConfig.endTime ? moment(calendarConfig.date + ' ' + calendarConfig.endTime, 'YYYY-MM-DD HH:mm') : ''
    );
    EventFormData.initCalendar();
    //EventFormData.showStep(3);
  }

  /**
   * @param {string|null} offerId
   */
  function fetchOffer(offerId) {
    if (!offerId) {
      startCreating();
    } else {
      udbApi
        .getOffer(offerId)
        .then(startEditing);
    }
  }

  /**
   *
   * @param {UdbPlace|UdbEvent} offer
   */
  function startEditing(offer) {
    var offerType = offer.url.split('/').shift();

    if (offerType === 'event') {
      EventFormData.isEvent = true;
      EventFormData.isPlace = false;
      copyItemDataToFormData(offer);

      // Copy location.
      if (offer.location && offer.location.id) {
        var location = jsonLDLangFilter(offer.location, offer.mainLanguage, true);
        EventFormData.location = {
          id : location.id.split('/').pop(),
          name : location.name,
          address : location.address
        };
      }

      EventFormData.audienceType = offer.audience.audienceType;
    }

    if (offerType === 'place') {
      EventFormData.isEvent = false;
      EventFormData.isPlace = true;
      copyItemDataToFormData(offer);

      // Places only have an address
      if (offer.address) {
        var translatedOffer = jsonLDLangFilter(offer, offer.mainLanguage, true);
        EventFormData.address = translatedOffer.address;
      }
    }

    if ($translate.use() !== $scope.language) {
      $scope.showLangWarning = true;
    }
  }

  /**
   * Copy all item data to form data so it can be used for edting.
   * var {UdbEvent|UdbPlace} item
   */
  function copyItemDataToFormData(item) {

    // Properties that exactly match.
    var sameProperties = [
      'id',
      'type',
      'theme',
      'openingHours',
      'description',
      'typicalAgeRange',
      'organizer',
      'bookingInfo',
      'contactPoint',
      'priceInfo',
      'facilities',
      'image',
      'additionalData',
      'apiUrl',
      'workflowStatus',
      'availableFrom',
      'labels',
      'mainLanguage'
    ];

    for (var i = 0; i < sameProperties.length; i++) {
      if (item[sameProperties[i]]) {
        EventFormData[sameProperties[i]] = item[sameProperties[i]];
      }
    }

    if (item.mediaObject) {
      EventFormData.mediaObjects = item.mediaObject || [];

      if (item.image) {
        var mainImage = _.find(EventFormData.mediaObjects, {'contentUrl': item.image});
        EventFormData.selectMainImage(mainImage);
      }
    }

    // 1. Main language is now a required property.
    // Events can be created in a given main language.
    // 2. Previous projections had a default main language of nl.
    // 3. Even older projections had a non-translated name.
    // @todo @mainLanguage after a full replay only case 1 needs to be supported.
    EventFormData.name = _.get(item.name, item.mainLanguage, null) ||
        _.get(item.name, 'nl', null) ||
        _.get(item, 'name', '');

    // Prices tariffs can be translated since III-2545
    // @todo @mainLanguage after a full replay only case 1 needs to be supported.

    if (!_.isEmpty(EventFormData.priceInfo)) {
      if (!EventFormData.priceInfo[0].name.nl && !EventFormData.priceInfo[0].name.en &&
        !EventFormData.priceInfo[0].name.fr && !EventFormData.priceInfo[0].name.de) {
        EventFormData.priceInfo = _.map(EventFormData.priceInfo, function(item) {
          var priceInfoInDutch = _.cloneDeep(item);
          priceInfoInDutch.name = {'nl': item.name};
          item = priceInfoInDutch;
          return item;
        });
      }
    }

    EventFormData.calendar.calendarType = item.calendarType; // === 'multiple' ? 'single' : item.calendarType;

    // Set correct date object for start and end.
    if (item.startDate) {
      EventFormData.calendar.startDate = moment(item.startDate).toDate();
    }

    if (item.endDate) {
      EventFormData.calendar.endDate = moment(item.endDate).toDate();
    }

    // SubEvents are timeSpans.
    if (item.calendarType === 'multiple' && item.subEvent) {
      for (var j = 0; j < item.subEvent.length; j++) {
        var subEvent = item.subEvent[j];
        EventFormData.addTimeSpan(subEvent.startDate, subEvent.endDate);
      }
    }
    else if (item.calendarType === 'single') {
      EventFormData.addTimeSpan(item.startDate, item.endDate);
    }

    if (EventFormData.calendar.calendarType) {
      EventFormData.initCalendar();
    }

    EventFormData.initOpeningHours(_.get(EventFormData, 'openingHours', []));

    $scope.language = EventFormData.mainLanguage;
    $scope.loaded = true;
    EventFormData.showStep(1);
    EventFormData.showStep(2);
    EventFormData.showStep(3);
    EventFormData.showStep(4);
    EventFormData.showStep(5);

  }
}
EventFormController.$inject = ["$scope", "offerId", "EventFormData", "udbApi", "moment", "jsonLDLangFilter", "$q", "appConfig", "$translate"];
})();

// Source: src/event_form/event-form.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:event-form.html
 * @description
 * # udb event form directive
 */
angular
  .module('udb.event-form')
  .directive('udbEventForm', EventFormDirective);

/* @ngInject */
function EventFormDirective() {
  return {
    templateUrl: 'templates/event-form.html',
    restrict: 'EA',
  };
}

/**
 * @ngdoc directive
 * @name udb.search.directive:event-form-extras.html
 * @description
 * # event form extras. Default empty, decorate it to add custom extras.
 */
angular
  .module('udb.event-form')
  .directive('udbEventFormExtras', EventFormExtras);

/* @ngInject */
function EventFormExtras() {
  return {
    template: '',
    restrict: 'EA',
  };
}

/**
 * @ngdoc directive
 * @name udb.search.directive:udbEvent
 * @description
 * # udb search directive
 */
angular
  .module('udb.event-form')
  .directive('udbEventFormStep1', EventFormStep1Directive);

/* @ngInject */
function EventFormStep1Directive() {
  return {
    templateUrl: 'templates/event-form-step1.html',
    restrict: 'EA',
  };
}

/**
 * @ngdoc directive
 * @name udb.search.directive:udbEvent
 * @description
 * # udb search directive
 */
angular
  .module('udb.event-form')
  .directive('udbEventFormStep2', EventFormStep2Directive);

/* @ngInject */
function EventFormStep2Directive() {
  return {
    templateUrl: 'templates/event-form-step2.html',
    restrict: 'EA',
  };
}

/**
 * @ngdoc directive
 * @name udb.search.directive:udbEvent
 * @description
 * # udb search directive
 */
angular
  .module('udb.event-form')
  .directive('udbEventFormStep3', EventFormStep3Directive);

/* @ngInject */
function EventFormStep3Directive() {
  return {
    templateUrl: 'templates/event-form-step3.html',
    restrict: 'EA',
  };
}

/**
 * @ngdoc directive
 * @name udb.search.directive:udbEvent
 * @description
 * # udb search directive
 */
angular
  .module('udb.event-form')
  .directive('udbEventFormStep4', EventFormStep4Directive);

/* @ngInject */
function EventFormStep4Directive() {
  return {
    templateUrl: 'templates/event-form-step4.html',
    restrict: 'EA',
  };
}

/**
 * @ngdoc directive
 * @name udb.search.directive:udbEvent
 * @description
 * # udb search directive
 */
angular
  .module('udb.event-form')
  .directive('udbEventFormStep5', EventFormStep5Directive);

/* @ngInject */
function EventFormStep5Directive() {
  return {
    templateUrl: 'templates/event-form-step5.html',
    restrict: 'EA',
  };
}

/**
 * @ngdoc directive
 * @name udb.event-form.directive:udbEventFormPublish
 * @description
 * # udb event form publish directive
 */
angular
  .module('udb.event-form')
  .directive('udbEventFormPublish', EventFormPublishDirective);

/* @ngInject */
function EventFormPublishDirective() {
  return {
    templateUrl: 'templates/event-form-publish.html',
    restrict: 'EA',
    controller: 'EventFormPublishController',
    controllerAs: 'efpc'
  };
}
})();

// Source: src/event_form/http-prefix.directive.js
(function () {
'use strict';

angular
  .module('udb.event-form')
  .directive('udbHttpPrefix', HttpPrefixDirective);

function HttpPrefixDirective() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, controller) {
      function ensureHttpPrefix(value) {
        // Need to add prefix if we don't have http:// prefix already AND we don't have part of it
        if (value && !/^(https?):\/\//i.test(value) && !isPrefixed(value)) {
          controller.$setViewValue('http://' + value);
          controller.$render();
          return 'http://' + value;
        }
        else {
          return value;
        }
      }

      function isPrefixed(value) {
        return 'http://'.indexOf(value) === 0 || 'https://'.indexOf(value) === 0;
      }

      controller.$formatters.push(ensureHttpPrefix);
      controller.$parsers.splice(0, 0, ensureHttpPrefix);
    }
  };
}
})();

// Source: src/event_form/steps/event-form-publish.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormStep3Controller
 * @description
 * # EventFormStep3Controller
 * Step 3 of the event form
 */
angular
  .module('udb.event-form')
  .controller('EventFormPublishController', EventFormPublishController);

/* @ngInject */
function EventFormPublishController(
    appConfig,
    EventFormData,
    eventCrud,
    OfferWorkflowStatus,
    $q,
    $location,
    $uibModal
) {

  var controller = this;

  controller.publish = publish;
  controller.canPublishLater = canPublishLater;
  controller.publishLater = publishLater;
  controller.preview = preview;
  controller.isDraft = isDraft;
  controller.saving = false;

  // main storage for event form.
  controller.eventFormData = EventFormData;

  var defaultPublicationDate = _.get(appConfig, 'offerEditor.defaultPublicationDate');
  controller.hasNoDefault = isNaN(Date.parse(defaultPublicationDate));
  if (!controller.hasNoDefault && isDraft) {
    controller.eventFormData.availableFrom = defaultPublicationDate;
  }

  function canPublishLater() {
    var tomorrow = moment()
      .add(1, 'days')
      .startOf('day')
      .toDate();

    var startDate = controller.eventFormData.getFirstStartDate();

    if (startDate && startDate < tomorrow) {
      return false;
    }

    return controller.hasNoDefault && isDraft(controller.eventFormData.workflowStatus);
  }

  function publish() {
    controller.saving = true;
    controller.error = '';
    eventCrud
      .publishOffer(EventFormData, controller.eventFormData.availableFrom)
      .then(function() {
        setEventAsReadyForValidation();
        redirectToDetailPage();
      })
      .catch(function () {
        controller.error = 'Dit event kon niet gepubliceerd worden, gelieve later opnieuw te proberen.';
      });
  }

  function publishLater() {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/event-form-publish-modal.html',
      controller: 'EventFormPublishModalController',
      controllerAs: 'efpmc',
      resolve: {
        eventFormData: function () {
          return controller.eventFormData;
        },
        publishEvent : function() {
          return controller.publish;
        }
      }
    });
  }

  function setEventAsReadyForValidation() {
    EventFormData.workflowStatus = OfferWorkflowStatus.READY_FOR_VALIDATION;
    return $q.resolve();
  }

  function redirectToDetailPage() {
    $location.path('/' + EventFormData.getType() + '/' + EventFormData.id + '/published');
  }

  function preview() {
    $location.path('/' + EventFormData.getType() + '/' + EventFormData.id + '/saved');
  }

  function isDraft(status) {
    return (status === OfferWorkflowStatus.DRAFT);
  }
}
EventFormPublishController.$inject = ["appConfig", "EventFormData", "eventCrud", "OfferWorkflowStatus", "$q", "$location", "$uibModal"];
})();

// Source: src/event_form/steps/event-form-step1.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormStep1Controller
 * @description
 * # EventFormStep1Controller
 * Step 1 of the event form
 */
angular
  .module('udb.event-form')
  .controller('EventFormStep1Controller', EventFormStep1Controller);
// .filter('groupBy', GroupByFilter);

/* @ngInject */
function EventFormStep1Controller($scope, $rootScope, EventFormData, eventCategories, placeCategories, $translate) {

  var controller = this;

  // main storage for event form.
  $scope.eventFormData = EventFormData;

  // Categories, event types, places.
  $scope.eventTypeLabels = eventCategories;
  $scope.placeLabels = placeCategories;

  $scope.canRefine = false;
  $scope.canRefineByGroups = false;
  $scope.showAllEventTypes = false;
  $scope.showAllPlaces = false;
  $scope.eventThemeLabels = [];
  $scope.eventGroupLabels = [];

  $scope.activeEventType = '';
  $scope.activeEventTypeLabel = '';
  $scope.activeTheme = '';
  $scope.activeThemeLabel = '';

  $scope.splitTypes = true;

  /**
   * Update the event type and theme picker.
   * @param {EventFormData} eventFormData
   */
  controller.updateEventTypeAndThemePicker = function (eventFormData) {
    var eventTypeId = eventFormData.getEventType().id;
    var eventThemeId = eventFormData.getTheme().id;

    var eventTypes = _.union(eventCategories, placeCategories);
    var type = _.findWhere(eventTypes, {id: eventTypeId});
    var theme;

    if (type) {
      $scope.activeEventType = type.id;
      $scope.activeEventTypeLabel = $translate.instant('offerTypes.' + type.label);
      $scope.eventThemeLabels = type.themes;
      $scope.eventGroupLabels = type.groups;

      if (type.themes) {
        theme = _.findWhere(type.themes, {id: eventThemeId});
      }

      if (type.groups) {
        var selectedGroup = _.find(type.groups, function(group) {
          return _.where(group.themes, {id: eventThemeId}).length > 0;
        });
        if (selectedGroup) {
          theme = _.findWhere(selectedGroup.themes, {id: eventThemeId});
        }
      }
    } else {
      $scope.activeEventType = '';
      $scope.activeEventTypeLabel = '';
    }

    if (theme) {
      $scope.activeTheme = theme.id;
      $scope.activeThemeLabel = $translate.instant('offerThemes.' + theme.label);
    } else {
      $scope.activeTheme = '';
      $scope.activeThemeLabel = '';
    }

    $scope.canRefine = type && !_.isEmpty(type.themes) && !theme;

    $scope.canRefineByGroups = type && !_.isEmpty(type.groups) && !theme;

  };

  /**
   * Click listener on the event type buttons.
   * Activate the selected event type.
   */
  function setEventType(eventType, isEvent) {
    // Check if previous event type was the same.
    // If so, just show the previous entered data.
    if (EventFormData.id === eventType.id) {
      return;
    }

    $scope.activeEventType = eventType.id;

    // User selected an event.
    if (isEvent) {
      EventFormData.isEvent = true;
      EventFormData.isPlace = false;
    }
    // User selected a place.
    else {

      // Reset calendar if user switched to permanent.
      if (EventFormData.calendar.calendarType !== 'permanent') {
        EventFormData.resetCalendar();
      }

      EventFormData.isEvent = false;
      EventFormData.isPlace = true;

      // Places are default permanent. Users should not see a selection.
      EventFormData.calendar.calendarType = 'permanent';
    }

    EventFormData.setEventType(eventType);

    // Keep track of changes.
    if (EventFormData.id) {
      $rootScope.$emit('eventTypeChanged', EventFormData);
    }

    controller.updateEventTypeAndThemePicker(EventFormData);

    EventFormData.showStep(2);
    EventFormData.showStep(3);
  }

  /**
   * Click listener to reset the event type. User can select a new event type.
   */
  controller.resetEventType = function () {
    EventFormData.removeType();
    controller.updateEventTypeAndThemePicker(EventFormData);
  };

  /**
   * Click listener to set the active theme.
   * @param {EventTheme} theme
   */
  function setTheme(theme) {
    // Check if previous event theme was the same.
    // If so, just show the previous entered data.
    if (EventFormData.getTheme().id === theme.id) {
      return;
    }

    EventFormData.setTheme(theme);
    EventFormData.showStep(2);
    controller.updateEventTypeAndThemePicker(EventFormData);
    controller.eventThemeChanged(EventFormData);
  }

  /**
   * Reset the active theme which in turns updates the data to render the picker and notifies other components.
   */
  controller.resetTheme = function() {
    EventFormData.removeTheme();
    controller.updateEventTypeAndThemePicker(EventFormData);
    controller.eventThemeChanged(EventFormData);
  };

  controller.eventThemeChanged = function(EventFormData) {
    if (EventFormData.id) {
      $rootScope.$emit('eventThemeChanged', EventFormData);
    }
  };

  /**
   * Click listener to toggle the event types list.
   */
  function toggleEventTypes() {
    $scope.showAllEventTypes = !$scope.showAllEventTypes;
  }

  /**
   * Click listener to toggle th places list.
   */
  function togglePlaces() {
    $scope.showAllPlaces = !$scope.showAllPlaces;
  }

  $scope.setEventType = setEventType;
  $scope.resetEventType = controller.resetEventType;
  $scope.toggleEventTypes = toggleEventTypes;
  $scope.togglePlaces = togglePlaces;
  $scope.setTheme = setTheme;
  $scope.resetTheme = controller.resetTheme;

  controller.init = function (EventFormData) {
    if (EventFormData.id) {
      controller.updateEventTypeAndThemePicker(EventFormData);
      $scope.splitTypes = false;
    }

    if (_.where($scope.eventTypeLabels, {primary: true}).length === $scope.eventTypeLabels.length) {
      $scope.showAllEventTypes = true;
    }

    if (_.where($scope.placeLabels, {primary: true}).length === $scope.placeLabels.length) {
      $scope.showAllPlaces = true;
    }
  };

  $scope.translateOfferTypes = function (type) {
    return $translate.instant('offerTypes.' + type);
  };

  $scope.translateOfferThemes = function (theme) {
    return $translate.instant('offerThemes.' + theme);
  };

  $scope.translateOfferThemesGroups = function (group) {
    return $translate.instant('offerThemesGroups.' + group);
  };

  controller.init(EventFormData);
}
EventFormStep1Controller.$inject = ["$scope", "$rootScope", "EventFormData", "eventCategories", "placeCategories", "$translate"];
})();

// Source: src/event_form/steps/event-form-step2.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormStep2Controller
 * @description
 * # EventFormStep2Controller
 * Step 2 of the event form
 */
angular
  .module('udb.event-form')
  .controller('EventFormStep2Controller', EventFormStep2Controller);

/* @ngInject */
function EventFormStep2Controller($scope, $rootScope, EventFormData) {
  var controller = this;

  // Scope vars.
  // main storage for event form.
  $scope.eventFormData = EventFormData;

  /**
   * Mark the major info as changed.
   */
  controller.eventTimingChanged = function() {
    if (EventFormData.id) {
      $rootScope.$emit('eventTimingChanged', EventFormData);
    }
  };

  EventFormData
    .timingChanged$
    .subscribe(controller.eventTimingChanged);
}
EventFormStep2Controller.$inject = ["$scope", "$rootScope", "EventFormData"];
})();

// Source: src/event_form/steps/event-form-step3.controller.js
(function () {
'use strict';

/**
 * @typedef {Object} City
 * @property {string} zip
 * @property {string} name
 */

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormStep3Controller
 * @description
 * # EventFormStep3Controller
 * Step 3 of the event form
 */
angular
  .module('udb.event-form')
  .controller('EventFormStep3Controller', EventFormStep3Controller);

/* @ngInject */
function EventFormStep3Controller(
    $scope,
    EventFormData,
    cityAutocomplete,
    placeCategories,
    $uibModal,
    citiesBE,
    citiesNL,
    Levenshtein,
    eventCrud,
    $rootScope,
    $translate,
    jsonLDLangFilter,
    appConfig
) {

  var controller = this;

  function getEmptyLocation() {
    var emptyLocation = {
      'id' : null,
      'name': '',
      'address': {
        'addressCountry': '',
        'addressLocality': '',
        'postalCode': '',
        'streetAddress': ''
      }
    };

    return _.cloneDeep(emptyLocation);
  }

  var language = $translate.use() || 'nl';

  // Scope vars.
  // main storage for event form.
  $scope.eventFormData = EventFormData;

  $scope.categories = placeCategories;

  // Autocomplete model field for the City/Postal code.
  $scope.cityAutocompleteTextField = '';

  // Autocomplete model field for the Location.
  $scope.locationAutocompleteTextField = '';

  $scope.availableCountries = appConfig.offerEditor.countries;
  $scope.defaultCountry = _.find($scope.availableCountries, function(country) { return country.default; });
  $scope.selectedCountry = $scope.defaultCountry;

  // Autocomplete helper vars.
  $scope.searchingCities = false;
  $scope.cityAutoCompleteError = false;
  $scope.loadingPlaces = false;
  $scope.locationAutoCompleteError = false;
  $scope.locationsSearched = false;

  $scope.selectedCity = '';
  $scope.selectedLocation = undefined;
  $scope.placeStreetAddress = '';
  $scope.newPlaceStreetAddress = '';
  $scope.openPlaceModal = openPlaceModal;

  // Validation.
  $scope.showValidation = false;
  $scope.showStreetValidation = false;
  $scope.showZipValidation = false;

  // Convenient scope variables for current controller (in multistep).
  $scope.locationsForCity = [];

  // Scope functions.

  $scope.cities = $scope.selectedCountry.code === 'BE' ? citiesBE : citiesNL;

  $scope.changeCountrySelection = changeCountrySelection;
  $scope.changeCitySelection = changeCitySelection;
  $scope.changeLocationSelection = changeLocationSelection;
  $scope.setPlaceStreetAddress = setPlaceStreetAddress;
  $scope.setNLPlaceStreetAddress = setNLPlaceStreetAddress;
  $scope.changePlaceStreetAddress = changePlaceStreetAddress;
  $scope.resetStreetValidation = resetStreetValidation;
  $scope.resetZipValidation = resetZipValidation;
  $scope.setMajorInfoChanged = setMajorInfoChanged;
  $scope.filterCities = function(value) {
    return function (city) {
      var length = value.length;
      var words = value.match(/.+/g);
      var labelMatches = words.filter(function (word) {
        return city.label.toLowerCase().indexOf(word.toLowerCase()) !== -1;
      });

      return labelMatches.length >= words.length;
    };
  };
  $scope.orderByLevenshteinDistance = function(value) {
    return function (city) {
      return new Levenshtein(value, city.label);
    };
  };

  /**
   * @param {City} city
   * @param {string} $label
   */
  controller.selectCity = function (city, $label) {

    var zipcode = city.zip,
        name = city.name;

    var newAddressInfo = {
      postalCode: zipcode,
      addressLocality: name,
      addressCountry: $scope.selectedCountry.code
    };

    if (EventFormData.isPlace) {
      var currentAddress = $scope.eventFormData.address;
      $scope.eventFormData.address = _.merge(getEmptyLocation().address, currentAddress, newAddressInfo);
    } else { //assume an event
      var newLocationInfo = {address: newAddressInfo};
      var currentLocation = $scope.eventFormData.getLocation();
      var newLocation = _.merge(getEmptyLocation(), currentLocation, newLocationInfo);
      EventFormData.setLocation(newLocation);
    }

    $scope.cityAutocompleteTextField = '';
    $scope.selectedCity = $label;
    $scope.selectedLocation = undefined;

    setMajorInfoChanged();

    controller.getLocations(city);
  };
  $scope.selectCity = controller.selectCity;

  /**
   * Change a city selection.
   */
  function changeCitySelection() {
    EventFormData.resetLocation();
    $scope.selectedCity = '';
    $scope.placeStreetAddress = '';
    $scope.cityAutocompleteTextField = '';
    $scope.locationsSearched = false;
    $scope.locationAutocompleteTextField = '';
    controller.stepUncompleted();
  }

  /**
   * Change a country selection.
   */
  function changeCountrySelection() {
    if ($scope.selectedCountry.code === 'NL') {
      $scope.cities = citiesNL;
    }
    else {
      $scope.cities = citiesBE;
    }
    changeCitySelection();
  }

  /**
   * Select location.
   * @returns {undefined}
   */
  controller.selectLocation = function ($item, $model, $label) {

    var selectedLocation = _.find($scope.locationsForCity, function (location) {
      return location.id === $model;
    });

    // Assign selection, hide the location field and show the selection.
    $scope.selectedLocation = selectedLocation;
    $scope.locationAutocompleteTextField = '';

    var location = EventFormData.getLocation();
    location.id = $model;
    location.name = $label;
    location.address = selectedLocation.address;
    EventFormData.setLocation(location);

    controller.stepCompleted();
    setMajorInfoChanged();
    $rootScope.$emit('locationSelected', location);

  };
  $scope.selectLocation = controller.selectLocation;

  /**
   * Change selected location.
   * @returns {undefined}
   */
  function changeLocationSelection() {

    // Reset only the location data of the location.
    var location = EventFormData.getLocation();
    location.id = '';
    location.name = '';
    var city = {};
    city.zip = location.address.postalCode;
    city.name = location.address.addressLocality;
    EventFormData.setLocation(location);

    $scope.selectedLocation = false;
    $scope.locationAutocompleteTextField = '';
    $scope.locationsSearched = false;

    controller.stepUncompleted();
    controller.getLocations(city);
  }

  /**
   * Get locations for Event.
   * @returns {undefined}
   * @param {Object} city
   */
  controller.getLocations = function (city) {

    function showErrorAndReturnEmptyList () {
      $scope.locationAutoCompleteError = true;
      return [];
    }

    function updateLocationsAndReturnList (locations) {
      // Loop over all locations to check if location is translated.
      _.each(locations, function(location, key) {
        locations[key] = jsonLDLangFilter(locations[key], language, true);
      });
      $scope.locationsForCity = locations;
      return locations;
    }

    function clearLoadingState() {
      $scope.locationsSearched = false;
      $scope.loadingPlaces = false;
    }

    $scope.loadingPlaces = true;
    $scope.locationAutoCompleteError = false;

    if ($scope.selectedCountry.code === 'BE') {
      return cityAutocomplete
        .getPlacesByZipcode(city.zip, 'BE')
        .then(updateLocationsAndReturnList, showErrorAndReturnEmptyList)
        .finally(clearLoadingState);
    }
    if ($scope.selectedCountry.code === 'NL') {
      return cityAutocomplete
        .getPlacesByCity(city.label, 'NL')
        .then(updateLocationsAndReturnList, showErrorAndReturnEmptyList)
        .finally(clearLoadingState);
    }
  };

  controller.cityHasLocations = function () {
    return $scope.locationsForCity instanceof Array && $scope.locationsForCity.length > 0;
  };
  $scope.cityHasLocations = controller.cityHasLocations;

  controller.locationSearched = function () {
    $scope.locationsSearched = true;
  };
  $scope.locationSearched = controller.locationSearched;

  controller.filterCityLocations = function (filterValue) {
    return function (location) {
      var words = filterValue.match(/\w+/g).filter(function (word) {
        return word.length > 2;
      });
      var addressMatches = words.filter(function (word) {
        return location.address.streetAddress.toLowerCase().indexOf(word.toLowerCase()) !== -1;
      });
      var nameMatches = words.filter(function (word) {
        return location.name.toLowerCase().indexOf(word.toLowerCase()) !== -1;
      });

      return addressMatches.length + nameMatches.length >= words.length;
    };
  };
  $scope.filterCityLocations = controller.filterCityLocations;

  controller.orderCityLocations = function (filterValue) {
    return function (location) {
      return new Levenshtein(location, location.name + '' + location.address.streetAddress);
    };
  };
  $scope.orderCityLocations = controller.orderCityLocations;

  /**
   * Open the place modal.
   */
  function openPlaceModal() {

    var modalInstance = $uibModal.open({
      templateUrl: 'templates/event-form-place-modal.html',
      controller: 'EventFormPlaceModalController',
      resolve: {
        location: function () {
          return $scope.eventFormData.location;
        },
        categories: function () {
          return $scope.categories;
        },
        title: function () {
          return $scope.locationAutocompleteTextField;
        }
      }
    });

    /**
     * @param {UdbPlace} place
     */
    function setEventFormDataPlace(place) {

      // Assign the just saved place to the event form data.
      EventFormData.place = place;

      // Assign selection, hide the location field and show the selection.
      $scope.selectedCity = place.address.postalCode + ' ' + place.address.addressLocality;

      var location = {
        'id' : place.id,
        'name': place.name,
        'address': {
          'addressCountry': $scope.selectedCountry.code,
          'addressLocality': place.address.addressLocality,
          'postalCode': place.address.postalCode,
          'streetAddress': place.address.streetAddress
        }
      };
      EventFormData.setLocation(location);
      $scope.selectedLocation = angular.copy(location);

      controller.stepCompleted();
    }

    modalInstance.result
      .then(setEventFormDataPlace);
  }

  function getNumberFromStreetAddress(streetAddress) {
    return streetAddress.split(' ').pop() || '';
  }

  function validateAddress(streetAddress) {
    if (streetAddress) {
      var maximumNumberLength = 15;
      return getNumberFromStreetAddress(streetAddress).length <= maximumNumberLength;
    }
  }

  function validateNlPostalCode(postalCode) {
    var regex = new RegExp(/^[0-9]{4}[a-z]{2}$/i);
    return regex.test(postalCode);
  }

  /**
   * Set the street address for a Place.
   *
   * @param {string} streetAddress
   */
  function setPlaceStreetAddress(streetAddress) {
    // Forms are automatically known in scope.
    $scope.showValidation = true;

    $scope.step3Form.street.$setValidity('invalid', true);
    if (!$scope.step3Form.$valid) {
      return;
    }

    if (!validateAddress(streetAddress)) {
      $scope.showStreetValidation = true;
      $scope.step3Form.street.$setValidity('invalid', false);
      return;
    }

    var currentAddress = EventFormData.address;
    var newAddressInfo = {
      streetAddress: streetAddress
    };

    EventFormData.address = _.merge(getEmptyLocation().address, currentAddress, newAddressInfo);
    $scope.placeStreetAddress = streetAddress;

    controller.stepCompleted();
  }

  function setNLPlaceStreetAddress(streetAddress, postalCode) {
    // Forms are automatically known in scope.
    $scope.showValidation = true;

    $scope.step3Form.street.$setValidity('invalid', true);

    if ($scope.selectedCountry.code === 'NL') {
      $scope.step3Form.postalCode.$setValidity('invalid', true);
    }

    if (!$scope.step3Form.$valid) {
      return;
    }

    if (!validateAddress(streetAddress)) {
      $scope.showStreetValidation = true;
      $scope.step3Form.street.$setValidity('invalid', false);
    }

    if ($scope.selectedCountry.code === 'NL') {
      if (!validateNlPostalCode(postalCode)) {
        $scope.showZipValidation = true;
        $scope.step3Form.postalCode.$setValidity('invalid', false);
      }
    }

    if ($scope.showStreetValidation || $scope.showZipValidation) {
      return;
    }

    var currentAddress = EventFormData.address;
    var newAddressInfo = {
      streetAddress: streetAddress,
      postalCode: postalCode
    };

    EventFormData.address = _.merge(getEmptyLocation().address, currentAddress, newAddressInfo);
    $scope.placeStreetAddress = streetAddress;

    controller.stepCompleted();
  }

  function resetStreetValidation() {
    $scope.showValidation = false;
    $scope.showStreetValidation = false;
  }

  function resetZipValidation() {
    $scope.showValidation = false;
    $scope.showZipValidation = false;
  }

  /**
   * Change StreetAddress
   */
  function changePlaceStreetAddress() {
    $scope.newPlaceStreetAddress = $scope.placeStreetAddress ? $scope.placeStreetAddress : '';
    $scope.placeStreetAddress = '';
    $scope.showValidation = false;
    $scope.showStreetValidation = false;
    $scope.showZipValidation = false;
    controller.stepUncompleted();
  }

  /**
   * Mark the major info as changed.
   */
  function setMajorInfoChanged() {
    if (EventFormData.id) {
      EventFormData.majorInfoChanged = true;
    }
  }

  controller.stepCompleted = function () {
    EventFormData.showStep(4);

    if (EventFormData.id) {
      eventCrud.updateMajorInfo(EventFormData);
    }
  };

  controller.stepUncompleted = function () {
    if (!EventFormData.id) {
      EventFormData.hideStep(4);
    }
  };

  controller.init = function (EventFormData) {
    var address;

    // Set location data when the form data contains an Event with a location
    if (EventFormData.isEvent && EventFormData.location.name) {
      address = _.get(EventFormData, 'location.address');
      if (EventFormData.location.name) {
        $scope.selectedLocation = angular.copy(EventFormData.location);
      }
    }

    // Set the address when the form contains Place address info
    if (EventFormData.isPlace && EventFormData.address.postalCode) {
      address = EventFormData.address;

      $scope.placeStreetAddress = address.streetAddress;
    }

    if (address) {
      $scope.selectedCity = address.addressLocality;
      $scope.selectedCountry = _.find($scope.availableCountries, function(country) {
        return country.code === address.addressCountry;
      });
    }
  };

  controller.init(EventFormData);
}
EventFormStep3Controller.$inject = ["$scope", "EventFormData", "cityAutocomplete", "placeCategories", "$uibModal", "citiesBE", "citiesNL", "Levenshtein", "eventCrud", "$rootScope", "$translate", "jsonLDLangFilter", "appConfig"];
})();

// Source: src/event_form/steps/event-form-step4.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormStep4Controller
 * @description
 * # EventFormStep4Controller
 * Step 4 of the event form
 */
angular
  .module('udb.event-form')
  .controller('EventFormStep4Controller', EventFormStep4Controller);

/* @ngInject */
function EventFormStep4Controller(
  $scope,
  EventFormData,
  searchApiSwitcher,
  appConfig,
  SearchResultViewer,
  eventCrud,
  $rootScope,
  $uibModal
) {

  var controller = this;
  var ignoreDuplicates = _.get(appConfig, 'offerEditor.ignoreDuplicates', false);

  // Scope vars.
  // main storage for event form.
  $scope.eventFormData = EventFormData;

  $scope.titleInputOptions = {updateOn: 'change blur'};

  $scope.infoMissing = false;
  $scope.duplicatesSearched = false;
  $scope.saving = false;
  $scope.error = false;

  $scope.validateEvent = validateEvent;
  $scope.saveEvent = createOffer;
  $scope.resultViewer = new SearchResultViewer();
  $scope.eventTitleChanged = eventTitleChanged;
  $scope.previewSuggestedItem = previewSuggestedItem;

  // Check if we need to show the leave warning
  window.onbeforeunload = function (event) {
    if (EventFormData.majorInfoChanged) {
      return 'Bent u zeker dat je de pagina wil verlaten? Gegevens die u hebt ingevoerd worden niet opgeslagen.';
    }
  };

  /**
   * Validate date after step 4 to enter step 5.
   */
  function validateEvent() {

    // First check if all data is correct.
    $scope.infoMissing = false;
    $scope.missingInfo = [];

    if (!EventFormData.type.id) {
      $scope.missingInfo.push('event type missing');
    }

    if (EventFormData.calendarType === 'single' && EventFormData.timestamps[0].date === '') {
      $scope.missingInfo.push('timestamp missing');
    }
    else if (EventFormData.calendarType === 'periodic' &&
      (EventFormData.startDate === '' || EventFormData.endDate === '')
    ) {
      $scope.missingInfo.push('start or end date missing');
    }
    else if (EventFormData.calendarType === '') {
      $scope.missingInfo.push('when missing');
    }

    if (EventFormData.isEvent && !EventFormData.location.id) {
      $scope.missingInfo.push('place missing for event');
    }
    else if (EventFormData.isPlace && !EventFormData.address.streetAddress) {
      $scope.missingInfo.push('address missing for place');
    }

    if (EventFormData.name === '') {
      $scope.missingInfo.push('title is missing');
    }

    if ($scope.missingInfo.length > 0) {
      $scope.infoMissing = true;
      return;
    }

    if (ignoreDuplicates) {
      createOffer();
    }
    else {
      suggestExistingOffers(EventFormData);
    }

  }

  /**
   * @param {EventFormData} formData
   */
  function suggestExistingOffers(formData) {
    $scope.saving = true;
    $scope.error = false;

    $scope.resultViewer.loading = true;
    $scope.duplicatesSearched = true;

    findDuplicates(formData).then(showDuplicates, showMajorInfoError);
  }

  /**
   * @param {PagedCollection} pagedDuplicates
   */
  function showDuplicates(pagedDuplicates) {

    // Set the results for the duplicates modal,
    if (pagedDuplicates.totalItems > 0) {
      $scope.saving = false;
      $scope.resultViewer.setResults(pagedDuplicates);
    }
    // or save the event immediately if no duplicates were found.
    else {
      createOffer();
    }
  }

  function findDuplicates(data) {
    var conditions = duplicateSearchConditions(data);

    var expressions = [];
    angular.forEach(conditions, function (value, key) {
      expressions.push(key + ':"' + value + '"');
    });

    var queryString = expressions.join(' AND ');

    return searchApiSwitcher.findOffers(queryString);
  }

  /**
   * Duplicates are searched for by identical properties:
   * - title is the same
   * - on the same location
   */
  function duplicateSearchConditions(data) {
    return searchApiSwitcher.getDuplicateSearchConditions(data);
  }

  /**
   * Save Event for the first time.
   */
  function createOffer() {

    resetMajorInfoError();

    var eventCrudPromise;
    eventCrudPromise = eventCrud.createOffer(EventFormData);

    eventCrudPromise.then(function(newEventFormData) {
      EventFormData = newEventFormData;
      EventFormData.majorInfoChanged = false;

      $scope.saving = false;
      $scope.resultViewer = new SearchResultViewer();
      $scope.titleInputOptions = {updateOn: 'change blur'};
      EventFormData.showStep(5);

    }, showMajorInfoError);

  }

  function resetMajorInfoError() {
    $scope.error = false;
    $scope.saving = true;
  }

  function showMajorInfoError() {
    // Error while saving.
    $scope.error = true;
    $scope.saving = false;
  }

  controller.eventFormSaved = function () {
    $rootScope.$emit('eventFormSaved', EventFormData);
  };

  /**
   * Notify that the title of an event has changed.
   */
  function eventTitleChanged() {
    if (EventFormData.id && EventFormData.name !== '') {
      $rootScope.$emit('eventTitleChanged', EventFormData);
    }
  }

  /**
   * Open the organizer modal.
   *
   * @param {object} item
   *  An item to preview from the suggestions in the current result viewer.
   */
  function previewSuggestedItem(item) {
    $uibModal.open({
      templateUrl: 'templates/suggestion-preview-modal.html',
      controller: 'SuggestionPreviewModalController',
      resolve: {
        selectedSuggestionId: function () {
          return item.id;
        },
        resultViewer: function () {
          return $scope.resultViewer;
        },
        suggestionType: function () {
          return EventFormData.getType();
        }
      }
    });
  }

}
EventFormStep4Controller.$inject = ["$scope", "EventFormData", "searchApiSwitcher", "appConfig", "SearchResultViewer", "eventCrud", "$rootScope", "$uibModal"];
})();

// Source: src/event_form/steps/event-form-step5.controller.js
(function () {
'use strict';

/**
 * @typedef {Object} ContactInfoItem
 * @property {ContactInfoTypeEnum} type
 * @property {boolean} booking
 * @property {string} value
 */

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormStep5Controller
 * @description
 * # EventFormStep5Controller
 * Step 5 of the event form
 */
angular
  .module('udb.event-form')
  .controller('EventFormStep5Controller', EventFormStep5Controller);

/* @ngInject */
function EventFormStep5Controller(
    $scope,
    EventFormData,
    eventCrud,
    udbOrganizers,
    $uibModal,
    $rootScope,
    appConfig,
    udbUitpasApi
  ) {

  var controller = this;
  var URL_REGEXP = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
  /**
   * Enum for contact info types.
   * @readonly
   * @enum {string}
   */
  var ContactInfoTypeEnum = Object.freeze({
    EMAIL: 'email',
    PHONE: 'phone',
    URL: 'url'
  });

  // Scope vars.
  $scope.eventFormData = EventFormData; // main storage for event form.
  $scope.mainLanguage = EventFormData.getMainLanguage();

  // Description vars.
  $scope.description = EventFormData.getDescription($scope.mainLanguage);
  $scope.descriptionCssClass = $scope.description ? 'state-complete' : 'state-incomplete';
  $scope.savingDescription = false;
  $scope.descriptionError = false;
  $scope.originalDescription = '';

  // Organizer vars.
  $scope.organizerCssClass = EventFormData.organizer.name ? 'state-complete' : 'state-incomplete';
  $scope.organizer = '';
  $scope.emptyOrganizerAutocomplete = false;
  $scope.loadingOrganizers = false;
  $scope.organizerError = false;
  $scope.savingOrganizer = false;

  // Price info
  $scope.disablePriceInfo = _.get(appConfig.offerEditor, 'disablePriceInfo');

  // Translatable languages
  $scope.translatableLanguages = appConfig.translatableLanguages;

  // Booking & tickets vars.
  $scope.editBookingPhone = !EventFormData.bookingInfo.phone;
  $scope.editBookingEmail = !EventFormData.bookingInfo.email;
  $scope.editBookingUrl = !EventFormData.bookingInfo.url;
  $scope.bookingModel = {
    urlRequired : false,
    emailRequired : false,
    phoneRequired : false,
    url : EventFormData.bookingInfo.urlLabel ? EventFormData.bookingInfo.url : '',
    urlLabel : {},
    urlLabelCustom : '',
    phone : EventFormData.bookingInfo.phone ? EventFormData.bookingInfo.phone : '',
    email : EventFormData.bookingInfo.email ? EventFormData.bookingInfo.email : ''
  };
  $scope.newBookingModel = {};

  $scope.bookingOptions = [];
  _.each($scope.translatableLanguages, function (language) {
    $scope.bookingOptions[language] = [
      {value: 'buy_tickets', label: translateBookingInfoUrlLabels('buy_tickets', language)},
      {value: 'reserve_places', label: translateBookingInfoUrlLabels('reserve_places', language)},
      {value: 'check_availability', label: translateBookingInfoUrlLabels('check_availability', language)},
      {value: 'subscribe', label: translateBookingInfoUrlLabels('subscribe', language)}
    ];
  });

  if (EventFormData.bookingInfo.urlLabel) {
    $scope.bookingModel.urlLabel = [];
    $scope.usedBookingOption = _.findWhere($scope.bookingOptions[$scope.mainLanguage],
        {label: EventFormData.bookingInfo.urlLabel}
    );

    // Quick fix for III-2791
    if ($scope.usedBookingOption === undefined) {
      $scope.usedBookingOption = _.findWhere($scope.bookingOptions[$scope.mainLanguage],
          {value: 'reserve_places'}
      );
    }

    if (typeof EventFormData.bookingInfo.urlLabel === 'string') {
      _.each($scope.translatableLanguages, function (language) {
        $scope.bookingModel.urlLabel[language] = _.findWhere($scope.bookingOptions[language],
            {value: $scope.usedBookingOption.value}
        );
      });
    }
    else {
      _.each($scope.translatableLanguages, function (language) {
        $scope.bookingModel.urlLabel[language] = _.findWhere($scope.bookingOptions[language],
            {value: $scope.usedBookingOption.value}
        );
      });
    }
  }
  else {
    _.each($scope.translatableLanguages, function (language) {
      $scope.bookingModel.urlLabel[language] = $scope.bookingOptions[language][1];
    });
  }

  // Add urlLabel to the option list when it is not in the options list.
  // This is mostly the case when the user is editing in another language as the offer's mainLanguage.
  if ($scope.usedBookingOption && !_.find($scope.bookingOptions[$scope.mainLanguage], $scope.usedBookingOption)) {
    $scope.bookingOptions[$scope.mainLanguage].unshift($scope.usedBookingOption);
  }

  $scope.viaWebsite =  !EventFormData.bookingInfo.url;
  $scope.viaEmail = !EventFormData.bookingInfo.email;
  $scope.viaPhone = !EventFormData.bookingInfo.phone;
  $scope.websitePreviewEnabled = false;
  $scope.bookingPeriodPreviewEnabled = false;
  $scope.bookingPeriodShowValidation = false;
  $scope.bookingInfoCssClass = 'state-incomplete';

  // Booking info vars.
  $scope.toggleBookingType = toggleBookingType;
  $scope.saveBookingInfo = saveBookingInfo;
  $scope.removeDuplicateContactBooking = removeDuplicateContactBooking;
  $scope.saveWebsitePreview = saveWebsitePreview;
  $scope.enableWebsitePreview = enableWebsitePreview;
  $scope.showBookingOption = showBookingOption;
  $scope.deleteBookingInfo = deleteBookingInfo;
  $scope.removeBookingInfo = removeBookingInfo;
  $scope.hasBookingInfo = hasBookingInfo;
  $scope.translateBookingInfoUrlLabels = translateBookingInfoUrlLabels;

  // Contactinfo vars.
  $scope.contactInfoCssClass = 'state-incomplete';
  $scope.savingContactInfo = false;
  $scope.contactInfoError = false;
  $scope.contactInfo = [];

  // Description functions.
  $scope.alterDescription = alterDescription;
  $scope.focusDescription = focusDescription;
  $scope.saveDescription = saveDescription;
  $scope.countCharacters = countCharacters;

  // Organizer functions.
  $scope.getOrganizers = getOrganizers;
  $scope.selectOrganizer = selectOrganizer;
  $scope.deleteOrganizerHandler = deleteOrganizerHandler;
  $scope.openOrganizerModal = openOrganizerModal;

  // Contact info functions.
  $scope.deleteContactInfo = deleteContactInfo;
  $scope.saveContactInfo = saveContactInfo;
  $scope.addContactInfo = addContactInfo;

  // Uitpas info
  $scope.hasTicketSales = false;
  $scope.hasUitpasError = false;

  // Image upload functions.
  $scope.openUploadImageModal = openUploadImageModal;
  $scope.removeImage = removeImage;
  $scope.editImage = editImage;
  $scope.selectMainImage = selectMainImage;
  // Init the controller for editing.
  initEditForm();

  /**
   * Alter description: used for adding and editing the description.
   */
  function alterDescription() {
    $scope.descriptionCssClass = 'state-filling';
  }

  function focusDescription () {
    $scope.descriptionInfoVisible = true;
    $scope.originalDescription = $scope.description;
  }

  /**
   * Save the description.
   */
  function saveDescription(allowEmpty) {

    if (allowEmpty) {
      $scope.description = '';
    }

    // only update description when there is one, it's not empty and it's not already saved; or when we allow empty
    var emptyAllowed = ($scope.description && $scope.description !== '') || allowEmpty;
    var notTheSame = ($scope.description !== $scope.originalDescription) || allowEmpty;
    if (emptyAllowed && notTheSame) {

      $scope.descriptionInfoVisible = false;
      $scope.savingDescription = true;
      $scope.descriptionError = false;

      EventFormData.setDescription(
        $scope.description.replace(new RegExp(String.fromCharCode(31), 'g'), ''),
        $scope.mainLanguage
      );

      var promise = eventCrud.updateDescription(EventFormData, $scope.description);
      promise.then(function() {

        $scope.savingDescription = false;
        controller.eventFormSaved();

        // Toggle correct class.
        if ($scope.description) {
          $scope.descriptionCssClass = 'state-complete';
        }
        else {
          $scope.descriptionCssClass = 'state-incomplete';
        }

      },
       // Error occured, show message.
      function() {
        $scope.savingDescription = false;
        $scope.descriptionError = true;
      });
    }
  }
  /**
   * Count characters in the description.
   */
  function countCharacters() {
    if ($scope.description) {
      return $scope.description.length;
    }
  }

  controller.eventFormSaved = function () {
    $rootScope.$emit('eventFormSaved', EventFormData);
  };

  /**
   * Auto-complete callback for organizers.
   * @param {String} value
   *  Suggest organizers based off of this value.
   *
   * @return {UdbOrganizer[]}
   */
  function getOrganizers(value) {
    function suggestExistingOrNewOrganiser (organizers) {
      var suitableOrganizers = organizers;
      if (appConfig.offerEditor.excludeOrganizerLabel && appConfig.offerEditor.excludeOrganizerLabel !== '') {
        suitableOrganizers = _.filter(suitableOrganizers, function(organizer) {
          if (organizer.labels && organizer.labels.length > 0) {
            return organizer.labels.indexOf(appConfig.offerEditor.excludeOrganizerLabel) < 0;
          } else {
            return true;
          }
        });
      }
      if (appConfig.offerEditor.includeOrganizerLabel && appConfig.offerEditor.includeOrganizerLabel !== '') {
        suitableOrganizers = _.filter(suitableOrganizers, function(organizer) {
          if (organizer.labels && organizer.labels.length > 0) {
            return organizer.labels.indexOf(appConfig.offerEditor.includeOrganizerLabel) >= 0;
          } else {
            return false;
          }
        });
      }
      $scope.emptyOrganizerAutocomplete = suitableOrganizers.length <= 0;
      $scope.loadingOrganizers = false;

      return suitableOrganizers;
    }

    $scope.loadingOrganizers = true;
    return udbOrganizers
      .suggestOrganizers(value)
      .then(suggestExistingOrNewOrganiser);
  }

  /**
   * Select listener on the typeahead.
   * @param {Organizer} organizer
   */
  function selectOrganizer(organizer) {
    controller.saveOrganizer(organizer);
  }

  controller.showAsyncOrganizerError = function() {
    $scope.organizerError = true;
    $scope.savingOrganizer = false;
  };

  function deleteOrganizerHandler() {
    if (EventFormData.priceInfo.length > 0) {
      udbUitpasApi.getTicketSales($scope.eventFormData.id, $scope.eventFormData.organizer)
        .then(
          function(hasTicketSales) {
            if (hasTicketSales) {
              $scope.hasTicketSales = hasTicketSales;
            }
            else {
              deleteOrganizer();
            }
          }, function() {
            $scope.hasUitpasError = true;
          });
    }
    else {
      deleteOrganizer();
    }
  }

  /**
   * Delete the selected organiser.
   */
  function deleteOrganizer() {
    function resetOrganizer() {
      controller.eventFormSaved();
      EventFormData.resetOrganizer();
      $rootScope.$emit('eventOrganizerDeleted', {});
      $scope.organizerCssClass = 'state-incomplete';
      $scope.savingOrganizer = false;
    }

    $scope.organizerError = false;
    eventCrud
      .deleteOfferOrganizer(EventFormData)
      .then(resetOrganizer, controller.showAsyncOrganizerError);
  }

  /**
   * Open the organizer modal.
   */
  function openOrganizerModal() {
    var modalInstance = $uibModal.open({
      backdrop: 'static',
      templateUrl: 'templates/event-form-organizer-modal.html',
      controller: 'EventFormOrganizerModalController',
      resolve: {
        organizerName: function () {
          return $scope.organizer;
        }
      }
    });

    function updateOrganizerInfo () {
      $scope.organizer = '';
      $scope.emptyOrganizerAutocomplete = false;
      if (EventFormData.organizer.id) {
        $scope.organizerCssClass = 'state-complete';
      }
      else {
        $scope.organizerCssClass = 'state-incomplete';
      }
    }

    modalInstance.result.then(controller.saveOrganizer, updateOrganizerInfo);
  }

  /**
   * Persist the organizer for the active event.
   * @param {Organizer} organizer
   */
  controller.saveOrganizer = function (organizer) {
    function resetOrganizerFeedback() {
      $scope.emptyOrganizerAutocomplete = false;
      $scope.organizerError = false;
      $scope.savingOrganizer = true;
      $scope.organizer = '';
    }

    function markOrganizerAsCompleted() {
      controller.eventFormSaved();
      $rootScope.$emit('eventOrganizerSelected', organizer);
      $scope.organizerCssClass = 'state-complete';
      $scope.savingOrganizer = false;
    }

    EventFormData.organizer = organizer;
    resetOrganizerFeedback();
    eventCrud
      .updateOrganizer(EventFormData)
      .then(markOrganizerAsCompleted, controller.showAsyncOrganizerError);
  };

  /**
   * Add an additional field to fill out contact info. Show the fields when none were shown before.
   */
  function addContactInfo() {
    if (_.isEmpty($scope.contactInfo)) {
      $scope.contactInfoCssClass = 'state-filling';
    }

    $scope.contactInfo.push({type: ContactInfoTypeEnum.PHONE, value: '', booking: false});
  }

  /**
   * Delete a given contact info item.
   */
  function deleteContactInfo(index) {
    $scope.contactInfo.splice(index, 1);

    if (_.isEmpty($scope.contactInfo)) {
      $scope.contactInfoCssClass = 'state-incomplete';
    }

    saveContactInfo();
  }

  /**
   * Save the contact info.
   */
  function saveContactInfo() {

    $scope.savingContactInfo = true;
    $scope.contactInfoError = false;

    // Only save with valid input.
    if ($scope.contactInfoForm.$valid) {

      EventFormData.resetContactPoint();

      _.forEach($scope.contactInfo, function (contactInfoItem) {
        if (contactInfoItem.booking) {
          toggleBookingType(contactInfoItem);
        } else {
          if (!_.isEmpty(contactInfoItem.value) && _.includes(ContactInfoTypeEnum, contactInfoItem.type)) {
            EventFormData
              .contactPoint[contactInfoItem.type]
              .push(contactInfoItem.value);
          }
        }
      });

      var promise = eventCrud.updateContactPoint(EventFormData);
      promise.then(function() {
        controller.eventFormSaved();
        if (!_.isEmpty($scope.contactInfo)) {
          $scope.contactInfoCssClass = 'state-complete';
        }
        $scope.savingContactInfo = false;
      }, function() {
        $scope.contactInfoError = true;
        $scope.savingContactInfo = false;
      });

    }
  }

  /**
   * @param {ContactInfoItem} contactInfoItem
   * @return {boolean}
   */
  function showBookingOption(contactInfoItem) {
    var bookingInfoOfSameType = _.find($scope.contactInfo, {type: contactInfoItem.type, booking: true});

    return contactInfoItem.booking || !bookingInfoOfSameType;
  }

  /**
   * @return {boolean}
   */
  function hasBookingInfo()
  {
    var bookingInfo = _.find($scope.contactInfo, {booking: true});
    return !!bookingInfo;
  }

  /**
   * Toggle the booking type and check if info should be deleted.
   *
   * @param {ContactInfoItem} contactInfoItem
   */
  function toggleBookingType(contactInfoItem) {
    var type = contactInfoItem.type,
        newValue = contactInfoItem.booking ? contactInfoItem.value : '';

    if ($scope.bookingModel[type] !== newValue) {
      $scope.bookingModel[type] = newValue;
      saveBookingInfo();
    }
  }

  /**
   * @param {string} type
   */
  function removeBookingInfo(type) {
    if (!_.includes(ContactInfoTypeEnum, type)) {
      return;
    }

    $scope.bookingModel[type] = '';
    saveBookingInfo();
  }

  /**
   * Save the website preview settings.
   */
  function saveWebsitePreview() {
    $scope.websitePreviewEnabled = false;
    EventFormData.bookingInfo.urlLabel = $scope.bookingModel.urlLabel;
    if ($scope.bookingModel.urlLabelCustom !== '') {
      EventFormData.bookingInfo.urlLabel = $scope.bookingModel.urlLabelCustom;
    }
    saveBookingInfo();
  }

  /**
   * Enable the website preview modal.
   */
  function enableWebsitePreview() {
    $scope.websitePreviewEnabled = true;
  }

  /**
   * Delete a given contact info item.
   */
  function deleteBookingInfo(element, index) {
    $scope.contactInfo[index].booking = false;
    toggleBookingType(element);

    $scope.contactInfo.splice(index, 1);

    if (_.isEmpty($scope.contactInfo)) {
      $scope.contactInfoCssClass = 'state-incomplete';
    }
  }

  function formatBookingInfoUrlLabel(urlLabel) {
    var returnValue = {};
    var newLabelValue = urlLabel[$scope.mainLanguage].value;
    _.each($scope.translatableLanguages, function(language) {
      returnValue[language] = _.findWhere($scope.bookingOptions[language], {value: newLabelValue}).label;
    });
    return returnValue;
  }

  /**
   * Saves the booking info
   */
  function saveBookingInfo() {
    var urlLabel = {};
    _.each($scope.translatableLanguages, function(language) {
      urlLabel[language] = translateBookingInfoUrlLabels('reserve_places', language);
    });

    // Make sure all default values are set.
    EventFormData.bookingInfo = angular.extend({}, {
      url : '',
      urlLabel : urlLabel,
      email : '',
      phone : '',
      availabilityStarts :
        EventFormData.bookingInfo.availabilityStarts ?
          moment(EventFormData.bookingInfo.availabilityStarts).format() :
          '',
      availabilityEnds :
        EventFormData.bookingInfo.availabilityEnds ?
          moment(EventFormData.bookingInfo.availabilityEnds).format() :
          ''
    }, $scope.bookingModel);

    if (typeof EventFormData.bookingInfo.urlLabel !== 'string') {
      EventFormData.bookingInfo.urlLabel = formatBookingInfoUrlLabel(EventFormData.bookingInfo.urlLabel);
    } else {
      EventFormData.bookingInfo.urlLabel = formatBookingInfoUrlLabel(EventFormData.bookingInfo.urlLabel);
    }

    $scope.savingBookingInfo = true;
    $scope.bookingInfoError = false;

    var promise = eventCrud.updateBookingInfo(EventFormData);
    promise.then(function() {
      controller.eventFormSaved();
      $scope.bookingInfoCssClass = 'state-complete';
      $scope.savingBookingInfo = false;
      $scope.bookingInfoError = false;
      removeDuplicateContactBooking();
    }, function() {
      $scope.savingBookingInfo = false;
      $scope.bookingInfoError = true;
    });
  }

  function removeDuplicateContactBooking() {
    var url = $scope.bookingModel.url;
    var phone = $scope.bookingModel.phone;
    var email = $scope.bookingModel.email;

    $scope.contactInfo.some(function (element) {
      return element.value === url;
    });

    $scope.contactInfo.some(function (element) {
      return element.value === phone;
    });

    $scope.contactInfo.some(function (element) {
      return element.value === email;
    });

    saveContactInfo();
  }

  /**
   * Open the upload modal.
   */
  function openUploadImageModal() {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/event-form-image-upload.html',
      controller: 'EventFormImageUploadController'
    });
  }

  /**
   * Open the modal to edit an image of the item.
   *
   * @param {MediaObject} image
   *    The media object of the image to edit.
   */
  function editImage(image) {
    $uibModal.open({
      templateUrl: 'templates/event-form-image-edit.html',
      controller: 'EventFormImageEditController',
      resolve: {
        mediaObject: function () {
          return image;
        }
      }
    });
  }

  /**
   * Open the modal to remove an image.
   *
   * @param {MediaObject} image
   *    The media object of the image to remove from the item.
   */
  function removeImage(image) {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/event-form-image-remove.html',
      controller: 'EventFormImageRemoveController',
      resolve: {
        image: function () {
          return image;
        }
      }
    });
  }

  /**
   * Select the main image for an item.
   *
   * @param {MediaObject} image
   *    The media object of the image to select as the main image.
   */
  function selectMainImage(image) {
    function updateImageOrder() {
      EventFormData.selectMainImage(image);
    }

    eventCrud
      .selectMainImage(EventFormData, image)
      .then(updateImageOrder);
  }

  /**
   * Init this step for editing.
   */
  function initEditForm() {
    $scope.contactInfo = _.flatten(
      _.map(EventFormData.contactPoint, function (contactInfo, type) {
        return _.contains(ContactInfoTypeEnum, type) ? _.map(contactInfo, function (contactInfoItem) {
          return {type: type, value: contactInfoItem, booking: false};
        }) : [];
      })
    );

    // III-963 put booking items into the contactInfo array
    if (EventFormData.bookingInfo.url) {
      $scope.contactInfo.push({type: 'url', value: EventFormData.bookingInfo.url, booking: true});
    }

    if (EventFormData.bookingInfo.phone) {
      $scope.contactInfo.push({type: 'phone', value: EventFormData.bookingInfo.phone, booking: true});
    }

    if (EventFormData.bookingInfo.email) {
      $scope.contactInfo.push({type: 'email', value: EventFormData.bookingInfo.email, booking: true});
    }

    // Set correct css class for contact info.
    if ($scope.contactInfo.length > 0) {
      $scope.contactInfoCssClass = 'state-complete';
    }

    if (EventFormData.priceInfo) {
      $scope.price = EventFormData.priceInfo;
      $scope.priceCssClass = 'state-complete';
    }

  }

  function translateBookingInfoUrlLabels(label, language) {
    var labels = [];
    switch (language) {
      case 'nl':
        labels = [
          {value: 'buy_tickets', label:'Koop tickets'},
          {value: 'reserve_places', label:'Reserveer plaatsen'},
          {value: 'check_availability', label:'Controleer beschikbaarheid'},
          {value: 'subscribe', label:'Schrijf je in'}
        ];
        break;

      case 'fr':
        labels = [
          {value: 'buy_tickets', label:'Achetez des tickets'},
          {value: 'reserve_places', label:'Réservez des places'},
          {value: 'check_availability', label:'Controlez la disponibilité'},
          {value: 'subscribe', label:'Inscrivez-vous'}
        ];
        break;

      case 'en':
        labels = [
          {value: 'buy_tickets', label:'Buy tickets'},
          {value: 'reserve_places', label:'Reserve places'},
          {value: 'check_availability', label:'Check availability'},
          {value: 'subscribe', label:'Subscribe'}
        ];
        break;

      case 'de':
        labels = [
          {value: 'buy_tickets', label:'Tickets kaufen'},
          {value: 'reserve_places', label:'Platzieren Sie eine Reservierung'},
          {value: 'check_availability', label:'Verfügbarkeit prüfen'},
          {value: 'subscribe', label:'Melde dich an'}
        ];
        break;
    }

    return _.findWhere(labels, {value: label}).label;
  }

}
EventFormStep5Controller.$inject = ["$scope", "EventFormData", "eventCrud", "udbOrganizers", "$uibModal", "$rootScope", "appConfig", "udbUitpasApi"];
})();

// Source: src/export/event-export-job.factory.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.entry.EventExportJob
 * @description
 * # BaseJob
 * This Is the factory that creates an event export job
 */
angular
  .module('udb.entry')
  .factory('EventExportJob', EventExportJobFactory);

/* @ngInject */
function EventExportJobFactory(BaseJob, JobStates, ExportFormats) {

  /**
   * @class EventExportJob
   * @constructor
   * @param   {string}    commandId
   * @param   {number}    eventCount
   * @param   {string}    format
   * @param   {Object}    details
   */
  var EventExportJob = function (commandId, eventCount, format, details) {
    BaseJob.call(this, commandId);
    this.exportUrl = '';
    this.eventCount = eventCount;
    this.format = format;
    this.extension = _.find(ExportFormats, {type: format}).extension;
    this.details = details;
  };

  EventExportJob.prototype = Object.create(BaseJob.prototype);
  EventExportJob.prototype.constructor = EventExportJob;

  EventExportJob.prototype.getTemplateName = function () {
    var templateName;

    switch (this.state) {
      case JobStates.FINISHED:
        templateName = 'export-job';
        break;
      case JobStates.FAILED:
        templateName = 'failed-job';
        break;
      default:
        templateName = 'base-job';
    }

    return templateName;
  };

  EventExportJob.prototype.getDescription = function () {
    var description = '';

    if (this.state === JobStates.FAILED) {
      description = 'Exporteren van evenementen mislukt';
    } else {
      description = 'Document .' + this.extension + ' met ' + this.eventCount + ' evenementen';
    }

    return description;
  };

  EventExportJob.prototype.info = function (jobData) {
    if (jobData.location) {
      this.exportUrl = jobData.location;
    }
  };

  EventExportJob.prototype.getTaskCount = function () {
    return this.eventCount;
  };

  return (EventExportJob);
}
EventExportJobFactory.$inject = ["BaseJob", "JobStates", "ExportFormats"];
})();

// Source: src/export/event-export.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.export.controller:EventExportController
 * @description
 * # EventExportController
 * Controller of the udb.export
 */
angular
  .module('udb.export')
  .controller('EventExportController', EventExportController);

/* @ngInject */
function EventExportController($uibModalInstance, eventExporter, ExportFormats, udbApi, appConfig) {

  var exporter = this;

  exporter.exportLogoUrl = appConfig.exportLogoUrl;

  exporter.dayByDay = false;

  exporter.eventProperties = [
    {name: 'name', include: true, sortable: false, excludable: false},
    {name: 'description', include: false, sortable: false, excludable: true},
    {name: 'labels', include: false, sortable: false, excludable: true},
    {name: 'calendarSummary', include: true, sortable: false, excludable: false},
    {name: 'image', include: false, sortable: false, excludable: true},
    {name: 'location', include: true, sortable: false, excludable: false},
    {name: 'address', include: true, sortable: false, excludable: true},
    {name: 'organizer', include: false, sortable: false, excludable: true},
    {name: 'priceInfo', include: false, sortable: false, excludable: true},
    {name: 'kansentarief', include: false, sortable: false, excludable: true, format: ExportFormats.OOXML},
    {name: 'contactPoint', include: false, sortable: false, excludable: true},
    {name: 'bookingInfo', include: false, sortable: false, excludable: true},
    {name: 'creator', include: false, sortable: false, excludable: true},
    {name: 'terms.theme', include: true, sortable: false, excludable: true},
    {name: 'terms.eventtype', include: true, sortable: false, excludable: true},
    {name: 'created', include: false, sortable: false, excludable: true},
    {name: 'modified', include: false, sortable: false, excludable: true},
    {name: 'available', include: false, sortable: false, excludable: true},
    {name: 'endDate', include: false, sortable: false, excludable: true},
    {name: 'startDate', include: false, sortable: false, excludable: true},
    {name: 'calendarType', include: false, sortable: false, excludable: true},
    {name: 'sameAs', include: false, sortable: false, excludable: true},
    {name: 'typicalAgeRange', include: false, sortable: false, excludable: true},
    {name: 'language', include: false, sortable: false, excludable: true},
    {name: 'audience', include: false, sortable: false, excludable: true, format: ExportFormats.OOXML}
  ];

  exporter.exportFormats = _.map(ExportFormats);

  exporter.brands = appConfig.exportBrands;
  exporter.restrictedBrands = appConfig.restrictedExportBrands;
  exporter.templateUrl = appConfig.exportTemplateUrl;
  exporter.templates = appConfig.exportTemplateTypes;

  udbApi.getMyRoles().then(function(roles) {
    angular.forEach(roles, function(value, key) {
      exporter.brands = exporter.brands.concat(_.where(exporter.restrictedBrands, {role : roles[key].uuid}));
    });
  });

  exporter.customizations = {
    brand: '',
    logo: exporter.exportLogoUrl + exporter.brands[0].logo,
    title: '',
    subtitle: '',
    footer: '',
    publisher: '',
    template: ''
  };

  /**
   * A map of all the possible export steps.
   * You can add a callback to its incomplete property which will be used to check if a step is completed.
   */
  exporter.exportSteps = {
    format: {
      name: 'format',
      incomplete: function () {
        var format = exporter.format,
            isCustomizable = !!_.find(exporter.exportFormats, {type: format, customizable: true});

        if (isCustomizable) {
          exporter.steps = [
            exporter.exportSteps.format,
            exporter.exportSteps.customize,
            exporter.exportSteps.confirm
          ];
        } else {
          exporter.steps = [
            exporter.exportSteps.format,
            exporter.exportSteps.filter,
            exporter.exportSteps.confirm
          ];
        }

        return !format;
      }
    },
    customize: {
      name: 'customize',
      incomplete: function () {
        return !exporter.customizations.brand || !exporter.customizations.title || !exporter.customizations.template ;
      }
    },
    filter: {
      name: 'filter',
      incomplete: function () {
        return !_.find(exporter.eventProperties, function (property) {
          return property.include === true;
        });
      }
    },
    confirm: {
      name: 'confirm'
    }
  };

  /**
   * This is a list of steps that the user has to navigate through.
   */
  exporter.steps = [
    exporter.exportSteps.format,
    exporter.exportSteps.confirm
  ];

  var activeStep = 0;
  exporter.nextStep = function () {
    if (exporter.isStepCompleted()) {
      setActiveStep(activeStep + 1);
    }
    else {
      exporter.hasErrors = true;
    }
  };

  exporter.previousStep = function () {
    setActiveStep(activeStep - 1);
  };

  exporter.isStepCompleted = function () {

    if (activeStep === -1) {
      return true;
    }

    var incompleteCheck = exporter.steps[activeStep].incomplete;
    return ((typeof incompleteCheck === 'undefined') || (typeof incompleteCheck === 'function' && !incompleteCheck()));
  };

  function setActiveStep(stepIndex) {
    if (stepIndex < 0) {
      activeStep = 0;
    } else if (stepIndex > exporter.steps.length) {
      activeStep = exporter.steps.length;
    } else {
      activeStep = stepIndex;
    }
  }

  exporter.isOnFirstStep = function () {
    return activeStep === 0;
  };

  exporter.getActiveStepName = function () {

    if (activeStep === -1) {
      return 'finished';
    }

    return exporter.steps[activeStep].name;
  };

  exporter.onLastStep = function () {
    return activeStep >= (exporter.steps.length - 1);
  };

  exporter.export = function () {

    var exportFormat = _.find(exporter.exportFormats, {type: exporter.format}),
        isCustomized = exportFormat && exportFormat.customizable === true,
        includedProperties,
        customizations;

    if (isCustomized) {
      customizations = exporter.customizations;
      customizations.logo = exporter.exportLogoUrl + customizations.brand.logo;
      customizations.brand = customizations.brand.name;
      customizations.template = customizations.template.name;
      includedProperties = [];
    } else {
      customizations = {};
      includedProperties = _.pluck(_.filter(exporter.eventProperties, 'include'), 'name');
    }

    eventExporter.export(exporter.format, exporter.email, includedProperties, exporter.dayByDay, customizations);
    activeStep = -1;
  };

  exporter.format = exporter.exportFormats[0].type;
  exporter.email = '';

  exporter.close = function () {
    $uibModalInstance.dismiss('cancel');
  };

  exporter.eventCount = eventExporter.activeExport.eventCount;
}
EventExportController.$inject = ["$uibModalInstance", "eventExporter", "ExportFormats", "udbApi", "appConfig"];
})();

// Source: src/export/event-exporter.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.entry.eventExporter
 * @description
 * # eventExporter
 * Event Exporter Service
 */
angular
  .module('udb.export')
  .service('eventExporter', eventExporter);

/* @ngInject */
function eventExporter(jobLogger, appConfig, udbApi, EventExportJob, $cookies, searchApiSwitcher) {

  var ex = this; // jshint ignore:line

  ex.activeExport = {
    query: {},
    eventCount: 0,
    selection: []
  };

  /**
   * Send the active export job to the server
   *
   * @param {'json'|'csv'}  format
   * @param {string}        email
   * @param {string[]}      properties
   * @param {boolean}       perDay
   * @param {Object}        customizations
   *
   * @return {object}
   */
  ex.export = function (format, email, properties, perDay, customizations) {
    var queryString = ex.activeExport.query.queryString,
        selection = ex.activeExport.selection || [],
        eventCount = ex.activeExport.eventCount,
        brand = customizations.brand || '',
        details = null,
        user = $cookies.getObject('user');

    var jobPromise = udbApi.exportEvents(
        getSapiVersion(),
        queryString,
        email,
        format,
        properties,
        perDay,
        selection,
        customizations
    );
    details = {
        format : format,
        user : user.id,
        brand : brand,
        queryString : queryString
      };

    jobPromise.success(function (jobData) {
      var job = new EventExportJob(jobData.commandId, eventCount, format, details);
      jobLogger.addJob(job);
      job.start();
    });

    return jobPromise;
  };

  /**
   * @returns {String}
   */
  function getSapiVersion() {
    return 'v' + searchApiSwitcher.getApiVersion();
  }
}
eventExporter.$inject = ["jobLogger", "appConfig", "udbApi", "EventExportJob", "$cookies", "searchApiSwitcher"];
})();

// Source: src/export/export-formats.constant.js
(function () {
'use strict';

/* jshint sub: true */

/**
 * @ngdoc constant
 * @name udb.export.ExportFormats
 * @description
 * # ExportFormats
 * Event export formats
 */
angular
  .module('udb.export')
  .constant('ExportFormats',
  /**
   * Enum for export formats
   * @readonly
   * @enum {string}
   */
  {
    OOXML: {
      type: 'ooxml',
      extension: 'xlsx',
      label: 'Office Open XML (Excel)',
      description: 'Het standaard formaat van Excel vanaf Microsoft Office 2007.'
    },
    PDF: {
      type: 'pdf',
      label: 'Als PDF',
      extension: 'pdf',
      description: 'Druk snel en eenvoudig items uit de UiTdatabank af. Kies een Vlieg, UiT-, of UiTPAS-sjabloon.',
      customizable: true
    },
    JSON: {
      type: 'json',
      label: 'Als json',
      extension: 'json',
      description: 'Exporteren naar event-ld om de informatie voor ontwikkelaars beschikbaar te maken.'
    }
  });
})();

// Source: src/export/export-modal-buttons.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.export.directive:udbExportModalButtons
 * @description
 * # udbExportModalButtons
 */
angular
  .module('udb.export')
  .directive('udbExportModalButtons', udbExportModalButtons);

/* @ngInject */
function udbExportModalButtons() {
  return {
    templateUrl: 'templates/export-modal-buttons.directive.html',
    restrict: 'E'
  };
}
})();

// Source: src/management/components/query-search-bar.component.js
(function () {
'use strict';

/**
 * @ngdoc component
 * @name udb.search.directive:udbSearchBar
 * @description
 * # udbQuerySearchBar
 */
angular
  .module('udb.management')
  .component('udbQuerySearchBar', {
    templateUrl: 'templates/query-search-bar.html',
    controller: QuerySearchBarComponent,
    controllerAs: 'qsb',
    bindings: {
      onChange: '&',
      searchLabel: '@'
    }
  });

/* @ngInject */
function QuerySearchBarComponent() {
  var qsb = this;

  qsb.queryString = '';
  qsb.find = find;

  /**
   * Search with a given query string and update the search bar or use the one currently displayed in the search bar
   *
   * @param {String} [queryString]
   */
  function find(queryString) {
    var query = typeof queryString !== 'undefined' ? queryString : qsb.queryString;

    qsb.queryString = query;
    qsb.onChange({query: query});
  }
}
})();

// Source: src/management/directives/form-group.directive.js
(function () {
'use strict';

angular
  .module('udb.management')
  .directive('udbFormGroup', FormGroupDirective);

function FormGroupDirective() {
  return {
    restrict: 'A',
    require: '^form',
    link: function (scope, element, attributes, formController) {
      var inputElement = element[0].querySelector('[name]');
      var field = angular.element(inputElement);
      var fieldName = field.attr('name');

      field.bind('blur', function () {
        var isInvalid = formController[fieldName].$invalid;
        element
          .toggleClass('has-error', isInvalid)
          .toggleClass('has-success', !isInvalid);
      });
    }
  };
}
})();

// Source: src/management/labels/label-creator.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:LabelCreatorController
 * @description
 * # LabelCreatorController
 */
angular
  .module('udb.management.labels')
  .controller('LabelCreatorController', LabelCreatorController);

/** @ngInject */
function LabelCreatorController(LabelManager, $uibModal, $state) {
  var creator = this;
  creator.creating = false;
  creator.create = create;
  creator.label = {
    name: '',
    isPrivate: false,
    isVisible: true
  };

  function create() {
    function goToOverview(jobInfo) {
      $state.go('split.manageLabels.list');
    }

    creator.creating = true;
    LabelManager
      .create(creator.label.name, creator.label.isVisible, creator.label.isPrivate)
      .then(goToOverview, showProblem)
      .finally(function () {
        creator.creating = false;
      });
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    var modalInstance = $uibModal.open(
      {
        templateUrl: 'templates/unexpected-error-modal.html',
        controller: 'UnexpectedErrorModalController',
        size: 'sm',
        resolve: {
          errorMessage: function() {
            return problem.title + ' ' + problem.detail;
          }
        }
      }
    );
  }
}
LabelCreatorController.$inject = ["LabelManager", "$uibModal", "$state"];
})();

// Source: src/management/labels/label-editor.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:LabelEditorController
 * @description
 * # LabelEditorController
 */
angular
  .module('udb.management.labels')
  .controller('LabelEditorController', LabelEditorController);

/** @ngInject */
function LabelEditorController(LabelManager, $uibModal, $stateParams, $q) {
  var editor = this;
  editor.updateVisibility = updateVisibility;
  editor.updatePrivacy = updatePrivacy;
  editor.saving = false;
  editor.renaming = false;
  editor.save = save;

  function rename() {
    function showRenamedLabel(jobInfo) {
      loadLabel(jobInfo.labelId);
    }

    editor.renaming = true;
    LabelManager
      .copy(editor.label)
      .then(showRenamedLabel, showProblem)
      .finally(function () {
        editor.renaming = false;
      });
  }

  function save() {
    editor.saving = true;

    var promisses = [];
    var checkRenaming = editor.originalLabel.name !== editor.label.name;

    if (checkRenaming) {
      rename();
    }

    else {
      if (editor.originalLabel.isVisible !== editor.label.isVisible) {
        promisses.push(updateVisibility());
      }

      if (editor.originalLabel.isPrivate !== editor.label.isPrivate) {
        promisses.push(updatePrivacy());
      }

      $q.all(promisses).finally(function() {
          editor.saving = false;
        }).catch(showProblem);
    }
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    loadLabel(editor.label.uuid);
    var modalInstance = $uibModal.open(
      {
        templateUrl: 'templates/unexpected-error-modal.html',
        controller: 'UnexpectedErrorModalController',
        size: 'sm',
        resolve: {
          errorMessage: function() {
            return problem.title + ' ' + problem.detail;
          }
        }
      }
    );
  }

  function loadLabelFromParams() {
    var id = $stateParams.id;
    loadLabel(id);
  }

  /**
   *
   * @param {Label} label
   */
  function showLabel(label) {
    editor.label = label;
    getVisibility(label);
    getPrivacy(label);
    editor.originalLabel = _.cloneDeep(editor.label);
  }

  function loadLabel(id) {
    editor.loadingError = false;
    editor.label = false;
    LabelManager
      .get(id)
      .then(showLabel, showLoadingError);
  }

  function getVisibility(label) {
    if (label.visibility === 'visible') {
      label.isVisible = true;
    }
    else {
      label.isVisible = false;
    }

    return label;
  }

  function getPrivacy(label) {
    if (label.privacy === 'public') {
      label.isPrivate = false;
    }
    else {
      label.isPrivate = true;
    }

    return label;
  }

  function showLoadingError () {
    editor.loadingError = 'Label niet gevonden!';
  }

  function updateVisibility () {
    var isVisible = editor.label.isVisible;

    return isVisible ? LabelManager.makeVisible(editor.label) : LabelManager.makeInvisible(editor.label);
  }

  function updatePrivacy () {
    var isPrivate = editor.label.isPrivate;

    return isPrivate ? LabelManager.makePrivate(editor.label) : LabelManager.makePublic(editor.label);
  }

  loadLabelFromParams();
}
LabelEditorController.$inject = ["LabelManager", "$uibModal", "$stateParams", "$q"];
})();

// Source: src/management/labels/label-manager.service.js
(function () {
'use strict';

/**
 * @typedef {Object} Label
 * @property {string}   id
 * @property {string}   name
 * @property {boolean}  isVisible
 * @property {boolean}  isPrivate
 */

/**
 * @ngdoc service
 * @name udb.management.labels
 * @description
 * # Label Manager
 * This service allows you to lookup labels and perform actions on them.
 */
angular
  .module('udb.management.labels')
  .service('LabelManager', LabelManager);

/* @ngInject */
function LabelManager(udbApi, jobLogger, BaseJob, $q) {
  var service = this;

  /**
   * @param {string} query
   * @param {int} limit
   * @param {int} start
   *
   * @return {Promise.<PagedCollection>}
   */
  service.find = function(query, limit, start) {
    return udbApi.findLabels(query, limit, start);
  };

  /**
   * @param {string|uuid} labelIdentifier
   *  The name or uuid of a label.
   * @return {Promise.<Label>}
   */
  service.get = function(labelIdentifier) {
    return udbApi.getLabelById(labelIdentifier);
  };

  /**
   * @param {string} name
   * @param {boolean} isVisible
   * @param {boolean} isPrivate
   *
   * @return {Promise.<BaseJob>}
   */
  service.create = function (name, isVisible, isPrivate) {
    return udbApi
      .createLabel(name, isVisible, isPrivate)
      .then(createNewLabelJob);
  };

  /**
   * @param {Label} label
   * @return {Promise.<BaseJob>}
   */
  service.copy = function (label) {
    return udbApi
      .createLabel(label.name, label.isVisible, label.isPrivate, label.uuid)
      .then(createNewLabelJob);
  };

  /**
   * @param {Label} label
   * @return {Promise.<BaseJob>}
   */
  service.delete = function (label) {
    return udbApi
      .deleteLabel(label.uuid)
      .then(logLabelJob);
  };

  /**
   * @param {Label} label
   * @return {Promise.<BaseJob>}
   */
  service.makeInvisible = function (label) {
    return udbApi
      .updateLabel(label.uuid, 'MakeInvisible')
      .then(logLabelJob);
  };

  /**
   * @param {Label} label
   * @return {Promise.<BaseJob>}
   */
  service.makeVisible = function (label) {
    return udbApi
      .updateLabel(label.uuid, 'MakeVisible')
      .then(logLabelJob);
  };

  /**
   *
   * @param {Label} label
   * @return {Promise.<BaseJob>}
   */
  service.makePrivate = function (label) {
    return udbApi
      .updateLabel(label.uuid, 'MakePrivate')
      .then(logLabelJob);
  };

  /**
   * @param {Label} label
   * @return {Promise.<BaseJob>}
   */
  service.makePublic = function (label) {
    return udbApi
      .updateLabel(label.uuid, 'MakePublic')
      .then(logLabelJob);
  };

  /**
   * @param {Object} commandInfo
   * @return {Promise.<BaseJob>}
   */
  function logLabelJob(commandInfo) {
    var job = new BaseJob(commandInfo.commandId);
    jobLogger.addJob(job);

    return $q.resolve(job);
  }

  /**
   * @param {Object} commandInfo
   * @return {Promise.<BaseJob>}
   */
  function createNewLabelJob(commandInfo) {
    var job = new BaseJob(commandInfo.commandId);
    job.labelId = commandInfo.uuid;
    jobLogger.addJob(job);

    return $q.resolve(job);
  }
}
LabelManager.$inject = ["udbApi", "jobLogger", "BaseJob", "$q"];
})();

// Source: src/management/labels/labels-list.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:LabelsListController
 * @description
 * # LabelsListController
 */
angular
  .module('udb.management.labels')
  .controller('LabelsListController', LabelsListController);

/* @ngInject */
function LabelsListController(SearchResultGenerator, rx, $scope, LabelManager) {
  var llc = this;

  var itemsPerPage = 10;
  var minQueryLength = 3;
  var query$ = rx.createObservableFunction(llc, 'queryChanged');
  var filteredQuery$ = query$.filter(ignoreShortQueries);
  var page$ = rx.createObservableFunction(llc, 'pageChanged');
  var searchResultGenerator = new SearchResultGenerator(LabelManager, filteredQuery$, page$, itemsPerPage);
  var searchResult$ = searchResultGenerator.getSearchResult$();

  /**
   * @param {string} query
   * @return {boolean}
   */
  function ignoreShortQueries(query) {
    if (llc.query === '') {
      return true;
    }
    else {
      return query.length >= minQueryLength;
    }
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    llc.problem = problem;
  }

  function clearProblem()
  {
    llc.problem = false;
  }

  /**
   * @param {(PagedCollection|ApiProblem)} searchResult
   */
  function showSearchResult(searchResult) {
    var problem = searchResult.error;

    if (problem) {
      showProblem(problem);
      llc.searchResult = {};
    } else {
      clearProblem();
      llc.searchResult = searchResult;
    }

    llc.loading = false;
  }

  llc.loading = false;
  llc.query = '';
  llc.page = 0;
  llc.minQueryLength = minQueryLength;

  query$
    .safeApply($scope, function (query) {
      llc.query = query;
    })
    .subscribe();

  searchResult$
    .safeApply($scope, showSearchResult)
    .subscribe();

  filteredQuery$
    .merge(page$)
    .safeApply($scope, function () {
      llc.loading = true;
    })
    .subscribe();
}
LabelsListController.$inject = ["SearchResultGenerator", "rx", "$scope", "LabelManager"];
})();

// Source: src/management/labels/semicolon-label-check.directive.js
(function () {
'use strict';

angular
  .module('udb.management.labels')
  .directive('udbSemicolonLabelCheck', SemicolonLabelCheckDirective);

/** @ngInject */
function SemicolonLabelCheckDirective($q) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, controller) {

      function hasNoSemicolons(name) {
        return name === undefined || (name.indexOf(';') === -1);
      }

      controller.$validators.semicolonLabel = hasNoSemicolons;
    }
  };
}
SemicolonLabelCheckDirective.$inject = ["$q"];
})();

// Source: src/management/labels/unique-label.directive.js
(function () {
'use strict';

angular
  .module('udb.management.labels')
  .directive('udbUniqueLabel', UniqueLabelDirective);

/** @ngInject */
function UniqueLabelDirective(LabelManager, $q) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, controller) {
      function isUnique(labelName) {
        if (controller.$isEmpty(labelName)) {
          return $q.when();
        }

        var deferredUniqueCheck = $q.defer();

        LabelManager
          .get(labelName)
          .then(deferredUniqueCheck.reject, deferredUniqueCheck.resolve);

        return deferredUniqueCheck.promise;
      }

      controller.$asyncValidators.uniqueLabel = isUnique;
    }
  };
}
UniqueLabelDirective.$inject = ["LabelManager", "$q"];
})();

// Source: src/management/list-item-defaults.factory.js
(function () {
'use strict';

/**
 * @typedef {Object} ManagementListItem
 * @property {string} name
 * @property {RolePermission} permission
 * @property {number} notificationCount
 * @property {number} index
 * @property {string} sref
 * @property {string} icon
 */

/**
 * @ngdoc service
 * @name udb.management.listItemDefaults
 * @description
 * # Management list item defaults
 * These are the defaut values for the list items you can show in the app side bar.
 */
angular
  .module('udb.management')
  .factory('managementListItemDefaults', listItemDefaults);

/**
 * @ngInject
 * @return {ManagementListItem[]}
 */
function listItemDefaults(RolePermission) {
  return [
    {
      name: 'Valideren',
      permission: RolePermission.AANBOD_MODEREREN,
      notificationCount: 0,
      index: 1,
      sref: 'management.moderation.list',
      icon: 'fa-flag'
    },
    {
      name: 'Gebruikers',
      permission: RolePermission.GEBRUIKERS_BEHEREN,
      notificationCount: 0,
      index: 2,
      sref: 'management.users.list',
      icon: 'fa-user'
    },
    {
      name: 'Rollen',
      permission: RolePermission.GEBRUIKERS_BEHEREN,
      notificationCount: 0,
      index: 3,
      sref: 'split.manageRoles.list',
      icon: 'fa-users'
    },
    {
      name: 'Labels',
      permission: RolePermission.LABELS_BEHEREN,
      notificationCount: 0,
      index: 4,
      sref: 'split.manageLabels.list',
      icon: 'fa-tag'
    },
    {
      name: 'Organisaties',
      permission: RolePermission.ORGANISATIES_BEHEREN,
      notificationCount: 0,
      index: 5,
      sref: 'management.organizers.search',
      icon: 'fa-slideshare'
    }
  ];
}
listItemDefaults.$inject = ["RolePermission"];
})();

// Source: src/management/list-items.factory.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.management.listItems
 * @description
 * # Management list items
 * Return the management list items to show in the sidebar as  a promise.
 */
angular
  .module('udb.management')
  .factory('managementListItems', listItems);

/**
 * @ngInject
 * @return {Promise.<ManagementListItem[]>}
 */
function listItems(
  RolePermission,
  authorizationService,
  ModerationService,
  $q,
  managementListItemDefaults,
  appConfig
) {
  var globalPermissionListItems = authorizationService
    .getPermissions()
    .then(generateListItems);

  var moderationListItems = ModerationService
    .getMyRoles()
    .then(generateModerationListItems);

  var apiVersion;

  return $q
    .all([globalPermissionListItems, moderationListItems])
    .then(_.flatten);

  /**
   * @param {Role[]} roles
   * @return {number}
   */
  function countOffersWaitingForValidation(roles) {
    apiVersion = appConfig.roleConstraintsMode;

    var query = '';

    _.forEach(roles, function(role) {
      if (role.constraints !== undefined && role.constraints[apiVersion]) {
        query += (query ? ' OR ' : '') + role.constraints[apiVersion];
      }
    });
    query = (query ? '(' + query + ')' : '');
    return ModerationService
      .find(query, 10, 0)
      .then(function(searchResult) {
        return searchResult.totalItems;
      });
  }

  /**
   *
   * @param {number} waitingOfferCount
   * @return {ManagementListItem}
   */
  function generateModerationListItem(waitingOfferCount) {
    var defaultModerationListItem = _.find(
      managementListItemDefaults,
      {permission: RolePermission.AANBOD_MODEREREN}
    );

    var moderationListItem = angular.copy(defaultModerationListItem);
    //
    moderationListItem.notificationCount = waitingOfferCount;

    return moderationListItem;
  }

  /**
   * @param {Role[]} userRoles
   * @return {Promise.<ManagementListItem[]>}
   */
  function generateModerationListItems(userRoles) {
    var deferredListItems = $q.defer();

    var moderationRoles = _.filter(userRoles, function(role) {
      return _.includes(role.permissions, RolePermission.AANBOD_MODEREREN);
    });

    if (moderationRoles.length > 0) {
      countOffersWaitingForValidation(moderationRoles)
        .then(generateModerationListItem)
        .then(function(moderationListItem) {
          deferredListItems.resolve([moderationListItem]);
        });
    } else {
      deferredListItems.resolve([]);
    }

    return deferredListItems.promise;
  }

  /**
   * @param {RolePermission[]} userPermissions
   * @return {Promise.<ManagementListItem[]>}
   */
  function generateListItems(userPermissions) {
    var globalUserPermissions = _.without(userPermissions, RolePermission.AANBOD_MODEREREN);

    var listItems = _.filter(managementListItemDefaults, function (listItem) {
      return _.includes(globalUserPermissions, listItem.permission);
    });

    return $q.resolve(listItems);
  }
}
listItems.$inject = ["RolePermission", "authorizationService", "ModerationService", "$q", "managementListItemDefaults", "appConfig"];
})();

// Source: src/management/moderation/components/moderation-offer/moderation-offer.component.js
(function () {
'use strict';

/**
 * @ngdoc component
 * @name udb.management.moderation.directive:udbModerationOffer
 * @description
 * # udbModerationOffer
 */
angular
  .module('udb.management.moderation')
  .component('udbModerationOffer', {
    templateUrl: 'templates/moderation-offer.html',
    controller: ModerationOfferComponent,
    controllerAs: 'moc',
    bindings: {
      continue: '@',
      offerId: '@',
      offerType: '@'
    }
  });

/* @ngInject */
function ModerationOfferComponent(ModerationService, jsonLDLangFilter, OfferWorkflowStatus, $uibModal) {
  var moc = this;
  var defaultLanguage = 'nl';

  moc.loading = true;
  moc.offer = {};
  moc.error = false;

  moc.isReadyForValidation = isReadyForValidation;
  moc.isApproved = isApproved;
  moc.isRejected = isRejected;
  moc.approve = approve;
  moc.askForRejectionReasons = askForRejectionReasons;
  moc.continueValidation = continueValidation;

  // fetch offer
  ModerationService
    .getModerationOffer(moc.offerId)
    .then(function(offer) {
      offer.updateTranslationState();
      moc.offer = jsonLDLangFilter(offer, defaultLanguage);
    })
    .catch(showLoadingError)
    .finally(function() {
      moc.loading = false;
    });

  function showLoadingError(problem) {
    showProblem(problem || {title:'Dit aanbod kon niet geladen worden.'});
  }

  function continueValidation() {
    return moc.continue === 'true';
  }

  function isReadyForValidation() {
    return moc.offer.workflowStatus === OfferWorkflowStatus.READY_FOR_VALIDATION;
  }

  function isApproved() {
    return moc.offer.workflowStatus === OfferWorkflowStatus.APPROVED;
  }

  function isRejected() {
    return moc.offer.workflowStatus === OfferWorkflowStatus.REJECTED;
  }

  function approve() {
    moc.error = false;
    ModerationService
      .approve(moc.offer)
      .then(function() {
        moc.offer.workflowStatus = OfferWorkflowStatus.APPROVED;
      })
      .catch(showProblem);
  }

  function askForRejectionReasons() {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/reject-offer-confirm-modal.html',
      controller: 'RejectOfferConfirmModalCtrl'
    });

    modalInstance.result.then(reject);
  }

  /**
   * @param {string} reason
   *  DUPLICATE
   *  INAPPROPRIATE
   *  or a custom reason
   */
  function reject(reason) {
    if (reason === 'DUPLICATE') {
      flagAsDuplicate();
    } else if (reason === 'INAPPROPRIATE') {
      flagAsInappropriate();
    } else {
      rejectWithReason(reason);
    }
  }

  /**
   * an offer can be rejected without a reason added.
   */
  function rejectWithReason(reason) {
    moc.error = false;
    ModerationService
      .reject(moc.offer, reason)
      .then(function() {
        moc.offer.workflowStatus = OfferWorkflowStatus.REJECTED;
      })
      .catch(showProblem);
  }

  function flagAsDuplicate() {
    moc.error = false;
    ModerationService
      .flagAsDuplicate(moc.offer)
      .then(function() {
        moc.offer.workflowStatus = OfferWorkflowStatus.REJECTED;
      })
      .catch(showProblem);
  }

  function flagAsInappropriate() {
    moc.error = false;
    ModerationService
      .flagAsInappropriate(moc.offer)
      .then(function() {
        moc.offer.workflowStatus = OfferWorkflowStatus.REJECTED;
      })
      .catch(showProblem);
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    moc.error = problem.title + (problem.detail ? ' ' + problem.detail : '');
  }
}
ModerationOfferComponent.$inject = ["ModerationService", "jsonLDLangFilter", "OfferWorkflowStatus", "$uibModal"];
})();

// Source: src/management/moderation/components/moderation-summary/moderation-summary.component.js
(function () {
'use strict';

/**
 * @ngdoc component
 * @name udb.management.moderation:udbModerationSummaryComponent
 * @description
 * # udbModerationSummary
 */
angular
  .module('udb.management.moderation')
  .component('udbModerationSummary', {
    templateUrl: 'templates/moderation-summary.html',
    controller: ModerationSummaryComponent,
    controllerAs: 'moc',
    bindings: {
      offerId: '@',
      offerType: '@'
    }
  });

/* @ngInject */
function ModerationSummaryComponent(ModerationService, jsonLDLangFilter, authorizationService, appConfig) {
  var moc = this;
  var defaultLanguage = 'nl';

  moc.loading = true;
  moc.offer = {};
  moc.error = false;
  moc.uitId = _.get(appConfig, 'uitidUrl');
  authorizationService.isGodUser()
    .then(function (permission) {
      moc.isGodUser = permission;
    });

  // fetch offer
  ModerationService
    .getModerationOffer(moc.offerId)
    .then(function(offer) {
      offer.updateTranslationState();
      moc.offer = jsonLDLangFilter(offer, defaultLanguage);
      if (_.isEmpty(moc.offer.description)) {
        moc.offer.description = '';
      }
    })
    .catch(showLoadingError)
    .finally(function() {
      moc.loading = false;
    });

  function showLoadingError(problem) {
    showProblem(problem || {title:'Dit aanbod kon niet geladen worden.'});
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    moc.error = problem.title + (problem.detail ? ' ' + problem.detail : '');
  }

}
ModerationSummaryComponent.$inject = ["ModerationService", "jsonLDLangFilter", "authorizationService", "appConfig"];
})();

// Source: src/management/moderation/components/reject-offer-confirm-modal.controller.js
(function () {

'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:RoleDeleteConfirmModalCtrl
 * @description
 * # RoleDeleteConfirmModalCtrl
 * Modal to delete a role.
 */
angular
  .module('udb.management.moderation')
  .controller('RejectOfferConfirmModalCtrl', RejectOfferConfirmModalCtrl);

/* @ngInject */
function RejectOfferConfirmModalCtrl($scope, $uibModalInstance, $q) {

  $scope.cancel = cancel;
  $scope.reject = reject;
  $scope.response = {};

  /**
   * Delete the role.
   */
  function reject() {
    var answer;
    $scope.error = false;

    // if no type chosen or the reason hasn't been filled in for OTHER
    if (!$scope.response.type ||
          ($scope.response.type === 'OTHER' &&
            (!$scope.response.reason || !$scope.response.reason.length))) {
      $scope.error = 'Gelieve een reden op te geven.';
      return;
    }

    if ($scope.response.type === 'OTHER') {
      answer = $scope.response.reason;
    } else {
      answer = $scope.response.type;
    }

    $uibModalInstance.close($q.resolve(answer));
  }

  /**
   * Cancel, modal dismiss.
   */
  function cancel() {
    $uibModalInstance.dismiss();
  }

}
RejectOfferConfirmModalCtrl.$inject = ["$scope", "$uibModalInstance", "$q"];
})();

// Source: src/management/moderation/moderation-list.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:ModerationListController
 * @description
 * # ModerationListController
 */
angular
  .module('udb.management.moderation')
  .controller('ModerationListController', ModerationListController);

/**
 * @ngInject
 * @constructor
 *
 * @param {ModerationService} ModerationService
 * @param {Object} $uibModal
 * @param {RolePermission} RolePermission
 */
function ModerationListController(
  ModerationService,
  $uibModal,
  RolePermission,
  SearchResultGenerator,
  rx,
  $scope,
  $q,
  $document,
  appConfig
) {
  var moderator = this;

  var query$, page$, searchResultGenerator, searchResult$;
  var itemsPerPage = 10;
  $scope.apiVersion = appConfig.roleConstraintsMode;

  moderator.roles = [];

  moderator.loading = true;
  moderator.errorMessage = false;
  moderator.selectedRole = {};
  moderator.searchResult = {};

  moderator.findModerationContent = findModerationContent;

  // load the current user's moderation roles
  ModerationService
    .getMyRoles()
    .then(filterModeratorRoles)
    .then(configureObservables)
    .catch(showProblem) // stop loading when there's an error
    .finally(function() {
      moderator.loading = false;
    });

  function configureObservables(currentRole) {
    // configure observables for searching items
    query$ = rx.createObservableFunction(moderator, 'queryChanged');
    page$ = rx.createObservableFunction(moderator, 'pageChanged');
    searchResultGenerator = new SearchResultGenerator(
      ModerationService, query$, page$, itemsPerPage, currentRole.constraints[$scope.apiVersion]
    );
    searchResult$ = searchResultGenerator.getSearchResult$();

    // show search results
    searchResult$
      .safeApply($scope, showSearchResult)
      .subscribe();

    // show loading screen on query change
    query$
      .safeApply($scope, function () {
        moderator.loading = true;
      })
      .subscribe();

    page$.subscribe(function () {
      $document.scrollTop(0);
    });

    return $q.resolve();
  }

  function filterModeratorRoles(roles) {
    // only show roles with moderator permission
    var filteredRoles = _.filter(roles, function(role) {
      var canModerate = _.filter(role.permissions, function(permission) {
        return permission === RolePermission.AANBOD_MODEREREN;
      });
      return canModerate.length > 0;
    });

    if (filteredRoles.length) {
      moderator.roles = filteredRoles;
      moderator.selectedRole = moderator.roles[0];

      return $q.resolve(moderator.selectedRole);
    }

    // when no roles were found aka no current role is set
    // don't bother continueing
    return $q.reject({title:'Er is huidig geen moderator rol gekoppeld aan jouw gebruiker.'});
  }

  function findModerationContent(currentRole) {
    moderator.queryChanged(currentRole.constraints[$scope.apiVersion]);
  }

  /**
   * @param {(PagedCollection|ApiProblem)} searchResult
   */
  function showSearchResult(searchResult) {
    var problem = searchResult.error;

    if (problem) {
      showProblem(problem);
      moderator.searchResult = {};
    } else {
      moderator.searchResult = searchResult;
    }

    moderator.loading = false;
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    moderator.errorMessage = problem.title + (problem.detail ? ' ' + problem.detail : '');

    var modalInstance = $uibModal.open(
      {
        templateUrl: 'templates/unexpected-error-modal.html',
        controller: 'UnexpectedErrorModalController',
        size: 'sm',
        resolve: {
          errorMessage: function() {
            return moderator.errorMessage;
          }
        }
      }
    );
  }
}
ModerationListController.$inject = ["ModerationService", "$uibModal", "RolePermission", "SearchResultGenerator", "rx", "$scope", "$q", "$document", "appConfig"];
})();

// Source: src/management/moderation/moderation.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.management.moderation
 * @description
 * # Moderation Manager
 * This service allows you to lookup moderation lists and approve/reject/... Offers.
 */
angular
  .module('udb.management.moderation')
  .service('ModerationService', ModerationService);

/* @ngInject */
function ModerationService(udbApi, OfferWorkflowStatus, jobLogger, BaseJob, $q) {
  var service = this;

  /**
   * @return {Promise.<Role[]>}
   */
  service.getMyRoles = function() {
    return udbApi.getMyRoles();
  };

  /**
   * Find moderation items
   *
   * @param {string} queryString
   * @param {int} itemsPerPage
   * @param {int} offset
   *
   * @return {Promise.<PagedCollection>}
   */
  service.find = function(queryString, itemsPerPage, offset) {
    return udbApi
      .findToModerate(queryString, offset, itemsPerPage);
  };

  /**
   * @param {string} offerId
   *
   * @return {Promise.<Offer>}
   */
  service.getModerationOffer = function(offerId) {
    return udbApi.getOffer(new URL(offerId));
  };

  /**
   * @param {UdbPlace|UdbEvent} offer
   *
   * @return {Promise.<BaseJob>}
   */
  service.approve = function(offer) {
    return udbApi
      .patchOffer(offer['@id'], 'Approve');
  };

  /**
   * @param {UdbPlace|UdbEvent} offer
   *
   * @return {Promise.<BaseJob>}
   */
  service.reject = function(offer, reason) {
    return udbApi
      .patchOffer(offer['@id'], 'Reject', reason);
  };

  /**
   * @param {UdbPlace|UdbEvent} offer
   *
   * @return {Promise.<BaseJob>}
   */
  service.flagAsDuplicate = function(offer) {
    return udbApi
      .patchOffer(offer['@id'], 'FlagAsDuplicate');
  };

  /**
   * @param {UdbPlace|UdbEvent} offer
   *
   * @return {Promise.<BaseJob>}
   */
  service.flagAsInappropriate = function(offer) {
    return udbApi
      .patchOffer(offer['@id'], 'FlagAsInappropriate');
  };
}
ModerationService.$inject = ["udbApi", "OfferWorkflowStatus", "jobLogger", "BaseJob", "$q"];
})();

// Source: src/management/moderation/workflow.constant.js
(function () {
'use strict';

/* jshint sub: true */

/**
 * @ngdoc service
 * @name udb.management.moderation.OfferWorkflowStatus
 * @description
 * # OfferWorkflowStatus
 * All the possible workflow states defined as a constant
 */
angular
  .module('udb.management.moderation')
  .constant('OfferWorkflowStatus',
    /**
     * Enum for workflowStatus
     * @readonly
     * @name OfferWorkflowStatus
     * @enum {string}
     */
    {
      'DRAFT': 'DRAFT',
      'READY_FOR_VALIDATION': 'READY_FOR_VALIDATION',
      'APPROVED': 'APPROVED',
      'REJECTED': 'REJECTED',
      'DELETED': 'DELETED'
    }
  );
})();

// Source: src/management/organizers/delete/organization-delete.modal.controller.js
(function () {
'use strict';

/**
 * @ngdoc controller
 * @name udbApp.management.organizers.controller:OrganizationDeleteModalController
 * @var OrganizationDeleteModalController odc
 * @description
 * # OrganizationDeleteModalController
 * Modal to delete an organization
 */
angular
  .module('udb.management.organizers')
  .controller('OrganizationDeleteModalController', OrganizationDeleteModalController);

/* @ngInject */
function OrganizationDeleteModalController($uibModalInstance, OrganizerManager, organization) {
  var controller = this;

  controller.organization = organization;
  controller.saving = false;
  controller.error = false;

  controller.cancelRemoval = cancelRemoval;
  controller.deleteOrganization = deleteOrganization;

  /**
   * Delete the role.
   */
  function deleteOrganization() {
    controller.error = false;
    controller.saving = true;

    function showError() {
      controller.saving = false;
      controller.error = true;
    }

    OrganizerManager
      .delete(organization)
      .then($uibModalInstance.close)
      .catch(showError);
  }

  /**
   * Cancel, modal dismiss.
   */
  function cancelRemoval() {
    $uibModalInstance.dismiss();
  }
}
OrganizationDeleteModalController.$inject = ["$uibModalInstance", "OrganizerManager", "organization"];
})();

// Source: src/management/organizers/search/organization-search-item.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.management.organizers.directive:udbOrganizationSearchItem
 * @var udbOrganizationSearchItem osic
 * @description
 * # Organizer search item Directive
 */
angular
  .module('udb.management.organizers')
  .directive('udbOrganizationSearchItem', OrganizationSearchItem);

function OrganizationSearchItem() {
  return {
    restrict: 'A',
    templateUrl: 'templates/organization-search-item.html',
    bindToController: {
      organizationSearchItem: '<udbOrganizationSearchItem'
    },
    controller: OrganizationSearchItemController,
    controllerAs: 'osic'
  };
}

/* @ngInject */
function OrganizationSearchItemController(udbApi, $rootScope) {
  var controller = this;
  var organizationDeletedListener = $rootScope.$on('organizationDeleted', matchAndMarkAsDeleted);

  udbApi
    .getOrganizerByLDId(controller.organizationSearchItem['@id'])
    .then(showOrganization);

  /**
   *
   * @param {UdbOrganizer} organization
   */
  function showOrganization(organization) {
    controller.organization = organization;
  }

  function markAsDeleted() {
    organizationDeletedListener();
    controller.organizationDeleted = true;
  }

  /**
   * @param {Object} angularEvent
   * @param {UdbOrganizer} deletedOrganization
   */
  function matchAndMarkAsDeleted(angularEvent, deletedOrganization) {
    if (!controller.organization) {
      return;
    }

    if (controller.organization.id === deletedOrganization.id) {
      markAsDeleted();
    }
  }
}
OrganizationSearchItemController.$inject = ["udbApi", "$rootScope"];
})();

// Source: src/management/organizers/search/organization-search.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.management.organizers.controller:OrganizationSearchController
 * @description
 * # Organization Search Controller
 */
angular
  .module('udb.management.organizers')
  .controller('OrganizationSearchController', OrganizationSearchController);

/* @ngInject */
function OrganizationSearchController(SearchResultGenerator, rx, $scope, OrganizerManager) {
  var controller = this;

  var itemsPerPage = 10;
  var minQueryLength = 3;
  var query$ = rx.createObservableFunction(controller, 'queryChanged');
  var filteredQuery$ = query$.filter(ignoreShortQueries(minQueryLength));
  var page$ = rx.createObservableFunction(controller, 'pageChanged');
  var searchResultGenerator = new SearchResultGenerator(OrganizerManager, filteredQuery$, page$, itemsPerPage);
  var searchResult$ = searchResultGenerator.getSearchResult$();

  /**
   * @param {number} minQueryLength
   * @return {Function}
   */
  function ignoreShortQueries(minQueryLength) {
    /**
     * @param {string} query
     */
    return function (query) {
      return query === '' || query.length >= minQueryLength;
    };
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    controller.problem = problem;
  }

  function clearProblem()
  {
    controller.problem = false;
  }

  /**
   * @param {(PagedCollection|ApiProblem)} searchResult
   */
  function showSearchResult(searchResult) {
    var problem = searchResult.error;

    if (problem) {
      showProblem(problem);
      controller.searchResult = {};
    } else {
      clearProblem();
      controller.searchResult = searchResult;
    }

    controller.loading = false;
  }

  controller.loading = false;
  controller.query = '';
  controller.page = 0;
  controller.minQueryLength = minQueryLength;

  query$
    .safeApply($scope, function (query) {
      controller.query = query;
    })
    .subscribe();

  searchResult$
    .safeApply($scope, showSearchResult)
    .subscribe();

  filteredQuery$
    .merge(page$)
    .safeApply($scope, function () {
      controller.loading = true;
    })
    .subscribe();
}
OrganizationSearchController.$inject = ["SearchResultGenerator", "rx", "$scope", "OrganizerManager"];
})();

// Source: src/management/roles/components/role-delete-confirm-modal.controller.js
(function () {

'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:RoleDeleteConfirmModalCtrl
 * @description
 * # RoleDeleteConfirmModalCtrl
 * Modal to delete a role.
 */
angular
  .module('udb.management.roles')
  .controller('RoleDeleteConfirmModalCtrl', RoleDeleteConfirmModalController);

/* @ngInject */
function RoleDeleteConfirmModalController($scope, $uibModalInstance, RoleManager, item) {

  $scope.item = item;
  $scope.saving = false;
  $scope.error = false;

  $scope.cancelRemoval = cancelRemoval;
  $scope.deleteRole = deleteRole;

  /**
   * Delete the role.
   */
  function deleteRole() {
    $scope.error = false;
    $scope.saving = true;

    function showError() {
      $scope.saving = false;
      $scope.error = true;
    }

    RoleManager
      .deleteRole(item)
      .then($uibModalInstance.close)
      .catch(showError);
  }

  /**
   * Cancel, modal dismiss.
   */
  function cancelRemoval() {
    $uibModalInstance.dismiss();
  }

}
RoleDeleteConfirmModalController.$inject = ["$scope", "$uibModalInstance", "RoleManager", "item"];
})();

// Source: src/management/roles/delete-role-job.factory.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.management.roles.DeleteRoleJob
 * @description
 * This is the factory that creates jobs to delete roles.
 */
angular
  .module('udb.management.roles')
  .factory('DeleteRoleJob', DeleteRoleJobFactory);

/* @ngInject */
function DeleteRoleJobFactory(BaseJob, $q, JobStates) {

  /**
   * @class DeleteRoleJob
   * @constructor
   * @param {string} commandId
   * @param {Role} role
   */
  var DeleteRoleJob = function (commandId, role) {
    BaseJob.call(this, commandId);

    this.role = role;
    this.task = $q.defer();
  };

  DeleteRoleJob.prototype = Object.create(BaseJob.prototype);
  DeleteRoleJob.prototype.constructor = DeleteRoleJob;

  DeleteRoleJob.prototype.finish = function () {
    BaseJob.prototype.finish.call(this);

    if (this.state !== JobStates.FAILED) {
      this.task.resolve();
    }
  };

  DeleteRoleJob.prototype.fail = function () {
    BaseJob.prototype.fail.call(this);

    this.task.reject();
  };

  DeleteRoleJob.prototype.getDescription = function() {
    return 'Rol verwijderen: "' +  this.role.name + '".';
  };

  return (DeleteRoleJob);
}
DeleteRoleJobFactory.$inject = ["BaseJob", "$q", "JobStates"];
})();

// Source: src/management/roles/permission.constant.js
(function () {
'use strict';

/* jshint sub: true */

/**
 * @ngdoc service
 * @name udb.management.roles.Permission
 * @description
 * # Permission
 * All the possible job states defined as a constant
 */
angular
  .module('udb.management.roles')
  .constant('RolePermission',
    /**
     * Enum for permissions
     * @readonly
     * @name RolePermission
     * @enum {string}
     */
    {
      'AANBOD_BEWERKEN': 'AANBOD_BEWERKEN',
      'AANBOD_MODEREREN': 'AANBOD_MODEREREN',
      'AANBOD_VERWIJDEREN': 'AANBOD_VERWIJDEREN',
      'ORGANISATIES_BEWERKEN': 'ORGANISATIES_BEWERKEN',
      'ORGANISATIES_BEHEREN': 'ORGANISATIES_BEHEREN',
      'GEBRUIKERS_BEHEREN': 'GEBRUIKERS_BEHEREN',
      'LABELS_BEHEREN': 'LABELS_BEHEREN',
      'VOORZIENINGEN_BEWERKEN': 'VOORZIENINGEN_BEWERKEN'
    }
  );
})();

// Source: src/management/roles/role-form.controller.js
(function () {
'use strict';

/**
 * @typedef {Object} TranslatedPermission
 * @property {RolePermission} key
 * @property {string} name
 */

/**
 * @ngdoc function
 * @name udbApp.controller:RoleFormController
 * @description
 * # RoleFormController
 */
angular
  .module('udb.management.roles')
  .controller('RoleFormController', RoleFormController);

/**
 * @ngInject
 * @constructor
 *
 * @param {RoleManager} RoleManager
 * @param {UserManager} UserManager
 * @param {Object} $uibModal
 * @param {Object} $stateParams
 * @param {Object} $q
 * @param {Function} $translate
 * @param {RolePermission} RolePermission
 */
function RoleFormController(
  RoleManager,
  UserManager,
  $uibModal,
  $stateParams,
  $q,
  $translate,
  RolePermission
) {
  var editor = this;
  var roleId = $stateParams.id;

  editor.saving = false;
  editor.loadedRole = false;
  editor.loadedRolePermissions = false;
  editor.loadedRoleUsers = false;
  editor.loadedRoleLabels = false;
  editor.addingUser = false;
  editor.role = {
    permissions: [],
    users: [],
    labels: []
  };
  /**
   * @type {TranslatedPermission[]}
   */
  editor.availablePermissions = [];
  editor.originalRole = {
    permissions: [],
    users: [],
    labels: []
  };
  editor.errorMessage = false;
  editor.editName = false;
  editor.editConstraintV2 = false;
  editor.editConstraintV3 = false;

  editor.addUser = addUser;
  editor.addLabel = addLabel;
  editor.createRole = createRole;
  editor.removeLabel = removeLabel;
  editor.removeUser = removeUser;
  editor.updatePermission = updatePermission;
  editor.updateName = updateName;
  editor.createConstraint = createConstraint;
  editor.updateConstraint = updateConstraint;
  editor.removeConstraint = removeConstraint;
  editor.constraintExists = constraintExists;

  function init() {
    getAllRolePermissions()
      .then(function(permissions) {
        editor.availablePermissions = permissions;
        return roleId ? loadRole(roleId) : $q.resolve();
      })
      .catch(showProblem) // stop loading when there's an error
      .finally(function() {
        // no matter what resest loading indicators
        editor.loadedRole = true;
        editor.loadedRolePermissions = true;
        editor.loadedRoleUsers = true;
        editor.loadedRoleLabels = true;
      });
  }

  function loadRole(roleId) {
    return RoleManager
      .get(roleId)
      .then(function(role) {
        editor.role = role;
        editor.originalRole = role;

        editor.role.users = [];
        editor.role.labels = [];
        editor.role.permissions = _.filter(editor.availablePermissions, function (permission) {
          return _.contains(role.permissions, permission.key);
        });
      }, function(problem) {
        problem.detail = problem.title;
        problem.title = 'De rol kon niet gevonden worden.';
        return $q.reject(problem);
      })
      .then(function () {
        return loadRoleUsers(roleId);
      })
      .then(function () {
        return loadRoleLabels(roleId);
      });
  }

  /**
   * @return {TranslatedPermission[]}
   */
  function getAllRolePermissions() {
    var permissionIds = _.values(RolePermission);

    function formatTranslatedPermissions(translations) {
      return _.map(translations, function (translation, translationId) {
        return {
          key: translationId,
          name: translation
        };
      });
    }

    return $translate(permissionIds)
      .then(formatTranslatedPermissions);
  }

  function loadRoleUsers(roleId) {
    return RoleManager
      .getRoleUsers(roleId)
      .then(function (users) {
        editor.role.users = users;
      }, function(problem) {
        problem.detail = problem.title;
        problem.title = 'De leden van deze rol konden niet geladen worden.';
        return $q.reject(problem);
      });
  }

  function loadRoleLabels(roleId) {
    return RoleManager
      .getRoleLabels(roleId)
      .then(function (labels) {
        editor.role.labels = labels;
      }, function(problem) {
        problem.detail = problem.title;
        problem.title = 'De labels van deze rol konden niet geladen worden.';
        return $q.reject(problem);
      });
  }

  function roleCreated (response) {
    roleId = response.roleId;
    // set uuid because a GET role would have a uuid as well
    editor.role.uuid = roleId;
    editor.originalRole.uuid = roleId;
  }

  function createRole() {
    if (!editor.role.uuid && editor.role.name) {
      RoleManager
        .create(editor.role.name)
        .then(roleCreated, showProblem)
        .finally(function () {
          editor.saving = false;
        });
    }
  }

  function constraintExists(version) {
    return _.has(editor.originalRole.constraints, version);
  }

  function createConstraint(version) {
    editor.saving = true;
    RoleManager
        .createRoleConstraint(roleId, version, editor.role.constraints[version])
        .then(function() {
          if (version === 'v3') {
            editor.editConstraintV3 = false;
          }
          else {
            editor.editConstraintV2 = false;
          }
        }, showProblem)
        .finally(function() {
          editor.saving = false;
        });
  }

  function updateConstraint(version) {
    editor.saving = true;
    RoleManager
      .updateRoleConstraint(roleId, version, editor.role.constraints[version])
      .then(function() {
        if (version === 'v3') {
          editor.editConstraintV3 = false;
        }
        else {
          editor.editConstraintV2 = false;
        }
      }, showProblem)
      .finally(function() {
        editor.saving = false;
      });
  }

  function removeConstraint(version) {
    editor.saving = true;
    RoleManager
        .removeRoleConstraint(roleId, version)
        .then(function() {
          if (version === 'v3') {
            editor.editConstraintV3 = false;
          }
          else {
            editor.editConstraintV2 = false;
          }
        }, showProblem)
        .finally(function() {
          editor.saving = false;
        });
  }

  function updateName() {
    editor.saving = true;
    RoleManager
      .updateRoleName(roleId, editor.role.name)
      .then(function() {
        editor.editName = false;
      }, showProblem)
      .finally(function() {
        editor.saving = false;
      });
  }

  /**
   *
   * @param {RolePermission} permission
   */
  function updatePermission(permission) {
    editor.loadedRolePermissions = false;
    var permissionUpdate = $q.reject();

    if (_.find(editor.role.permissions, {key: permission.key})) {
      editor.role.permissions = _.reject(editor.role.permissions, {key: permission.key});
      permissionUpdate = RoleManager.removePermissionFromRole(permission.key, roleId);
    } else {
      editor.role.permissions.push(permission);
      permissionUpdate = RoleManager.addPermissionToRole(permission.key, roleId);
    }

    permissionUpdate
      .catch(showProblem)
      .finally(function() {
        editor.loadedRolePermissions = true;
      })
    ;
  }

  function addLabel(label) {
    editor.saving = true;

    RoleManager
      .addLabelToRole(roleId, label.uuid)
      .then(function () {
        editor.role.labels.push(label);
      }, showProblem)
      .finally(function() {
        editor.saving = false;
      });
  }

  function removeLabel(label) {
    editor.saving = true;

    RoleManager
      .removeLabelFromRole(roleId, label.uuid)
      .then(function () {
        var pos = editor.role.labels.indexOf(label);
        editor.role.labels.splice(pos, 1);
      }, showProblem)
      .finally(function() {
        editor.saving = false;
      });
  }

  function removeUser(user) {
    var role = _.pick(editor.role, ['uuid', 'name', 'constraint']);

    editor.saving = true;

    RoleManager
      .removeUserFromRole(role, user)
      .then(function () {
        var pos = editor.role.users.indexOf(user);
        editor.role.users.splice(pos, 1);
      }, showProblem)
      .finally(function() {
        editor.saving = false;
      });
  }

  function addUser() {
    editor.addingUser = true;
    var userAdded = false;

    UserManager
      .findUserWithEmail(editor.email)
      .then(function(user) {
        var userExists = false;
        userAdded = user;

        angular.forEach(editor.role.users, function(roleUser) {
          if (roleUser.uuid === user.uuid) {
            userExists = true;
          }
        });

        if (userExists) {
          return $q.reject({
            title: 'De gebruiker hangt al aan deze rol.'
          });
        } else {
          return user;
        }
      })
      .then(function(user) {
        var role = _.pick(editor.role, ['uuid', 'name', 'constraint']);
        return RoleManager.addUserToRole(user, role);
      })
      .then(function() {
        editor.role.users.push(userAdded);
        editor.form.email.$setViewValue('');
        editor.form.email.$setPristine(true);
        editor.form.email.$render();
      })
      .catch(showProblem)
      .finally(function() {
        editor.addingUser = false;
      });
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    editor.errorMessage = problem.title + (problem.detail ? ' ' + problem.detail : '');

    var modalInstance = $uibModal.open(
      {
        templateUrl: 'templates/unexpected-error-modal.html',
        controller: 'UnexpectedErrorModalController',
        size: 'sm',
        resolve: {
          errorMessage: function() {
            return editor.errorMessage;
          }
        }
      }
    );
  }

  init();
}
RoleFormController.$inject = ["RoleManager", "UserManager", "$uibModal", "$stateParams", "$q", "$translate", "RolePermission"];
})();

// Source: src/management/roles/role-manager.service.js
(function () {
'use strict';

/**
 * @typedef {Object} Role
 * @property {string}   uuid
 * @property {string}   name
 * @property {string}   constraint
 * @property {RolePermission[]} permissions
 */

/**
 * @typedef {Object} roleUpdate
 * @property {string} @name
 * @property {string} @constraint
 */

/**
 * @ngdoc service
 * @name udb.management.roles
 * @description
 * # Role Manager
 * This service allows you to lookup roles and perform actions on them.
 */
angular
  .module('udb.management.roles')
  .service('RoleManager', RoleManager);

/* @ngInject */
function RoleManager(udbApi, jobLogger, BaseJob, $q, DeleteRoleJob, UserRoleJob) {
  var service = this;

  /**
   * @param {string} query
   * @param {int} limit
   * @param {int} start
   *
   * @return {Promise.<PagedCollection>}
   */
  service.find = function(query, limit, start) {
    return udbApi.findRoles(query, limit, start);
  };

  /**
   * @param {string|uuid} roleIdentifier
   *  The name or uuid of a role.
   * @return {Promise.<Role>}
   */
  service.get = function(roleIdentifier) {
    return udbApi.getRoleById(roleIdentifier);
  };

  /**
   * @param {string|uuid} roleId
   *  The name or uuid of a role.
   * @return {Promise.<Role>}
   */
  service.getRolePermissions = function(roleId) {
    return udbApi.getRolePermissions(roleId);
  };

  /**
   * @param {string|uuid} roleId
   *  The name or uuid of a role.
   * @return {Promise.<Role>}
   */
  service.getRoleUsers = function(roleId) {
    return udbApi.getRoleUsers(roleId);
  };

  /**
   * @param {string} name
   *  The name of the new role.
   * @return {Promise.<Role>}
   */
  service.create = function(name) {
    return udbApi.createRole(name);
  };

  /**
   * @param {RolePermission} permission
   *  The permission to add to the role
   * @param {string} roleId
   *  roleId for the role
   * @return {Promise}
   */
  service.addPermissionToRole = function(permission, roleId) {
    return udbApi
      .addPermissionToRole(permission, roleId)
      .then(logRoleJob);
  };

  /**
   * @param {RolePermission} permission
   *  The key for the permission
   * @param {string} roleId
   *  roleId for the role
   * @return {Promise}
   */
  service.removePermissionFromRole = function(permission, roleId) {
    return udbApi
      .removePermissionFromRole(permission, roleId)
      .then(logRoleJob);
  };

  /**
   * @param {User} user
   *  The user you want to add a role to
   * @param {Role} role
   *  The role you want added to the user
   * @return {Promise.<UserRoleJob>}
   */
  service.addUserToRole = function(user, role) {
    return udbApi
      .addUserToRole(user.uuid, role.uuid)
      .then(userRoleJobCreator(user, role));
  };

  /**
   * @param {uuid} roleId
   * @param {string} name
   * @return {Promise}
   */
  service.updateRoleName = function(roleId, name) {
    return udbApi
      .updateRoleName(roleId, name)
      .then(logRoleJob);
  };

  /**
   *
   * @param {uuid} roleId
   * @param {string} version
   * @param {string} constraint
   * @returns {Promise}
   */
  service.createRoleConstraint = function(roleId, version, constraint) {
    return udbApi
        .createRoleConstraint(roleId, version, constraint)
        .then(logRoleJob);
  };

  /**
   * @param {uuid} roleId
   * @param {string} version
   * @param {string} constraint
   * @return {Promise}
   */
  service.updateRoleConstraint = function(roleId, version, constraint) {
    return udbApi
        .updateRoleConstraint(roleId, version, constraint)
        .then(logRoleJob);
  };

  /**
   * @param {uuid} roleId
   * @param {string} version
   * @param {string} constraint
   * @return {Promise}
   */
  service.removeRoleConstraint = function(roleId, version) {
    return udbApi
        .removeRoleConstraint(roleId, version)
        .then(logRoleJob);
  };

  /**
   * @param {uuid} roleId
   * @param {uuid} labelId
   * @return {Promise.<BaseJob>}
   */
  service.addLabelToRole = function(roleId, labelId) {
    return udbApi
      .addLabelToRole(roleId, labelId)
      .then(logRoleJob);
  };

  /**
   * @param {uuid} roleId
   * @return {Promise}
   */
  service.getRoleLabels = function(roleId) {
    return udbApi
      .getRoleLabels(roleId);
  };

  /**
   * @param {uuid} roleId
   * @param {uuid} labelId
   * @return {Promise.<BaseJob>}
   */
  service.removeLabelFromRole = function(roleId, labelId) {
    return udbApi
      .removeLabelFromRole(roleId, labelId)
      .then(logRoleJob);
  };

  /**
   * @param {Role} role
   * @param {User} user
   * @return {Promise.<UserRoleJob>}
   */
  service.removeUserFromRole = function(role, user) {
    return udbApi
      .removeUserFromRole(role.uuid, user.uuid)
      .then(userRoleJobCreator(user, role));
  };

  /**
   * @param {Role} role
   * @return {Promise}
   */
  service.deleteRole = function (role) {
    function logDeleteJob(jobData) {
      var job = new DeleteRoleJob(jobData.commandId, role);
      jobLogger.addJob(job);

      return $q.resolve(job);
    }

    return udbApi
      .removeRole(role.uuid)
      .then(logDeleteJob);
  };

  /**
   * @param {Object} commandInfo
   * @return {Promise.<BaseJob>}
   */
  function logRoleJob(commandInfo) {
    var job = new BaseJob(commandInfo.commandId);
    jobLogger.addJob(job);

    return $q.resolve(job);
  }

  /**
   * Returns a callable function that takes a command info and returns a user role job promise.
   *
   * @param {User} user
   * @param {Role} role
   */
  function userRoleJobCreator(user, role) {
    /**
     * @param {CommandInfo} commandInfo
     * @return {Promise.<UserRoleJob>}
     */
    return function(commandInfo) {
      var job = new UserRoleJob(commandInfo.commandId, user, role);
      jobLogger.addJob(job);

      return $q.resolve(job);
    };
  }
}
RoleManager.$inject = ["udbApi", "jobLogger", "BaseJob", "$q", "DeleteRoleJob", "UserRoleJob"];
})();

// Source: src/management/roles/roles-list.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:RolesListController
 * @description
 * # RolesListController
 */
angular
  .module('udb.management.roles')
  .controller('RolesListController', RolesListController);

/* @ngInject */
function RolesListController(SearchResultGenerator, rx, $scope, RoleManager, $uibModal, $state, $document) {
  var rlc = this;

  var itemsPerPage = 10;
  var minQueryLength = 3;

  var query$ = rx.createObservableFunction(rlc, 'queryChanged');
  var filteredQuery$ = query$.filter(ignoreShortQueries);
  var page$ = rx.createObservableFunction(rlc, 'pageChanged');
  var searchResultGenerator = new SearchResultGenerator(RoleManager, filteredQuery$, page$, itemsPerPage);
  var searchResult$ = searchResultGenerator.getSearchResult$();

  /**
   * Filter applied on query-stream to ignore too short queries
   * @param {string} query
   * @return {boolean}
   */
  function ignoreShortQueries(query) {
    if (rlc.query === '') {
      return true;
    }
    else {
      return query.length >= minQueryLength;
    }
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    rlc.problem = problem;
  }

  function clearProblem()
  {
    rlc.problem = false;
  }

  /**
   * @param {(PagedCollection|ApiProblem)} searchResult
   */
  function showSearchResult(searchResult) {
    var problem = searchResult.error;

    if (problem) {
      showProblem(problem);
      rlc.searchResult = {};
    } else {
      clearProblem();
      rlc.searchResult = searchResult;
    }

    rlc.loading = false;
  }

  function openDeleteConfirmModal(role) {
    var modalInstance = $uibModal.open({
        templateUrl: 'templates/role-delete-confirm-modal.html',
        controller: 'RoleDeleteConfirmModalCtrl',
        resolve: {
          item: function () {
            return role;
          }
        }
      });
    modalInstance.result.then(function() {
      $state.reload();
    });
    // TODO: $state.reload isn't the best way to do it, better have another stream
  }
  rlc.openDeleteConfirmModal = openDeleteConfirmModal;

  rlc.loading = false;
  rlc.query = '';
  rlc.page = 0;
  rlc.minQueryLength = minQueryLength;

  query$
    .safeApply($scope, function (query) {
      rlc.query = query;
    })
    .subscribe();

  searchResult$
    .safeApply($scope, showSearchResult)
    .subscribe();

  filteredQuery$
    .merge(page$)
    .safeApply($scope, function () {
      rlc.loading = true;
    })
    .subscribe();

  page$
    .subscribe(function () {
      $document.scrollTop(0);
    });
}
RolesListController.$inject = ["SearchResultGenerator", "rx", "$scope", "RoleManager", "$uibModal", "$state", "$document"];
})();

// Source: src/management/roles/search-label.component.js
(function () {
'use strict';

angular
  .module('udb.management.roles')
  .component('udbSearchLabel', {
    templateUrl: 'templates/search-label.html',
    controller: LabelSearchComponent,
    controllerAs: 'select',
    bindings: {
      labelAdded: '&',
      labelRemoved: '&'
    }
  });

/** @ngInject */
function LabelSearchComponent(LabelManager) {
  var select = this;
  /** @type {Label[]} */
  select.availableLabels = [];
  select.suggestLabels = suggestLabels;
  select.minimumInputLength = 2;
  select.findDelay = 300;
  select.label = null;

  function findSuggestions(name) {
    LabelManager
      .find(name, 6, 0)
      .then(function(results) {
        setAvailableLabels(results.member);
      })
      .finally(function () {
        select.refreshing = false;
      });
  }

  function suggestLabels(name) {
    select.refreshing = true;
    setAvailableLabels([]);
    findSuggestions(name);
  }

  /** @param {Label[]} labels */
  function setAvailableLabels(labels) {
    select.availableLabels = labels;
  }
}
LabelSearchComponent.$inject = ["LabelManager"];
})();

// Source: src/management/roles/unique-role.directive.js
(function () {
'use strict';

angular
  .module('udb.management.roles')
  .directive('udbUniqueRole', UniqueRoleDirective);

/** @ngInject */
function UniqueRoleDirective(RoleManager, $q) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, controller) {
      function isUnique(roleName) {
        if (controller.$isEmpty(roleName)) {
          return $q.when();
        }

        var deferredUniqueCheck = $q.defer();

        RoleManager
          .get(roleName)
          .then(deferredUniqueCheck.reject, deferredUniqueCheck.resolve);

        return deferredUniqueCheck.promise;
      }

      controller.$asyncValidators.uniqueRole = isUnique;
    }
  };
}
UniqueRoleDirective.$inject = ["RoleManager", "$q"];
})();

// Source: src/management/search-result-generator.factory.js
(function () {
'use strict';

/**
 * @ngdoc factory
 * @name udb.management.SearchResultGenerator
 * @description
 * # Search Result Generator
 * Provides a stream of paged search results.
 */
angular
  .module('udb.management')
  .factory('SearchResultGenerator', SearchResultGenerator);

/* @ngInject */
function SearchResultGenerator(rx) {
  /**
   * @class SearchResultGenerator
   * @constructor
   * @param {Object} searchService
   * @param {Observable} query$
   * @param {Observable} page$
   * @param {Number} itemsPerPage
   */
  var SearchResultGenerator = function (searchService, query$, page$, itemsPerPage, start) {
    start = start || '';
    this.searchService = searchService;
    this.itemsPerPage = itemsPerPage;
    this.query$ = query$.debounce(300).startWith(start);
    this.offset$ = page$.map(pageToOffset(itemsPerPage)).startWith(0);

    this.searchParameters$ = rx.Observable.combineLatest(
      this.query$,
      this.offset$,
      combineQueryParameters
    );
  };

  SearchResultGenerator.prototype.constructor = SearchResultGenerator;

  /**
   * @param {string} query
   * @param {Number} offset
   * @return {{query: *, offset: *}}
   */
  function combineQueryParameters(query, offset) {
    return {query: query, offset: offset};
  }

  /**
   * @param {Number} itemsPerPage
   * @return {Function}
   */
  function pageToOffset(itemsPerPage) {
    return function(page) {
      return (page - 1) * itemsPerPage;
    };
  }

  /**
   * @param {{query: *, offset: *}} searchParameters
   * @return {Observable.<PagedCollection|Object>}
   */
  SearchResultGenerator.prototype.find = function (searchParameters) {
    var generator = this;

    return rx.Observable
      .fromPromise(
        generator.searchService.find(
          searchParameters.query,
          generator.itemsPerPage,
          searchParameters.offset
        )
      )
      .catch(function(searchError) {
        return rx.Observable.just({error : searchError});
      });
  };

  SearchResultGenerator.prototype.getSearchResult$ = function () {
    var generator = this;

    return generator.searchParameters$
      .flatMap(generator.find.bind(generator));
  };

  return (SearchResultGenerator);
}
SearchResultGenerator.$inject = ["rx"];
})();

// Source: src/management/search.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.management.SearchService
 * @description
 * # Search Service
 * This is a placeholder service to feed the search result generator.
 */
angular
  .module('udb.management')
  .service('SearchService', SearchService);

/* @ngInject */
function SearchService($q) {
  var service = this;

  /**
   * @param {string} query
   * @param {int} limit
   * @param {int} start
   *
   * @return {Promise.<PagedCollection>}
   */
  service.find = function(query, limit, start) {
    return $q.resolve({
      '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
      '@type': 'PagedCollection',
      'itemsPerPage': 10,
      'totalItems': 0,
      'member': [],
      'firstPage': 'http://du.de/items?page=1',
      'lastPage': 'http://du.de/items?page=1',
      'nextPage': 'http://du.de/items?page=1'
    });
  };
}
SearchService.$inject = ["$q"];
})();

// Source: src/management/users/user-editor.controller.js
(function () {
'use strict';

/**
 * @typedef {Object} RoleAction
 * @property {Role} item
 * @property {ActionCallback} perform
 *  The API action that has to be performed for this action.
 */

/**
 * @callback ActionCallback
 * @param {Promise.<UserRoleJob>} job
 */

/**
 * @ngdoc function
 * @name udbApp.controller:UserEditorController
 * @description
 * # UserEditorController
 */
angular
  .module('udb.management.users')
  .controller('UserEditorController', UserEditorController);

/* @ngInject */
function UserEditorController(UserManager, RoleManager, $stateParams, $q) {
  var editor = this;
  var userId = $stateParams.id;

  loadUser(userId);

  function loadUser(userId) {
    UserManager
      .get(userId)
      .then(showUser);

    UserManager
      .getRoles(userId)
      .then(showUserRoles);
  }

  /**
   * @param {User} user
   */
  function showUser(user) {
    editor.user = user;
  }

  /**
   * @param {Role[]} roles
   */
  function showUserRoles(roles) {
    editor.roles = roles;
  }

  /**
   * @param {Role} role
   */
  editor.deleteRole = function (role) {
    var deleteRoleAction = {
      role: role,
      style: 'list-group-item-danger',
      perform: _.once(function () {
        return RoleManager
          .removeUserFromRole(role, editor.user)
          .then(returnTaskPromise);
      }),
      undo: function () {
        console.log('¯\\_(ツ)_/¯');
      }
    };

    editor.queueAction(deleteRoleAction);
  };

  function returnTaskPromise(job) {
    return $q.when(job.task.promise);
  }

  /**
   * @param {RoleAction} action
   */
  editor.queueAction = function (action) {
    var currentActions = editor.actions ? editor.actions : [];

    if (!editor.getRoleAction(action.role)) {
      currentActions.push(action);
      editor.actions = currentActions;
    }
  };

  /**
   * @param {Role} role
   */
  editor.getRoleStyle = function(role) {
    var action = editor.getRoleAction(role);

    return action ? action.style : null;
  };

  /**
   * @param {Role} role
   */
  editor.getRoleAction =  function (role) {
    return _.find(editor.actions, {
      role: {
        uuid: role.uuid
      }
    });
  };

  /**
   * @param {string} roleName
   * @return {Promise.<Role[]>}
   */
  editor.lookupRoles = function (roleName) {
    return RoleManager
      .find(roleName, 20)
      .then(function (pagedRoleCollection) {
        return _.reject(pagedRoleCollection.member, function (role) {
          return _.find(editor.roles, {uuid: role.uuid});
        });
      });
  };

  /**
   * @param {Role} role
   */
  editor.addRole = function (role) {
    if (_.find(editor.roles, {uuid: role.uuid})) {
      return; // do nothing when the user already has the role
    }

    editor.roles.push(role);
    editor.roleLookupName = '';

    var addRoleAction = {
      role: role,
      style: 'list-group-item-success',
      perform: _.once(function () {
        return RoleManager
          .addUserToRole(editor.user, role)
          .then(returnTaskPromise);
      }),
      undo: function () {
        editor.roles = _.reject(editor.roles, {uuid: role.uuid});
      }
    };

    editor.queueAction(addRoleAction);
  };

  editor.save = function() {
    editor.saving = true;
    var actionPromises = _.map(editor.actions, performAction);

    $q.all(actionPromises)
      .then(function () {
        loadUser(userId);
        editor.saving = false;
        editor.actions = [];
      });
  };

  /**
   * @param {RoleAction} action
   */
  function performAction(action) {
    return action
      .perform()
      .catch(action.undo);
  }

  /**
   * @param {Role} role
   */
  editor.undoAction = function(role) {
    var action = editor.getRoleAction(role);
    action.undo();

    editor.actions = _.reject(
      editor.actions,
      {
        role: {
          uuid: role.uuid
        }
      }
    );
  };
}
UserEditorController.$inject = ["UserManager", "RoleManager", "$stateParams", "$q"];
})();

// Source: src/management/users/user-manager.service.js
(function () {
'use strict';

/**
 * @typedef {Object} User
 * @property {string}   uuid
 * @property {string}   email
 * @property {string}   username
 */

/**
 * @ngdoc service
 * @name udb.management.users
 * @description
 * # User Manager
 * This service allows you to lookup users and perform actions on them.
 */
angular
  .module('udb.management.users')
  .service('UserManager', UserManager);

/* @ngInject */
function UserManager(udbApi, $q) {
  var service = this;

  /**
   * @param {string} email
   *  A valid email address with a specific domain. The wildcard '*' can be used in the local part.
   * @param {int} limit
   * @param {int} start
   *
   * @return {Promise.<PagedCollection>}
   */
  service.find = function (email, limit, start) {
    return udbApi.findUsersByEmail(email, limit, start);
  };

  /**
   * @param {string} email
   *
   * @returns {Promise}
   *
   */
  service.findUserWithEmail = function(email) {
    return udbApi.findUserWithEmail(email);
  };

  /**
   * @param {string} userId
   *
   * @returns {Promise.<User>}
   */
  service.get = function(userId) {
    return udbApi.getUser(userId);
  };

  /**
   * @param {string} userId
   *
   * @return {Promise.<Role[]>}
   */
  service.getRoles = function (userId) {
    return udbApi.getUserRoles(userId);
  };
}
UserManager.$inject = ["udbApi", "$q"];
})();

// Source: src/management/users/user-role-job.factory.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.management.users.UserRoleJob
 * @description
 * # User Role Job
 * This Is the factory that creates a user role job
 */
angular
  .module('udb.management.users')
  .factory('UserRoleJob', UserRoleJobFactory);

/* @ngInject */
function UserRoleJobFactory(BaseJob, JobStates, $q) {

  /**
   * @class UserRoleJob
   * @constructor
   * @param {string} commandId
   * @param {User} user
   * @param {Role} role
   */
  var UserRoleJob = function (commandId, user, role) {
    BaseJob.call(this, commandId);

    this.role = role;
    this.user = user;
    this.task = $q.defer();
  };

  UserRoleJob.prototype = Object.create(BaseJob.prototype);
  UserRoleJob.prototype.constructor = UserRoleJob;

  UserRoleJob.prototype.finish = function () {
    BaseJob.prototype.finish.call(this);

    if (this.state !== JobStates.FAILED) {
      this.task.resolve();
    }
  };

  UserRoleJob.prototype.fail = function () {
    BaseJob.prototype.fail.call(this);

    this.task.reject();
  };

  UserRoleJob.prototype.getDescription = function () {
    var job = this,
      description;

    var failedDescriptionTemplate = _.template(
      'Het toekennen of verwijderen van de rol: "${role.name}" is mislukt voor "${user.username}".'
    );
    var descriptionTemplate = _.template(
      'Toevoegen of verwijderen van de rol: "${role.name}" voor gebruiker "${user.username}".'
    );

    if (this.state === JobStates.FAILED) {
      description = failedDescriptionTemplate(job);
    } else {
      description = descriptionTemplate(job);
    }

    return description;
  };

  return (UserRoleJob);
}
UserRoleJobFactory.$inject = ["BaseJob", "JobStates", "$q"];
})();

// Source: src/management/users/users-list.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:UsersListController
 * @description
 * # UsersListController
 */
angular
  .module('udb.management.users')
  .controller('UsersListController', UsersListController);

/* @ngInject */
function UsersListController(SearchResultGenerator, rx, $scope, UserManager, $uibModal, $state, $document) {
  var ulc = this;

  var itemsPerPage = 20;
  var minQueryLength = 3;

  ulc.query = '';
  ulc.problem = false;
  ulc.loading = true;
  ulc.query = '';
  ulc.page = 0;
  ulc.minQueryLength = minQueryLength;

  var query$ = rx.createObservableFunction(ulc, 'queryChanged');
  var filteredQuery$ = query$.filter(ignoreShortQueries);
  var page$ = rx.createObservableFunction(ulc, 'pageChanged');
  var searchResultGenerator = new SearchResultGenerator(UserManager, filteredQuery$, page$, itemsPerPage);
  var searchResult$ = searchResultGenerator.getSearchResult$();

  /**
   * @param {string} query
   * @return {boolean}
   */
  function ignoreShortQueries(query) {
    if (ulc.query === '') {
      return true;
    }
    else {
      return query.length >= minQueryLength;
    }
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    ulc.problem = problem;
  }

  function clearProblem()
  {
    ulc.problem = false;
  }

  /**
   * @param {(PagedCollection|ApiProblem)} searchResult
   */
  function showSearchResult(searchResult) {
    var problem = searchResult.error;

    if (problem) {
      showProblem(problem);
      ulc.searchResult = {};
    } else {
      clearProblem();
      ulc.searchResult = searchResult;
    }

    ulc.loading = false;
  }

  function openDeleteConfirmModal(user) {
    var modalInstance = $uibModal.open({
        templateUrl: 'templates/user-delete-confirm-modal.html',
        controller: 'UserDeleteConfirmModalCtrl',
        resolve: {
          item: function () {
            return user;
          }
        }
      });
    modalInstance.result.then($state.reload);
  }
  ulc.openDeleteConfirmModal = openDeleteConfirmModal;

  query$
    .safeApply($scope, function (query) {
      ulc.query = query;
    })
    .subscribe();

  searchResult$
    .safeApply($scope, showSearchResult)
    .subscribe();

  filteredQuery$
    .merge(page$)
    .safeApply($scope, function () {
      ulc.loading = true;
    })
    .subscribe();

  page$.subscribe(function () {
    $document.scrollTop(0);
  });
}
UsersListController.$inject = ["SearchResultGenerator", "rx", "$scope", "UserManager", "$uibModal", "$state", "$document"];
})();

// Source: src/media/media-manager.service.js
(function () {
'use strict';

/**
 * @typedef {Object} MediaObject
 * @property {string}   @id
 * @property {string}   @type
 * @property {string}   contentUrl
 * @property {string}   thumbnailUrl
 * @property {string}   description
 * @property {string}   copyrightHolder
 */

/**
 * @ngdoc function
 * @name udb.media.service:MediaManager
 * @description
 * # MediaManager
 * Service to manage media.
 */
angular
  .module('udb.media')
  .service('MediaManager', MediaManager);

/**
 * @ngInject
 */
function MediaManager(jobLogger, appConfig, $q, udbApi) {
  var service = this;

  /**
   * @param {File} imageFile
   * @param {string} description
   * @param {string} copyrightHolder
   *
   * @return {Promise.<MediaObject>}
   */
  service.createImage = function(imageFile, description, copyrightHolder, language) {
    var deferredMediaObject = $q.defer();
    var allowedFileExtensions = ['png', 'jpeg', 'jpg', 'gif'];

    function getFileExtension(filename) {
      return filename.split('/').pop();
    }

    function isAllowedFileExtension(fileExtension) {
      return allowedFileExtensions.indexOf(fileExtension) >= 0;
    }

    function fetchAndReturnMedia(response) {
      service
        .getImage(response.data.imageId)
        .then(deferredMediaObject.resolve, deferredMediaObject.reject);
    }

    if (!isAllowedFileExtension(getFileExtension(imageFile.type))) {
      deferredMediaObject.reject({
        data: {
          title: 'The uploaded file is not an image.'
        }
      });
    } else {
      udbApi
        .uploadMedia(imageFile, description, copyrightHolder, language)
        .then(fetchAndReturnMedia, deferredMediaObject.reject);
    }

    return deferredMediaObject.promise;
  };

  /**
   * @param {string} imageId
   *
   * @return {Promise.<MediaObject>}
   */
  service.getImage = function (imageId) {
    function returnMediaObject(data) {
      var mediaObject = data;
      mediaObject.id = imageId;

      return $q.resolve(mediaObject);
    }

    return udbApi
      .getMedia(imageId)
      .then(returnMediaObject);
  };
}
MediaManager.$inject = ["jobLogger", "appConfig", "$q", "udbApi"];
})();

// Source: src/migration/event-migration-footer.component.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.migration.component:udbEventMigrationFooter
 * @description
 * # Event Migration Footer
 * Footer component for migrating events
 */
angular
  .module('udb.migration')
  .component('udbEventMigrationFooter', {
    templateUrl: 'templates/event-migration-footer.component.html',
    controller: EventMigrationFooterController,
    controllerAs: 'migration'
  });

/* @ngInject */
function EventMigrationFooterController(EventFormData, $stateParams, $state) {
  var controller = this;

  controller.completeMigration = completeMigration;
  controller.destination = $stateParams.destination;
  controller.migrationReady = migrationReady;

  function completeMigration () {
    if (migrationReady()) {
      $state.go($stateParams.destination.state, {id: EventFormData.id});
    }
  }

  function migrationReady () {
    return !!_.get(EventFormData, 'location.id');
  }
}
EventMigrationFooterController.$inject = ["EventFormData", "$stateParams", "$state"];
})();

// Source: src/migration/event-migration.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.migration.eventMigration
 * @description
 * Event Migration Service
 */
angular
  .module('udb.migration')
  .service('eventMigration', EventMigrationService);

/* @ngInject */
function EventMigrationService() {
  var service = this;

  var migrationRequirements = {
    location: hasKnownLocation
  };

  /**
   * @param {udbEvent} event
   */
  function hasKnownLocation(event) {
    return !!_.get(event, 'location.id');
  }

  /**
   * @param {udbEvent} event
   *
   * @return string[]
   *  A list of migrations steps needed to meet all requirements.
   */
  service.checkRequirements = function (event) {
    var migrationSteps = _(migrationRequirements)
      .pick(function (requirementCheck) {
        return !requirementCheck(event);
      })
      .keys();

    return migrationSteps.value();
  };

}
})();

// Source: src/offer_translate/components/address/translate.address.component.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.offer-translate:TranslateAddressController
 * @description
 * # TranslateAddressController
 * Controller for the address translation component
 */
angular
    .module('udb.offer-translate')
    .component('offerTranslateAddress', {
      templateUrl: 'templates/translate-address.html',
      controller: TranslateAddressController,
      controllerAs: 'tac',
      bindings: {
        offer: '<',
        activeLanguages: '<'
      }
    });

/* @ngInject */
function TranslateAddressController(offerTranslator) {
  var controller = this;

  controller.translatedAddresses = {};

  controller.originalAddress = _.get(controller.offer.address, controller.offer.mainLanguage, '') ||
      _.get(controller.offer.address, 'nl', '') ||
      _.get(controller.offer, 'address', '');

  controller.translatedAddresses = _.get(controller.offer, 'address');
  _.forEach(controller.activeLanguages, function(language, key) {
    if (controller.translatedAddresses[key] === undefined) {
      controller.translatedAddresses[key] = {
        postalCode: controller.originalAddress.postalCode,
        addressLocality: controller.originalAddress.addressLocality,
        addressCountry: controller.originalAddress.addressCountry
      };
    }
  });

  controller.saveTranslatedAddress = saveTranslatedAddress;

  function saveTranslatedAddress(language) {

    offerTranslator
        .translateAddress(controller.offer, language, controller.translatedAddresses[language]);
  }
}
TranslateAddressController.$inject = ["offerTranslator"];
})();

// Source: src/offer_translate/components/description/translate-description.component.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.offer-translate:TranslateDescriptionController
 * @description
 * # TranslateDescriptionController
 * Controller for the description translation component
 */
angular
    .module('udb.offer-translate')
    .component('offerTranslateDescription', {
      templateUrl: 'templates/translate-description.html',
      controller: TranslateDescriptionController,
      controllerAs: 'ttd',
      bindings: {
        offer: '<',
        activeLanguages: '<'
      }
    });

/* @ngInject */
function TranslateDescriptionController(offerTranslator) {
  var controller = this;

  controller.translatedDescriptions = {};
  controller.originalDescription = _.get(controller.offer.description, controller.offer.mainLanguage, '') ||
      _.get(controller.offer.description, 'nl', '') ||
      _.get(controller.offer, 'description', '');
  controller.originalDescription = _.isEmpty(controller.originalDescription) ? '' : controller.originalDescription;

  controller.translatedDescriptions = _.get(controller.offer, 'description');

  controller.saveTranslatedDescription = saveTranslatedDescription;

  function saveTranslatedDescription(language) {
    offerTranslator
        .translateProperty(controller.offer, 'description', language, controller.translatedDescriptions[language])
        .then(function() {
          //
        });
  }
}
TranslateDescriptionController.$inject = ["offerTranslator"];
})();

// Source: src/offer_translate/components/images/translate-images.component.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.offer-translate:TranslateImagesController
 * @description
 * # TranslateImagesController
 * Controller for the images translation component
 */
angular
    .module('udb.offer-translate')
    .component('offerTranslateImages', {
      templateUrl: 'templates/translate-images.html',
      controller: TranslateImagesController,
      controllerAs: 'tic',
      bindings: {
        offer: '<',
        activeLanguages: '<'
      }
    });

/* @ngInject */
function TranslateImagesController($uibModal, eventCrud, MediaManager, EventFormData) {
  var controller = this;

  EventFormData.init();

  controller.eventFormData = EventFormData;
  if (controller.offer.mediaObject) {
    EventFormData.mediaObjects = controller.offer.mediaObject || [];
  }
  EventFormData.name = controller.offer.name;
  EventFormData.apiUrl = controller.offer.apiUrl;
  EventFormData.mainLanguage = controller.offer.mainLanguage;

  controller.openUploadImageModal = openUploadImageModal;
  controller.removeImage = removeImage;
  controller.editImage = editImage;
  controller.copyImage = copyImage;

  /**
   * Open the upload modal.
   */
  function openUploadImageModal(language) {
    EventFormData.mainLanguage = language;
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/event-form-image-upload.html',
      controller: 'EventFormImageUploadController',
      resolve: {
        EventFormData: function () {
          return EventFormData;
        }
      }
    });
  }

  function copyImage(image, language) {
    var blob = null;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', image.contentUrl);
    xhr.responseType = 'blob';
    xhr.onload = function() {
      blob = xhr.response;
      MediaManager
          .createImage(blob, image.description, image.copyrightHolder, language)
          .then(
              addImageToEvent, displayError
          );
    };
    xhr.send();
  }

  /**
   * Open the modal to edit an image of the item.
   *
   * @param {MediaObject} image
   *    The media object of the image to edit.
   */
  function editImage(image) {
    $uibModal.open({
      templateUrl: 'templates/event-form-image-edit.html',
      controller: 'EventFormImageEditController',
      resolve: {
        EventFormData: function () {
          return EventFormData;
        },
        mediaObject: function () {
          return image;
        }
      }
    });
  }

  /**
   * Open the modal to remove an image.
   *
   * @param {MediaObject} image
   * The media object of the image to remove from the item.
   */
  function removeImage(image) {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/event-form-image-remove.html',
      controller: 'EventFormImageRemoveController',
      resolve: {
        EventFormData: function () {
          return EventFormData;
        },
        image: function () {
          return image;
        }
      }
    });
  }

  /**
   * @param {MediaObject} mediaObject
   */
  function addImageToEvent(mediaObject) {
    function updateImageForm() {
      EventFormData.addImage(mediaObject);
    }

    eventCrud
        .addImage(EventFormData, mediaObject)
        .then(updateImageForm, displayError);
  }

  function displayError(errorResponse) {
    var errorMessage = errorResponse.data.title;
    var error = 'Er ging iets mis bij het opslaan van de afbeelding.';

    switch (errorMessage) {
      case 'The uploaded file is not an image.':
        error = 'Het geüpload bestand is geen geldige afbeelding. ' +
            'Enkel bestanden met de extenties .jpeg, .gif of .png zijn toegelaten.';
        break;
      case 'The file size of the uploaded image is too big.':
        error = 'Het geüpload bestand is te groot.';
        break;
    }

    controller.saving = false;
    controller.error = error;
  }
}
TranslateImagesController.$inject = ["$uibModal", "eventCrud", "MediaManager", "EventFormData"];
})();

// Source: src/offer_translate/components/tariffs/translate-tariffs.component.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.offer-translate:TranslateTariffsController
 * @description
 * # TranslateTariffsController
 * Controller for the tariffs translation component
 */
angular
    .module('udb.offer-translate')
    .component('offerTranslateTariffs', {
      templateUrl: 'templates/translate-tariffs.html',
      controller: TranslateTariffsController,
      controllerAs: 'ttsc',
      bindings: {
        offer: '<',
        activeLanguages: '<'
      }
    });

/* @ngInject */
function TranslateTariffsController(eventCrud) {
  var controller = this;

  controller.translatedTariffs = [];

  controller.originalTariffs = getOriginalTariffs();
  controller.translatedTariffs = getTranslatedTariffs();

  controller.saveTranslatedTariffs = saveTranslatedTariffs;

  function saveTranslatedTariffs() {
    for (var key in controller.offer.priceInfo) {
      if (key > 0) {
        var originalTariff = {};
        originalTariff[controller.offer.mainLanguage] = controller.originalTariffs[key - 1];
        controller.offer.priceInfo[key].name =
            _.merge(originalTariff, controller.translatedTariffs[key - 1]);
      }
    }

    eventCrud.updatePriceInfo(controller.offer);
  }

  function getOriginalTariffs() {
    var originalTariffs = [];
    for (var key in controller.offer.priceInfo) {
      if (key > 0) {
        originalTariffs.push(
            controller.offer.priceInfo[key].name[controller.offer.mainLanguage] ?
                controller.offer.priceInfo[key].name[controller.offer.mainLanguage] :
                controller.offer.priceInfo[key].name);
      }
    }

    return originalTariffs;
  }

  function getTranslatedTariffs() {
    var translatedTariffs = [];
    for (var key in controller.offer.priceInfo) {
      if (key > 0) {
        translatedTariffs.push(controller.offer.priceInfo[key].name);
      }
    }

    return translatedTariffs;
  }
}
TranslateTariffsController.$inject = ["eventCrud"];
})();

// Source: src/offer_translate/components/title/translate-title.component.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.offer-translate:TranslateTitleController
 * @description
 * # TranslateTitleController
 * Controller for the title translation component
 */
angular
    .module('udb.offer-translate')
    .component('offerTranslateTitle', {
      templateUrl: 'templates/translate-title.html',
      controller: TranslateTitleController,
      controllerAs: 'ttc',
      bindings: {
        offer: '<',
        activeLanguages: '<'
      }
    });

/* @ngInject */
function TranslateTitleController(offerTranslator) {
  var controller = this;

  controller.translatedNames = {};
  controller.originalName = _.get(controller.offer.name, controller.offer.mainLanguage, null) ||
      _.get(controller.offer.name, 'nl', null) ||
      _.get(controller.offer, 'name', '');

  controller.translatedNames = _.get(controller.offer, 'name');

  controller.saveTranslatedName = saveTranslatedName;

  function saveTranslatedName(language) {
    offerTranslator
        .translateProperty(controller.offer, 'name', language, controller.translatedNames[language])
        .then(function() {
          //
        });
  }
}
TranslateTitleController.$inject = ["offerTranslator"];
})();

// Source: src/offer_translate/offer-translate.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:OfferTranslateController
 * @description
 * # OffertranslateController
 * Init the event form
 */
angular
  .module('udb.offer-translate')
  .controller('OfferTranslateController', OfferTranslateController);

/* @ngInject */
function OfferTranslateController(
    $scope,
    offerId,
    udbApi,
    jsonLDLangFilter,
    $q,
    $translate,
    $state
) {

  $scope.apiUrl = '';
  $scope.loaded = false;
  $scope.mainLanguage = '';
  $scope.languages = ['nl', 'fr', 'en', 'de'];
  $scope.activeLanguages = {
    'nl': {'active': false, 'main': false},
    'fr': {'active': false, 'main': false},
    'en': {'active': false, 'main': false},
    'de': {'active': false, 'main': false}
  };

  // Functions
  $scope.openEditPage = openEditPage;
  $scope.goToDashboard = goToDashboard;

  $q.when(offerId)
    .then(fetchOffer, offerNotFound);

  function startTranslating(offer) {
    $scope.language = $translate.use() || 'nl';
    $scope.cachedOffer = offer;
    $scope.apiUrl = offer.apiUrl;
    $scope.mainLanguage = offer.mainLanguage ? offer.mainLanguage : 'nl';
    $scope.translatedOffer = jsonLDLangFilter(offer, $scope.language, true);
    $scope.originalName = $scope.translatedOffer.name;

    $scope.offerType = offer.url.split('/').shift();
    if ($scope.offerType === 'event') {
      $scope.isEvent = true;
      $scope.isPlace = false;
    } else {
      $scope.isEvent = false;
      $scope.isPlace = true;
    }

    _.forEach($scope.cachedOffer.name, function(name, language) {
      $scope.activeLanguages[language].active = true;
    });

    $scope.activeLanguages[$scope.mainLanguage].main = true;

    $scope.loaded = true;
  }

  function offerNotFound() {
    console.log('offer not found');
  }

  /**
   * @param {string|null} offerId
   */
  function fetchOffer(offerId) {
    if (!offerId) {
      offerNotFound();
    } else {
      udbApi
        .getOffer(offerId)
        .then(startTranslating);
    }
  }

  function openEditPage() {
    var offerLocation = $scope.cachedOffer.id.toString();
    var id = offerLocation.split('/').pop();
    $state.go('split.eventEdit', {id: id});
  }

  function goToDashboard() {
    $state.go('split.footer.dashboard');
  }
}
OfferTranslateController.$inject = ["$scope", "offerId", "udbApi", "jsonLDLangFilter", "$q", "$translate", "$state"];
})();

// Source: src/offer_translate/offer-translate.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:offer-translate.html
 * @description
 * # udb offer translate directive
 */
angular
  .module('udb.offer-translate')
  .directive('udbOfferTranslate', OfferTranslateDirective);

/* @ngInject */
function OfferTranslateDirective() {
  return {
    templateUrl: 'templates/offer-translate.html',
    restrict: 'EA',
  };
}
})();

// Source: src/organizers/components/organizer-address/organizer-address.component.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:OrganizerAddressController
 * @description
 * # OrganizerAddressController
 * Modal for setting the reservation period.
 */
angular
    .module('udb.organizers')
    .component('udbOrganizerAddress', {
      templateUrl: 'templates/organizer-address.html',
      controller: OrganizerAddressComponent,
      controllerAs: 'oac',
      bindings: {
        address: '=',
        onUpdate: '&'
      }
    });

/* @ngInject */
function OrganizerAddressComponent($scope, Levenshtein, citiesBE, citiesNL, appConfig, $q) {
  var controller = this;

  function init () {
    controller.availableCountries = appConfig.offerEditor.countries;
    controller.defaultCountry = _.find(controller.availableCountries, function(country) { return country.default; });
    controller.selectedCountry = controller.defaultCountry;
    if (controller.address.addressCountry !== '') {
      controller.selectedCountry = {
        code: controller.address.addressCountry,
        default: true
      };
    }
    else {
      controller.selectedCountry = controller.defaultCountry;
    }
    controller.address.addressCountry = controller.selectedCountry.code;

    controller.cities = controller.selectedCountry.code === 'BE' ? citiesBE : citiesNL;
    controller.selectedCity = '';
    controller.requiredAddress = false;

    if (controller.address.addressLocality) {
      controller.selectedCity = controller.address.postalCode + ' ' + controller.address.addressLocality;
      controller.requiredAddress = true;
    }
  }

  controller.streetHasErrors = false;
  controller.cityHasErrors = false;
  controller.addressHasErrors = false;
  controller.zipHasErrors = false;
  controller.zipValidateError = false;

  controller.validateAddress = validateAddress;
  controller.filterCities = filterCities;
  controller.orderByLevenshteinDistance = orderByLevenshteinDistance;
  controller.selectCity = selectCity;
  controller.changeCitySelection = changeCitySelection;
  controller.changeCountrySelection = changeCountrySelection;
  controller.$onInit = init;

  $scope.$on('organizerAddressSubmit', function () {
    controller.organizerAddressForm.$setSubmitted();
    reset();
    validateAddress();
  });

  function reset() {
    controller.streetHasErrors = false;
    controller.cityHasErrors = false;
    controller.zipValidateError = false;
    controller.zipHasErrors = false;
    controller.addressHasErrors = false;
  }

  function validateAddress() {
    reset();
    if (controller.requiredAddress) {
      if (controller.address.streetAddress === '' ||
          controller.address.streetAddress === undefined) {
        controller.streetHasErrors = true;
      }
      if (controller.selectedCity === '') {
        controller.cityHasErrors = true;
      }
      if (controller.selectedCountry.code === 'NL') {
        if (controller.address.postalCode === '' ||
            controller.address.postalCode === undefined) {
          controller.zipHasErrors = true;
          controller.zipValidateError = !validateNlPostalCode(controller.address.postalCode);
        }
      }
    }
    else {
      if (controller.selectedCity !== '') {
        if (controller.address.streetAddress === '' ||
            controller.address.streetAddress === undefined) {
          controller.streetHasErrors = true;
        }

        if (controller.selectedCountry.code === 'NL') {
          if (controller.address.postalCode === '' ||
              controller.address.postalCode === undefined) {
            controller.zipHasErrors = true;
            controller.zipValidateError = !validateNlPostalCode(controller.address.postalCode);
          }
        }
      }

      if (controller.address.streetAddress !== '') {
        if (controller.selectedCity === '') {
          controller.cityHasErrors = true;
        }

        if (controller.address.postalCode === '' ||
            controller.address.postalCode === undefined) {
          controller.zipHasErrors = true;
          controller.zipValidateError = !validateNlPostalCode(controller.address.postalCode);
        }
      }

      if (controller.selectedCountry.code === 'NL') {
        if (controller.address.postalCode !== '') {
          if (controller.address.streetAddress === '' ||
              controller.address.streetAddress === undefined) {
            controller.streetHasErrors = true;
          }

          if (controller.selectedCity === '') {
            controller.cityHasErrors = true;
          }
          controller.zipValidateError = !validateNlPostalCode(controller.address.postalCode);
        }
      }
    }
    sendUpdate();
  }

  function validateNlPostalCode(postalCode) {
    var regex = new RegExp(/^[0-9]{4}[a-z]{2}$/i);
    return regex.test(postalCode);
  }

  function filterCities(value) {
    return function (city) {
      var length = value.length;
      var words = value.match(/\w+/g);
      var labelMatches = words.filter(function (word) {
        return city.label.toLowerCase().indexOf(word.toLowerCase()) !== -1;
      });

      return labelMatches.length >= words.length;
    };
  }

  function orderByLevenshteinDistance(value) {
    return function (city) {
      return new Levenshtein(value, city.label);
    };
  }

  /**
   * Select City.
   */
  function selectCity($item, $label) {
    if (controller.selectedCountry.code === 'BE') {
      controller.address.postalCode = $item.zip;
    }

    controller.address.addressLocality = $item.name;

    controller.cityAutocompleteTextField = '';
    controller.selectedCity = $label;
    validateAddress();
  }

  /**
   * Change a city selection.
   */
  function changeCitySelection() {
    controller.address.postalCode = '';
    controller.address.addressLocality = '';

    controller.selectedCity = '';
    controller.cityAutocompleteTextField = '';
    validateAddress();
  }

  /**
   * Change a city selection.
   */
  function changeCountrySelection() {
    if (controller.selectedCountry.code === 'NL') {
      controller.cities = citiesNL;
    }
    else {
      controller.cities = citiesBE;
    }
    controller.address.addressCountry = controller.selectedCountry.code;
    changeCitySelection();
  }

  function sendUpdate() {
    controller.addressHasErrors = controller.streetHasErrors || controller.cityHasErrors ||
        controller.zipHasErrors || controller.zipValidateError;
    controller.onUpdate({error: controller.addressHasErrors});
  }
}
OrganizerAddressComponent.$inject = ["$scope", "Levenshtein", "citiesBE", "citiesNL", "appConfig", "$q"];
})();

// Source: src/organizers/components/organizer-contact/organizer-contact.component.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormOrganizerAddressController
 * @description
 * # EventFormOrganizerAddressController
 * Modal for setting the reservation period.
 */
angular
    .module('udb.organizers')
    .component('udbOrganizerContact', {
      templateUrl: 'templates/organizer-contact.html',
      controller: OrganizerContactComponent,
      controllerAs: 'occ',
      bindings: {
        contact: '=',
        onUpdate: '&'
      }
    });

/* @ngInject */
function OrganizerContactComponent($scope, appConfig) {
  var controller = this;

  controller.newContact = {};
  controller.addingContactEntry = false;
  controller.isPristine = true;
  controller.validateContact = validateContact;
  controller.addOrganizerContactEntry = addOrganizerContactEntry;
  controller.cancelOrganizerContactEntry = cancelOrganizerContactEntry;
  controller.addOrganizerContactInfo = addOrganizerContactInfo;
  controller.deleteOrganizerContactInfo = deleteOrganizerContactInfo;
  controller.sendUpdate = sendUpdate;
  controller.contactUrlRegex = new RegExp(/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i);

  $scope.$on('organizerContactSubmit', function() {
    controller.organizerContactWrapper.$setSubmitted();
  });

  function validateContact() {
    if (_.find(controller.contact, {'value': ''}) ||
        _.find(controller.contact, {'value': undefined}) ||
        (controller.organizerContactWrapper.$invalid &&  controller.organizerContactWrapper.$dirty)) {
      controller.contactHasErrors = true;
    }
    else {
      controller.contactHasErrors = false;
    }
    sendUpdate();
  }

  function resetOrganizerContactEntry() {
    controller.newContact = {
      type : '',
      value : ''
    };
  }

  /**
   * Add a contact info entry for an organizer.
   */
  function addOrganizerContactEntry(type) {
    controller.newContact = {
      type : type,
      value : ''
    };
    controller.isPristine = true;
    controller.addingContactEntry = true;
  }

  /**
   * Add a contact info entry for an organizer.
   */
  function cancelOrganizerContactEntry() {
    resetOrganizerContactEntry();
    controller.addingContactEntry = false;
    controller.isPristine = true;
  }

  /* */
  function addOrganizerContactInfo() {
    validateContact();
    if (!controller.contactHasErrors) {
      controller.contact.push(controller.newContact);
      resetOrganizerContactEntry();
      controller.addingContactEntry = false;
      controller.isPristine = true;
      sendUpdate();
    }
  }

  /**
   * Remove a given key of the contact info.
   */
  function deleteOrganizerContactInfo(index) {
    controller.contact.splice(index, 1);
    validateContact();
  }

  function sendUpdate() {
    controller.onUpdate({error: controller.contactHasErrors});
  }

  $scope.$watch(function() {
    return controller.newContact;
  }, function(value) {
    if (value && value.value && value.value !== '') {
      controller.isPristine = false;
    }
  }, true);
}
OrganizerContactComponent.$inject = ["$scope", "appConfig"];
})();

// Source: src/organizers/detail/organizer-detail.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:OrganizerDetailController
 * @description
 * # OrganizerDetailController
 */
angular
  .module('udb.organizers')
  .controller('OrganizerDetailController', OrganizerDetailController);

/* @ngInject */
function OrganizerDetailController(OrganizerManager, $uibModal, $stateParams, $location, $state) {
  var controller = this;
  var organizerId = $stateParams.id;
  var stateName = $state.current.name;

  // labels scope variables and functions
  controller.labelSaving = false;
  controller.addLabel = addLabel;
  controller.deleteLabel = deleteLabel;
  controller.labelResponse = '';
  controller.labelsError = '';
  controller.deleteOrganization = deleteOrganization;
  controller.isManageState = isManageState;
  controller.finishedLoading = finishedLoading;

  function loadOrganizer(organizerId) {
    OrganizerManager
      .get(organizerId)
      .then(showOrganizer);
  }

  loadOrganizer(organizerId);

  /**
   * @param {udbOrganizer} organizer
   */
  function showOrganizer(organizer) {
    controller.organizer = organizer;
  }

  function addLabel(label) {
    controller.labelSaving = true;
    clearLabelsError();

    OrganizerManager
      .addLabelToOrganizer(organizerId, label.name)
      .catch(showProblem)
      .finally(function() {
        controller.labelSaving = false;
        removeFromCache();
      });
  }

  function deleteLabel(label) {
    controller.labelSaving = true;
    clearLabelsError();
    removeFromCache();

    OrganizerManager
        .deleteLabelFromOrganizer(organizerId, label.name)
        .catch(showUnlabelProblem)
        .finally(function() {
          controller.labelSaving = false;
        });
  }

  function removeFromCache() {
    OrganizerManager.removeOrganizerFromCache(organizerId);
  }

  function clearLabelsError() {
    controller.labelResponse = '';
    controller.labelsError = '';
  }

  function isManageState() {
    return (stateName.indexOf('manage') !== -1);
  }

  function goToOrganizerOverview() {
    $location.path('/manage/organizations');
  }

  function goToOrganizerOverviewOnJobCompletion(job) {
    job.task.promise.then(goToOrganizerOverview);
  }

  function deleteOrganization() {
    openOrganizationDeleteConfirmModal(controller.organizer);
  }

  function openOrganizationDeleteConfirmModal(organizer) {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/organization-delete.modal.html',
      controller: 'OrganizationDeleteModalController',
      controllerAs: 'odc',
      resolve: {
        organization: function () {
          return organizer;
        }
      }
    });

    modalInstance.result
      .then(goToOrganizerOverviewOnJobCompletion);
  }

  /**
   * @param {ApiProblem} problem
   */
  function showUnlabelProblem(problem) {
    loadOrganizer(organizerId);
    controller.labelResponse = 'unlabelError';
    controller.labelsError = problem.title;
  }

  /**
   * @param {ApiProblem} problem
   */
  function showProblem(problem) {
    controller.errorMessage = problem.title + (problem.detail ? ' ' + problem.detail : '');

    var modalInstance = $uibModal.open(
      {
        templateUrl: 'templates/unexpected-error-modal.html',
        controller: 'UnexpectedErrorModalController',
        size: 'sm',
        resolve: {
          errorMessage: function() {
            return controller.errorMessage;
          }
        }
      }
    );
  }

  function finishedLoading () {
    return (controller.organizer && !controller.loadingError);
  }
}
OrganizerDetailController.$inject = ["OrganizerManager", "$uibModal", "$stateParams", "$location", "$state"];
})();

// Source: src/organizers/organization-delete-job.factory.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udbApp.organizers.CreateDeleteOrganizerJob
 * @description
 * # Oragnizer deletion job
 * This factory creates a job that tracks organizer deletion.
 */
angular
  .module('udb.organizers')
  .factory('CreateDeleteOrganizerJob', CreateDeleteOrganizerFactory);

/* @ngInject */
function CreateDeleteOrganizerFactory(BaseJob, JobStates, $q) {

  /**
   * @class CreateDeleteOrganizerJob
   * @constructor
   * @param {string} commandId
   */
  var CreateDeleteOrganizerJob = function (commandId) {
    BaseJob.call(this, commandId);
    this.task = $q.defer();
  };

  CreateDeleteOrganizerJob.prototype = Object.create(BaseJob.prototype);
  CreateDeleteOrganizerJob.prototype.constructor = CreateDeleteOrganizerJob;

  CreateDeleteOrganizerJob.prototype.finish = function () {
    if (this.state !== JobStates.FAILED) {
      this.state = JobStates.FINISHED;
      this.finished = new Date();
      this.task.resolve();
    }
    this.progress = 100;
  };

  CreateDeleteOrganizerJob.prototype.fail = function () {
    this.finished = new Date();
    this.state = JobStates.FAILED;
    this.progress = 100;
    this.task.reject('Failed to delete the organization');
  };

  return (CreateDeleteOrganizerJob);
}
CreateDeleteOrganizerFactory.$inject = ["BaseJob", "JobStates", "$q"];
})();

// Source: src/organizers/organizer-form.controller.js
(function () {
'use strict';

/* @ngInject */
function OrganizerFormController(
    OrganizerManager,
    udbOrganizers,
    $state,
    $stateParams,
    $q,
    $scope,
    $translate,
    eventCrud,
    appConfig
) {
  var controller = this;
  var organizerId = $stateParams.id;
  var stateName = $state.current.name;
  var language = $translate.use() || 'nl';

  controller.language = language;
  controller.showAddressComponent = false;
  controller.isNew = true;
  controller.loadingError = false;
  controller.contact = [];
  controller.showWebsiteValidation = false;
  controller.urlError = false;
  controller.websiteError = false;
  controller.nameError = false;
  controller.addressError = false;
  controller.contactError = false;
  controller.hasErrors = false;
  controller.disableSubmit = true;
  controller.saveError = false;

  controller.validateWebsite = validateWebsite;
  controller.validateName = validateName;
  controller.validateAddress = validateAddress;
  controller.validateContact = validateContact;
  controller.checkChanges = checkChanges;
  controller.validateOrganizer = validateOrganizer;
  controller.cancel = cancel;
  controller.isManageState = isManageState;

  var oldOrganizer = {};
  var oldContact = [];
  var isWebsiteChanged = false;
  var isNameChanged = false;
  var isAddressChanged = false;
  var isContactChanged = false;

  if (organizerId) {
    controller.isNew = false;
    loadOrganizer(organizerId);
  }
  else {
    startCreatingOrganizer();
  }

  function startCreatingOrganizer() {
    controller.organizer = {
      mainLanguage: language,
      website: 'http://',
      name : '',
      address : {
        streetAddress : '',
        addressLocality : '',
        postalCode: '',
        addressCountry : ''
      },
      contact: []
    };
    controller.showAddressComponent = true;
  }

  function loadOrganizer(organizerId) {
    OrganizerManager.removeOrganizerFromCache(organizerId);

    OrganizerManager
        .get(organizerId)
        .then(showOrganizer, function () {
          controller.loadingError = true;
        })
        .finally(function () {
          controller.showAddressComponent = true;
        });
  }

  /**
   * @param {udbOrganizer} organizer
   */
  function showOrganizer(organizer) {
    if (_.isEmpty(organizer.address)) {
      organizer.address = {
        streetAddress : '',
        addressLocality : '',
        postalCode: '',
        addressCountry : ''
      };
    }
    controller.organizer = organizer;
    oldOrganizer = _.cloneDeep(organizer);
    controller.originalName = oldOrganizer.name;

    if (controller.organizer.contactPoint !== null) {
      _.forEach(controller.organizer.contactPoint, function(contactArray, key) {
        _.forEach(contactArray, function(value) {
          controller.contact.push({type: key, value: value});
        });
      });
      oldContact = _.cloneDeep(controller.contact);
    }
  }

  /**
   * Validate the website of new organizer.
   */
  function validateWebsite() {
    controller.showWebsiteValidation = true;

    if (!controller.organizerForm.website.$valid) {
      controller.showWebsiteValidation = false;
      controller.urlError = true;
      return;
    }

    udbOrganizers
        .findOrganizersWebsite(controller.organizer.website)
        .then(function (data) {
          controller.urlError = false;
          if (data.totalItems > 0) {
            if (data.member[0].name === controller.originalName) {
              controller.showWebsiteValidation = false;
              controller.organizersWebsiteFound = false;
            }
            else {
              controller.organizersWebsiteFound = true;
              controller.showWebsiteValidation = false;
            }
          }
          else {
            controller.showWebsiteValidation = false;
            controller.organizersWebsiteFound = false;
          }
        }, function () {
          controller.websiteError = true;
          controller.showWebsiteValidation = false;
        })
        .finally(function() {
          checkChanges();
        });
  }

  function validateName() {
    if (!controller.organizerForm.name.$valid) {
      controller.nameError = true;
    }
    else {
      controller.nameError = false;
    }

    checkChanges();
  }

  function validateAddress(error) {
    controller.addressError = error;
    checkChanges();
  }

  function validateContact(error) {
    controller.contactError = error;
    checkChanges();
  }

  /**
   * Validate the new organizer.
   */
  function validateOrganizer() {
    controller.showValidation = true;
    if (!controller.organizerForm.$valid || controller.organizersWebsiteFound ||
        controller.websiteError || controller.urlError || controller.nameError ||
        controller.addressError || controller.contactError) {
      controller.hasErrors = true;
      controller.disableSubmit = true;
      $scope.$broadcast('organizerAddressSubmit');
      $scope.$broadcast('organizerContactSubmit');
      return;
    }
    if (controller.isNew) {
      createNewOrganizer();
    }
    else {
      saveOrganizer();
    }
  }

  function checkChanges() {
    isWebsiteChanged = !_.isEqual(controller.organizer.website, oldOrganizer.website);
    isNameChanged = !_.isEqual(controller.organizer.name, oldOrganizer.name);
    // Also check if the address isn't empty
    isAddressChanged = (!_.isEqual(controller.organizer.address, oldOrganizer.address) &&
        !_.isEmpty(controller.organizer.address.streetAddress));
    isContactChanged = !_.isEqual(controller.contact, oldContact);

    if (isWebsiteChanged || isNameChanged || isAddressChanged || isContactChanged) {
      controller.disableSubmit = false;
    }
    else {
      controller.disableSubmit = true;
    }

    if (controller.organizerForm.$valid && !controller.organizersWebsiteFound &&
        !controller.websiteError && !controller.urlError && !controller.nameError &&
        !controller.addressError && !controller.contactError) {
      controller.hasErrors = false;
    }
  }

  function saveOrganizer() {
    var promises = [];

    if (isWebsiteChanged) {
      promises.push(OrganizerManager.updateOrganizerWebsite(organizerId, controller.organizer.website));
    }

    if (isNameChanged) {
      promises.push(OrganizerManager.updateOrganizerName(organizerId, controller.organizer.name, language));
    }

    if (isAddressChanged) {
      promises.push(OrganizerManager.updateOrganizerAddress(organizerId, controller.organizer.address, language));
    }

    if (isContactChanged) {
      promises.push(OrganizerManager.updateOrganizerContact(organizerId, controller.contact));
    }

    promises.push(OrganizerManager.removeOrganizerFromCache(organizerId));

    $q.all(promises)
        .then(function() {
          redirectToDetailPage();
        })
        .catch(function () {
          controller.hasErrors = true;
          controller.saveError = true;
        });
  }

  function createNewOrganizer() {

    var organizer = _.clone(controller.organizer);
    // remove the address when it's empty
    if (
        !organizer.address.streetAddress &&
        !organizer.address.addressLocality &&
        !organizer.address.postalCode
    ) {
      delete organizer.address;
    }

    eventCrud
        .createOrganizer(organizer)
        .then(function(jsonResponse) {
          var defaultOrganizerLabel = _.get(appConfig, 'offerEditor.defaultOrganizerLabel');
          if (typeof(defaultOrganizerLabel) !== 'undefined' &&
              defaultOrganizerLabel !== '') {
            OrganizerManager
                .addLabelToOrganizer(jsonResponse.data.organizerId, defaultOrganizerLabel);
          }
          controller.organizer.id = jsonResponse.data.organizerId;
          redirectToDetailPage();
        }, function() {
          controller.hasErrors = true;
          controller.saveError = true;
        });
  }

  function cancel() {
    if (isManageState()) {
      $state.go('management.organizers.search', {}, {reload: true});
    } else {
      $state.go('split.footer.dashboard', {}, {reload: true});
    }
  }

  function redirectToDetailPage() {
    OrganizerManager.removeOrganizerFromCache(controller.organizer.id);
    $state.go('split.organizerDetail', {id: controller.organizer.id}, {reload: true});
  }

  function isManageState() {
    return (stateName.indexOf('manage') !== -1);
  }
}
OrganizerFormController.$inject = ["OrganizerManager", "udbOrganizers", "$state", "$stateParams", "$q", "$scope", "$translate", "eventCrud", "appConfig"];

/**
 * @ngdoc function
 * @name udbApp.controller:OrganizerFormController
 * @description
 * # OrganizerFormController
 */
angular
  .module('udb.organizers')
  .controller('OrganizerFormController', OrganizerFormController);
})();

// Source: src/organizers/organizer-manager.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.organizers
 * @description
 * # Organizer Manager
 * This service allows you to lookup organizers and perform actions on them.
 */
angular
  .module('udb.organizers')
  .service('OrganizerManager', OrganizerManager);

/* @ngInject */
function OrganizerManager(udbApi, jobLogger, BaseJob, $q, $rootScope, CreateDeleteOrganizerJob) {
  var service = this;

  /**
   * @param {UdbOrganizer} organization
   */
  service.delete = function (organization) {
    return udbApi
      .deleteOrganization(organization)
      .then(logOrganizationDeleted(organization));
  };

  /**
   * @param {UdbOrganizer} organization
   * @return {Function}
   */
  function logOrganizationDeleted(organization) {
    /**
     * @param {Object} commandInfo
     * @return {Promise.<CreateDeleteOrganizerJob>}
     */
    return function (commandInfo) {
      var job = new CreateDeleteOrganizerJob(commandInfo.commandId);
      jobLogger.addJob(job);
      $rootScope.$emit('organizationDeleted', organization);
      return $q.resolve(job);
    };

  }

  /**
   * @param {string} query
   * @param {int} limit
   * @param {int} start
   *
   * @return {Promise.<PagedCollection>}
   */
  service.find = function(query, limit, start) {
    return udbApi.findOrganisations(start, limit, null, query);
  };

  /**
   * @param {string} organizerId
   *
   * @returns {Promise.<UdbOrganizer>}
   */
  service.get = function(organizerId) {
    return udbApi.getOrganizerById(organizerId);
  };

  /**
   * @param {string} organizerId
   * @param {string} labelUuid
   *
   * @returns {Promise}
   */
  service.addLabelToOrganizer = function(organizerId, labelUuid) {
    return udbApi
      .addLabelToOrganizer(organizerId, labelUuid)
      .then(logUpdateOrganizerJob);
  };

  /**
   * @param {string} organizerId
   * @param {string} labelUuid
   *
   * @returns {Promise}
   */
  service.deleteLabelFromOrganizer = function(organizerId, labelUuid) {
    return udbApi
      .deleteLabelFromOrganizer(organizerId, labelUuid)
      .then(logUpdateOrganizerJob);
  };

  /**
   * Removes an organizer from the cache.
   * @param {string} organizerId
   */
  service.removeOrganizerFromCache = function(organizerId) {
    return udbApi.removeItemFromCache(organizerId);
  };

  /**
   * Update the unique url of a specific organizer.
   * @param {string} organizerId
   * @param {string} website
   *
   * @returns {Promise}
   */
  service.updateOrganizerWebsite = function(organizerId, website) {
    return udbApi
        .updateOrganizerWebsite(organizerId, website)
        .then(logUpdateOrganizerJob);
  };

  /**
   * Update the name of a specific organizer.
   * @param {string} organizerId
   * @param {string} name
   * @param {string} language
   *
   * @returns {Promise}
   */
  service.updateOrganizerName = function(organizerId, name, language) {
    return udbApi
        .updateOrganizerName(organizerId, name, language)
        .then(logUpdateOrganizerJob);
  };

  /**
   * Update the address of a specific organizer.
   * @param {string} organizerId
   * @param {Object} address
   * @param {string} language
   *
   * @returns {Promise}
   */
  service.updateOrganizerAddress = function(organizerId, address, language) {
    return udbApi
        .updateOrganizerAddress(organizerId, address, language)
        .then(logUpdateOrganizerJob);
  };

  /**
   * Update contact info of a specific organizer.
   * @param {string} organizerId
   * @param {Array} contact
   * @param {string} language
   *
   * @returns {Promise}
   */
  service.updateOrganizerContact = function(organizerId, contact, language) {
    return udbApi
        .updateOrganizerContact(organizerId, contact, language)
        .then(logUpdateOrganizerJob);
  };

  /**
   * @param {Object} commandInfo
   * @return {Promise.<BaseJob>}
   */
  function logUpdateOrganizerJob(commandInfo) {
    var job = new BaseJob(commandInfo.commandId);
    jobLogger.addJob(job);

    return $q.resolve(job);
  }
}
OrganizerManager.$inject = ["udbApi", "jobLogger", "BaseJob", "$q", "$rootScope", "CreateDeleteOrganizerJob"];
})();

// Source: src/place-detail/place-detail.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.place-detail.directive:place-detail.html
 * @description
 * # udb place-detail directive
 */
angular
  .module('udb.place-detail')
  .directive('udbPlaceDetail', udbPlaceDetailDirective);

/* @ngInject */
function udbPlaceDetailDirective() {
  return {
    templateUrl: 'templates/place-detail.html',
    restrict: 'EA',
    controller: PlaceDetail // jshint ignore:line
  };
}
})();

// Source: src/place-detail/ui/place-detail.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.place-detail.controller:PlaceDetailController
 * @description
 * # PlaceDetailController
 * Place Detail controller
 */
angular
    .module('udb.place-detail')
    .controller('PlaceDetailController', PlaceDetail);

/* @ngInject */
function PlaceDetail(
  $scope,
  placeId,
  udbApi,
  $state,
  jsonLDLangFilter,
  variationRepository,
  offerEditor,
  eventCrud,
  $uibModal,
  $q,
  $window,
  offerLabeller,
  appConfig,
  $translate
) {
  var activeTabId = 'data';
  var controller = this;
  var disableVariations = _.get(appConfig, 'disableVariations');
  var language = $translate.use() || 'nl';

  $q.when(placeId, function (offerLocation) {
    $scope.placeId = offerLocation;

    var offer = udbApi.getOffer(offerLocation);
    var permission = udbApi.hasPermission(offerLocation);

    offer.then(showOffer, failedToLoad);

    $q.all([permission, offer])
      .then(grantPermissions, denyAllPermissions);

    permission.catch(denyAllPermissions);
  });

  function grantPermissions() {
    $scope.permissions = {editing: true};
  }

  function denyAllPermissions() {
    $scope.permissions = {editing: false};
  }

  $scope.placeIdIsInvalid = false;

  // labels scope variables and functions
  $scope.labelAdded = labelAdded;
  $scope.labelRemoved = labelRemoved;
  $scope.labelResponse = '';
  $scope.labelsError = '';
  $scope.finishedLoading = false;

  $scope.placeHistory = [];
  $scope.tabs = [
    {
      id: 'data'
    },
    {
      id: 'publication'
    }
  ];
  $scope.deletePlace = function () {
    openPlaceDeleteConfirmModal($scope.place);
  };

  $scope.language = language;
  var cachedPlace;

  function showOffer(place) {
    cachedPlace = place;

    $scope.place = jsonLDLangFilter(place, language, true);
    $scope.placeIdIsInvalid = false;

    if (typeof $scope.place.description === 'object') {
      $scope.place.description = $scope.place.description[language];
      if ($scope.place.description === undefined) {
        $scope.place.description = '';
      }
    }

    if (!disableVariations) {
      variationRepository
        .getPersonalVariation(place)
        .then(showVariation);
    }

    $scope.finishedLoading = true;
    if (place.typicalAgeRange.indexOf('-') === place.typicalAgeRange.length - 1) {
      $scope.ageRange = place.typicalAgeRange.slice(0, -1) + '+';
    }
    else {
      $scope.ageRange = place.typicalAgeRange;
    }
  }

  function showVariation(variation) {
    $scope.place.description = variation.description[language];
  }

  function failedToLoad(reason) {
    $scope.placeIdIsInvalid = true;
  }

  $scope.placeLocation = function (place) {

    if (place.address.addressLocality) {
      return place.address.addressLocality;
    }

    return '';
  };

  $scope.isTabActive = function (tabId) {
    return tabId === activeTabId;
  };

  $scope.makeTabActive = function (tabId) {
    activeTabId = tabId;
  };

  $scope.openEditPage = function() {
    var placeLocation = $scope.placeId.toString();
    var id = placeLocation.split('/').pop();

    $state.go('split.placeEdit', {id: id});
  };

  $scope.openTranslatePage = function() {
    var placeLocation = $scope.placeId.toString();
    var id = placeLocation.split('/').pop();

    $state.go('split.placeTranslate', {id: id});
  };

  $scope.updateDescription = function(description) {
    if ($scope.place.description !== description) {
      var updatePromise = offerEditor.editDescription(cachedPlace, description);

      updatePromise.finally(function () {
        if (!description) {
          $scope.place.description = cachedPlace.description[language];
        }
      });

      return updatePromise;
    }
  };

  function goToDashboard() {
    $state.go('split.footer.dashboard');
  }

  /**
   * @param {EventCrudJob} job
   */
  controller.goToDashboardOnJobCompletion = function(job) {
    job.task.promise
      .then(goToDashboard);
  };

  function openPlaceDeleteConfirmModal(item) {

    function displayModal(place, events) {
      var modalInstance = $uibModal.open({
        templateUrl: 'templates/place-delete-confirm-modal.html',
        controller: 'PlaceDeleteConfirmModalCtrl',
        resolve: {
          place: function () {
            return place;
          },
          events: function () {
            return events;
          }
        }
      });

      modalInstance.result
        .then(controller.goToDashboardOnJobCompletion);
    }

    // Check if this place has planned events.
    eventCrud
      .findEventsAtPlace(item.apiUrl)
      .then(function(events) {
        displayModal(item, events);
      });
  }

  /**
   * @param {Label} newLabel
   */
  function labelAdded(newLabel) {
    var similarLabel = _.find(cachedPlace.labels, function (label) {
      return newLabel.name.toUpperCase() === label.toUpperCase();
    });

    if (similarLabel) {
      $window.alert('Het label "' + newLabel.name + '" is reeds toegevoegd als "' + similarLabel + '".');
    } else {
      offerLabeller.label(cachedPlace, newLabel.name)
        .then(function(response) {
          if (response.success) {
            $scope.labelResponse = 'success';
            $scope.addedLabel = response.name;
          }
          else {
            $scope.labelResponse = 'error';
            $scope.labelsError = response;
          }
          $scope.place.labels = angular.copy(cachedPlace.labels);
        });
    }
  }

  function clearLabelsError() {
    $scope.labelResponse = '';
    $scope.labelsError = '';
  }

  /**
   * @param {ApiProblem} problem
   */
  function showUnlabelProblem(problem) {
    $scope.place.labels = angular.copy(cachedPlace.labels);
    $scope.labelResponse = 'unlabelError';
    $scope.labelsError = problem.title;
  }

  /**
   * @param {Label} label
   */
  function labelRemoved(label) {
    clearLabelsError();

    offerLabeller
      .unlabel(cachedPlace, label.name)
      .catch(showUnlabelProblem);
  }

  $scope.translateType = function (type) {
    // Work around for III-2695
    var translatedString = $translate.instant('offerTypes.' + type);
    if (_.includes(translatedString, 'offerTypes.')) {
      return type;
    }
    else {
      return translatedString;
    }
  };
}
PlaceDetail.$inject = ["$scope", "placeId", "udbApi", "$state", "jsonLDLangFilter", "variationRepository", "offerEditor", "eventCrud", "$uibModal", "$q", "$window", "offerLabeller", "appConfig", "$translate"];
})();

// Source: src/router/offer-locator.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udbApp.OfferLocator
 * @description
 * Index and locate offers by UUID.
 */
angular.module('udb.router')
  .service('offerLocator', OfferLocator);

/* @ngInject */
function OfferLocator($q, searchApiSwitcher) {
  // An associative array with UUIDs pointing to locations.
  // eg: 0586DF1-89D7-42F6-9804-DAE8878C2617 -> http://du.de/event/0586DF1-89D7-42F6-9804-DAE8878C2617
  var locations = {};

  // public methods
  this.get = get;
  this.add = add;
  this.addPagedCollection = addPagedCollection;

  /**
   * @param {string} uuid
   * @param {URL} location
   */
  function add(uuid, location) {
    locations[uuid] = location;
  }

  /**
   * @param {PagedCollection} offerCollection
   */
  function addPagedCollection(offerCollection) {
    _.each(offerCollection.member, function (item) {
      var offerLocation = item['@id'];
      var offerUuid = offerLocation.split('/').pop();
      add(offerUuid, offerLocation);
    });
  }

  /**
   * @param {string} uuid
   * @return {Promise.<URL>}
   */
  function get(uuid) {
    var knownLocation = locations[uuid];

    if (knownLocation) {
      return $q.resolve(knownLocation);
    } else {
      return findLocation(uuid);
    }
  }

  /**
   * @param {string} uuid
   * @return {Promise.<URL>}
   */
  function findLocation(uuid) {
    var deferredLocation = $q.defer();

    function cacheAndResolveLocation(pagedSearchResults) {
      if (pagedSearchResults.totalItems === 1) {
        var location = pagedSearchResults.member[0]['@id'];
        add(uuid, location);
        deferredLocation.resolve(location);
      } else {
        deferredLocation.reject('Unable to determine the exact offer for this uuid.');
      }
    }

    var queryString = 'cdbid:"' + uuid + '"';
    if (searchApiSwitcher.getApiVersion() > 2) {
      queryString = 'id:"' + uuid + '"';
    }

    searchApiSwitcher
      .findOffers(queryString)
      .then(cacheAndResolveLocation)
      .catch(deferredLocation.reject);

    return deferredLocation.promise;
  }
}
OfferLocator.$inject = ["$q", "searchApiSwitcher"];
})();

// Source: src/saved-searches/components/delete-search-modal.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.entry.controller:DeleteSearchModalController
 * @description
 * # DeleteSearchModalController
 * Controller of the udb.entry
 */
angular
  .module('udb.saved-searches')
  .controller('DeleteSearchModalController', DeleteSearchModalController);

/* @ngInject */
function DeleteSearchModalController($scope, $uibModalInstance) {

  var confirm = function () {
    $uibModalInstance.close();
  };

  var cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.cancel = cancel;
  $scope.confirm = confirm;
}
DeleteSearchModalController.$inject = ["$scope", "$uibModalInstance"];
})();

// Source: src/saved-searches/components/save-search-modal.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.entry.controller:SaveSearchModalController
 * @description
 * # SaveSearchModalController
 * Controller of the udb.entry
 */
angular
  .module('udb.saved-searches')
  .controller('SaveSearchModalController', SaveSearchModalController);

/* @ngInject */
function SaveSearchModalController($scope, $uibModalInstance) {

  var ok = function () {
    var name = $scope.queryName;
    $scope.wasSubmitted = true;

    if (name) {
      $uibModalInstance.close(name);
    }
  };

  var cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.cancel = cancel;
  $scope.ok = ok;
  $scope.queryName = '';
  $scope.wasSubmitted = false;
}
SaveSearchModalController.$inject = ["$scope", "$uibModalInstance"];
})();

// Source: src/saved-searches/components/save-search.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.savedSearches.directive:udbSaveSearch
 * @description
 * # udbSaveSearch
 */
angular
  .module('udb.saved-searches')
  .directive('udbSaveSearch', udbSaveSearch);

/* @ngInject */
function udbSaveSearch(savedSearchesService, $uibModal) {
  var directive = {
    link: link,
    templateUrl: 'templates/save-search.directive.html',
    restrict: 'AE',
    scope: {
      queryString: '=udbQueryString'
    }
  };
  return directive;

  function link(scope, element, attrs, controllers) {
    scope.saveSearch = function () {
      var modal = $uibModal.open({
        templateUrl: 'templates/save-search-modal.html',
        controller: 'SaveSearchModalController'
      });

      modal.result.then(function (name) {
        savedSearchesService
          .createSavedSearch(name, scope.queryString)
          .catch(displayErrorModal);
      });
    };
  }

  function displayErrorModal() {
    $uibModal.open(
      {
        templateUrl: 'templates/unexpected-error-modal.html',
        controller: 'UnexpectedErrorModalController',
        size: 'lg',
        resolve: {
          errorMessage: function() {
            return 'Het opslaan van de zoekopdracht is mislukt. Controleer de verbinding en probeer opnieuw.';
          }
        }
      }
    );
  }
}
udbSaveSearch.$inject = ["savedSearchesService", "$uibModal"];
})();

// Source: src/saved-searches/udb.saved-searches.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.saved-searches.savedSearchesService
 * @description
 * # savedSearchesService
 * Service in udb.saved-searches.
 */
angular
  .module('udb.saved-searches')
  .service('savedSearchesService', SavedSearchesService);

/* @ngInject */
function SavedSearchesService($q, $http, $cookies, appConfig, $rootScope, udbApi, searchApiSwitcher) {
  var apiUrl = appConfig.baseUrl;
  var defaultApiConfig = {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  var savedSearches = [];
  var ss = this;
  var sapiVersion = getSapiVersion();

  ss.createSavedSearch = function(name, query) {
    return udbApi.createSavedSearch(sapiVersion, name, query).then(function () {
      savedSearches.push({'name': name, 'query': query});
      savedSearchesChanged();

      return $q.resolve();
    });
  };

  ss.getSavedSearches = function () {
    return udbApi.getSavedSearches(sapiVersion).then(function (data) {
      savedSearches = data;
      return $q.resolve(data);
    });
  };

  ss.deleteSavedSearch = function (searchId) {
    return udbApi.deleteSavedSearch(sapiVersion, searchId).then(function () {
      _.remove(savedSearches, {id: searchId});
      savedSearchesChanged();

      return $q.resolve();
    });
  };

  function savedSearchesChanged () {
    $rootScope.$emit('savedSearchesChanged', savedSearches);
  }

  /**
   * @returns {String}
   */
  function getSapiVersion() {
    return 'v' + searchApiSwitcher.getApiVersion();
  }
}
SavedSearchesService.$inject = ["$q", "$http", "$cookies", "appConfig", "$rootScope", "udbApi", "searchApiSwitcher"];

})();

// Source: src/saved-searches/ui/saved-searches-list.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.saved-searches-list.controller:SavedSearchesListController
 * @description
 * # SavedSearchesListController
 * Saved searches list controller
 */
angular
  .module('udb.saved-searches')
  .controller('SavedSearchesListController', SavedSearchesList);

/* @ngInject */
function SavedSearchesList($scope, savedSearchesService, $uibModal, $rootScope) {

  $scope.savedSearches = [];

  $scope.editorOptions = {
    mode: 'solr',
    lineWrapping: true,
    readOnly: true
  };

  $scope.codemirrorLoaded = function(editorInstance) {
    editorInstance.on('focus', function () {
      editorInstance.execCommand('selectAll');
    });

    editorInstance.on('blur', function() {
      editorInstance.setCursor(0, 0, true);
    });
  };

  // get the current saved searches and watch for changes
  var savedSearchesPromise = savedSearchesService.getSavedSearches();
  savedSearchesPromise.then(function (savedSearches) {
    $scope.savedSearches = savedSearches;
  });
  $rootScope.$on('savedSearchesChanged', function (event, savedSearches) {
    $scope.savedSearches = savedSearches;
  });

  this.encodeURI = function (uri) {
    return encodeURIComponent(uri);
  };
  $scope.encodeURI = this.encodeURI;

  this.deleteSavedSearch = function(searchId) {
    var modal = $uibModal.open({
      templateUrl: 'templates/delete-search-modal.html',
      controller: 'DeleteSearchModalController'
    });

    modal.result.then(function () {
      var savedSearchPromise = savedSearchesService.deleteSavedSearch(searchId);

      savedSearchPromise
        .catch(function() {
          var modalInstance = $uibModal.open({
            templateUrl: 'templates/unexpected-error-modal.html',
            controller: 'UnexpectedErrorModalController',
            size: 'lg',
            resolve: {
              errorMessage: function() {
                return 'Het verwijderen van de zoekopdracht is mislukt. Controleer de verbinding en probeer opnieuw.';
              }
            }
          });
        });
    });
  };

  $scope.deleteSavedSearch = this.deleteSavedSearch;
}
SavedSearchesList.$inject = ["$scope", "savedSearchesService", "$uibModal", "$rootScope"];
})();

// Source: src/search/components/event-link.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:udbEventLink
 * @description
 *  Renders a link for an event.
 */
angular
  .module('udb.event-form')
  .directive('udbEventLink', udbEventLink);

/* @ngInject */
function udbEventLink() {
  var eventLinkDirective = {
    restrict: 'AE',
    controller: 'OfferController',
    controllerAs: 'eventCtrl',
    templateUrl: 'templates/event-link.directive.html'
  };

  return eventLinkDirective;
}
})();

// Source: src/search/components/label-select.component.js
(function () {
'use strict';

angular
  .module('udb.search')
  .component('udbLabelSelect', {
    templateUrl: 'templates/label-select.html',
    controller: LabelSelectComponent,
    controllerAs: 'select',
    bindings: {
      labels: '<',
      labelAdded: '&',
      labelRemoved: '&'
    }
  });

/** @ngInject */
function LabelSelectComponent(offerLabeller, $q) {
  var select = this;
  /** @type {Label[]} */
  select.availableLabels = [];
  select.suggestLabels = suggestLabels;
  select.createLabel = createLabel;
  select.areLengthCriteriaMet = areLengthCriteriaMet;
  select.areContentCriteriaMet = areContentCriteriaMet;
  /** @type {Label[]} */
  select.labels = objectifyLabels(select.labels);
  select.minimumInputLength = 2;
  select.maxInputLength = 50;
  select.currentLabel = '';
  select.onSelect = onSelect;
  select.onRemove = onRemove;

  select.$onChanges = updateLabels;

  /**
   * @param {Object} bindingChanges
   * @see https://code.angularjs.org/1.5.9/docs/guide/component
   */
  function updateLabels(bindingChanges) {
    select.labels = objectifyLabels(_.get(bindingChanges, 'labels.currentValue', select.labels));
  }

  select.regex = /^([a-zA-Z0-9ŠŽšœžŸÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]{1}[a-zA-Z0-9ŠŽšœžŸÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ_-\s]+)$/;

  function onSelect(item) {
    select.currentLabel = '';
    select.labelAdded({label: item});
    select.labels.push(item);
  }

  function onRemove(label) {
    select.currentLabel = '';
    select.labelRemoved({label: label});
    select.labels = _.without(select.labels, label);
  }

  /**
   * @param {string[]|Label[]} labels
   * @return {Label[]}
   */
  function objectifyLabels(labels) {
    return _.map(select.labels, function (label) {
      return _.isString(label) ? {name:label} : label;
    });
  }

  function areLengthCriteriaMet(length) {
    return (length >= select.minimumInputLength && length <= select.maxInputLength);
  }

  function areContentCriteriaMet(labelName) {
    return select.regex.test(labelName);
  }

  function createLabel(labelName) {
    if (areContentCriteriaMet(labelName)) {

      var similarLabel = _.find(select.labels, function (existingLabel) {
        return existingLabel.name.toUpperCase() === labelName.toUpperCase();
      });
      if (!similarLabel && select.areLengthCriteriaMet(labelName.length) && select.areContentCriteriaMet(labelName)) {
        return {name:labelName};
      }
    }

  }

  function findSuggestions(name) {
    return offerLabeller
      .getSuggestions(name, 6)
      .then(function(labels) {
        labels.push({name: name});
        return setAvailableLabels(labels);
      });
  }

  function suggestLabels(name) {
    if (areContentCriteriaMet(name)) {
      setAvailableLabels([]);
      return findSuggestions(name);
    } else {
      setAvailableLabels([]);
    }
  }

  /** @param {Label[]} labels */
  function setAvailableLabels(labels) {
    select.availableLabels = _.chain(labels)
      .filter(function(label) {
        return areContentCriteriaMet(label.name);
      })
      .reject(function(label) {
        return _.find(select.labels, {'name': label.name});
      })
      .uniq(function (label) {
        return label.name.toUpperCase();
      })
      .value();
    return select.availableLabels;
  }
}
LabelSelectComponent.$inject = ["offerLabeller", "$q"];
})();

// Source: src/search/components/offer-accessibility-info.component.js
(function () {
'use strict';

angular
  .module('udb.search')
  .component('udbOfferAccessibilityInfo', {
    templateUrl: 'templates/offer-accessibility-info.component.html',
    controller: AccessibilityInfoController,
    bindings: {
      'offerType': '<',
      'offer': '='
    }
  });

/* @ngInject */
function AccessibilityInfoController(facilities, $uibModal) {
  var controller = this;

  controller.changeFacilities = function () {
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/search-facilities-modal.html',
      controller: 'SearchFacilitiesModalController',
      resolve: {
        offer: function () {
          return controller.offer;
        },
        facilities: function () {
          return 'place' === controller.offerType ? _.pick(facilities, 'place') : _.omit(facilities, 'place');
        }
      }
    });
  };
}
AccessibilityInfoController.$inject = ["facilities", "$uibModal"];
})();

// Source: src/search/components/query-editor-daterangepicker.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:udbQueryEditorDaterangepicker
 * @description
 * # udbQueryEditorDaterangepicker
 */
angular
  .module('udb.search')
  .directive('udbQueryEditorDaterangepicker', udbQueryEditorDaterangepicker);

/* @ngInject */
function udbQueryEditorDaterangepicker($translate, uibDatepickerPopupConfig) {
  return {
    templateUrl: 'templates/query-editor-daterangepicker.directive.html',
    restrict: 'E',
    link: function postLink(scope, element, attrs) {

      var dateRangePicker = {
        startOpened: false,
        endOpened: false,
        dateFormat: 'dd/MM/yyyy'
      };

      $translate(['datepicker.CURRENT', 'datepicker.CLEAR', 'datepicker.CLOSE']).then(function (translations) {
        uibDatepickerPopupConfig.currentText = translations['datepicker.CURRENT'];
        uibDatepickerPopupConfig.clearText = translations['datepicker.CLEAR'];
        uibDatepickerPopupConfig.closeText = translations['datepicker.CLOSE'];
      });

      dateRangePicker.openStart = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        dateRangePicker.startOpened = true;
        dateRangePicker.endOpened = false;
      };

      dateRangePicker.openEnd = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        dateRangePicker.startOpened = false;
        dateRangePicker.endOpened = true;
      };

      scope.drp = dateRangePicker;
    }
  };
}
udbQueryEditorDaterangepicker.$inject = ["$translate", "uibDatepickerPopupConfig"];

angular
  .module('udb.search')
  .directive('datepickerPopup', datepickerPopup);

/* @ngInject */
function datepickerPopup() {
  return {
    restrict: 'EAC',
    require: 'ngModel',
    link: function (scope, element, attr, controller) {
      //remove the default formatter from the input directive to prevent conflict
      controller.$formatters.shift();
    }
  };
}
})();

// Source: src/search/components/query-editor-field.controller.js
(function () {
'use strict';

/**
 * @ngdoc controller
 * @name udb.search.controller:QueryEditorField
 * @description
 * # QueryEditorFieldController
 */
angular
  .module('udb.search')
  .controller('QueryEditorFieldController', QueryEditorFieldController);

/* @ngInject */
function QueryEditorFieldController($scope) {

  function getParentGroup() {
    var parentGroup;

    if (isSubGroup()) {
      parentGroup = $scope.$parent.field;
    } else {
      parentGroup = $scope.rootGroup;
    }

    return parentGroup;
  }

  function getOperatorClass() {
    var operatorClass;
    if (isSubGroup() && $scope.$index === 0) {
      operatorClass = 'AND';
    } else {
      operatorClass = $scope.$index ? 'OR' : 'FIRST';
    }

    return operatorClass;
  }

  function isSubGroup() {
    var parentGroup = $scope.$parent;
    return parentGroup.field.type === 'group';
  }

  function canRemoveField() {
    var group = $scope.rootGroup;
    return (group.nodes.length > 1);
  }

  $scope.addField = function (index) {
    $scope.qe.addField(getParentGroup(), index);
  };

  $scope.removeField = function (index) {
    $scope.qe.removeField(getParentGroup(), index, $scope.rootGroup);
  };

  $scope.addSubGroup = function (index) {
    var rootGroup = $scope.rootGroup,
      treeGroupId = _.uniqueId(),
      group = getParentGroup();

    group.treeGroupId = treeGroupId;

    if (isSubGroup()) {
      index = _.findIndex(rootGroup.nodes, function (group) {
        return group.treeGroupId === treeGroupId;
      });
    }

    $scope.qe.addSubGroup(rootGroup, index);
  };

  $scope.isSubGroup = isSubGroup;
  $scope.getOperatorClass = getOperatorClass;
  $scope.canRemoveField = canRemoveField;
}
QueryEditorFieldController.$inject = ["$scope"];
})();

// Source: src/search/components/query-editor-field.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:udbQueryEditorField
 * @description
 * # udbQueryEditorField
 */
angular
  .module('udb.search')
  .directive('udbQueryEditorField', udbQueryEditorField);

/* @ngInject */
function udbQueryEditorField(searchApiSwitcher) {
  return searchApiSwitcher.getQueryEditorFieldDefinition();
}
udbQueryEditorField.$inject = ["searchApiSwitcher"];
})();

// Source: src/search/components/query-editor.controller.js
(function () {
'use strict';

/**
 * @typedef {Object} OfferType
 * @property {string} id
 * @property {string} label
 */

/**
 * @ngdoc directive
 * @name udb.search.controller:QueryEditorController
 * @description
 * # QueryEditorController
 */
angular
  .module('udb.search')
  .controller('QueryEditorController', QueryEditorController);

/* @ngInject */
function QueryEditorController(
  queryFields,
  LuceneQueryBuilder,
  taxonomyTerms,
  sapi3CitiesBE,
  fieldTypeTransformers,
  searchHelper,
  $translate,
  $rootScope,
  eventTypes,
  placeTypes
) {
  var qe = this,
      queryBuilder = LuceneQueryBuilder;

  qe.fieldOptions = _.filter(queryFields, 'editable');

  // use the first occurrence of a group name to order it against the other groups
  var orderedGroups = _.chain(qe.fieldOptions)
    .map(function (field) {
           return field.group;
         })
    .uniq()
    .value();

  _.forEach(qe.fieldOptions, function (field) {
    var fieldName = 'queryFieldLabel.' + field.name,
        fieldGroup = 'queryFieldGroup.' + field.group;

    $translate([fieldName, fieldGroup]).then(function (translations) {
      field.label = translations[fieldName];
      field.groupIndex = _.indexOf(orderedGroups, field.group);
      field.groupLabel = translations[fieldGroup];
    });
  });

  qe.getDefaultQueryTree = function () {
    return {
      type: 'root',
      nodes: [
        {
          type: 'group',
          operator: 'OR',
          nodes: [
            {
              name: 'title',
              field: 'name.\\*',
              term: '',
              fieldType: 'tokenized-string',
              transformer: '+'
            }
          ]
        }
      ]
    };
  };
  qe.groupedQueryTree = searchHelper.getQueryTree() || qe.getDefaultQueryTree();

  // Holds options for both term and choice query-field types
  qe.transformers = {};
  qe.termOptions = _.groupBy(taxonomyTerms, function (term) {
    return 'category_' + term.domain + '_name';
  });
  qe.termOptions.locationtype = placeTypes;
  qe.termOptions.nisRegions = sapi3CitiesBE;
  qe.termOptions['category_eventtype_name'] = eventTypes; // jshint ignore:line
  _.forEach(queryFields, function (field) {
    if (field.type === 'choice') {
      qe.termOptions[field.name] = field.options;
    }
    qe.transformers[field.name] = fieldTypeTransformers[field.type];
  });

  /**
   * Update the search input field with the data from the query editor
   */
  qe.updateQueryString = function () {
    searchHelper.setQueryTree(qe.groupedQueryTree);
    $rootScope.$emit('searchSubmitted');
    qe.stopEditing();
  };

  qe.stopEditing = function () {
    $rootScope.$emit('stopEditingQuery');
  };

  /**
   * Add a field to a group
   *
   * @param  {object}  group       The group to add the field to
   * @param {number}  fieldIndex  The index of the field after which to add
   */
  qe.addField = function (group, fieldIndex) {

    var insertIndex = fieldIndex + 1,
        field = {
          field: 'name.\\*',
          name: 'title',
          term: '',
          fieldType: 'tokenized-string',
          transformer: '+'
        };

    group.nodes.splice(insertIndex, 0, field);

    if (group.nodes.length) {
      group.type = 'group';
    }
  };

  /**
   * Remove a field from a group
   *
   * @param {object}    group       The group to delete a field from
   * @param {number}    fieldIndex  The index of the field to delete
   * @param {object=}   rootGroup   The root group of the field to delete
   */
  qe.removeField = function (group, fieldIndex, rootGroup) {
    if (rootGroup.nodes.length > 1) {
      group.nodes.splice(fieldIndex, 1);
    }

    qe.cleanUpGroups();
  };

  qe.cleanUpGroups = function () {
    qe.removeEmptyGroups();
    qe.unwrapSubGroups();
  };

  qe.unwrapSubGroups = function () {
    var root = qe.groupedQueryTree;

    _.forEach(root.nodes, function (group) {
      var firstNode = group.nodes[0];

      if (firstNode.nodes) {
        var firstNodeChildren = firstNode.nodes;
        group.nodes.splice(0, 1);
        _.forEach(firstNodeChildren, function (node, index) {
          group.nodes.splice(index, 0, node);
        });
      }
    });
  };

  qe.removeEmptyGroups = function () {
    var root = qe.groupedQueryTree;

    _.forEach(root.nodes, function (group) {
      _.remove(group.nodes, function (node) {
        return node.nodes && node.nodes.length === 0;
      });
    });
  };

  qe.toggleExcludeGroup = function (group) {
    group.excluded = !group.excluded;
  };

  qe.canRemoveGroup = function () {
    return !qe.hasSingleGroup();
  };

  qe.removeGroup = function (groupIndex) {
    if (qe.canRemoveGroup()) {
      var root = qe.groupedQueryTree,
          group = root.nodes[groupIndex];

      if (qe.canRemoveGroup() && group) {
        root.nodes.splice(groupIndex, 1);
      }
    }
  };

  qe.resetGroups = function () {
    qe.groupedQueryTree = qe.getDefaultQueryTree();
  };

  /**
   * Add a field group
   */
  qe.addGroup = function () {
    var root = qe.groupedQueryTree;
    var group = {
      type: 'group',
      operator: 'OR',
      nodes: [
        {
          field: 'name.\\*',
          name: 'title',
          term: '',
          fieldType: 'tokenized-string',
          transformer: '+'
        }
      ]
    };

    root.nodes.push(group);
  };

  qe.addSubGroup = function (parentGroup, fieldIndex) {
    var group = {
      type: 'group',
      operator: 'AND',
      nodes: [
        {
          field: 'name.\\*',
          name: 'title',
          term: '',
          fieldType: 'tokenized-string',
          transformer: '+'
        }
      ]
    };

    parentGroup.nodes.splice(fieldIndex + 1, 0, group);
  };

  qe.fieldTypeSelected = function (field) {
    var fieldName = field.name,
        queryField = _.find(queryFields, function (field) {
          return field.name === fieldName;
        });

    if (queryField) {
      field.field = queryField.field;
    }

    if (field.fieldType !== queryField.type) {
      // TODO: Maybe try to do a type conversion?
      if (queryField.type === 'date-range') {
        field.lowerBound = moment().startOf('day').toDate();
        field.upperBound = moment().endOf('day').toDate();
        field.inclusive = true;
      } else {
        field.term = '';
        field.lowerBound = undefined;
        field.upperBound = undefined;
        field.inclusive = undefined;
      }

      if (queryField.type === 'check') {
        field.term = queryField.name;
      }

      if (queryField.type === 'number') {
        field.inclusive = true;
      }

      if (!field.transformer || !_.contains(fieldTypeTransformers[queryField.type], field.transformer)) {
        field.transformer = _.first(fieldTypeTransformers[queryField.type]);
      }

      field.fieldType = queryField.type;
    }
  };

  qe.hasSingleGroup = function () {
    return (qe.groupedQueryTree.nodes.length === 1);
  };
}
QueryEditorController.$inject = ["queryFields", "LuceneQueryBuilder", "taxonomyTerms", "sapi3CitiesBE", "fieldTypeTransformers", "searchHelper", "$translate", "$rootScope", "eventTypes", "placeTypes"];
})();

// Source: src/search/components/query-editor.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:udbQueryEditor
 * @description
 * # udbQueryEditor
 */
angular
  .module('udb.search')
  .directive('udbQueryEditor', udbQueryEditor);

/* @ngInject */
function udbQueryEditor(searchApiSwitcher) {
  return {
    templateUrl: 'templates/query-editor.directive.html',
    restrict: 'EA',
    controllerAs: 'qe',
    controller: searchApiSwitcher.getQueryEditorController()
  };
}
udbQueryEditor.$inject = ["searchApiSwitcher"];
})();

// Source: src/search/components/sapi2.query-editor.controller.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.search.controller:sapi2QueryEditorController
 * @description
 * # sapi2QueryEditorController
 */
angular
  .module('udb.search')
  .controller('sapi2QueryEditorController', Sapi2QueryEditorController);

Sapi2QueryEditorController.$inject = [
  'sapi2QueryFields',
  'sapi2QueryBuilder',
  'taxonomyTerms',
  'sapi2FieldTypeTransformers',
  'searchHelper',
  '$translate',
  '$rootScope'
];
function Sapi2QueryEditorController(
  queryFields,
  LuceneQueryBuilder,
  taxonomyTerms,
  fieldTypeTransformers,
  searchHelper,
  $translate,
  $rootScope
) {
  var qe = this,
    queryBuilder = LuceneQueryBuilder;

  qe.fields = _.filter(queryFields, 'editable');

  // use the first occurrence of a group name to order it against the other groups
  var orderedGroups = _.chain(qe.fields)
    .map(function (field) {
      return field.group;
    })
    .uniq()
    .value();

  _.forEach(qe.fields, function (field) {
    var fieldName = 'queryFieldLabel.' + field.name,
      fieldGroup = 'queryFieldGroup.' + field.group;

    $translate([fieldName, fieldGroup]).then(function (translations) {
      field.label = translations[fieldName];
      field.groupIndex = _.indexOf(orderedGroups, field.group);
      field.groupLabel = translations[fieldGroup];
    });
  });

  qe.getDefaultQueryTree = function () {
    return {
      type: 'root',
      nodes: [
        {
          type: 'group',
          operator: 'OR',
          nodes: [
            {
              field: 'title',
              term: '',
              fieldType: 'tokenized-string',
              transformer: '+'
            }
          ]
        }
      ]
    };
  };
  qe.groupedQueryTree = searchHelper.getQueryTree() || qe.getDefaultQueryTree();

  // Holds options for both term and choice query-field types
  qe.transformers = {};
  qe.termOptions = _.groupBy(taxonomyTerms, function (term) {
    return 'category_' + term.domain + '_name';
  });
  _.forEach(queryFields, function (field) {
    if (field.type === 'choice') {
      qe.termOptions[field.name] = field.options;
    }
    qe.transformers[field.name] = fieldTypeTransformers[field.type];
  });

  /**
   * Update the search input field with the data from the query editor
   */
  qe.updateQueryString = function () {
    searchHelper.setQueryTree(qe.groupedQueryTree);
    $rootScope.$emit('searchSubmitted');
    qe.stopEditing();
  };

  qe.stopEditing = function () {
    $rootScope.$emit('stopEditingQuery');
  };

  /**
   * Add a field to a group
   *
   * @param  {object}  group       The group to add the field to
   * @param {number}  fieldIndex  The index of the field after which to add
   */
  qe.addField = function (group, fieldIndex) {

    var insertIndex = fieldIndex + 1,
      field = {
        field: 'title',
        term: '',
        fieldType: 'tokenized-string',
        transformer: '+'
      };

    group.nodes.splice(insertIndex, 0, field);

    if (group.nodes.length) {
      group.type = 'group';
    }
  };

  /**
   * Remove a field from a group
   *
   * @param {object}    group       The group to delete a field from
   * @param {number}    fieldIndex  The index of the field to delete
   * @param {object=}   rootGroup   The root group of the field to delete
   */
  qe.removeField = function (group, fieldIndex, rootGroup) {
    if (rootGroup.nodes.length > 1) {
      group.nodes.splice(fieldIndex, 1);
    }

    qe.cleanUpGroups();
  };

  qe.cleanUpGroups = function () {
    qe.removeEmptyGroups();
    qe.unwrapSubGroups();
  };

  qe.unwrapSubGroups = function () {
    var root = qe.groupedQueryTree;

    _.forEach(root.nodes, function (group) {
      var firstNode = group.nodes[0];

      if (firstNode.nodes) {
        var firstNodeChildren = firstNode.nodes;
        group.nodes.splice(0, 1);
        _.forEach(firstNodeChildren, function (node, index) {
          group.nodes.splice(index, 0, node);
        });
      }
    });
  };

  qe.removeEmptyGroups = function () {
    var root = qe.groupedQueryTree;

    _.forEach(root.nodes, function (group) {
      _.remove(group.nodes, function (node) {
        return node.nodes && node.nodes.length === 0;
      });
    });
  };

  qe.toggleExcludeGroup = function (group) {
    group.excluded = !group.excluded;
  };

  qe.canRemoveGroup = function () {
    return !qe.hasSingleGroup();
  };

  qe.removeGroup = function (groupIndex) {
    if (qe.canRemoveGroup()) {
      var root = qe.groupedQueryTree,
        group = root.nodes[groupIndex];

      if (qe.canRemoveGroup() && group) {
        root.nodes.splice(groupIndex, 1);
      }
    }
  };

  qe.resetGroups = function () {
    qe.groupedQueryTree = qe.getDefaultQueryTree();
  };

  /**
   * Add a field group
   */
  qe.addGroup = function () {
    var root = qe.groupedQueryTree;
    var group = {
      type: 'group',
      operator: 'OR',
      nodes: [
        {
          field: 'title',
          term: '',
          fieldType: 'tokenized-string',
          transformer: '+'
        }
      ]
    };

    root.nodes.push(group);
  };

  qe.addSubGroup = function (parentGroup, fieldIndex) {
    var group = {
      type: 'group',
      operator: 'AND',
      nodes: [
        {
          field: 'title',
          term: '',
          fieldType: 'tokenized-string',
          transformer: '+'
        }
      ]
    };

    parentGroup.nodes.splice(fieldIndex + 1, 0, group);
  };

  qe.updateFieldType = function (field) {
    var fieldName = field.field,
      queryField = _.find(queryFields, function (field) {
        return field.name === fieldName;
      });

    if (field.fieldType !== queryField.type) {
      // TODO: Maybe try to do a type conversion?
      if (queryField.type === 'date-range') {
        field.lowerBound = moment().startOf('day').toDate();
        field.upperBound = moment().endOf('day').toDate();
        field.inclusive = true;
      } else {
        field.term = '';
        field.lowerBound = undefined;
        field.upperBound = undefined;
        field.inclusive = undefined;
      }

      if (queryField.type === 'check') {
        field.term = 'TRUE';
      }

      if (queryField.type === 'number') {
        field.inclusive = true;
      }

      if (!field.transformer || !_.contains(fieldTypeTransformers[queryField.type], field.transformer)) {
        field.transformer = _.first(fieldTypeTransformers[queryField.type]);
      }

      field.fieldType = queryField.type;
    }
  };

  qe.hasSingleGroup = function () {
    return (qe.groupedQueryTree.nodes.length === 1);
  };
}
})();

// Source: src/search/components/search-bar.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:udbSearchBar
 * @description
 * # udbSearchBar
 */
angular
  .module('udb.search')
  .directive('udbSearchBar', udbSearchBar);

/* @ngInject */
function udbSearchBar(searchHelper, $rootScope, $uibModal, savedSearchesService, searchApiSwitcher) {
  return {
    templateUrl: 'templates/search-bar.directive.html',
    restrict: 'E',
    link: function postLink(scope, element, attrs) {

      var searchBar = {
        queryString: '',
        hasErrors: false,
        errors: '',
        isEditing: false,
        savedSearches: []
      };

      var editorModal;

      searchBar.editQuery = function () {
        $rootScope.$emit('startEditingQuery');
        searchBar.isEditing = true;

        editorModal = $uibModal.open({
          templateUrl: 'templates/query-editor-modal.html',
          controller: searchApiSwitcher.getQueryEditorController(),
          controllerAs: 'qe',
          size: 'lg'
        });
      };

      /**
       * Search with a given query string and update the search bar or use the one currently displayed in the search bar
       *
       * @param {String} [queryString]
       */
      searchBar.find = function (queryString) {
        var query = typeof queryString !== 'undefined' ? queryString : searchBar.queryString;

        searchBar.queryString = query;
        searchHelper.setQueryString(query);
        $rootScope.$emit('searchSubmitted');
      };

      /**
       * When the user manually changes the query field the current query tree should be cleared
       */
      searchBar.queryChanged = function() {
        searchHelper.clearQueryTree();
      };

      scope.sb = searchBar;

      /**
       * Update the search bar with the info from a query object.
       *
       * @param {Object} event
       * @param {Object} query
       */
      searchBar.updateQuery = function(event, query) {
        searchBar.queryString = query.queryString;

        if (query.errors && query.errors.length) {
          scope.sb.hasErrors = true;
          scope.sb.errors = formatErrors(query.errors);
        } else {
          scope.sb.hasErrors = false;
          scope.sb.errors = '';
        }
      };

      function formatErrors(errors) {
        var formattedErrors = '';

        _.forEach(errors, function (error) {
          formattedErrors += (error + '\n');
        });

        return formattedErrors;
      }

      /**
       * Show the first 5 items from a list of saved searches.
       *
       * @param {Object[]} savedSearches
       */
      function showSavedSearches(savedSearches) {
        searchBar.savedSearches = _.take(savedSearches, 5);
      }

      savedSearchesService
        .getSavedSearches()
        .then(showSavedSearches);

      var savedSearchesChangedListener = $rootScope.$on('savedSearchesChanged', function (event, savedSearches) {
        showSavedSearches(savedSearches);
      });

      var stopEditingQueryListener = $rootScope.$on('stopEditingQuery', function () {
        scope.sb.isEditing = false;
        if (editorModal) {
          editorModal.dismiss();
        }
      });

      var searchQueryChangedListener = $rootScope.$on('searchQueryChanged', searchBar.updateQuery);

      scope.$on('$destroy', savedSearchesChangedListener);
      scope.$on('$destroy', stopEditingQueryListener);
      scope.$on('$destroy', searchQueryChangedListener);
    }
  };
}
udbSearchBar.$inject = ["searchHelper", "$rootScope", "$uibModal", "savedSearchesService", "searchApiSwitcher"];
})();

// Source: src/search/event-types.value.js
(function () {
'use strict';

/**
 * @ngdoc value
 * @name udb.search.eventTypes
 * @description
 * # Event Types
 * A list of types you can use to find events.
 */
angular
  .module('udb.search')
  .value('eventTypes', [
    {label: 'Begeleide rondleiding', id: '0.7.0.0.0'},
    {label: 'Beurs', id: '0.6.0.0.0'},
    {label: 'Concert', id: '0.50.4.0.0'},
    {label: 'Cursus of workshop', id: '0.3.1.0.0'},
    {label: 'Dansvoorstelling', id: '0.54.0.0.0'},
    {label: 'Eten en drinken', id: '1.50.0.0.0'},
    {label: 'Festival', id: '0.5.0.0.0'},
    {label: 'Film', id: '0.50.6.0.0'},
    {label: 'Kamp of vakantie', id: '0.57.0.0.0'},
    {label: 'Kermis of feestelijkheid', id: '0.28.0.0.0'},
    {label: 'Lezing of congres', id: '0.3.2.0.0'},
    {label: 'Markt of braderie', id: '0.37.0.0.0'},
    {label: 'Opendeurdag', id: '0.12.0.0.0'},
    {label: 'Party of fuif', id: '0.49.0.0.0'},
    {label: 'Route', id: '0.17.0.0.0'},
    {label: 'Spel of quiz', id: '0.50.21.0.0'},
    {label: 'Sport en beweging', id: '0.59.0.0.0 '},
    {label: 'Sportwedstrijd bekijken', id: '0.19.0.0.0'},
    {label: 'Tentoonstelling', id: '0.0.0.0.0'},
    {label: 'Theatervoorstelling', id: '0.55.0.0.0'}
  ]);
})();

// Source: src/search/filters/currency.filter.js
(function () {
'use strict';

/**
 * @ngdoc filter
 * @name udb.search.filter:currency
 * @function
 * @description
 * # currency
 * Custom currency filter to display event prices
 */
angular
  .module('udb.search')
  .filter('currency', CurrencyFilter);

/* @ngInject */
function CurrencyFilter() {
  return function (number, currencyCode) {
    var currencies = {
      // Source: Interinstitutional Style Guide of the EU
      // Chapter 7.3.3. Rules for expressing monetary units
      // http://publications.europa.eu/code/en/en-370303.htm
      EUR: {
        symbol: '',
        thousand: '.',
        decimal: ',',
        format: '%s%v',
        precision: 2
      }
    };

    var currency = currencies[currencyCode];
    // Default to Euro if the currency is not defined
    if (!currency) {
      currency = currencies.EUR;
    }

    return accounting.formatMoney(number, currency);
  };
}
})();

// Source: src/search/filters/imagesbyLanguage.filter.js
(function () {
'use strict';

/**
 * @ngdoc filter
 * @name udb.search.filter:imagesByLanguage
 * @function
 * @description
 * # jsonLDLang
 * Filter JsonLD objects by language.
 */
angular.module('udb.search')
  .filter('imagesByLanguage', imagesByLanguageFilter);

/* @ngInject */
function imagesByLanguageFilter() {
  return function (mediaObjects, preferredLanguage) {

    var filtered = _.filter(mediaObjects, function(mediaObject) {
      if (typeof mediaObject !== 'undefined') {
        return mediaObject['@type'] === 'schema:ImageObject' &&
          (mediaObject.inLanguage === preferredLanguage || angular.isUndefined(mediaObject.inLanguage));
      }
    });
    return filtered;
  };
}
})();

// Source: src/search/filters/json-ld-lang.filter.js
(function () {
'use strict';

/**
 * @ngdoc filter
 * @name udb.search.filter:jsonLDLang
 * @function
 * @description
 * # jsonLDLang
 * Filter JsonLD objects by language.
 */
angular.module('udb.search')
  .filter('jsonLDLang', JsonLDLangFilter);

/* @ngInject */
function JsonLDLangFilter() {
  return function (jsonLDObject, preferredLanguage, shouldFallback) {
    var translatedJsonLDObject = _.cloneDeep(jsonLDObject);
    translatedJsonLDObject = translateProperties(translatedJsonLDObject, preferredLanguage, shouldFallback);
    return translatedJsonLDObject;
  };
}

function isALanguageKey(key) {
  return key.length === 2;
}

function translateProperties(jsonLDProperty, preferredLanguage, shouldFallback) {
  jsonLDProperty = _.each(jsonLDProperty, function(val, key) {
    if (_.isObject(val)) {
      var allKeys = Object.keys(val);
      if (allKeys.length > 0 && allKeys.every(isALanguageKey)) {
        if (val[preferredLanguage]) {
          jsonLDProperty[key] = val[preferredLanguage];
        } else {
          if (shouldFallback) {
            var fallbackLanguage = allKeys[0];
            var translatedProperty = val[fallbackLanguage];
            jsonLDProperty[key] = translatedProperty;
          }
        }
      } else {
        val = translateProperties(val, preferredLanguage, shouldFallback);
      }
    }
  });
  return jsonLDProperty;
}
})();

// Source: src/search/place-types.value.js
(function () {
'use strict';

/**
 * @ngdoc value
 * @name udb.search.placeTypes
 * @description
 * # Place Types
 * A list of types you can use to find places.
 */
angular
  .module('udb.search')
  .value('placeTypes', [
    {label: 'Archeologische site', id:'3CuHvenJ+EGkcvhXLg9Ykg'},
    {label: 'Bibliotheek of documentatiecentrum', id: 'kI7uAyn2uUu9VV6Z3uWZTA'},
    {label: 'Bioscoop', id: 'BtVNd33sR0WntjALVbyp3w'},
    {label: 'Cultuur- of ontmoetingscentrum', id: 'Yf4aZBfsUEu2NsQqsprngw'},
    {label: 'Discotheek', id: 'YVBc8KVdrU6XfTNvhMYUpg'},
    {label: 'Horeca', id: 'ekdc4ATGoUitCa0e6me6xA'},
    {label: 'Jeugdhuis of jeugdcentrum', id: 'JCjA0i5COUmdjMwcyjNAFA'},
    {label: 'Monument', id: '0.14.0.0.0'},
    {label: 'Museum of galerij', id: 'GnPFp9uvOUyqhOckIFMKmg'},
    {label: 'Natuur, park of tuin', id: '0.15.0.0.0'},
    {label: 'Openbare ruimte', id: '0.8.0.0.0'},
    {label: 'Recreatiedomein of centrum', id: '0.53.0.0.0'},
    {label: 'School of onderwijscentrum', id: 'rJRFUqmd6EiqTD4c7HS90w'},
    {label: 'Sportcentrum', id: 'eBwaUAAhw0ur0Z02i5ttnw'},
    {label: 'Thema of pretpark', id: '0.41.0.0.0'},
    {label: 'Winkel', id: 'VRC6HX0Wa063sq98G5ciqw'},
    {label: 'Zaal of expohal', id: 'OyaPaf64AEmEAYXHeLMAtA'},
  ]);
})();

// Source: src/search/services/field-type-transformers.value.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.search.fieldTypeTransformers
 * @description
 * # fieldTypeTransformers
 * Value in udb.search module.
 */
angular
  .module('udb.search')
  .value('fieldTypeTransformers', {
    'string': ['=', '!'],
    'tokenized-string': ['+', '-'],
    'choice': ['=', '!'],
    'term': ['=', '!'],
    'termNis': ['=', '!'],
    'number': ['=', '><', '<', '>'],
    'check': ['='],
    'date-range': ['=', '><', '<', '>']
});
})();

// Source: src/search/services/query-builder.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udbApp.LuceneQueryBuilder
 * @description
 * # LuceneQueryBuilder
 * Service in the udb.search.
 */
angular.module('udb.search')
  .service('LuceneQueryBuilder', LuceneQueryBuilder);

/* @ngInject */
function LuceneQueryBuilder(LuceneQueryParser, QueryTreeValidator, QueryTreeTranslator, queryFields, taxonomyTerms) {
  var implicitToken = '<implicit>';

  this.translate = function (query) {
    QueryTreeTranslator.translateQueryTree(query.queryTree);
  };

  this.validate = function (query) {
    QueryTreeValidator.validate(query.queryTree, query.errors);
  };

  this.isValid = function (query) {
    this.translate(query);
    this.validate(query);

    return query.errors.length === 0;
  };

  this.parseQueryString = function (query) {
    try {
      query.queryTree = LuceneQueryParser.parse(query.queryString);
    } catch (e) {
      query.errors.push(e.message);
    }

    return query.queryTree;
  };

  /**
   *
   * @param {string} queryString
   */
  this.createQuery = function (queryString) {
    var query = {
      originalQueryString: queryString,
      queryString: queryString,
      queryTree: {},
      errors: []
    };

    this.parseQueryString(query);

    return query;
  };

  var printTerm = function (node) {
    var term = node.term,
        isRangeExpression = (node.lowerBound || node.upperBound);

    if (isRangeExpression) {
      var min = node.lowerBound || '*',
          max = node.upperBound || '*',
          inclusive = node.inclusive;

      if (min instanceof Date) {
        min = moment(min).format();
      }
      if (max instanceof Date) {
        max = moment(max).format();
      }

      term = min + ' TO ' + max;

      if (inclusive) {
        term = '[' + term + ']';
      } else {
        term = '{' + term + '}';
      }
    } else {
      // if the term is a phrase surround it with double quotes
      if (node.quoted || term.indexOf(' ') !== -1) {
        term = '"' + term + '"';
      }

      // check for fuzzy search modifier
      if (node.similarity) {
        term += ('~' + node.similarity);
      }

      // check for proximity modifier
      if (node.proximity) {
        term += ('~' + node.proximity);
      }

      // check for prefix modifier
      if (node.prefix) {
        term = node.prefix + term;
      }

      // check for boost modifier
      if (node.boost) {
        term += ('^' + node.boost);
      }
    }

    return term;
  };

  var unparseNode = function (branch, depth, sentence) {

    if (branch.left) {
      var result,
          operator = (branch.operator === implicitToken) ? ' ' : (' ' + branch.operator + ' ');

      if (branch.right) {
        result = unparseNode(branch.left, depth + 1, sentence);
        result += operator;
        result += unparseNode(branch.right, depth + 1, sentence);

        if (depth > 0) {
          result = '(' + result + ')';
        }

        if (branch.field && branch.field !== implicitToken) {
          result = (branch.field + ':') + result;
        }

      } else {
        var singleTransformedGroupedTerm = branch.field && (branch.left.field === implicitToken) && branch.left.prefix;

        result = singleTransformedGroupedTerm ?
          branch.field + ':(' + printTerm(branch.left) + ')' :
          unparseNode(branch.left, depth + 1, sentence);
      }

      return result;

    } else {
      var fieldQuery = '',
          term = printTerm(branch);

      if (branch.field !== implicitToken && branch.field !== null) {
        var fieldPrefix = '';

        if (_.contains(['!', '+', '-'], branch.transformer)) {
          fieldPrefix = branch.transformer;
        }

        fieldQuery += (fieldPrefix + branch.field + ':');
      }

      fieldQuery += term;

      return sentence += fieldQuery;
    }
  };

  this.unparse = function (query) {
    query.queryString = this.unparseQueryTree(query.queryTree);
    return query.queryString;
  };

  this.unparseQueryTree = function (queryTree) {
    var queryString = '';

    if (queryTree.left) {
      queryString = unparseNode(queryTree, 0, '');
    }

    return queryString;
  };

  function printTreeField(field) {
    if (field.fieldType === 'date-range') {
      cleanUpDateRangeField(field);
    }
    var transformedField = transformField(field);
    return transformedField.field + printTerm(transformedField);
  }

  /**
   * @description
   * Unparse a grouped field information tree to a query string
   *
   * @param   {object}  groupedTree     A tree structure with field groups
   * @return  {string}  A query string
   */
  this.unparseGroupedTree = function (groupedTree) {
    var root = groupedTree;
    var queryString = '';

    _.forEach(root.nodes, function (node, nodeIndex) {
      var nodeString = '';
      if (node.type === 'group') {
        var group = node;

        _.forEach(group.nodes, function (field, fieldIndex) {

          // check if the field is actually a sub group
          if (field.type === 'group') {

            var subGroup = field,
                subGroupString = ' ';

            if (subGroup.nodes.length === 1) {
              var singleField = subGroup.nodes[0];
              subGroupString += subGroup.operator + ' ' + printTreeField(singleField);
            } else {
              subGroupString += subGroup.operator + ' (';
              _.forEach(subGroup.nodes, function (field, fieldIndex) {
                if (fieldIndex) {
                  subGroupString += ' OR ';
                }
                subGroupString += printTreeField(field);
              });
              subGroupString += ')';
            }

            nodeString += subGroupString;
          } else {
            if (fieldIndex) {
              nodeString += ' ' + node.operator + ' ';
            }

            nodeString += printTreeField(field);

            var nextIndex = fieldIndex + 1;
            if (fieldIndex && nextIndex < group.nodes.length && group.nodes[nextIndex].type === 'group') {
              nodeString = '(' + nodeString + ')';
            }
          }
        });

        if (root.nodes.length > 1 && group.nodes.length > 1) {
          nodeString = '(' + nodeString + ')';
        }
      } else {
        console.log('Expecting a group but found: ' + node.type);
      }

      // do not prepend the first node with an operator
      if (nodeIndex || node.excluded) {
        var operator = node.excluded ? 'NOT' : 'OR';
        queryString += ' ' + operator + ' ';
      }
      queryString += nodeString;
    });

    return queryString;
  };

  function cleanUpDateRangeField(field) {
    if (field.transformer === '=' && moment(field.lowerBound).isValid()) {
      field.lowerBound = moment(field.lowerBound).startOf('day').toDate();
      field.upperBound = moment(field.lowerBound).endOf('day').toDate();
    }

    if (field.transformer === '><') {
      if (moment(field.lowerBound).isValid()) {
        field.lowerBound = moment(field.lowerBound).startOf('day').toDate();
      } else {
        field.lowerBound = '*';
      }

      if (moment(field.upperBound).isValid()) {
        field.upperBound = moment(field.upperBound).endOf('day').toDate();
      } else {
        field.upperBound = '*';
      }
    }

    if (field.transformer === '<') {
      if (moment(field.upperBound).isValid()) {
        field.upperBound = moment(field.upperBound).endOf('day').toDate();
      } else {
        field.upperBound = moment().endOf('day').toDate();
      }
    }

    if (field.transformer === '>') {
      if (moment(field.lowerBound).isValid()) {
        field.lowerBound = moment(field.lowerBound).startOf('day').toDate();
      } else {
        field.lowerBound = moment().startOf('day').toDate();
      }
    }
  }

  function transformField(originalField) {
    var field = _.clone(originalField);
    var isFieldImplicit = field.field === implicitToken;
    var fieldOperator = '';

    switch (field.transformer) {
      case '!':
        fieldOperator = '!';
        break;
      case '-':
        fieldOperator = '-';
        break;
      case '<':
        field.lowerBound = '*';
        break;
      case '>':
        field.upperBound = '*';
        break;
      case '=':
        if (field.fieldType !== 'date-range') {
          field.upperBound = undefined;
          field.lowerBound = undefined;
        }
        break;
    }

    field.field = fieldOperator + (isFieldImplicit ? '' : field.field + ':');

    return field;
  }

  /**
   * @description
   * Generate a grouped field information tree from a query tree
   * The query tree should not nest different operators deeper than 2 levels.
   * Modifiers will be ignored.
   *
   * @param   {object}  queryTree   - The queryTree to get information from
   *
   * @return  {object}              - A grouped field information tree
   */
  this.groupQueryTree = function (queryTree) {
    var groupedFieldTree = {
      type: 'root',
      nodes: [],
      operator: queryTree.operator || 'OR'
    };

    // If the query tree of an empty search is used, add a default field and group
    if (!queryTree.left) {
      var group = {
        type: 'field',
        operator: 'OR',
        nodes: [
          {
            field: 'name.\\*',
            name: 'title',
            term: '',
            fieldType: 'tokenized-string',
            transformer: '+'
          }
        ]
      };
      groupedFieldTree.nodes.push(group);
    } else {
      this.groupNode(queryTree, groupedFieldTree);
      this.cleanUpGroupedFieldTree(groupedFieldTree);
    }

    return groupedFieldTree;
  };

  /**
   * @description
   * Clean up a field tree after grouping.
   * Used by groupQueryTree to cleanse a freshly grouped tree.
   *
   * @param {object} groupedFieldTree
   */
  this.cleanUpGroupedFieldTree = function (groupedFieldTree) {
    _.forEach(groupedFieldTree.nodes, function (fieldGroup) {
      // This property is just used to track implicit fields and can be removed when switching groups.
      delete fieldGroup.implicitField;

      // Switch the type of the node to field instead of group if it only contains one field.
      if (fieldGroup.nodes && fieldGroup.nodes.length === 1) {
        fieldGroup.type = 'field';
      }

      // Replace any remaining implicitly declared operators with OR.
      // Assuming the following term grouping syntax was used "field:(term1 term2)".
      if (fieldGroup.operator === implicitToken) {
        fieldGroup.operator = 'OR';
      }

      // add field-query type and map options for term and choice fields
      _.forEach(fieldGroup.nodes, function (field) {

        // Find the field-query field type
        var fieldType = _.find(queryFields, function (fieldType) {
          return fieldType.name === field.field;
        });

        // Set the type and map options depending on field type
        if (fieldType) {
          field.fieldType = fieldType.type;

          // terms should be matched to their domain and used as the field-query field
          // if no matching taxonomy term is found the query-field should be removed
          if (fieldType.type === 'term') {
            var taxonomyTerm = _.find(taxonomyTerms, function (term) {
              return term.label.toUpperCase() === field.term.toUpperCase();
            });

            if (taxonomyTerm) {
              var domainFieldName = 'category_' + taxonomyTerm.domain + '_name';
              field.field = domainFieldName;
              field.term = taxonomyTerm.label;
            } else {
              field.invalid = true;
            }
          }

          // Look up options for choice field-query
          if (fieldType.type === 'choice') {
            var option = _.find(fieldType.options, function (option) {
              return option === field.term.toUpperCase();
            });

            if (option) {
              field.term = option;
            } else {
              field.invalid = true;
            }
          }

          // Make sure boolean field-query values are either true or false
          if (fieldType.type === 'check') {
            var trueValue = fieldType.name,
                falseValue = '(!' + fieldType.name + ')';

            if (!(field.term === trueValue || field.term === falseValue)) {
              field.invalid = true;
            }
          }

          if (fieldType.type === 'tokenized-string') {
            if (!field.transformer || field.transformer === '=') {
              field.transformer = '+';
            }

            if (field.transformer === '!') {
              field.transformer = '-';
            }
          }

          if (fieldType.type === 'string') {
            if (!field.transformer || field.transformer === '+') {
              field.transformer = '=';
            }

            if (field.transformer === '-') {
              field.transformer = '!';
            }
          }

          // Numbers can be a single or ranged term
          // The editor only handles ranges that have one of the boundaries set to infinity
          if (fieldType.type === 'number') {
            if (field.term) {
              field.transformer = '=';
            } else {
              if (field.upperBound && field.lowerBound === '*') {
                field.transformer = '<';
              } else if (field.lowerBound && field.upperBound === '*') {
                field.transformer = '>';
              } else {
                field.transformer = '=';
                field.term = field.lowerBound || field.upperBound;
                field.lowerBound = undefined;
                field.upperBound = undefined;
              }
            }
          }

          if (fieldType.type === 'date-range') {
            var startDate = moment(field.lowerBound),
                endDate = moment(field.upperBound);

            if (startDate.isValid() && endDate.isValid()) {
              if (startDate.isSame(endDate, 'day')) {
                field.transformer = '=';
              } else {
                field.transformer = '><';
              }
            } else {
              if (!startDate.isValid() && endDate.isValid()) {
                field.transformer = '<';
              }

              if (!endDate.isValid() && startDate.isValid()) {
                field.transformer = '>';
              }
            }
          }
        }

      });
    });
  };

  /**
   * @description
   * Group a node in a query tree branch.
   * You should not need to call this method directly, use groupQueryTree instead.
   *
   * @param {object}  branch        - The branch of a query tree
   * @param {object}  fieldTree     - The field tree that will be returned
   * @param {object}  [fieldGroup]  - Keeps track of the current field group
   */
  this.groupNode = function (branch, fieldTree, fieldGroup) {
    // if the operator is implicit, you're dealing with grouped terms eg: field:(term1 term2)
    if (branch.operator === implicitToken) {
      branch.operator = 'OR';
    }
    if (!fieldGroup || branch.operator && (branch.operator !== fieldGroup.operator)) {
      var newFieldGroup = {
        type: 'group',
        operator: branch.operator || 'OR',
        nodes: []
      };

      fieldTree.nodes.push(newFieldGroup);
      fieldGroup = newFieldGroup;
    }

    // Track the last used field name to apply to implicitly defined terms
    if (branch.field && branch.field !== implicitToken) {
      fieldGroup.implicitField = branch.field;
    }

    if (branch.term || (branch.lowerBound && branch.upperBound)) {
      var field = branch.field;

      // Handle implicit field names by using the last used field name
      if (field === implicitToken) {
        if (fieldGroup.implicitField) {
          field = fieldGroup.implicitField;
        } else {
          throw 'Field name is implicit and not defined elsewhere.';
        }
      }

      fieldGroup.nodes.push(makeField(branch, field));
    }

    if (branch.left) {
      this.groupNode(branch.left, fieldTree, fieldGroup);
      if (branch.right) {
        this.groupNode(branch.right, fieldTree, fieldGroup);
      }
    }
  };

  /**
   * @description
   * Generate a field object that's used to render the query editor fields.
   *
   * @param {object} node The node with all the necessary information
   * @return {object} A field object used to render the query editor
   */
  function makeField(node, fieldName) {
    var fieldType = _.find(queryFields, function (type) {
          return type.name === node.field;
        }),
        field = {
          field: fieldName || node.field,
          fieldType: fieldType || 'string',
          transformer: node.transformer || '='
        };

    if (node.lowerBound || node.upperBound) {
      field.lowerBound = node.lowerBound || undefined;
      field.upperBound = node.upperBound || undefined;
      field.inclusive = node.inclusive || true;
    } else {
      field.term = node.term || undefined;
    }

    return field;
  }
}
LuceneQueryBuilder.$inject = ["LuceneQueryParser", "QueryTreeValidator", "QueryTreeTranslator", "queryFields", "taxonomyTerms"];
})();

// Source: src/search/services/query-field-translations.constant.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.search.queryFieldTranslations
 * @description
 * # queryFieldTranslations
 * Value in the udb.search.
 */
angular
  .module('udb.search')
  .constant('queryFieldTranslations', {
    sapi2: {
      'TYPE' : 'type',
      'CDBID' : 'cdbid',
      'LOCATION_ID' : 'location_id',
      'ORGANISER_ID' : 'organiser_id',
      'TITLE' : 'title',
      'KEYWORDS' : 'keywords',
      'CITY' : 'city',
      'ORGANISER_KEYWORDS': 'organiser_keywords',
      'ZIPCODE' : 'zipcode',
      'COUNTRY' : 'country',
      'CATEGORY_NAME' : 'category_name',
      'AGEFROM' : 'agefrom',
      'DETAIL_LANG' : 'detail_lang',
      'PRICE' : 'price',
      'STARTDATE' : 'startdate',
      'ENDDATE' : 'enddate',
      'ORGANISER_LABEL' : 'organiser_label',
      'LOCATION_LABEL' : 'location_label',
      'EXTERNALID' : 'externalid',
      'LASTUPDATED' : 'lastupdated',
      'CREATIONDATE' : 'creationdate',
      'CREATEDBY' : 'createdby',
      'PERMANENT' : 'permanent',
      'CATEGORY_EVENTTYPE_NAME' : 'category_eventtype_name',
      'LOCATIONTYPE' : 'locationtype',
      'OFFERTYPE' : 'offertype',
      'CATEGORY_THEME_NAME' : 'category_theme_name',
      'CATEGORY_FACILITY_NAME' : 'category_facility_name',
      'CATEGORY_TARGETAUDIENCE_NAME' : 'category_targetaudience_name',
      'CATEGORY_FLANDERSREGION_NAME' : 'category_flandersregion_name',
      'AVAILABLEFROM' : 'availablefrom'
    },
    en: {
      'TEXT': 'text',
      'KEYWORDS' : 'label',
      'PHYSICAL_GIS' : 'geo',
      'CATEGORY_NAME' : 'category',
      'DETAIL_LANG' : 'translation',
      'ORGANISER_LABEL' : 'organiser',
      'LOCATION_LABEL' : 'location',
      'CREATIONDATE' : 'created',
      'CATEGORY_EVENTTYPE_NAME' : 'eventtype',
      'LOCATIONTYPE' : 'locationtype',
      'OFFERTYPE' : 'offertype',
      'CATEGORY_THEME_NAME' : 'theme',
      'CATEGORY_FACILITY_NAME' : 'facility',
      'CATEGORY_TARGETAUDIENCE_NAME' : 'targetaudience',
      'CATEGORY_FLANDERSREGION_NAME' : 'region',
      'AVAILABLEFROM' : 'available',
      'LOCATION_ID' : 'locationid',
      'ORGANISER_ID' : 'organizationid',
      'DATE' : 'date'
    },
    fr: {
      'LOCATION_LABEL': 'location',
      'TITLE': 'titre'
    },
    nl: {
      'TYPE' : 'type',
      'TEXT': 'tekst',
      'LOCATION_ID' : 'locatieid',
      'ORGANISER_ID' : 'organisatieid',
      'TITLE' : 'titel',
      'KEYWORDS' : 'label',
      'CITY' : 'stad',
      'ORGANISER_KEYWORDS': 'organisatielabel',
      'ZIPCODE' : 'postcode',
      'COUNTRY' : 'land',
      'CATEGORY_NAME' : 'categorie',
      'AGEFROM' : 'leeftijd',
      'DETAIL_LANG' : 'vertaling',
      'PRICE' : 'prijs',
      'DATE' : 'datum',
      'STARTDATE' : 'startdatum',
      'ENDDATE' : 'einddatum',
      'ORGANISER_LABEL' : 'organisatienaam',
      'LOCATION_LABEL' : 'locatienaam',
      'EXTERNALID' : 'externalid',
      'LASTUPDATED' : 'laatst_aangepast',
      'CREATIONDATE' : 'gecreëerd',
      'CREATEDBY' : 'gecreëerd_door',
      'PERMANENT' : 'permanent',
      'CATEGORY_EVENTTYPE_NAME' : 'type',
      'LOCATIONTYPE' : 'locatietype',
      'OFFERTYPE' : 'aanbodtype',
      'CATEGORY_THEME_NAME' : 'thema',
      'CATEGORY_FACILITY_NAME' : 'voorzieningen',
      'CATEGORY_TARGETAUDIENCE_NAME' : 'doelgroep',
      'CATEGORY_FLANDERSREGION_NAME' : 'gemeente',
      'AVAILABLEFROM' : 'datum_beschikbaar'
    }
  });
})();

// Source: src/search/services/query-fields.value.js
(function () {
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
    {name: 'category_eventtype_name', field:'terms.label', type: 'term', group: 'what', editable: true},
    {name: 'locationtype', field:'terms.label', type: 'term', group: 'what', editable: true},
    {name: 'category_theme_name', field:'terms.label', type: 'term', group: 'what', editable: true},
    {name: 'text', field:'<implicit>', type: 'tokenized-string', group: 'what', editable: true},

    {name: 'city', field:'address.\\*.addressLocality', type: 'string', group:'where', editable: true},
    {name: 'zipcode', field:'address.\\*.postalCode', type: 'string', group:'where', editable: true},
    {name: 'location_id', field:'location.id', type: 'string', group:'where', editable: true},
    {name: 'country', field: 'address.\\*.addressCountry', type: 'choice', group:'where', editable: false, options: ['AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM']},
    {name: 'location_label', field: 'location.name.\\*', type: 'tokenized-string', group:'where', editable: true},
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
    {name: 'price', field: 'price', type: 'number' , group: 'other', editable: true},
    {name: 'organiser_label', field: 'organizer.name.\\*', type: 'tokenized-string', group: 'other', editable: true},
    {name: 'category_facility_name', field:'location.terms.label', type: 'term', group: 'other', editable: true},
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
    {field: 'terms.id', type: 'string'},
    {field: 'mediaObjectsCount', type: 'number'},
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
})();

// Source: src/search/services/query-tree-translator.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.search.QueryTreeTranslator
 * @description
 * # QueryTreeTranslator
 * Service in the udb.search.
 */
angular
  .module('udb.search')
  .service('QueryTreeTranslator', QueryTreeTranslator);

/* @ngInject */
function QueryTreeTranslator(queryFieldTranslations, queryFields) {
  /**
   * @param {string} field    - The field to translate.
   * @param {string} srcLang  - To source language to translate from.
   */
  var translateField = function (field, srcLang) {
    var translatableFieldName = _.findKey(queryFieldTranslations[srcLang], function (src) {
      return src === field;
    });

    var queryField = (undefined === translatableFieldName) ?
      undefined :
      _.find(queryFields, {name: translatableFieldName.toLowerCase()});

    return (undefined === queryField) ? field : queryField.field;
  };

  var translateNode = function (node, depth) {
    var left = node.left || false,
      right = node.right || false,
      nodes = [];

    if (left) {
      nodes.push(left);
    }
    if (right) {
      nodes.push(right);
    }

    for (var i = 0, len = nodes.length; i < len; i++) {
      var iNode = nodes[i];
      if (typeof iNode === 'object') {
        translateNode(iNode, depth + 1);
      }
    }

    if (node.field) {
      node.field = translateField(node.field, 'sapi2');
      node.field = translateField(node.field, 'en');
      node.field = translateField(node.field, 'nl');
    }

  };

  this.translateQueryTree = function (queryTree) {
    return translateNode(queryTree, 0);
  };
}
QueryTreeTranslator.$inject = ["queryFieldTranslations", "queryFields"];
})();

// Source: src/search/services/query-tree-validator.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.search.QueryTreeValidator
 * @description
 * # QueryTreeValidator
 * Service in the udb.search.
 */
angular.module('udb.search')
  .service('QueryTreeValidator', QueryTreeValidator);

/* @ngInject */
function QueryTreeValidator(queryFields) {

  var validFields = _.union(_.map(queryFields, 'field'), ['_exists_']),
      implicitToken = '<implicit>',
      validParentFields = _(validFields)
        .filter(function (field) {
          return field.indexOf('.') > 0;
        })
        .map(function (field) {
          var fields = field.split('.');
          fields.pop();
          return fields.join('.');
        })
        .value();

  var validateFields = function (current, depth, errors) {
    var left = current.left || false,
      right = current.right || false,
      nodes = [];

    if (left) {
      nodes.push(left);
    }
    if (right) {
      nodes.push(right);
    }

    for (var i = 0, len = nodes.length; i < len; i++) {
      var node = nodes[i];
      if (typeof node === 'object') {
        validateFields(node, depth + 1, errors);
      }
    }

    var queryField = current.field;
    if (typeof(queryField) !== 'undefined') {
      var field = _.trim(queryField, '.\\*');
      var fieldHasWildcard = queryField !== field;

      if (field !== null && field !== implicitToken) {
        if (fieldHasWildcard) {
          if (!_.contains(validParentFields, field)) {
            errors.push(field + ' is not a valid parent search field that can be used with a wildcard');
          }
        } else {
          if (!_.contains(validFields, field)) {
            errors.push(field + ' is not a valid search field');
          }
        }
      }
    }
  };

  this.validate = function (queryTree, errors) {
    validateFields(queryTree, 0, errors);
  };

}
QueryTreeValidator.$inject = ["queryFields"];
})();

// Source: src/search/services/sapi2.field-type-transformers.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.search.sapi2FieldTypeTransformers
 * @description
 * # sapi2FieldTypeTransformers
 * Value in udb.search module.
 */
angular
  .module('udb.search')
  .value('sapi2FieldTypeTransformers', {
    'string': ['=', '!'],
    'tokenized-string': ['+', '-'],
    'choice': ['=', '!'],
    'term': ['=', '!'],
    'number': ['=', '<', '>'],
    'check': ['='],
    'date-range': ['=', '><', '<', '>']
  });
})();

// Source: src/search/services/sapi2.query-builder.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udbApp.sapi2QueryBuilder
 * @description
 * # sapi2QueryBuilder
 * Service in the udb.search.
 */
angular.module('udb.search')
  .service('sapi2QueryBuilder', QueryBuilder);

QueryBuilder.$inject = [
  'LuceneQueryParser',
  'sapi2QueryTreeValidator',
  'sapi2QueryTreeTranslator',
  'sapi2QueryFields',
  'taxonomyTerms'
];
function QueryBuilder(LuceneQueryParser, QueryTreeValidator, QueryTreeTranslator, queryFields, taxonomyTerms) {
  var implicitToken = '<implicit>';

  this.translate = function (query) {
    QueryTreeTranslator.translateQueryTree(query.queryTree);
  };

  this.validate = function (query) {
    QueryTreeValidator.validate(query.queryTree, query.errors);
  };

  this.isValid = function (query) {
    this.translate(query);
    this.validate(query);

    return query.errors.length === 0;
  };

  this.parseQueryString = function (query) {
    try {
      query.queryTree = LuceneQueryParser.parse(query.queryString);
    } catch (e) {
      query.errors.push(e.message);
    }

    return query.queryTree;
  };

  /**
   *
   * @param {string} queryString
   */
  this.createQuery = function (queryString) {
    var query = {
      originalQueryString: queryString,
      queryString: queryString,
      queryTree: {},
      errors: []
    };

    this.parseQueryString(query);

    return query;
  };

  var printTerm = function (node) {
    var term = node.term,
      isRangeExpression = (node.lowerBound || node.upperBound);

    if (isRangeExpression) {
      var min = node.lowerBound || '*',
        max = node.upperBound || '*',
        inclusive = node.inclusive;

      if (min instanceof Date) {
        min = min.toISOString();
      }
      if (max instanceof Date) {
        max = max.toISOString();
      }

      term = min + ' TO ' + max;

      if (inclusive) {
        term = '[' + term + ']';
      } else {
        term = '{' + term + '}';
      }
    } else {
      // if the term is a phrase surround it with double quotes
      if (node.quoted || term.indexOf(' ') !== -1) {
        term = '"' + term + '"';
      }

      // check for fuzzy search modifier
      if (node.similarity) {
        term += ('~' + node.similarity);
      }

      // check for proximity modifier
      if (node.proximity) {
        term += ('~' + node.proximity);
      }

      // check for prefix modifier
      if (node.prefix) {
        term = node.prefix + term;
      }

      // check for boost modifier
      if (node.boost) {
        term += ('^' + node.boost);
      }
    }

    return term;
  };

  var unparseNode = function (branch, depth, sentence) {

    if (branch.left) {
      var result,
        operator = (branch.operator === implicitToken) ? ' ' : (' ' + branch.operator + ' ');

      if (branch.right) {
        result = unparseNode(branch.left, depth + 1, sentence);
        result += operator;
        result += unparseNode(branch.right, depth + 1, sentence);

        if (depth > 0) {
          result = '(' + result + ')';
        }

        if (branch.field && branch.field !== implicitToken) {
          result = (branch.field + ':') + result;
        }

      } else {
        result = unparseNode(branch.left, depth + 1, sentence);
      }

      return result;

    } else {
      var fieldQuery = '',
        term = printTerm(branch);

      if (branch.field !== implicitToken && branch.field !== null) {
        var fieldPrefix = '';

        if (_.contains(['!', '+', '-'], branch.transformer)) {
          fieldPrefix = branch.transformer;
        }

        fieldQuery += (fieldPrefix + branch.field + ':');
      }

      fieldQuery += term;

      return sentence += fieldQuery;
    }

    if (depth === 0) {
      return sentence;
    }
  };

  this.unparse = function (query) {
    query.queryString = this.unparseQueryTree(query.queryTree);
    return query.queryString;
  };

  this.unparseQueryTree = function (queryTree) {
    var queryString = '';

    if (queryTree.left) {
      queryString = unparseNode(queryTree, 0, '');
    }

    return queryString;
  };

  function printTreeField(field) {
    if (field.fieldType === 'date-range') {
      cleanUpDateRangeField(field);
    }
    var transformedField = transformField(field);
    return transformedField.field + ':' + printTerm(transformedField);
  }

  /**
   * @description
   * Unparse a grouped field information tree to a query string
   *
   * @param   {object}  groupedTree     A tree structure with field groups
   * @return  {string}  A query string
   */
  this.unparseGroupedTree = function (groupedTree) {
    var root = groupedTree;
    var queryString = '';

    _.forEach(root.nodes, function (node, nodeIndex) {
      var nodeString = '';
      if (node.type === 'group') {
        var group = node;

        _.forEach(group.nodes, function (field, fieldIndex) {

          // check if the field is actually a sub group
          if (field.type === 'group') {

            var subGroup = field,
              subGroupString = ' ';

            if (subGroup.nodes.length === 1) {
              var singleField = subGroup.nodes[0];
              subGroupString += subGroup.operator + ' ' + printTreeField(singleField);
            } else {
              subGroupString += subGroup.operator + ' (';
              _.forEach(subGroup.nodes, function (field, fieldIndex) {
                if (fieldIndex) {
                  subGroupString += ' OR ';
                }
                subGroupString += printTreeField(field);
              });
              subGroupString += ')';
            }

            nodeString += subGroupString;
          } else {
            if (fieldIndex) {
              nodeString += ' ' + node.operator + ' ';
            }

            nodeString += printTreeField(field);

            var nextIndex = fieldIndex + 1;
            if (fieldIndex && nextIndex < group.nodes.length && group.nodes[nextIndex].type === 'group') {
              nodeString = '(' + nodeString + ')';
            }
          }
        });

        if (root.nodes.length > 1 && group.nodes.length > 1) {
          nodeString = '(' + nodeString + ')';
        }
      } else {
        console.log('Expecting a group but found: ' + node.type);
      }

      // do not prepend the first node with an operator
      if (nodeIndex || node.excluded) {
        var operator = node.excluded ? 'NOT' : 'OR';
        queryString += ' ' + operator + ' ';
      }
      queryString += nodeString;
    });

    return queryString;
  };

  function cleanUpDateRangeField(field) {
    if (field.transformer === '=' && moment(field.lowerBound).isValid()) {
      field.lowerBound = moment(field.lowerBound).startOf('day').toDate();
      field.upperBound = moment(field.lowerBound).endOf('day').toDate();
    }

    if (field.transformer === '><') {
      if (moment(field.lowerBound).isValid()) {
        field.lowerBound = moment(field.lowerBound).startOf('day').toDate();
      } else {
        field.lowerBound = '*';
      }

      if (moment(field.upperBound).isValid()) {
        field.upperBound = moment(field.upperBound).endOf('day').toDate();
      } else {
        field.upperBound = '*';
      }
    }

    if (field.transformer === '<') {
      if (moment(field.upperBound).isValid()) {
        field.upperBound = moment(field.upperBound).endOf('day').toDate();
      } else {
        field.upperBound = moment().endOf('day').toDate();
      }
    }

    if (field.transformer === '>') {
      if (moment(field.lowerBound).isValid()) {
        field.lowerBound = moment(field.lowerBound).startOf('day').toDate();
      } else {
        field.lowerBound = moment().startOf('day').toDate();
      }
    }
  }

  function transformField(originalField) {
    var field = _.clone(originalField);

    switch (field.transformer) {
      case '!':
        field.field = '!' + field.field;
        break;
      case '-':
        field.field = '-' + field.field;
        break;
      case '<':
        field.lowerBound = '*';
        break;
      case '>':
        field.upperBound = '*';
        break;
      case '=':
        if (field.fieldType !== 'date-range') {
          field.upperBound = undefined;
          field.lowerBound = undefined;
        }
        break;
    }

    return field;
  }

  /**
   * @description
   * Generate a grouped field information tree from a query tree
   * The query tree should not nest different operators deeper than 2 levels.
   * Modifiers will be ignored.
   *
   * @param   {object}  queryTree   - The queryTree to get information from
   *
   * @return  {object}              - A grouped field information tree
   */
  this.groupQueryTree = function (queryTree) {
    var groupedFieldTree = {
      type: 'root',
      nodes: [],
      operator: queryTree.operator || 'OR'
    };

    // If the query tree of an empty search is used, add a default field and group
    if (!queryTree.left) {
      var group = {
        type: 'field',
        operator: 'OR',
        nodes: [
          {
            field: 'title',
            term: '',
            fieldType: 'tokenized-string',
            transformer: '+'
          }
        ]
      };
      groupedFieldTree.nodes.push(group);
    } else {
      this.groupNode(queryTree, groupedFieldTree);
      this.cleanUpGroupedFieldTree(groupedFieldTree);
    }

    return groupedFieldTree;
  };

  /**
   * @description
   * Clean up a field tree after grouping.
   * Used by groupQueryTree to cleanse a freshly grouped tree.
   *
   * @param {object} groupedFieldTree
   */
  this.cleanUpGroupedFieldTree = function (groupedFieldTree) {
    _.forEach(groupedFieldTree.nodes, function (fieldGroup) {
      // This property is just used to track implicit fields and can be removed when switching groups.
      delete fieldGroup.implicitField;

      // Switch the type of the node to field instead of group if it only contains one field.
      if (fieldGroup.nodes && fieldGroup.nodes.length === 1) {
        fieldGroup.type = 'field';
      }

      // Replace any remaining implicitly declared operators with OR.
      // Assuming the following term grouping syntax was used "field:(term1 term2)".
      if (fieldGroup.operator === implicitToken) {
        fieldGroup.operator = 'OR';
      }

      // add field-query type and map options for term and choice fields
      _.forEach(fieldGroup.nodes, function (field) {

        // Find the field-query field type
        var fieldType = _.find(queryFields, function (fieldType) {
          return fieldType.name === field.field;
        });

        // Set the type and map options depending on field type
        if (fieldType) {
          field.fieldType = fieldType.type;

          // terms should be matched to their domain and used as the field-query field
          // if no matching taxonomy term is found the query-field should be removed
          if (fieldType.type === 'term') {
            var taxonomyTerm = _.find(taxonomyTerms, function (term) {
              return term.label.toUpperCase() === field.term.toUpperCase();
            });

            if (taxonomyTerm) {
              var domainFieldName = 'category_' + taxonomyTerm.domain + '_name';
              field.field = domainFieldName;
              field.term = taxonomyTerm.label;
            } else {
              field.invalid = true;
            }
          }

          // Look up options for choice field-query
          if (fieldType.type === 'choice') {
            var option = _.find(fieldType.options, function (option) {
              return option === field.term.toUpperCase();
            });

            if (option) {
              field.term = option;
            } else {
              field.invalid = true;
            }
          }

          // Make sure boolean field-query values are either true or false
          if (fieldType.type === 'check') {
            if (_.contains(['TRUE', 'FALSE'], field.term.toUpperCase())) {
              field.term = field.term.toUpperCase();
            } else {
              field.invalid = true;
            }
          }

          if (fieldType.type === 'tokenized-string') {
            if (!field.transformer || field.transformer === '=') {
              field.transformer = '+';
            }

            if (field.transformer === '!') {
              field.transformer = '-';
            }
          }

          if (fieldType.type === 'string') {
            if (!field.transformer || field.transformer === '+') {
              field.transformer = '=';
            }

            if (field.transformer === '-') {
              field.transformer = '!';
            }
          }

          // Numbers can be a single or ranged term
          // The editor only handles ranges that have one of the boundaries set to infinity
          if (fieldType.type === 'number') {
            if (field.term) {
              field.transformer = '=';
            } else {
              if (field.upperBound && field.lowerBound === '*') {
                field.transformer = '<';
              } else if (field.lowerBound && field.upperBound === '*') {
                field.transformer = '>';
              } else {
                field.transformer = '=';
                field.term = field.lowerBound || field.upperBound;
                field.lowerBound = undefined;
                field.upperBound = undefined;
              }
            }
          }

          if (fieldType.type === 'date-range') {
            var startDate = moment(field.lowerBound),
              endDate = moment(field.upperBound);

            if (startDate.isValid() && endDate.isValid()) {
              if (startDate.isSame(endDate, 'day')) {
                field.transformer = '=';
              } else {
                field.transformer = '><';
              }
            } else {
              if (!startDate.isValid() && endDate.isValid()) {
                field.transformer = '<';
              }

              if (!endDate.isValid() && startDate.isValid()) {
                field.transformer = '>';
              }
            }
          }
        }

      });
    });
  };

  /**
   * @description
   * Group a node in a query tree branch.
   * You should not need to call this method directly, use groupQueryTree instead.
   *
   * @param {object}  branch        - The branch of a query tree
   * @param {object}  fieldTree     - The field tree that will be returned
   * @param {object}  [fieldGroup]  - Keeps track of the current field group
   */
  this.groupNode = function (branch, fieldTree, fieldGroup) {
    // if the operator is implicit, you're dealing with grouped terms eg: field:(term1 term2)
    if (branch.operator === implicitToken) {
      branch.operator = 'OR';
    }
    if (!fieldGroup || branch.operator && (branch.operator !== fieldGroup.operator)) {
      var newFieldGroup = {
        type: 'group',
        operator: branch.operator || 'OR',
        nodes: []
      };

      fieldTree.nodes.push(newFieldGroup);
      fieldGroup = newFieldGroup;
    }

    // Track the last used field name to apply to implicitly defined terms
    if (branch.field && branch.field !== implicitToken) {
      fieldGroup.implicitField = branch.field;
    }

    if (branch.term || (branch.lowerBound && branch.upperBound)) {
      var field = branch.field;

      // Handle implicit field names by using the last used field name
      if (field === implicitToken) {
        if (fieldGroup.implicitField) {
          field = fieldGroup.implicitField;
        } else {
          throw 'Field name is implicit and not defined elsewhere.';
        }
      }

      fieldGroup.nodes.push(makeField(branch, field));
    }

    if (branch.left) {
      this.groupNode(branch.left, fieldTree, fieldGroup);
      if (branch.right) {
        this.groupNode(branch.right, fieldTree, fieldGroup);
      }
    }
  };

  /**
   * @description
   * Generate a field object that's used to render the query editor fields.
   *
   * @param {object} node The node with all the necessary information
   * @return {object} A field object used to render the query editor
   */
  function makeField(node, fieldName) {
    var fieldType = _.find(queryFields, function (type) {
        return type.name === node.field;
      }),
      field = {
        field: fieldName || node.field,
        fieldType: fieldType || 'string',
        transformer: node.transformer || '='
      };

    if (node.lowerBound || node.upperBound) {
      field.lowerBound = node.lowerBound || undefined;
      field.upperBound = node.upperBound || undefined;
      field.inclusive = node.inclusive || true;
    } else {
      field.term = node.term || undefined;
    }

    return field;
  }
}
})();

// Source: src/search/services/sapi2.query-fields.value.js
(function () {
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
    {name: 'location_label', type: 'tokenized-string', group:'where', editable: true},
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
})();

// Source: src/search/services/sapi2.query-tree-translator.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.search.sapi2QueryTreeTranslator
 * @description
 * # QueryTreeTranslator
 * Service in the udb.search.
 */
angular
  .module('udb.search')
  .service('sapi2QueryTreeTranslator', QueryTreeTranslator);

/* @ngInject */
function QueryTreeTranslator(queryFieldTranslations) {

  var translations = queryFieldTranslations;

  /**
   * @param {string} field    - The field to translate.
   * @param {string} srcLang  - To source language to translate from.
   */
  var translateField = function (field, srcLang) {
    var translation = field,
      identifier = _.findKey(translations[srcLang], function (src) {
        return src === field;
      });

    if (identifier) {
      translation = identifier.toLowerCase();
    }

    return translation;
  };

  var translateNode = function (node, depth) {
    var left = node.left || false,
      right = node.right || false,
      nodes = [];

    if (left) {
      nodes.push(left);
    }
    if (right) {
      nodes.push(right);
    }

    for (var i = 0, len = nodes.length; i < len; i++) {
      var iNode = nodes[i];
      if (typeof iNode === 'object') {
        translateNode(iNode, depth + 1);
      }
    }

    if (node.field) {
      node.field = translateField(node.field, 'en');
      node.field = translateField(node.field, 'nl');
    }

  };

  this.translateQueryTree = function (queryTree) {
    return translateNode(queryTree, 0);
  };
}
QueryTreeTranslator.$inject = ["queryFieldTranslations"];
})();

// Source: src/search/services/sapi2.query-tree-validator.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.search.sapi2QueryTreeValidator
 * @description
 * # sapi2QueryTreeValidator
 * Service in the udb.search.
 */
angular.module('udb.search')
  .service('sapi2QueryTreeValidator', QueryTreeValidator);

QueryTreeValidator.$inject = ['sapi2QueryFields'];
function QueryTreeValidator(queryFields) {

  var validFieldNames = _.union(_.map(queryFields, 'name'), ['_exists_']),
    implicitToken = '<implicit>',
    validParentFieldNames = _(validFieldNames)
      .filter(function (fieldName) {
        return fieldName.indexOf('.') > 0;
      })
      .map(function (fieldName) {
        return fieldName.split('.')[0];
      })
      .value();

  var validateFields = function (current, depth, errors) {
    var left = current.left || false,
      right = current.right || false,
      nodes = [];

    if (left) {
      nodes.push(left);
    }
    if (right) {
      nodes.push(right);
    }

    for (var i = 0, len = nodes.length; i < len; i++) {
      var node = nodes[i];
      if (typeof node === 'object') {
        validateFields(node, depth + 1, errors);
      }
    }

    var field = current.field;
    if (typeof(field) !== 'undefined') {

      var fieldName = _.trim(field, '.\\*');
      var fieldHasWildcard = field !== fieldName;

      if (fieldName !== null && fieldName !== implicitToken) {

        if (fieldHasWildcard) {
          if (!_.contains(validParentFieldNames, fieldName)) {
            errors.push(fieldName + ' is not a valid parent search field that can be used with a wildcard');
          }
        } else {
          if (!_.contains(validFieldNames, fieldName)) {
            errors.push(fieldName + ' is not a valid search field');
          }
        }
      }
    }
  };

  this.validate = function (queryTree, errors) {
    validateFields(queryTree, 0, errors);
  };

}
})();

// Source: src/search/services/search-api-switcher.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.search.searchApiSwitcher
 * @description
 * # searchApiSwitcher
 * This service provides context to switch between SAPI2 and SAPI3
 */
angular
  .module('udb.search')
  .service('searchApiSwitcher', SearchApiSwitcher);

/* @ngInject */
function SearchApiSwitcher(appConfig, udbApi, $cookies, sapi2QueryBuilder, LuceneQueryBuilder) {
  var switcher = this;
  var apiVersionCookieKey = 'search-api-version';
  var defaultApiVersion = _.get(appConfig, 'search.defaultApiVersion', '2');
  switcher.getApiVersion = getApiVersion;

  /**
   * @returns {Number}
   */
  function getApiVersion() {
    return parseInt($cookies.get(apiVersionCookieKey) || defaultApiVersion);
  }

  /**
   * @param {string} queryString
   * @param {number} start
   * @returns {Promise.<PagedCollection>}
   */
  switcher.findOffers = function (queryString, start) {
    start = start || 0;
    return (getApiVersion() > 2) ? udbApi.findOffers(queryString, start) : udbApi.findEvents(queryString, start);
  };

  /**
   * @param {EventFormData} formData
   * @returns {object}
   */
  switcher.getDuplicateSearchConditions = function (formData) {
    var location = formData.getLocation();

    if (getApiVersion() > 2) {
      if (formData.isEvent) {
        /*jshint camelcase: false*/
        /*jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
        return {
          'name.\\*': formData.name.nl,
          'location.name.\\*' : location.name
        };
      }
      else {
        /*jshint camelcase: false */
        return {
          'name.\\*': formData.name.nl,
          'postalCode': formData.address.postalCode,
          'labels': 'UDB3 place'
        };
      }
    } else {
      if (formData.isEvent) {
        /*jshint camelcase: false*/
        /*jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
        return {
          text: formData.name.nl,
          location_label : location.name
        };
      }
      else {
        /*jshint camelcase: false */
        return {
          text: formData.name.nl,
          zipcode: formData.address.postalCode,
          keywords: 'UDB3 place'
        };
      }
    }
  };

  /**
   * @returns {object}
   *  An angular directive definition object.
   */
  switcher.getQueryEditorFieldDefinition = function() {
    if (getApiVersion() > 2) {
      return {
        templateUrl: 'templates/query-editor-field.directive.html',
        restrict: 'E',
        controller: 'QueryEditorFieldController'
      };
    } else {
      return {
        templateUrl: 'templates/sapi2.query-editor-field.directive.html',
        restrict: 'E',
        controller: 'QueryEditorFieldController'
      };
    }
  };

  /**
   * @returns {string}
   *  A query editor controller name.
   */
  switcher.getQueryEditorController = function() {
    if (getApiVersion() > 2) {
      return 'QueryEditorController';
    } else {
      return 'sapi2QueryEditorController';
    }
  };

  /**
   * @returns {object}
   *  A query builder instance.
   */
  switcher.getQueryBuilder = function () {
    if (getApiVersion() > 2) {
      return LuceneQueryBuilder;
    } else {
      return sapi2QueryBuilder;
    }
  };
}
SearchApiSwitcher.$inject = ["appConfig", "udbApi", "$cookies", "sapi2QueryBuilder", "LuceneQueryBuilder"];
})();

// Source: src/search/services/search-helper.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.search.searchHelper
 * @description
 * # searchHelper
 * Service in the udb.search.
 */
angular
  .module('udb.search')
  .service('searchHelper', SearchHelper);

/* @ngInject */
function SearchHelper(searchApiSwitcher, $rootScope) {
  var query = null;
  var queryTree = null;
  var queryBuilder = searchApiSwitcher.getQueryBuilder();

  this.clearQueryTree = function () {
    queryTree = null;
  };

  /**
   *
   * @param {string} queryString
   * @param {boolean} forceUpdate
   *  Set to true to emit a "searchQueryChanged" even if the query has not changed.
   *  A possible use-case is navigating back to the search page and reloading the same query.
   */
  this.setQueryString = function (queryString, forceUpdate) {
    var newQuery = false;

    if (!query || query.queryString !== queryString) {
      newQuery = queryBuilder.createQuery(queryString);
      queryBuilder.isValid(newQuery);
      this.setQuery(newQuery);
      queryTree = null;
    }

    if (query && !newQuery && forceUpdate) {
      this.setQuery(query);
    }
  };

  this.setQueryTree = function (groupedQueryTree) {
    var queryString = queryBuilder.unparseGroupedTree(groupedQueryTree);
    var newQuery = queryBuilder.createQuery(queryString);
    queryBuilder.isValid(newQuery);
    this.setQuery(newQuery);

    queryTree = groupedQueryTree;
  };

  this.setQuery = function (searchQuery) {
    query = searchQuery;
    $rootScope.$emit('searchQueryChanged', searchQuery);
  };

  this.getQuery = function () {
    return query;
  };

  this.getQueryTree = function () {
    return angular.copy(queryTree);
  };
}
SearchHelper.$inject = ["searchApiSwitcher", "$rootScope"];
})();

// Source: src/search/services/search-result-viewer.factory.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.search.SearchResultViewer
 * @description
 * # SearchResultViewer
 * Search result viewer factory
 */
angular
  .module('udb.search')
  .factory('SearchResultViewer', SearchResultViewerFactory);

function SearchResultViewerFactory() {

  var SelectionState = {
    ALL: {'name': 'all', 'icon': 'fa-check-square'},
    NONE: {'name': 'none', 'icon': 'fa-square-o'},
    SOME: {'name': 'some', 'icon': 'fa-minus-square'}
  };

  var identifyItem = function (event) {
    return event['@id'].split('/').pop();
  };

  /**
   * @class SearchResultViewer
   * @constructor
   * @param    {number}     pageSize        The number of items shown per page
   * @param    {number}     activePage
   *
   * @property {object[]}   events          A list of json-LD event objects
   * @property {number}     pageSize        The current page size
   * @property {number}     totalItems      The total items found
   * @property {number}     currentPage     The index of the current page without zeroing
   * @property {boolean}    loading         A flag to indicate the period between changing of the query and
   *                                        receiving of the results.
   * @property {object}     eventProperties A list of event properties that can be shown complementary
   * @property {array}      eventSpecifics  A list of specific event info that can be shown exclusively
   * @property {SelectionState} selectionState Enum that keeps the state of selected results
   */
  var SearchResultViewer = function (pageSize, activePage) {
    this.pageSize = pageSize || 30;
    this.events = [];
    this.totalItems = 0;
    this.currentPage = activePage || 1;
    this.loading = true;
    this.lastQuery = null;
    this.eventProperties = {
      description: {name: 'Beschrijving', visible: false},
      labels: {name: 'Labels', visible: false},
      image: {name: 'Afbeelding', visible: false}
    };
    this.eventSpecifics = [
      {id: 'input', name: 'Invoer-informatie'}
    ];
    this.activeSpecific = this.eventSpecifics[0];
    this.selectedOffers = [];
    this.selectionState = SelectionState.NONE;
    this.querySelected = false;
  };

  SearchResultViewer.prototype = {
    enableSpecifics: function (specifics) {
      this.eventSpecifics = _.uniq(_.union(this.eventSpecifics, specifics), 'id');
    },
    toggleSelection: function () {
      var state = this.selectionState;

      if (state === SelectionState.SOME || state === SelectionState.ALL) {
        this.deselectPageItems();
        if (this.querySelected) {
          this.deselectAll();
          this.querySelected = false;
        }
      } else {
        this.selectPageItems();
      }
    },
    selectQuery: function () {
      this.querySelected = true;
      this.selectPageItems();
    },
    updateSelectionState: function () {
      var selectedOffers = this.selectedOffers,
          selectedPageItems = _.filter(this.events, function (event) {
            return _.contains(selectedOffers, event);
          });

      if (selectedPageItems.length === this.pageSize) {
        this.selectionState = SelectionState.ALL;
      } else if (selectedPageItems.length > 0) {
        this.selectionState = SelectionState.SOME;
      } else {
        this.selectionState = SelectionState.NONE;
      }
    },
    toggleSelect: function (offer) {

      // Prevent toggling individual items when the whole query is selected
      if (this.querySelected) {
        return;
      }

      // select the offer from the result viewer events
      // it's this "event" that will get stored
      var theOffer = _.filter(this.events, function (event) {
            return offer['@id'] === event['@id'];
          }).pop();

      var selectedOffers = this.selectedOffers,
          isSelected = _.contains(selectedOffers, theOffer);

      if (isSelected) {
        _.remove(selectedOffers, function (selectedOffer) {
          return selectedOffer['@id'] === theOffer['@id'];
        });
      } else {
        selectedOffers.push(theOffer);
      }

      this.updateSelectionState();
    },
    deselectAll: function () {
      this.selectedOffers = [];
      this.selectionState = SelectionState.NONE;
    },
    deselectPageItems: function () {
      var selectedOffers = this.selectedOffers;
      _.forEach(this.events, function (event) {
        _.remove(selectedOffers, function (offer) {
          return offer['@id'] === event['@id'];
        });
      });

      this.selectionState = SelectionState.NONE;
    },
    selectPageItems: function () {
      var events = this.events,
          selectedOffers = this.selectedOffers;

      _.each(events, function (event) {
        selectedOffers.push(event);
      });

      this.selectedOffers = _.uniq(selectedOffers);
      this.selectionState = SelectionState.ALL;
    },
    isOfferSelected: function (offer) {
      // get the right offer object from the events list
      var theOffer = _.filter(this.events, function (event) {
            return offer['@id'] === event['@id'];
          }).pop();

      return _.contains(this.selectedOffers, theOffer);
    },
    /**
     * @param {PagedCollection} pagedResults
     */
    setResults: function (pagedResults) {
      var viewer = this;

      viewer.pageSize = pagedResults.itemsPerPage || 30;
      viewer.events = pagedResults.member || [];
      viewer.totalItems = pagedResults.totalItems || 0;

      viewer.loading = false;
      if (this.querySelected) {
        this.selectPageItems();
      }
      this.updateSelectionState();
    },
    queryChanged: function (query) {
      this.loading = true;
      this.selectedOffers = [];
      this.querySelected = false;

      // prevent the initial search from resetting the active page
      if (this.lastQuery && this.lastQuery !== query) {
        this.currentPage = 1;
      }

      this.lastQuery = query;
    },
    activateSpecific: function (specific) {
      this.activeSpecific = specific;
    },
    /**
     * Checks if at least one of the event properties is visible
     * @return {boolean}
     */
    isShowingProperties: function () {
      var property = _.find(this.eventProperties, function (property) {
        return property.visible;
      });

      return !!property;
    }
  };

  return (SearchResultViewer);
}
})();

// Source: src/search/services/variation-repository.service.js
(function () {
'use strict';

/**
 * @ngdoc service
 * @name udb.search.variationRepository
 * @description
 * # variationRepository
 * Service in the udb.search.
 */
angular
  .module('udb.search')
  .service('variationRepository', VariationRepository);

/* @ngInject */
function VariationRepository(udbApi, $cacheFactory, $q, UdbEvent, $rootScope, UdbPlace) {

  var requestChain = $q.when();
  var interruptRequestChain = false;
  var personalVariationCache = $cacheFactory('personalVariationCache');

  this.getPersonalVariation = function (offer) {
    var deferredVariation =  $q.defer(),
        personalVariation = personalVariationCache.get(offer['@id']);

    if (personalVariation) {
      if (personalVariation === 'no-personal-variation') {
        deferredVariation.reject('there is no personal variation for offer with url: ' + offer['@id']);
      } else {
        deferredVariation.resolve(personalVariation);
      }
    } else {
      var userPromise = udbApi.getMe();

      userPromise
        .then(function(user) {
          requestChain = requestChain.then(
            requestVariation(user.id, 'personal', offer['@id'], deferredVariation)
          );
        });
    }

    return deferredVariation.promise;
  };

  function requestVariation(userId, purpose, offerUrl, deferredVariation) {
    return function () {
      var offerLocation = offerUrl.toString();

      if (interruptRequestChain) {
        deferredVariation.reject('interrupting request for offer variation located at: ' + offerLocation);
        return deferredVariation;
      }

      var personalVariationRequest = udbApi.getOfferVariations(userId, purpose, offerUrl, deferredVariation);

      personalVariationRequest.success(function (variations) {
        var jsonPersonalVariation = _.first(variations.member);
        if (jsonPersonalVariation) {
          var variation;
          if (jsonPersonalVariation['@context'] === '/api/1.0/event.jsonld') {
            variation = new UdbEvent(jsonPersonalVariation);
          } else if (jsonPersonalVariation['@context'] === '/api/1.0/place.jsonld') {
            variation = new UdbPlace(jsonPersonalVariation);
          }
          personalVariationCache.put(offerLocation, variation);
          deferredVariation.resolve(variation);
        } else {
          personalVariationCache.put(offerLocation, 'no-personal-variation');
          deferredVariation.reject('there is no personal variation for the offer located at: ' + offerLocation);
        }
      });

      personalVariationRequest.error(function () {
        deferredVariation.reject('no variations found for offer located at: ' + offerLocation);
      });

      return personalVariationRequest.then();
    };
  }

  /**
   * @param {string} offerLocation
   * @param {(UdbPlace|UdbEvent)} variation
   */
  this.save = function (offerLocation, variation) {
    personalVariationCache.put(offerLocation, variation);
  };

  /**
   * @param {string} offerLocation
   */
  this.remove = function (offerLocation) {
    personalVariationCache.remove(offerLocation);
  };

  $rootScope.$on('$locationChangeStart', function() {
    interruptRequestChain = true;
    requestChain = requestChain.finally(function () {
      interruptRequestChain = false;
    });
  });
}
VariationRepository.$inject = ["udbApi", "$cacheFactory", "$q", "UdbEvent", "$rootScope", "UdbPlace"];
})();

// Source: src/search/ui/event-translation-state.constant.js
(function () {
'use strict';

/* jshint sub: true */

/**
 * @ngdoc constant
 * @name udb.search.EventTranslationState
 * @description
 * # EventTranslationState
 * Event translation state
 */
angular
  .module('udb.search')
  .constant(
  'EventTranslationState',
  /**
   * Enum for event translation states
   * @readonly
   * @enum {string}
   */
  {
    ALL: {'name': 'all', 'icon': 'fa-circle'},
    NONE: {'name': 'none', 'icon': 'fa-circle-o'},
    SOME: {'name': 'some', 'icon': 'fa-dot-circle-o'}
  }
);
})();

// Source: src/search/ui/event.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:udbEvent
 * @description
 * # udbEvent
 */
angular
  .module('udb.search')
  .directive('udbEvent', udbEvent);

/* @ngInject */
function udbEvent() {
  var eventDirective = {
    restrict: 'AE',
    controller: 'OfferController',
    controllerAs: 'eventCtrl',
    templateUrl: 'templates/event.directive.html'
  };

  return eventDirective;
}
})();

// Source: src/search/ui/offer.controller.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.search.controller:OfferController
 * @description
 * # OfferController
 */
angular
  .module('udb.search')
  .controller('OfferController', OfferController);

/* @ngInject */
function OfferController(
  udbApi,
  $scope,
  jsonLDLangFilter,
  EventTranslationState,
  offerTranslator,
  offerLabeller,
  $window,
  offerEditor,
  variationRepository,
  $q,
  appConfig,
  $uibModal,
  $translate,
  authorizationService
) {
  var controller = this;
  var cachedOffer;
  var defaultLanguage = $translate.use() || 'nl';

  controller.translation = false;
  controller.activeLanguage = defaultLanguage;
  controller.languageSelector = [
    {'lang': 'fr'},
    {'lang': 'en'},
    {'lang': 'de'}
  ];
  controller.uitId = _.get(appConfig, 'uitidUrl');
  controller.labelRemoved = labelRemoved;
  authorizationService.isGodUser()
    .then(function (permission) {
      controller.isGodUser = permission;
    });
  controller.init = function () {
    if (!$scope.event.title) {
      controller.fetching = true;

      return udbApi
        .getOffer($scope.event['@id'])
        .then(function (offerObject) {
          var sortedFacilities = offerObject.facilities.sort(
            function(a, b) {
              return a.label.localeCompare(b.label);
            });
          offerObject.facilities = sortedFacilities;

          cachedOffer = offerObject;
          cachedOffer.updateTranslationState();

          $scope.event = jsonLDLangFilter(cachedOffer, defaultLanguage, true);
          $scope.offerType = $scope.event.url.split('/').shift();
          $scope.translatedOfferType = $translate.instant('offerTypes.' + $scope.event.type.label);
          controller.offerExpired = $scope.offerType === 'event' ? offerObject.isExpired() : false;
          controller.hasFutureAvailableFrom = offerObject.hasFutureAvailableFrom();
          controller.fetching = false;
          watchLabels();
          return cachedOffer;
        });
    } else {
      controller.fetching = false;
    }
  };

  // initialize controller and take optional event actions
  $q.when(controller.init())
    // translate location before fetching the maybe non-existant variation
    // a variation does not change the location
    .then(translateLocation)
    .then(fetchPersonalVariation)
    .then(ifOfferIsEvent)
    .finally(function () {
      controller.editable = true;
    });

  function ifOfferIsEvent(offer) {
    if (offer && $scope.event.url.split('/').shift() === 'event') {
      return $q.resolve(offer);
    } else {
      return $q.reject();
    }
  }

  function watchLabels() {
    $scope.$watch(function () {
      return cachedOffer.labels;
    }, function (labels) {
      $scope.event.labels = angular.copy(labels);
    });
  }

  controller.hasActiveTranslation = function () {
    var offer = cachedOffer;
    return offer && offer.translationState[controller.activeLanguage] !== EventTranslationState.NONE;
  };

  controller.getLanguageTranslationIcon = function (lang) {
    var icon = EventTranslationState.NONE.icon;

    if (cachedOffer && lang) {
      icon = cachedOffer.translationState[lang].icon;
    }

    return icon;
  };

  controller.translate = function () {
    controller.applyPropertyChanges('name');
    controller.applyPropertyChanges('description');
  };

  /**
   * Sets the provided language as active or toggles it off when already active
   *
   * @param {String} lang
   */
  controller.toggleLanguage = function (lang) {
    if (lang === controller.activeLanguage) {
      controller.stopTranslating();
    } else {
      controller.activeLanguage = lang;
      controller.translation = jsonLDLangFilter(cachedOffer, controller.activeLanguage);
    }
  };

  controller.hasPropertyChanged = function (propertyName) {
    var lang = controller.activeLanguage,
        translation = controller.translation;

    return controller.translation && cachedOffer[propertyName][lang] !== translation[propertyName];
  };

  controller.undoPropertyChanges = function (propertyName) {
    var lang = controller.activeLanguage,
        translation = controller.translation;

    if (translation) {
      translation[propertyName] = cachedOffer[propertyName][lang];
    }
  };

  controller.applyPropertyChanges = function (propertyName) {
    var translation = controller.translation[propertyName];
    translateEventProperty(propertyName, translation, propertyName);
  };

  controller.stopTranslating = function () {
    controller.translation = undefined;
    controller.activeLanguage = defaultLanguage;
  };

  function translateEventProperty(property, translation, apiProperty) {
    var language = controller.activeLanguage,
        udbProperty = apiProperty || property;

    if (translation && translation !== cachedOffer[property][language]) {
      offerTranslator
        .translateProperty(cachedOffer, udbProperty, language, translation)
        .then(cachedOffer.updateTranslationState(cachedOffer));
    }
  }

  // Labelling
  /**
   * @param {Label} newLabel
   */
  controller.labelAdded = function (newLabel) {
    var similarLabel = _.find(cachedOffer.labels, function (label) {
      return newLabel.name.toUpperCase() === label.toUpperCase();
    });
    if (similarLabel) {
      $scope.$apply(function () {
        $scope.event.labels = angular.copy(cachedOffer.labels);
      });
      $window.alert('Het label "' + newLabel.name + '" is reeds toegevoegd als "' + similarLabel + '".');
    } else {
      offerLabeller.label(cachedOffer, newLabel.name)
        .then(function(response) {
          if (response.success) {
            controller.labelResponse = 'success';
            controller.addedLabel = response.name;
          }
          else {
            controller.labelResponse = 'error';
            controller.labelsError = response;
          }
          $scope.event.labels = angular.copy(cachedOffer.labels);
        });
    }
  };

  function clearLabelsError() {
    controller.labelResponse = '';
    controller.labelsError = '';
  }

  /**
   * @param {ApiProblem} problem
   */
  function showUnlabelProblem(problem) {
    $scope.event.labels = angular.copy(cachedOffer.labels);
    controller.labelResponse = 'unlabelError';
    controller.labelsError = problem.title;
  }

  /**
   * @param {Label} label
   */
  function labelRemoved(label) {
    clearLabelsError();

    offerLabeller
      .unlabel(cachedOffer, label.name)
      .catch(showUnlabelProblem);
  }

  /**
   * @param {(UdbPlace|UdbEvent)}offer
   * @return {Promise}
   */
  function fetchPersonalVariation(offer) {
    var disableVariations = _.get(appConfig, 'disableVariations');
    if (!disableVariations) {
      return variationRepository
        .getPersonalVariation(offer)
        .then(function (personalVariation) {
          $scope.event.description = personalVariation.description[defaultLanguage];
          return personalVariation;
        }, function () {
          return $q.reject();
        });
    } else {
      return $q.reject();
    }
  }

  /**
   * @param {UdbEvent} event
   * @return {Promise}
   */
  function translateLocation(event) {
    if ($scope.event.location) {
      $scope.event.location = jsonLDLangFilter($scope.event.location, defaultLanguage);
    }
    return $q.resolve(event);
  }

  // Editing
  controller.updateDescription = function (description) {
    if ($scope.event.description !== description) {
      var updatePromise = offerEditor.editDescription(cachedOffer, description);

      updatePromise.finally(function () {
        if (!description) {
          $scope.event.description = cachedOffer.description[defaultLanguage];
        }
      });

      return updatePromise;
    }
  };
}
OfferController.$inject = ["udbApi", "$scope", "jsonLDLangFilter", "EventTranslationState", "offerTranslator", "offerLabeller", "$window", "offerEditor", "variationRepository", "$q", "appConfig", "$uibModal", "$translate", "authorizationService"];
})();

// Source: src/search/ui/place.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:udbPlace
 * @description
 * # udbPlace
 */
angular
  .module('udb.search')
  .directive('udbPlace', udbPlace);

/* @ngInject */
function udbPlace() {
  var placeDirective = {
    restrict: 'AE',
    controller: 'OfferController',
    controllerAs: 'placeCtrl',
    templateUrl: 'templates/place.directive.html'
  };

  return placeDirective;
}
})();

// Source: src/search/ui/search-facilities-modal.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:SearchFacilitiesModalController
 * @description
 * # SearchFacilitiesModalController
 * Modal for selecting facilities.
 */
angular
  .module('udb.event-form')
  .controller('SearchFacilitiesModalController', SearchFacilitiesModalController);

/* @ngInject */
function SearchFacilitiesModalController($scope, $uibModalInstance, offer, eventCrud, facilities) {
  $scope.saving = false;
  $scope.error = false;
  $scope.cancel = cancel;
  $scope.saveFacilities = saveFacilities;
  $scope.facilities = preselectFacilities(facilities);

  function preselectFacilities(facilities) {
    return _.mapValues(facilities, function (facilityType) {
      return _.map(facilityType, function (facility) {
        return _.assign(facility, {
          selected: !!_.find(offer.facilities, {id: facility.id})
        });
      });
    });
  }

  function cancel() {
    $uibModalInstance.dismiss('cancel');
  }

  function saveFacilities() {
    showSaving();

    var newFacilites = _.where(
      _.flatten(_.map($scope.facilities)),
      {selected: true}
    );

    function persistAndClose() {
      offer.facilities = newFacilites;
      closeModal();
    }

    eventCrud
      .updateFacilities(offer, newFacilites)
      .then(persistAndClose, showError);
  }

  function closeModal() {
    $scope.saving = false;
    $uibModalInstance.close();
  }

  function showError() {
    $scope.error = true;
    $scope.saving = false;
  }

  function showSaving() {
    $scope.saving = true;
    $scope.error = false;
  }
}
SearchFacilitiesModalController.$inject = ["$scope", "$uibModalInstance", "offer", "eventCrud", "facilities"];
})();

// Source: src/search/ui/search.controller.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udb.search.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Search controller
 */
angular
  .module('udb.search')
  .controller('SearchController', SearchController);

/* @ngInject */
function SearchController(
  $scope,
  udbApi,
  $window,
  $location,
  $uibModal,
  SearchResultViewer,
  offerLabeller,
  offerLocator,
  searchHelper,
  $rootScope,
  eventExporter,
  $translate,
  searchApiSwitcher,
  authorization,
  authorizationService
) {
  var queryBuilder = searchApiSwitcher.getQueryBuilder();

  function getSearchQuery() {
    return searchHelper.getQuery();
  }

  function getCurrentPage() {
    var currentPage = 1;
    var searchParams = $location.search();

    if (searchParams.page) {
      currentPage = parseInt(searchParams.page);
    }

    return currentPage;
  }

  $scope.resultViewer = new SearchResultViewer(30, getCurrentPage());
  $scope.realQuery = false;
  $scope.activeQuery = false;
  $scope.queryEditorShown = false;
  $scope.currentPage = getCurrentPage();

  var additionalSpecifics = [
    {id: 'accessibility', name: 'Toegankelijkheidsinformatie', permission: authorization.editFacilities}
  ];
  authorizationService
    .getPermissions()
    .then(function (userPermissions) {
      var specifics = _.filter(
        additionalSpecifics,
        function (specific) {
          return !_.has(specific, 'permission') || _.contains(userPermissions, specific.permission);
        }
      );

      $scope.resultViewer.enableSpecifics(specifics);
    })
  ;

  /**
   * Fires off a search for offers using a plain query string or a query object.
   * @param {String|Query} query A query string or object to search with.
   */
  var findOffers = function (query) {
    var offset = ($scope.resultViewer.currentPage - 1) * $scope.resultViewer.pageSize;
    var queryString = typeof query === 'string' ? query : query.queryString;
    var pageSearchParameter = $scope.resultViewer.currentPage > 1 ? String($scope.resultViewer.currentPage) : null;

    $location.search({
      'query': getSearchQuery().queryString || null,
      'page': pageSearchParameter
    });

    $scope.resultViewer.loading = true;

    searchApiSwitcher
      .findOffers(queryString, offset)
      .then(function (pagedEvents) {
        offerLocator.addPagedCollection(pagedEvents);
        $scope.resultViewer.setResults(pagedEvents);
      });
  };

  /**
   * @param {Query} query A query object used to update the interface and result viewer.
   */
  var updateQuery = function (query) {
    $scope.activeQuery = query;

    if (queryBuilder.isValid(query)) {
      var realQuery = queryBuilder.unparse(query);
      $scope.resultViewer.queryChanged(realQuery);
      findOffers(realQuery);

      if (realQuery !== query.originalQueryString) {
        $scope.realQuery = realQuery;
      } else {
        $scope.realQuery = false;
      }
    }
  };

  var labelSelection = function () {

    var selectedOffers = $scope.resultViewer.selectedOffers;

    if (!selectedOffers.length) {
      $window.alert('First select the events you want to label.');
      return;
    }

    var modal = $uibModal.open({
      templateUrl: 'templates/offer-label-modal.html',
      controller: 'OfferLabelModalCtrl',
      controllerAs: 'lmc'
    });

    modal.result.then(function (labels) {

      _.each(selectedOffers, function (offer) {
        var eventPromise;

        eventPromise = udbApi.getOffer(new URL(offer['@id']));

        eventPromise.then(function (event) {
          event.label(labels);
        });
      });

      _.each(labels, function (label) {
        offerLabeller.labelOffersById(selectedOffers, label);
      });
    });
  };

  function labelActiveQuery() {
    var query = $scope.activeQuery,
      eventCount = $scope.resultViewer.totalItems;

    if (queryBuilder.isValid(query)) {
      var modal = $uibModal.open({
        templateUrl: 'templates/offer-label-modal.html',
        controller: 'OfferLabelModalCtrl',
        controllerAs: 'lmc'
      });

      modal.result.then(function (labels) {
        // eagerly label all cached events on the first page
        var selectedIds = $scope.resultViewer.selectedIds;
        _.each(selectedIds, function (eventId) {
          var eventPromise = udbApi.getEventById(eventId);

          eventPromise.then(function (event) {
            event.label(labels);
          });
        });

        _.each(labels, function (label) {
          offerLabeller.labelQuery(query.queryString, label, eventCount);
        });
      });
    } else {
      $window.alert('provide a valid query to label');
    }
  }

  var label = function () {
    var labellingQuery = $scope.resultViewer.querySelected;

    if (labellingQuery) {
      labelActiveQuery();
    } else {
      labelSelection();
    }
  };

  function exportEvents() {
    var exportingQuery = $scope.resultViewer.querySelected,
        query = $scope.activeQuery,
        eventCount,
        selectedIds = [];

    if (exportingQuery) {
      eventCount = $scope.resultViewer.totalItems;
    } else {
      selectedIds = _.chain($scope.resultViewer.selectedOffers)
        .filter({'@type': 'Event'})
        .map(function(offer) {
          return new URL(offer['@id']);
        })
        .value();

      if (!selectedIds.length) {
        $window.alert(
            $translate.instant('search.modal')
        );
        return;
      } else {
        eventCount = selectedIds.length;
      }
    }

    eventExporter.activeExport.query = query;
    eventExporter.activeExport.eventCount = eventCount;
    eventExporter.activeExport.selection = selectedIds;

    var exportLimit = 5000;

    var tooManyItems = eventCount >= exportLimit;

    if (tooManyItems) {
      $translate('EVENT-EXPORT.TOO-MANY-ITEMS', {limit: exportLimit}).then(function(message) {
        $window.alert(message);
      });
    }
    else {
      if (query && query.queryString.length && queryBuilder.isValid(query)) {
        var modal = $uibModal.open({
          templateUrl: 'templates/event-export-modal.html',
          controller: 'EventExportController',
          controllerAs: 'exporter',
          size: 'lg'
        });
      } else {
        $translate('EVENT-EXPORT.QUERY-IS-MISSING').then(function(message) {
          $window.alert(message);
        });
      }
    }
  }

  $scope.exportEvents = exportEvents;
  $scope.label = label;

  $scope.startEditing = function () {
    $scope.queryEditorShown = true;
  };

  $scope.stopEditing = function () {
    $scope.queryEditorShown = false;
  };

  function queryChanged(event, newQuery) {
    updateQuery(newQuery);
  }

  // Because the uib pagination directive is messed up and overrides the initial page to 1,
  // you have to silence and revert it.
  var initialChangeSilenced = $scope.currentPage === 1;
  $scope.pageChanged = function () {
    var newPageNumber = $scope.currentPage;

    if (!initialChangeSilenced) {
      $scope.currentPage = $scope.resultViewer.currentPage;
      initialChangeSilenced = true;
    } else {
      $scope.resultViewer.currentPage = newPageNumber;

      findOffers($scope.activeQuery);
      $window.scroll(0, 0);
    }
  };

  /**
   * Get the query string from the URI params
   *
   * @return {null|string}
   */
  function getQueryStringFromParams() {
    var queryString = null;
    var searchParams = $location.search();

    if (searchParams.query) {
      queryString = searchParams.query;
    }

    return queryString;
  }

  var initListeners = _.once(function () {
    var searchQueryChangedListener = $rootScope.$on('searchQueryChanged', queryChanged);
    var startEditingQueryListener = $rootScope.$on('startEditingQuery', $scope.startEditing);
    var stopEditingQueryListener = $rootScope.$on('stopEditingQuery', $scope.stopEditing);

    $scope.$on('$destroy', startEditingQueryListener);
    $scope.$on('$destroy', searchQueryChangedListener);
    $scope.$on('$destroy', stopEditingQueryListener);
  });

  initListeners();
}
SearchController.$inject = ["$scope", "udbApi", "$window", "$location", "$uibModal", "SearchResultViewer", "offerLabeller", "offerLocator", "searchHelper", "$rootScope", "eventExporter", "$translate", "searchApiSwitcher", "authorization", "authorizationService"];
})();

// Source: src/search/ui/search.directive.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.search.directive:udbEvent
 * @description
 * # udb search directive
 */
angular
  .module('udb.search')
  .directive('udbSearch', searchDirective);

/* @ngInject */
function searchDirective() {
  return {
    templateUrl: 'templates/search.html',
    restrict: 'EA',
    controller: 'SearchController'
  };
}
})();

// Source: src/uitpas/components/card-systems/card-system-selector.component.js
(function () {
'use strict';

/**
 * @typedef {Object} Cardsystem
 * @property {string} id
 *  a number serialized as a string
 * @property {string} name
 * @property {DistributionKey[]} distributionKeys
 * @property {DistributionKey|undefined} [assignedDistributionKey]
 */

/**
 * @ngdoc function
 * @name udbApp.controller:CardSystemSelector
 * @description
 * # CardSystemSelector
 * Component for setting UiTPAS info.
 */
angular
  .module('udb.uitpas')
  .component('cardSystemSelector', {
    templateUrl: 'templates/card-systems.html',
    controller: CardSystemsController,
    controllerAs: 'cardSystemSelector',
    bindings: {
      organisation: '<',
      offerData: '<'
    }
  });

/* @ngInject */
function CardSystemsController($q, udbUitpasApi, $rootScope) {
  var controller = this;
  var organisation = controller.organisation;
  var offerData = controller.offerData;
  controller.$onInit = init;
  controller.refresh = refresh;

  function init() {
    $q
      .all([
        udbUitpasApi.getEventCardSystems(offerData.id),
        udbUitpasApi.findOrganisationsCardSystems(organisation.id)
      ])
      .then(showCardSystems, showUitpasUnavailableNotice);
  }

  function showUitpasUnavailableNotice() {
    controller.uitpasUnavailable = true;
  }

  function hideUitpasUnavailableNotice() {
    controller.uitpasUnavailable = undefined;
  }

  function refresh() {
    controller.availableCardSystems = undefined;
    hideUitpasUnavailableNotice();
    unlockCardSystems();
    init();
  }

  function showCardSystems(cardSystemCollections) {
    var eventCardSystems = cardSystemCollections[0],
        organisationCardSystems = cardSystemCollections[1];

    controller.availableCardSystems = _.map(organisationCardSystems, function (cardSystem) {
      return _.assign(cardSystem, {
        assignedDistributionKey: findAssignedDistributionKey(eventCardSystems, cardSystem),
        active: !!_.find(eventCardSystems, {id: cardSystem.id})
      });
    });
  }

  /**
   * @param {CardSystem[]} cardSystemCollection
   * @param {CardSystem} cardSystem
   *
   * @return {(DistributionKey|null)}
   */
  function findAssignedDistributionKey(cardSystemCollection, cardSystem) {
    var matchingCardSystem = _.find(cardSystemCollection, {id: cardSystem.id});

    return _.first(
      (!matchingCardSystem || _.isEmpty(matchingCardSystem.distributionKeys)) ?
        cardSystem.distributionKeys :
        matchingCardSystem.distributionKeys
    );
  }

  /**
   * @param {CardSystem} cardSystem
   */
  controller.distributionKeyAssigned = function(cardSystem) {
    if (!cardSystem.assignedDistributionKey) {
      throw 'card system distribution key is missing';
    }

    controller.persistingCardSystems = true;

    return udbUitpasApi
      .addEventCardSystemDistributionKey(offerData.id, cardSystem.id, cardSystem.assignedDistributionKey.id)
      .then(function () {
        $rootScope.$emit('uitpasDataSaved');
        unlockCardSystems();
        return $q.resolve();
      });
  };

  function unlockCardSystems() {
    controller.persistingCardSystems = false;
  }

  /**
   * @param {CardSystem} cardSystem
   * @return {Promise}
   */
  function assignKeyAndOrCardSystem(cardSystem) {
    return cardSystem.assignedDistributionKey ?
      controller.distributionKeyAssigned(cardSystem) :
      udbUitpasApi.addEventCardSystem(offerData.id, cardSystem.id);
  }

  /**
   * @param {CardSystem} cardSystem
   */
  controller.activeCardSystemsChanged = function(cardSystem) {
    controller.persistingCardSystems = true;
    var activeCardSystemsUpdated = cardSystem.active ?
      assignKeyAndOrCardSystem(cardSystem) :
      udbUitpasApi.removeEventCardSystem(offerData.id, cardSystem.id);

    function revertCardSystemStatus() {
      cardSystem.active = !cardSystem.active;
      showUitpasUnavailableNotice();
    }

    function notifyUitpasDataSaved () {
      $rootScope.$emit('uitpasDataSaved');
    }

    activeCardSystemsUpdated
      .then(notifyUitpasDataSaved, revertCardSystemStatus)
      .finally(unlockCardSystems);
  };
}
CardSystemsController.$inject = ["$q", "udbUitpasApi", "$rootScope"];
})();

// Source: src/uitpas/components/uitpas-info/uitpas-info.component.js
(function () {
'use strict';

/**
 * @ngdoc function
 * @name udbApp.controller:EventFormUitpasInfoController
 * @description
 * # EventFormUitpasInfoController
 * Component for setting UiTPAS info.
 */
angular
  .module('udb.uitpas')
  .component('uitpasInfo', {
    templateUrl: 'templates/uitpasInfo.html',
    controller: UitpasInfoComponent,
    controllerAs: 'upic',
    bindings: {
      organizer: '<',
      price: '<'
    }
  });

/* @ngInject */
function UitpasInfoComponent(
  $scope,
  $rootScope,
  EventFormData
) {
  var controller = this;

  $scope.showUitpasInfo = false;
  $scope.uitpasCssClass = 'state-incomplete';
  controller.listeners = [];
  controller.showCardSystems = false;

  controller.$onInit = init;
  controller.$onDestroy = destroy;

  /**
   *
   * @param {Object} angularEvent
   * @param {EventFormData} offerData
   */
  controller.showCardSystemsIfPriceIsSelected = function(angularEvent, offerData) {
    controller.showCardSystems = offerData.priceInfo && !!offerData.priceInfo.length;
  };

  controller.markUitpasDataAsCompleted = function () {
    $scope.uitpasCssClass = 'state-complete';
  };

  controller.updateOrganizer = function (angularEvent, organization) {
    controller.organizer = organization;
    showOrganizer(organization);
  };

  function showOrganizer(organization) {
    if (organization) {
      $scope.showUitpasInfo = _.get(controller, 'organizer.isUitpas', false) && EventFormData.isEvent;
      controller.showCardSystems = controller.price && !!controller.price.length;
    } else {
      controller.showCardSystems = false;
      $scope.showUitpasInfo = false;
    }
  }

  function init() {
    controller.eventFormData = EventFormData;
    showOrganizer(controller.organizer);

    controller.listeners = [
      $rootScope.$on('eventFormSaved', controller.showCardSystemsIfPriceIsSelected),
      $rootScope.$on('eventOrganizerSelected', controller.updateOrganizer),
      $rootScope.$on('eventOrganizerDeleted', controller.updateOrganizer),
      $rootScope.$on('uitpasDataSaved', controller.markUitpasDataAsCompleted)
    ];
  }

  function destroy() {
    _.invoke(controller.listeners, 'call');
  }
}
UitpasInfoComponent.$inject = ["$scope", "$rootScope", "EventFormData"];
})();

// Source: src/uitpas/default-uitpas-labels.constant.js
(function () {
'use strict';

/* jshint sub: true */

/**
 * @ngdoc service
 * @name udb.uitpas.DefaultUitpasLabels
 * @description
 * # Default UiTPAS Labels
 *
 * All the known UiTPAS labels that link an organizer to card-systems on 2017-03-30.
 * This file used to be updated each time labels changed but now acts as a placeholder.
 *
 * The actual labels should be fetched when building or bootstrapping your app and written to the UitpasLabels constant.
 * The UiTPAS service should have an endpoint with all the labels for your environment.
 * e.g.: https://uitpas.uitdatabank.be/labels for production
 */
angular
  .module('udb.uitpas')
  .constant('DefaultUitpasLabels',
  /**
   * Enum for UiTPAS labels
   * @readonly
   * @enum {string}
   */
  {
    'PASPARTOE': 'Paspartoe',
    'UITPAS': 'UiTPAS',
    'UITPAS_GENT': 'UiTPAS Gent',
    'UITPAS_OOSTENDE': 'UiTPAS Oostende',
    'UITPAS_REGIO_AALST': 'UiTPAS Regio Aalst',
    'UITPAS_DENDER': 'UiTPAS Dender',
    'UITPAS_ZUIDWEST': 'UiTPAS Zuidwest',
    'UITPAS_MECHELEN': 'UiTPAS Mechelen',
    'UITPAS_KEMPEN': 'UiTPAS Kempen',
    'UITPAS_MAASMECHELEN': 'UiTPAS Maasmechelen',
    'UITPAS_LEUVEN': 'UiTPAS Leuven',
    'UITPAS_LIER': 'UiTPAS Lier',
    'UITPAS_HEIST-OP-DEN-BERG': 'UiTPAS Heist-op-den-Berg',
    'UITPAS_MEETJESLAND': 'UiTPAS Meetjesland',
    'UITPAS_WESTHOEK': 'UiTPAS Westhoek'
  });
})();

// Source: src/uitpas/organisation-suggestion.controller.js
(function () {
'use strict';

/**
 * @ngdoc directive
 * @name udb.search.controller:OfferController
 * @description
 * # OfferController
 */
angular
  .module('udb.uitpas')
  .controller('OrganisationSuggestionController', OrganisationSuggestionController);

/* @ngInject */
function OrganisationSuggestionController($scope) {
  var controller = this;
  controller.organisation = $scope.organisation;
  controller.query = $scope.query;
}
OrganisationSuggestionController.$inject = ["$scope"];
})();

// Source: src/uitpas/organisation-suggestion.directive.js
(function () {
'use strict';

angular
  .module('udb.uitpas')
  .directive('uitpasOrganisationSuggestion', uitpasOrganisationSuggestion);

/* @ngInject */
function uitpasOrganisationSuggestion() {
  return {
    templateUrl: 'templates/organisation-suggestion.directive.html',
    controller: 'OrganisationSuggestionController',
    controllerAs: 'os',
    scope: {
      organisation: '<',
      query: '<'
    },
    restrict: 'A'
  };
}
})();

// Source: src/uitpas/udb-uitpas-api.service.js
(function () {
'use strict';

/**
 * @typedef {Object} CardSystem
 * @property {string} id
 *  a number serialized as a string
 * @property {string} name
 * @property {DistributionKey[]} distributionKeys
 */

/**
 * @typedef {Object} DistributionKey
 * @property {string} id
 *  a number serialized as a string
 * @property {string} name
 *  the name of the key including the price, eg: "CC De Werf - 1,5 EUR / dag"
 */

angular
  .module('udb.uitpas')
  .service('udbUitpasApi', UdbUitpasApi);

function UdbUitpasApi($q, $http, appConfig, uitidAuth, $timeout, moment) {
  var uitpasApiUrl = _.get(appConfig, 'uitpasUrl');
  var uitpasMaxDelay = _.get(appConfig, 'uitpasMaxDelay', 8);
  var defaultApiConfig = {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + uitidAuth.getToken()
    },
    params: {}
  };

  /**
   * Events are automatically registered by UiTPAS but there can be some delay.
   * In the meantime the UiTPAS API will not known about the event.
   * Make sure to poke UiTPAS a few times before giving up.
   *
   * An empty collection is returned if UiTPAS repeatedly fails on an event.
   *
   * @param {string} eventId
   * @return {Promise.<CardSystem[]>}
   */
  this.getEventCardSystems = function(eventId) {
    function request () {
      return $http.get(uitpasApiUrl + 'events/' + eventId + '/cardSystems/', defaultApiConfig);
    }

    var until = moment().add(uitpasMaxDelay, 's');

    return retry(request, 2, until).then(returnCardSystemCollection);
  };

  /**
   * getTicketSales
   * @param {string} eventId
   * @param {Organizer} organizer
   * @return {Promise.<hasTicketSales>}
   */
  this.getTicketSales = function(eventId, organizer) {
    var deferred = $q.defer();
    var until = moment().add(uitpasMaxDelay, 's');

    function request () {
      return $http.get(uitpasApiUrl + 'events/' + eventId, defaultApiConfig);
    }

    function returnTicketSales(response) {
      return response.data.hasTicketSales;
    }

    if (organizer.isUitpas) {
      deferred.resolve(retry(request, 2, until).then(returnTicketSales));
    } else {
      deferred.resolve(false);
    }

    return deferred.promise;
  };

  /**
   * @param {string} organizerId of the organizer
   * @return {Promise.<CardSystem[]>}
   */
  this.findOrganisationsCardSystems = function(organizerId) {
    return $http
      .get(uitpasApiUrl + 'organizers/' + organizerId + '/cardSystems/', defaultApiConfig)
      .then(returnCardSystemCollection);
  };

  /**
   * @param {CardSystem} cardSystem
   * @returns {CardSystem}
   */
  function convertDistributionKeysToList(cardSystem) {
    if ('object' === typeof cardSystem.distributionKeys) {
      cardSystem.distributionKeys = _.values(cardSystem.distributionKeys);
    }

    return cardSystem;
  }

  /**
   * @param {object} response
   *  Angular HTTP response
   * @return {CardSystem[]}
   */
  function returnCardSystemCollection(response) {
    var cardSystemCollection = 'object' === typeof response.data ? _.values(response.data) : response.data;
    return $q.resolve(_.map(cardSystemCollection, convertDistributionKeysToList));
  }

  /**
   * @param {string} eventId
   * @param {string} cardSystemId
   * @return {Promise.<Object>}
   */
  this.addEventCardSystem = function(eventId, cardSystemId) {
    return $http
      .put(
        uitpasApiUrl + 'events/' + eventId + '/cardSystems/' + cardSystemId,
        null,
        defaultApiConfig
      )
      .then(returnUnwrappedData);
  };

  /**
   * @param {string} eventId
   * @param {string} cardSystemId
   * @return {Promise.<Object>}
   */
  this.removeEventCardSystem = function(eventId, cardSystemId) {
    return $http
      .delete(
        uitpasApiUrl + 'events/' + eventId + '/cardSystems/' + cardSystemId,
        defaultApiConfig
      )
      .then(returnUnwrappedData);
  };

  /**
   * @param {string} eventId
   * @param {string} cardSystemId
   * @param {string} distributionKeyId
   * @return {Promise.<Object>}
   */
  this.addEventCardSystemDistributionKey = function(eventId, cardSystemId, distributionKeyId) {
    return $http
      .put(
        uitpasApiUrl + 'events/' + eventId + '/cardSystems/' + cardSystemId + '/distributionKey/' + distributionKeyId,
        null,
        defaultApiConfig
      )
      .then(returnUnwrappedData);
  };

  function returnUnwrappedData(response) {
    return $q.resolve(response.data);
  }

  /**
   * @param {function} repeatable
   *  A promise returning function without arguments.
   *
   * @param {number} delay
   *  The number of seconds to delay after a response before firing a consecutive request.
   *
   * @param {moment} limit
   *  The moment that marks the time limit.
   */
  function retry(repeatable, delay, limit) {
    function retryLater(error) {
      return moment().add(delay, 'seconds').isAfter(limit) ?
        $q.reject(error) :
        $timeout(function () {
          return retry(repeatable, delay, limit);
        }, delay);
    }

    return repeatable().catch(retryLater);
  }
}
UdbUitpasApi.$inject = ["$q", "$http", "appConfig", "uitidAuth", "$timeout", "moment"];
})();

// Source: src/uitpas/uitpas-labels.provider.js
(function () {
'use strict';

/* jshint sub: true */

/**
 * @ngdoc service
 * @name udb.uitpas.UitpasLabelsProvider
 * @description
 * # UiTPAS Labels Provider
 *
 * All the known UiTPAS labels that link an organizer to card-systems on 2017-03-01 are in the DefaultUitpasLabels
 * constant. The file used to be updated each time labels changed but now acts as a placeholder.
 *
 * The actual labels should be fetched when building or bootstrapping your app and written to the ExtermalUitpasLabels
 * constant. The UiTPAS service should have an endpoint with all the labels for your environment.
 * e.g.: https://uitpas.uitdatabank.be/labels for production
 */
angular
  .module('udb.uitpas')
  .provider('UitpasLabels', UitpasLabelsProvider);

function UitpasLabelsProvider() {
  var customUitpasLabels;

  /**
   * Configure the UiTPAS labels by providing a map of {LABEL_KEY: label name}
   * @param {object} labels
   */
  this.useLabels = function(labels) {
    customUitpasLabels = labels;
  };

  this.$get = ['DefaultUitpasLabels', function(DefaultUitpasLabels) {
    return !!customUitpasLabels ? customUitpasLabels : DefaultUitpasLabels;
  }];
}
})();
