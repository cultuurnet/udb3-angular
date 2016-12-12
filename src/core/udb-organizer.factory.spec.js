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
        'green',
        'UiTPAS'
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
        'green',
        'UiTPAS'
      ]
    };

    var organizerFromJson = new UdbOrganizer(jsonOrganizer);
    expect(organizerFromJson).toEqual(expectedOrganizer);
  }));
});