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
      'CDBID' : 'identificatiecode (CDBID)',
      'LOCATION_ID' : 'locatieid',
      'ORGANISER_ID' : 'organisatieid',
      'TITLE' : 'titel',
      'KEYWORDS' : 'label',
      'CITY' : 'gemeente (naam)',
      'ORGANISER_KEYWORDS': 'label organisatie',
      'ZIPCODE' : 'postcode',
      'COUNTRY' : 'land',
      'CATEGORY_NAME' : 'categorie',
      'AGEFROM' : 'leeftijd',
      'DETAIL_LANG' : 'vertaling',
      'PRICE' : 'prijs',
      'DATE' : 'datum',
      'STARTDATE' : 'startdatum',
      'ENDDATE' : 'einddatum',
      'ORGANISER_LABEL' : 'organisatie (naam)',
      'LOCATION_LABEL' : 'locatie (naam)',
      'EXTERNALID' : 'externalid',
      'LASTUPDATED' : 'laatst aangepast',
      'CREATIONDATE' : 'gecreëerd',
      'CREATEDBY' : 'gecreëerd door',
      'PERMANENT' : 'permanent',
      'CATEGORY_EVENTTYPE_NAME' : 'type',
      'LOCATIONTYPE' : 'locatietype',
      'OFFERTYPE' : 'aanbodtype',
      'CATEGORY_THEME_NAME' : 'thema',
      'CATEGORY_FACILITY_NAME' : 'voorzieningen',
      'CATEGORY_TARGETAUDIENCE_NAME' : 'doelgroep',
      'CATEGORY_FLANDERSREGION_NAME' : 'regio / gemeente',
      'AVAILABLEFROM' : 'datum beschikbaar'
    }
  });
