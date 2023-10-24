'use strict';

describe('Factory: UDB Organizer', function () {

  beforeEach(module('udb.core'));

  var jsonOrganizer = {
    '@id': 'http://culudb-silex.dev:8080/organizer/357D5297-9E37-1DE9-62398987EA110D38',
    '@context': '/api/1.0/organizer.jsonld',
    'created': '2017-03-28T12:09:18+00:00',
    'creator': '357D5297-9E37-1DE9-62398987EA110D38',
    'url': 'http://foo.bar',
    'name': 'Club Silo',
    'description': 'Club Silo is een club in Leuven.',
    'educationalDescription': 'Club Silo is een club in Leuven.',
    'address': {
      addressCountry: 'BE',
      addressLocality: 'Leuven',
      postalCode: '3000',
      streetAddress: 'Vaartkom 39'
    },
    mainImage: 'http://foo.bar.jpg',
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
    ],
    workflowStatus: 'ok'
  };

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
    ],
    workflowStatus: 'ok'
  };

  var jsonOrganizerDeleted = {
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
    ],
    workflowStatus: 'DELETED'
  };

  it('should set all the properties when parsing a json organizer', inject(function (UdbOrganizer) {
    var expectedOrganizer = {
      '@id': 'http://culudb-silex.dev:8080/organizer/357D5297-9E37-1DE9-62398987EA110D38',
      'id': '357D5297-9E37-1DE9-62398987EA110D38',
      'name': 'Club Silo',
      description: 'Club Silo is een club in Leuven.',
      educationalDescription: 'Club Silo is een club in Leuven.',
      'address': {
        addressCountry: 'BE',
        addressLocality: 'Leuven',
        postalCode: '3000',
        streetAddress: 'Vaartkom 39'
      },
      'email': 'info@silo.be',
      'phone': '+32 476 838982',
      'website': 'http://foo.bar',
      'contactPoint': {
        'email': [
          'info@silo.be'
        ],
        'phone': [
          '+32 476 838982'
        ]
      },
      'labels': [
        'green',
        'UiTPAS'
      ],
      image: 'http://foo.bar.jpg',
      mediaObject: [],
      hiddenLabels: [

      ],
      'isUitpas': true,
      'created': new Date('2017-03-28T12:09:18+00:00'),
      'deleted': false,
      'detailUrl': '/organizer/357D5297-9E37-1DE9-62398987EA110D38'
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

  it('it can take into account translated name', inject(function (UdbOrganizer) {
    jsonOrganizer.name = {nl : jsonOrganizer.name};

    var organizer = new UdbOrganizer(jsonOrganizer);
    expect(organizer.name).toEqual('Club Silo');
  }));

  it('it can take into account main language', inject(function (UdbOrganizer) {
      jsonOrganizer.mainLanguage = 'en';
      jsonOrganizer.name = {en : jsonOrganizer.name.nl};

      var organizer = new UdbOrganizer(jsonOrganizer);
      expect(organizer.name).toEqual('Club Silo');
  }));

  it('it should set deleted to true when the workflow status is DELETED', inject(function (UdbOrganizer) {
    var organizer = new UdbOrganizer(jsonOrganizerDeleted);
    expect(organizer.deleted).toEqual(true);
  }));

  it('should verify if contact url is valid according to the regex', inject(function (UdbOrganizer) {
    var OrganizerUrlRegex = new UdbOrganizer().regex.url;
    var mockUrls= MockData.urls;
    mockUrls.map(function(mockUrl){
      expect(OrganizerUrlRegex.test(mockUrl.url)).toEqual(mockUrl.valid);
    });
  }));


});
