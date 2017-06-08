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
    en: {
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
      'AVAILABLEFROM' : 'available'
    },
    fr: {
      'LOCATION_LABEL': 'location',
      'TITLE': 'titre'
    },
    nl: {
      'TYPE' : 'type',
      'CDBID' : 'identificatiecode (CDBID)',
      'TITLE' : 'titel',
      'KEYWORDS' : 'label',
      'CITY' : 'gemeente (naam)',
      'ORGANISER_KEYWORDS': 'label organisatie',
      'ZIPCODE' : 'postcode',
      'COUNTRY' : 'land',
      'PHYSICAL_GIS' : 'geo-coördinaten',
      'CATEGORY_NAME' : 'categorie',
      'AGEFROM' : 'leeftijd vanaf',
      'DETAIL_LANG' : 'vertaling',
      'PRICE' : 'prijs',
      'STARTDATE' : 'startdatum',
      'ENDDATE' : 'einddatum',
      'ORGANISER_LABEL' : 'organisatie (naam)',
      'LOCATION_LABEL' : 'locatie (naam)',
      'EXTERNALID' : 'externalid',
      'LASTUPDATED' : 'laatst aangepast',
      'CREATIONDATE' : 'gecreëerd',
      'CREATEDBY' : 'gecreëerd door',
      'PERMANENT' : 'permanent',
      'DATETYPE' : 'wanneer',
      'CATEGORY_EVENTTYPE_NAME' : 'type',
      'LOCATIONTYPE' : 'locatietype',
      'OFFERTYPE' : 'aanbodtype',
      'CATEGORY_THEME_NAME' : 'thema',
      'CATEGORY_FACILITY_NAME' : 'voorzieningen',
      'CATEGORY_TARGETAUDIENCE_NAME' : 'doelgroep',
      'CATEGORY_FLANDERSREGION_NAME' : 'regio / gemeente',
      'LIKE_COUNT' : 'aantal keer \'geliket\'',
      'RECOMMEND_COUNT' : 'aantal keer aanbevolen',
      'ATTEND_COUNT' : 'aantal keer \'ik ga hierheen\'',
      'COMMENT_COUNT' : 'aantal reacties',
      'PRIVATE' : 'privé',
      'AVAILABLEFROM' : 'datum beschikbaar'
    }
  });
