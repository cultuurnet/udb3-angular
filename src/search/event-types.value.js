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
    {label: 'Begeleide uitstap of rondleiding', id: '0.7.0.0.0'},
    {label: 'Beurs', id: '0.6.0.0.0'},
    {label: 'Concert', id: '0.50.4.0.0'},
    {label: 'Lessenreeks', id: '0.3.1.0.0'},
    {label: 'Cursus met open sessies', id: '0.3.1.0.1'},
    {label: 'Dansvoorstelling', id: '0.54.0.0.0'},
    {label: 'Eet- of drankfestijn', id: '1.50.0.0.0'},
    {label: 'Festival', id: '0.5.0.0.0'},
    {label: 'Film', id: '0.50.6.0.0'},
    {label: 'Kamp of vakantie', id: '0.57.0.0.0'},
    {label: 'Festiviteit', id: '0.28.0.0.0'},
    {label: 'Lezing of congres', id: '0.3.2.0.0'},
    {label: 'Markt, braderie of kermis', id: '0.37.0.0.0'},
    {label: 'Opendeurdag', id: '0.12.0.0.0'},
    {label: 'Party of fuif', id: '0.49.0.0.0'},
    {label: 'Route', id: '0.17.0.0.0'},
    {label: 'Spel of quiz', id: '0.50.21.0.0'},
    {label: 'Sport en beweging', id: '0.59.0.0.0 '},
    {label: 'Sportwedstrijd bekijken', id: '0.19.0.0.0'},
    {label: 'Tentoonstelling', id: '0.0.0.0.0'},
    {label: 'Theatervoorstelling', id: '0.55.0.0.0'}
  ]);
