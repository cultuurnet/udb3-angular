'use strict';

describe('Factory: UDB Organizer', function () {

  beforeEach(module('udb.core'));

  it('should set all the properties when parsing a json organizer', inject(function (UdbOrganizer) {
    var expectedOrganizer = {
      'id': '357D5297-9E37-1DE9-62398987EA110D38',
      'name': 'Club Silo',
      'address': {
        addressCountry: 'BE',
        addressLocality: 'Leuven',
        postalCode: '3000',
        streetAddress: 'Vaartkom 39'
      },
      'email': 'info@silo.be',
      'phone': '+32 476 838982',
      'url': undefined,
      'labels': [
        {
          name: 'green',
          uuid: '6befb6d0-aefe-42bb-8496-960e9ceec05f'
        },
        {
          name: 'UiTPAS',
          uuid: '10e44536-44e2-4b42-98c8-b8dd86a6d60b'
        }
      ],
      'isUitpas': true
    };
    var jsonOrganizer = {
      '@id': 'http://culudb-silex.dev:8080/organizer/357D5297-9E37-1DE9-62398987EA110D38',
      '@context': '/api/1.0/organizer.jsonld',
      'name': 'Club Silo',
      'address': {
        addressCountry: 'BE',
        addressLocality: 'Leuven',
        postalCode: '3000',
        streetAddress: 'Vaartkom 39'
      },
      contactPoint: {
        'email': [
          'info@silo.be'
        ],
        'phone': [
          '+32 476 838982'
        ]
      },
      labels: [
        {
          name: 'green',
          uuid: '6befb6d0-aefe-42bb-8496-960e9ceec05f'
        },
        {
          name: 'UiTPAS',
          uuid: '10e44536-44e2-4b42-98c8-b8dd86a6d60b'
        }
      ]
    };

    var organizerFromJson = new UdbOrganizer(jsonOrganizer);
    expect(organizerFromJson).toEqual(expectedOrganizer);
  }));
});