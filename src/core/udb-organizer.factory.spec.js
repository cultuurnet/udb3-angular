'use strict';

describe('Factory: UDB Organizer', function () {

  beforeEach(module('udb.core'));

  var jsonOrganizerWithHiddenLabel = {
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
      'green'
    ],
    hiddenLabels: [
      'UiTPAS'
    ]
  };

  it('should set all the properties when parsing a json organizer', inject(function (UdbOrganizer) {
    var expectedOrganizer = {
      '@id': 'http://culudb-silex.dev:8080/organizer/357D5297-9E37-1DE9-62398987EA110D38',
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
      'url': 'http://foo.bar',
      'labels': [
        'green',
        'UiTPAS'
      ],
      hiddenLabels: [

      ],
      'isUitpas': true,
      'created': new Date('2017-03-28T12:09:18+00:00')
    };
    var jsonOrganizer = {
      '@id': 'http://culudb-silex.dev:8080/organizer/357D5297-9E37-1DE9-62398987EA110D38',
      '@context': '/api/1.0/organizer.jsonld',
      'created': '2017-03-28T12:09:18+00:00',
      'creator': '357D5297-9E37-1DE9-62398987EA110D38',
      'url': 'http://foo.bar',
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

  it('takes into account hidden labels when checking for UiTPAS', inject(function (UdbOrganizer) {
    var organizerFromJson = new UdbOrganizer(jsonOrganizerWithHiddenLabel);
    expect(organizerFromJson.isUitpas).toEqual(true);
  }));

  it('should combine regular and hidden labels as a single list', inject(function (UdbOrganizer) {
    var expectedCombinedLabels = ['green', 'UiTPAS'];
    var organizer = new UdbOrganizer(jsonOrganizerWithHiddenLabel);

    expect(organizer.labels).toEqual(expectedCombinedLabels);
  }));
});
